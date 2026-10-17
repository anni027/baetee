const { readFileSync, mkdirSync, writeFileSync } = require('node:fs')
const { parseEnv } = require('node:util')
const { randomBytes } = require('node:crypto')
const { spawn } = require('node:child_process')
const { Client } = require('pg')
const { databaseOptions } = require('./database-options.cjs')

// Optional integration check. Owns a temporary local database; never migrates the catalog database.
async function verify() {
  if (process.env.NODE_ENV === 'production') throw new Error('Local development only')
  const env = { ...parseEnv(readFileSync('.env', 'utf8')), ...process.env }
  if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(env.DATABASE_URL).hostname)) throw new Error('Local database only')
  const databaseName = `verify_medusa_${randomBytes(8).toString('hex')}`
  const schema = 'medusa'
  const testUrl = new URL(env.DATABASE_URL)
  testUrl.pathname = `/${databaseName}`
  const childEnv = { ...env, DATABASE_URL: testUrl.toString(), NODE_ENV: 'development', DATABASE_SCHEMA: schema, DATABASE_SSL: 'false', DATABASE_CA_CERT: '' }
  const admin = new Client(databaseOptions(env.DATABASE_URL, { NODE_ENV: 'development' }).connection)
  const client = new Client(databaseOptions(childEnv.DATABASE_URL, childEnv).connection)
  let created = false
  const run = (args) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''
    child.stdout.on('data', chunk => { output += chunk.toString() })
    child.stderr.on('data', chunk => { output += chunk.toString() })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) return resolve()
      // Redact configured secrets before retaining diagnostics in the ignored local state directory.
      for (const [name,value] of Object.entries(childEnv)) if (/SECRET|TOKEN|KEY|PASSWORD|DATABASE_URL|REDIS_URL/.test(name) && value) output = output.split(value).join('[redacted]')
      const password = decodeURIComponent(new URL(env.DATABASE_URL).password)
      if (password) output = output.split(password).join('[redacted]')
      mkdirSync('.local-state', { recursive: true })
      writeFileSync('.local-state/schema-check-error.log', output, { mode: 0o600 })
      reject(new Error('Migration subprocess failed; inspect ignored .local-state/schema-check-error.log'))
    })
  })
  try {
    await admin.connect()
    await admin.query(`create database ${databaseName}`)
    created = true
    await client.connect()
    await client.query(`create schema ${schema}`)
    console.log('Checking Medusa migrations in a private schema inside an isolated temporary local database...')
    await run([require.resolve('@medusajs/cli/cli.js'), 'db:migrate'])
    await run(['scripts/migrate-refund-ledger.cjs'])
    for (const table of ['product', 'order', 'baetee_gateway_refunds']) {
      const { rows: [row] } = await client.query('select to_regclass($1) as name', [`${schema}.${table}`])
      if (!row.name) throw new Error(`Private schema is missing ${table}`)
    }
    const { rows: [row] } = await client.query('select current_schema() as name')
    if (row.name !== schema) throw new Error('Standalone PG client did not select the private schema')
    const { rows: [publicTables] } = await client.query("select count(*)::int as count from information_schema.tables where table_schema = 'public'")
    if (publicTables.count !== 0) throw new Error('Migrations created public tables')
    console.log('Private-schema integration passed: Medusa migrations and the refund ledger are isolated from public.')
  } finally {
    await client.end()
    // The target is generated internally from a fixed prefix and hex bytes, never supplied by a user.
    if (created) await admin.query(`drop database ${databaseName}`)
    await admin.end()
  }
}
verify().catch(error => { console.error('Local private-schema integration failed:', error.code || error.message); process.exitCode = 1 })
