import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { kitRoutes } from 'vite-plugin-kit-routes'

import type { KIT_ROUTES } from '$lib/ROUTES'

export default defineConfig({
  plugins: [
    sveltekit(),
    kitRoutes<KIT_ROUTES>({
      PAGES: {
        '/at/[handle]': {
          explicit_search_params: {
            skip_follow: {
              required: false,
              type: 'boolean',
            },
          },
        },
      },
    }),
  ],
})
