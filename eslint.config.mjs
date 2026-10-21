import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  { ignores: ['.next/**', '_next/**', 'node_modules/**', 'backend/**', 'supabase/**'] },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      // React 19's new rule flags several intentional mount-time initializers in
      // the existing storefront and generated UI components. Keep them visible
      // during cleanup without blocking a production build.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
