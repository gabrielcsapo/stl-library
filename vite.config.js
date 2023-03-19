import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      path: path.resolve(__dirname, "node_modules/path-browserify"),
    },
  },
  server: {
    port: 3000,
  },
  plugins: [react(), reactRefresh()],
});
