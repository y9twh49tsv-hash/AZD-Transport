import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      /**
       * `import 'server-only'` throws outside a Server Component, which is the
       * whole point of the package — but it also makes server modules
       * untestable. The stub keeps the guard in place where it matters (the
       * real package is still what the bundler resolves for the application)
       * and lets the test runner import those modules.
       */
      'server-only': path.resolve(__dirname, './src/test/server-only-stub.ts'),
    },
  },
});
