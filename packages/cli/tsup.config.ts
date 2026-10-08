import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  // Types publiés (exports["."].types = dist/index.d.ts). L'API publique n'expose aucun type de @cupel/shared
  // (non publié) : vérifié par l'absence de toute référence à @cupel/shared dans le .d.ts généré.
  // `incremental` (tsconfig.base) est incompatible avec l'émission d'un .d.ts unique : désactivé pour cette étape.
  dts: { compilerOptions: { incremental: false } },
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: false,
  noExternal: ['@cupel/shared'],
});
