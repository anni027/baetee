import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const { databaseOptions } = require('../scripts/database-options.cjs')

test('production database settings require private schema, verified TLS and session-compatible connections', () => {
  const folder = mkdtempSync(join(tmpdir(), 'baetee-db-ca-'))
  const ca = join(folder, 'ca.crt')
  writeFileSync(ca, 'fixture-ca')
  try {
    const env = { NODE_ENV: 'production', DATABASE_SCHEMA: 'medusa', DATABASE_SSL: 'true', DATABASE_CA_CERT: ca, DATABASE_POOL_MAX: '5' }
    const url = 'postgresql://baetee_medusa.ref:fixture@pooler.invalid:5432/postgres'
    const options = databaseOptions(url, env)
    assert.equal(options.connection.ssl.rejectUnauthorized, true)
    assert.equal(options.connection.ssl.ca, 'fixture-ca')
    assert.equal(options.connection.options, '-c search_path=medusa,pg_catalog')
    assert.equal(new URL(options.connection.connectionString).searchParams.get('options'), '-c search_path=medusa,pg_catalog')
    assert.equal(options.poolMax, 5)
    for (const change of [{ DATABASE_SCHEMA: 'public' }, { DATABASE_SCHEMA: 'medusa;select' }, { DATABASE_SSL: 'false' }, { DATABASE_CA_CERT: '' }, { DATABASE_POOL_MAX: '100' }]) assert.throws(() => databaseOptions(url, { ...env, ...change }))
    for (const changedUrl of [url.replace(':5432', ':6543'), `${url}?sslmode=no-verify`, `${url}?options=-c%20search_path=public`, `${url}?pgbouncer=true`]) assert.throws(() => databaseOptions(changedUrl, env))
  } finally { rmSync(folder, { recursive: true, force: true }) }
})

test('local development keeps the existing public schema without requiring a CA file', () => {
  const result = databaseOptions('postgres://local:fixture@localhost:5432/baetee', { NODE_ENV: 'development' })
  assert.equal(result.schema, 'public')
  assert.equal(result.connection.ssl, false)
})
