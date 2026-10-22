import { defineConfig } from 'vitest/config'

// Checks the built site in dist/, so it needs `astro build` first.
// `pnpm build` runs it after every build; `pnpm test` does not.
export default defineConfig({
  test: {
    include: ['tests/dist/**/*.test.ts'],
  },
})
