import path from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * Vitest configuration for repository-level integrity tests.
 *
 * We run validations in a Node environment (filesystem + schemas + JSON parsing).
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
  test: {
    environment: 'node',
    // Use threads pool to avoid fork process termination issues in constrained environments.
    pool: 'threads',
    include: ['tests/**/*.test.ts'],
    reporters: ['default'],
    passWithNoTests: false,
  },
})
