import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rawBase = process.env.VITE_BASE_PATH ?? "/";
const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export default defineConfig({
  base: normalizedBase,
  root: path.resolve(__dirname, "site"),
  publicDir: path.resolve(__dirname, "site/public"),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "site/index.html"),
        artifact: path.resolve(__dirname, "site/artifact.html")
      }
    }
  }
});
