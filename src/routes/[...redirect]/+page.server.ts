import { redirect } from '@sveltejs/kit'

import { route } from '$lib/ROUTES'

import type { PageServerLoad } from './$types'

export const load = (async ({ params, url }) => {
  if (params.redirect.includes('youtube')) {
    const videoId = url.searchParams.get('v')
    redirect(302, route(`/thumb-meta/[videoId]`, { videoId: videoId ?? '' }))
  } else if (params.redirect.includes('bsky.app')) {
    const handle = params.redirect.split('/').pop()
    redirect(302, route(`/crab/[handle]`, { handle: handle ?? '' }))
  } else {
    if (url.host === 'localhost:5173') {
      // Just for dev purposes
      redirect(302, route(`/crab`))
    } else if (url.host === 'jyc.dev') {
      redirect(302, route(`/blog`))
    } else {
      redirect(302, route(`/crab`))
    }
  }

  return {}
}) satisfies PageServerLoad
