import tailwindCss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-oxc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindCss()],
  server: { port: 3000 },
  build: { target: "esnext" },
  preview: { port: 3000 },
  // experimental: { enableNativePlugin: true },
});
