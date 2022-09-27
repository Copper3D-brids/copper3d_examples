import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/copper3d_examples/",
  build: {
    outDir: "./build",
  },
  server: {
    host: "0.0.0.0",
  },
});
