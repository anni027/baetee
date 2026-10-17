const {mkdirSync,copyFileSync,readFileSync,writeFileSync} = require('node:fs')
for (const dir of ['scripts','migrations']) mkdirSync(`.medusa/server/${dir}`,{recursive:true})
copyFileSync('scripts/migrate-refund-ledger.cjs','.medusa/server/scripts/migrate-refund-ledger.cjs')
copyFileSync('scripts/database-options.cjs','.medusa/server/scripts/database-options.cjs')
copyFileSync('scripts/preflight-production.cjs','.medusa/server/scripts/preflight-production.cjs')
copyFileSync('migrations/0001_razorpay_refunds.sql','.medusa/server/migrations/0001_razorpay_refunds.sql')
const file='.medusa/server/package.json'
const pkg=JSON.parse(readFileSync(file,'utf8'))
for(const name of ['seed','configure:razorpay']) if(pkg.scripts[name])pkg.scripts[name]=pkg.scripts[name].replace(/\.ts$/u,'.js')
delete pkg.scripts['connect:storefront']
delete pkg.scripts['verify:catalog']
delete pkg.scripts['verify:schema']
writeFileSync(file,JSON.stringify(pkg,null,2)+'\n')
console.log('Copied refund ledger migration into the Medusa runtime build.')
