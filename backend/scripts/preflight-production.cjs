const { readFileSync } = require('node:fs')
const { Client } = require('pg')
const { databaseOptions } = require('./database-options.cjs')

async function preflight() {
  if (process.env.NODE_ENV !== 'production') throw new Error('Run preflight with the production environment')
  const db = databaseOptions(process.env.DATABASE_URL)
  for (const name of ['MEDUSA_BACKEND_URL','STORE_ASSET_BASE_URL','STORE_CORS','ADMIN_CORS','AUTH_CORS','JWT_SECRET','COOKIE_SECRET','REDIS_URL','S3_FILE_URL','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY','S3_REGION','S3_BUCKET','S3_ENDPOINT']) {
    if (!process.env[name] || /GENERATE|PROJECT_REF|example\.com|ACTUAL_|replace-me/.test(process.env[name])) throw new Error(`Set ${name} to a real production value`)
  }
  for (const name of ['MEDUSA_BACKEND_URL','STORE_ASSET_BASE_URL','STORE_CORS','ADMIN_CORS','AUTH_CORS','S3_FILE_URL','S3_ENDPOINT']) {
    for (const value of process.env[name].split(',')) if (new URL(value.trim()).protocol !== 'https:') throw new Error(`${name} must use HTTPS`)
  }
  for (const name of ['JWT_SECRET','COOKIE_SECRET']) if (process.env[name].length < 32) throw new Error(`${name} must be at least 32 characters`)
  readFileSync(process.env.DATABASE_CA_CERT)
  const client = new Client({ ...db.connection, connectionTimeoutMillis: 10000 })
  try {
    await client.connect()
    const { rows: [state] } = await client.query("select current_schema() as schema, current_user as role, (select ssl from pg_stat_ssl where pid=pg_backend_pid()) as tls")
    if (state.schema !== db.schema || !state.tls || state.role !== 'baetee_medusa') throw new Error('Database must use verified TLS, the private schema and baetee_medusa role')
    for (const role of ['anon','authenticated','service_role']) {
      const { rows: [row] } = await client.query('select has_schema_privilege($1,$2,\'USAGE\') as allowed', [role,db.schema])
      if (row.allowed) throw new Error('A Data API role can access the commerce schema; fix schema grants')
    }
    const { rows: [ledger] } = await client.query("select to_regclass('baetee_gateway_refunds') as name")
    if (!ledger.name) throw new Error('Run Medusa and refund migrations first')
    console.log('Production database preflight passed: TLS, dedicated role, private schema, restricted grants and refund ledger present.')
    console.log('Still verify HTTPS/Redis/uploads, Data API exposed schemas, backups, gateway/email delivery and launch gates on the actual services.')
  } finally { await client.end() }
}
preflight().catch(() => { console.error('Production preflight failed. Check private environment values, TLS certificate, database role/schema grants and migrations. No credentials were printed.'); process.exitCode = 1 })
