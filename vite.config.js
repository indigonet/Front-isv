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
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom") ||
              id.includes("@mui") ||
              id.includes("@emotion")
            ) {
              return "vendor-core";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("gsap")) {
              return "vendor-gsap";
            }
            if (id.includes("peerjs")) {
              return "vendor-peerjs";
            }
          }
        },
      },
    },
  },
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
