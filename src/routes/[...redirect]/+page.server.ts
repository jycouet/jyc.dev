import { redirect } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load = (async ({ params, url }) => {
  if (params.redirect.includes('youtube')) {
    const videoId = url.searchParams.get('v')
    redirect(302, `/thumb-meta/${videoId}`)
  } else if (params.redirect.includes('bsky.app')) {
    // thus url should look like: jyc.dev/bsky.app/profile/mikek.me
    // we should redirect to /at/mikek.me
    const handle = params.redirect.split('/').pop()
    redirect(302, `/at/${handle}`)
  } else {
    redirect(302, `/blog`)
  }

  return {}
}) satisfies PageServerLoad
