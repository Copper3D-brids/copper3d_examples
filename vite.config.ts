import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import glslify from "rollup-plugin-glslify";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return tag === "ion-icon"; // (return true)
          },
        },
      },
    }),
    glslify({
      // Default
      include: ["**/*.vs", "**/*.fs", "**/*.vert", "**/*.frag", "**/*.glsl"],

      // Undefined by default
      exclude: "node_modules/**",

      // Compress shader by default using logic from rollup-plugin-glsl
      compress: true,
    }),
  ],
  base: "/copper3d_examples/",
  build: {
    outDir: "./build",
  },
  server: {
    host: "0.0.0.0",
  },
});
