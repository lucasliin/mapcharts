import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: true, // 防止不必要的替换
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "packages/index.ts"),
      name: "MapChart", // 生成的库的全局名称
      fileName: (format) => `mapchart.${format}.js`,
      formats: ["umd"], // 输出为 UMD 格式，也可以是 ['es', 'umd'] 等
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
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
