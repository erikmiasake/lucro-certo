import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers — smaller, faster output (no IE polyfills)
    target: "es2020",
    // NOTE: manualChunks removed — it caused "Cannot access 'x' before
    // initialization" (TDZ) errors in production due to cross-chunk
    // circular dependencies between react/motion/radix. Let Rollup
    // handle chunking automatically based on the real module graph.
  },
}));
