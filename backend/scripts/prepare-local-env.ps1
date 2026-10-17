$ErrorActionPreference = 'Stop'
$backendDir = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $backendDir '.env'

if (Test-Path -LiteralPath $envPath) {
  Write-Output 'backend/.env already exists; it was left untouched.'
  exit 0
}

function New-HexSecret([int]$bytes) {
  return [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes($bytes)).ToLowerInvariant()
}

$dbPassword = New-HexSecret 24
$jwtSecret = New-HexSecret 32
$cookieSecret = New-HexSecret 32

@"
BAETEE_LOCAL_DB_PASSWORD=$dbPassword
DATABASE_URL=postgres://baetee:$dbPassword@localhost:5432/baetee
REDIS_URL=redis://localhost:6379
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000,http://localhost:3000
MEDUSA_BACKEND_URL=http://localhost:9000
JWT_SECRET=$jwtSecret
COOKIE_SECRET=$cookieSecret
MEDUSA_WORKER_MODE=shared
PORT=9000
STORE_ASSET_BASE_URL=http://localhost:3000
ORDER_DELIVERY_VERIFIED=false
"@ | Set-Content -LiteralPath $envPath -Encoding utf8 -NoNewline

Write-Output 'Created ignored backend/.env with unique local database and application secrets.'
