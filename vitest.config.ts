import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Component tests for the blog renderer. Next itself is not involved — the
// renderer is a plain React component by design, which is what makes it
// testable and shareable between the public site and the admin preview.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["**/__tests__/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
