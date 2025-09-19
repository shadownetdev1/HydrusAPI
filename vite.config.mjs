import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // globals: true,
    coverage: {
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: process.env.GITHUB_ACTIONS ? ['text', 'html', 'json-summary', 'github-actions'] : ['text', 'html', 'json-summary'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
      exclude: ['docs/coverage', 'scripts', 'eslint.config.mjs', 'vite.config.mjs', 'types', 'tests/hydrus', 'tests/deep-object-diff-fixed'],
      reportsDirectory: './docs/coverage'
    },
    exclude: ['node_modules', 'docs/coverage', 'scripts', 'eslint.config.mjs', 'vite.config.mjs', 'types', 'tests/hydrus', 'tests/deep-object-diff-fixed']
  },
})