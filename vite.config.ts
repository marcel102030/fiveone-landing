import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base "/" gera caminhos absolutos (/assets/...) — necessário para rotas
  // aninhadas como /insights/:slug e /cursos/apologetica funcionarem em
  // acesso direto. Com "" (relativo), ./assets quebrava em sub-rotas.
  base: "/",
  server: {
    proxy: {
      "/api": {
        // Permite trocar o alvo do proxy via env ao desenvolver.
        // Ex.: VITE_API_TARGET=http://127.0.0.1:8788 para usar wrangler pages dev
        target: process.env.VITE_API_TARGET || "https://fiveonemovement.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
