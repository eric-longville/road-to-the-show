import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// `.mts` so the ESM config loads without Vite's CommonJS warning.
// Default environment is `node` — the domain core is pure functions, so it
// runs fast. Component tests (later in M1) opt into jsdom per file with a
// `// @vitest-environment jsdom` directive, and the jest-dom matchers below.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
