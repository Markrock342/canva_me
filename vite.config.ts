import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'polotno/utils/validate-key.js': path.resolve(
        __dirname,
        'src/polotno/validate-key-shim.ts',
      ),
    },
  },
  optimizeDeps: {
    include: ['polotno', 'mobx', 'mobx-state-tree', 'konva'],
  },
})
