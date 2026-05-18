import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  noExternal: ['cupel', '@cupel/shared'],
  banner: {
    js: "import { createRequire as __cupelCreateRequire } from 'module'; const require = __cupelCreateRequire(import.meta.url);",
  },
});
