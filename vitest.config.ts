import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['app/components/**/*.test.tsx', 'jsdom']],
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts',
      'app/**/__tests__/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts'],
    },
  },
  resolve: {
    alias: {
      '@/simulator': resolve(__dirname, './src/simulator'),
      '@/io': resolve(__dirname, './src/io'),
      '@/app': resolve(__dirname, './app'),
    },
  },
});
