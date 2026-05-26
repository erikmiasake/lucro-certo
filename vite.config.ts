import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers — smaller, faster output (no IE polyfills)
    target: "es2020",
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy for mobile performance:
         *
         *  vendor-react   — react + react-dom + react-router (must stay together)
         *  vendor-motion  — framer-motion (used on many pages; own chunk = cached separately)
         *  vendor-charts  — recharts + d3 (only loaded on Movimentacoes / Custos / Desempenho)
         *  vendor-supabase — @supabase (auth + db client)
         *  vendor-radix   — all @radix-ui/* primitives (grouped to reduce request count)
         *  vendor-forms   — react-hook-form + zod (forms only)
         *  vendor         — everything else in node_modules
         *
         * Benefits:
         *  1. Each vendor chunk is hashed and cached independently — a code change in
         *     your app pages no longer busts the 200 KB framer-motion cache.
         *  2. recharts (~200 KB) is never downloaded on the login or overview screens.
         *  3. Parallel chunk downloads on modern mobile HTTP/2 connections.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // React core — must stay in one chunk (context, scheduler, etc.)
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router")
          ) {
            return "vendor-react";
          }

          // Animation library — used across ~35 files; own chunk = long-lived cache
          if (id.includes("/framer-motion") || id.includes("/motion/")) {
            return "vendor-motion";
          }

          // Charts — pulled in lazily via Movimentacoes / Custos / Desempenho only
          if (
            id.includes("/recharts/") ||
            id.includes("/d3-") ||
            id.includes("/victory-vendor/")
          ) {
            return "vendor-charts";
          }

          // Supabase — auth + realtime + postgrest
          if (id.includes("/@supabase/")) {
            return "vendor-supabase";
          }

          // Radix UI primitives — ~26 packages grouped to cut HTTP requests
          if (id.includes("/@radix-ui/")) {
            return "vendor-radix";
          }

          // Forms / validation
          if (
            id.includes("/react-hook-form/") ||
            id.includes("/@hookform/") ||
            id.includes("/zod/")
          ) {
            return "vendor-forms";
          }

          // Catch-all vendor bucket
          return "vendor";
        },
      },
    },
  },
}));
