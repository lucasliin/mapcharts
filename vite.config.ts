import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import typescript from "@rollup/plugin-typescript";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import replace from "@rollup/plugin-replace";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    react(),
    typescript({
      target: "es5",
      rootDir: resolve("packages/"),
      declaration: true,
      declarationDir: resolve("lib"),
      exclude: resolve("node_modules/**"),
      allowSyntheticDefaultImports: true,
    }),
    // replace({
    //   "process.env.NODE_ENV": JSON.stringify("production"),
    //   preventAssignment: true, // 防止不必要的替换
    // }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "packages/index.ts"),
      name: "MapChart",
      fileName: (format) => `mapchart.${format}.js`,
      formats: ["umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "react",
          "react-dom": "react-dom",
        },
      },
    },
  },
});
