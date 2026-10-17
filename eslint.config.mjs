import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  { ignores: ['.next/**', '_next/**', 'node_modules/**', 'backend/**', 'supabase/**'] },
  { rules: { 'react/no-unescaped-entities': 'off', '@next/next/no-html-link-for-pages': 'off' } },
])
