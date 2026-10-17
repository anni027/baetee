const {readFileSync,existsSync} = require('node:fs')
const {parseEnv} = require('node:util')
const {Client} = require('pg')
const {databaseOptions} = require('./database-options.cjs')

async function migrate() {
  const file = existsSync('.env') ? parseEnv(readFileSync('.env','utf8')) : {}
  const connectionString = process.env.DATABASE_URL || file.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required')
  const client = new Client(databaseOptions(connectionString, {...file,...process.env}).connection)
  try {
    await client.connect()
    await client.query('begin')
    await client.query("select pg_advisory_xact_lock(hashtext('baetee-refund-ledger-migration'))")
    await client.query(readFileSync('migrations/0001_razorpay_refunds.sql','utf8'))
    await client.query('commit')
    console.log('Razorpay refund ledger migration applied.')
  } finally {await client.end()}
}
migrate().catch(error=>{console.error('Refund ledger migration failed:',error.code || 'configuration/connection error');process.exitCode=1})
