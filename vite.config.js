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
      '/cl-api-dev':  { target: 'https://api-dev-getnet-posintegrado.ione.cl/api/postxs/', changeOrigin: true, rewrite: (p) => p.replace(/^\/cl-api-dev/, '') },
      '/cl-api-uat':  { target: 'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/', changeOrigin: true, rewrite: (p) => p.replace(/^\/cl-api-uat/, '') },
      '/cl-api-prod': { target: 'https://api-getnet-posintegrado.ione.cl/api/postxs/',     changeOrigin: true, rewrite: (p) => p.replace(/^\/cl-api-prod/, '') },
      '/ar-api-dev':  { target: 'https://api-dev.ione-tech.com/api/postxs/',              changeOrigin: true, rewrite: (p) => p.replace(/^\/ar-api-dev/, '') },
      '/ar-api-uat':  { target: 'https://api-uat.ione-tech.com/api/postxs/',              changeOrigin: true, rewrite: (p) => p.replace(/^\/ar-api-uat/, '') },
      '/ar-api-prod': { target: 'https://api.ione-tech.com/api/postxs/',                  changeOrigin: true, rewrite: (p) => p.replace(/^\/ar-api-prod/, '') },
    }
  }
});
