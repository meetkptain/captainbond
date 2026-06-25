import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
