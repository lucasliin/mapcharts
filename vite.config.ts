import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: true,
    }),
    typescript({
      target: "es2015",
      rootDir: resolve("src/"),
      declaration: true,
      declarationDir: resolve("dist"),
      exclude: [resolve("node_modules/**"), resolve("svgicons/**")],
      allowSyntheticDefaultImports: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "packages/index.ts"),
      name: "LexicalRichTextEditor",
      fileName: (format) => `lexicalrichtexteditor.${format}.js`,
      formats: ["umd"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
