import tailwindCss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-oxc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindCss()],
  resolve: {
    alias: {
      src: "/src",
      components: "/components",
      root: "/",
    },
  },
  server: { port: 3000 },
  build: { target: "esnext" },
  preview: { port: 3000 },
  experimental: { enableNativePlugin: true },
});
