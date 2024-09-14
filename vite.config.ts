import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import typescript from "@rollup/plugin-typescript";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

function resolve(str: string) {
  return path.resolve(__dirname, str);
}

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
  ],
  build: {
    outDir: "lib",
    cssTarget: "chrome61",
    lib: {
      entry: resolve("packages/index.ts"),
      name: "RichText",
      fileName: "richtext",
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
