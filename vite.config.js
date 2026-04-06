import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/cl/dev':  { target: 'https://api-dev-getnet-posintegrado.ione.cl/api/postxs/', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/cl\/dev/, '') },
      '/api/cl/uat':  { target: 'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/cl\/uat/, '') },
      '/api/cl/prod': { target: 'https://api-getnet-posintegrado.ione.cl/api/postxs/',     changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/cl\/prod/, '') },
      '/api/ar/dev':  { target: 'https://api-dev.ione-tech.com/api/postxs/',              changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/ar\/dev/, '') },
      '/api/ar/uat':  { target: 'https://api-uat.ione-tech.com/api/postxs/',              changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/ar\/uat/, '') },
      '/api/ar/prod': { target: 'https://api.ione-tech.com/api/postxs/',                  changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/ar\/prod/, '') },
    }
  }
});
