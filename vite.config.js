import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { config } from './src/config.js'

const siteUrl = `https://${config.githubUsername}.github.io/${config.repoName}/`;

export default defineConfig({
  base: `/${config.repoName}/`,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'html-config-inject',
      transformIndexHtml(html) {
        return html
          .replace(/__SITE_URL__/g, siteUrl)
          .replace(/__OG_IMAGE__/g, `${siteUrl}WC_2026_image.png`);
      },
    },
  ],
})
