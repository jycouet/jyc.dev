import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { kitRoutes } from 'vite-plugin-kit-routes'

import { write } from '@kitql/internals'

import type { KIT_ROUTES } from '$lib/ROUTES'

import { getProfile } from './src/modules/at/agentHelper'

export default defineConfig({
  plugins: [
    sveltekit(),
    kitRoutes<KIT_ROUTES>({
      PAGES: {
        '/stats/[handle]': {
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
    {
      name: 'sponsors',
      async buildStart() {
        const sponsors = [
          'tigur.com',
          'imlunahey.com',
          'harry-lewiston.bsky.social',
          'patak.dev',
          'robertlin.bsky.social',
          'eomasters.org',
          'adaszpilka.bsky.social',
        ]
        const sponsorsData = await Promise.all(
          sponsors.map(async (handle) => {
            try {
              return await getProfile(handle)
            } catch (error) {
              console.error(error)
            }
          }),
        )

        write('src/lib/sponsors.ts', [
          `export const sponsors = [`,
          sponsorsData
            .filter((c) => c !== undefined)
            .map((sponsor) => {
              return `  {
    handle: '${sponsor.data.handle}',
    avatar:
      '${sponsor.data.avatar}',
    displayName: '${sponsor.data.displayName}',
  }`
            })
            .join(',\n') + ',',
          `]`,
          '',
        ])
      },
    },
  ],
})
