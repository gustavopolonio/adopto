import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environmentMatchGlobs: [
      ['src/http/**', 'prisma/vitest-environment-prisma.ts'],
    ],
    env: {
      BUCKET_NAME: 'adopto-pet-images-test',
    },
  },
})
