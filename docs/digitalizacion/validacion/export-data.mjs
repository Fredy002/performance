import { registerHooks } from 'node:module';
import { writeFile } from 'node:fs/promises';

// Native Node TypeScript loading needs extensions for the application's relative imports.
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context); }
    catch (error) {
      if (specifier.startsWith('./')) return next(`${specifier}.ts`, context);
      throw error;
    }
  },
});

const { PERFORMANCE_TABLES } = await import('../../../src/data/tables/index.ts');
await writeFile(process.argv[2], JSON.stringify(PERFORMANCE_TABLES));
