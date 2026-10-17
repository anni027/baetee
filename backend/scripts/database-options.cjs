const { readFileSync } = require('node:fs')

// Shared by Medusa, the refund pool and the standalone ledger migrator.
// Reject URL SSL overrides so node-postgres cannot replace the verified TLS options.
function databaseOptions(connectionString, env = process.env) {
  if (!connectionString) throw new Error('DATABASE_URL is required')
  const url = new URL(connectionString)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('DATABASE_URL must use PostgreSQL')
  if (url.port === '6543' || url.searchParams.get('pgbouncer') === 'true') throw new Error('Use a direct or session-mode database connection; transaction pooling breaks refund locks')
  for (const name of ['sslmode', 'ssl_mode', 'sslcert', 'sslkey', 'sslrootcert', 'options']) {
    if (url.searchParams.has(name)) throw new Error('Remove database URL SSL/options parameters; configure DATABASE_SSL and DATABASE_CA_CERT instead')
  }
  const schema = env.DATABASE_SCHEMA || 'public'
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Invalid DATABASE_SCHEMA')
  const production = env.NODE_ENV === 'production'
  if (production && schema === 'public') throw new Error('Production requires a private DATABASE_SCHEMA, such as medusa')
  if (production && env.DATABASE_SSL !== 'true') throw new Error('Production requires DATABASE_SSL=true')
  let ssl = false
  if (env.DATABASE_SSL === 'true') {
    if (!env.DATABASE_CA_CERT) throw new Error('DATABASE_CA_CERT must point to the database CA certificate')
    ssl = { rejectUnauthorized: true, ca: readFileSync(env.DATABASE_CA_CERT, 'utf8') }
  }
  const poolMax = Number(env.DATABASE_POOL_MAX || '5')
  if (!Number.isSafeInteger(poolMax) || poolMax < 1 || poolMax > 20) throw new Error('DATABASE_POOL_MAX must be between 1 and 20')
  const options = `-c search_path=${schema},pg_catalog`
  // Some Medusa migrators create their own connection and issue unqualified SQL.
  // Set the schema at connection startup as well as in the ORM configuration.
  url.searchParams.set('options', options)
  return { schema, poolMax, connection: { connectionString: url.toString(), ssl, options } }
}
module.exports = { databaseOptions }
