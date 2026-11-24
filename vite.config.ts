import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** Keep the built stylesheet ahead of the module script so the first paint is already laid out. */
function stylesBeforeScripts(): Plugin {
  return {
    name: 'styles-before-scripts',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const links = html.match(/<link rel="stylesheet"[^>]*>/g)
        if (!links?.length) return html
        const withoutLinks = html.replace(/[ \t]*<link rel="stylesheet"[^>]*>\r?\n?/g, '')
        const block = links.map((link) => `    ${link}`).join('\n')
        if (withoutLinks.includes('<script type="module"')) {
          return withoutLinks.replace('<script type="module"', `${block}\n    <script type="module"`)
        }
        return withoutLinks.replace('</head>', `${block}\n  </head>`)
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stylesBeforeScripts()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
