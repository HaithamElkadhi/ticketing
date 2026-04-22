import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/airtable": {
          target: "https://api.airtable.com/v0",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/airtable/, ""),
          headers: {
            Authorization: `Bearer ${env.AIRTABLE_TOKEN || ""}`,
            "Content-Type": "application/json",
          },
        },
      },
    },
  }
})
