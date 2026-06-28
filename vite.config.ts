import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function cssBeforeAppScript(): Plugin {
  return {
    name: 'css-before-app-script',
    enforce: 'post',
    transformIndexHtml(html) {
      const stylesheet = html.match(/<link rel="stylesheet"[^>]*>/)
      const appScript = html.match(/<script type="module"[^>]*><\/script>/)
      if (!stylesheet || !appScript) return html

      return html
        .replace(stylesheet[0], '')
        .replace(appScript[0], `${stylesheet[0]}\n    ${appScript[0]}`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Root-domain Cloudflare Pages deployment (https://stuartlab.signallabsystems.com)
  base: '/',
  plugins: [react(), cssBeforeAppScript()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    cssCodeSplit: true,
  },
})
