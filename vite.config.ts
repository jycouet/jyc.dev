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
              type: '"true" | "false"',
            },
          },
        },
      },
      LINKS: {
        bsky_profile: {
          href: 'https://bsky.app/profile/[handle]',
        },
        bsky_hashtag: {
          href: 'https://bsky.app/hashtag/[hashtag]',
        },
        bsky_starter_pack: {
          href: 'https://bsky.app/starter-pack/[creator_handle]/[rkey]',
        },
      },
    }),
  ],
})
