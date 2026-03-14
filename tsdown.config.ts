import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  format: "esm",
  clean: true,
  plugins: [
    {
      name: "css-as-text",
      transform(code, id) {
        if (id.endsWith(".css")) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            moduleType: "js",
          };
        }
      },
    },
  ],
});
