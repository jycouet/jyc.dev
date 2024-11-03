import { redirect } from '@sveltejs/kit'
import { google } from 'googleapis'

import { cyan, green, Log } from '@kitql/helpers'

import { YOUTUBE_API_KEY } from '$env/static/private'
import { dev } from '$app/environment'

import type { PageServerLoad } from './$types'

const log = new Log('jyc.dev')

async function fetchImageAsBase64(url: string) {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      redirect: 'follow',
    })
    const arrayBuffer = await response.arrayBuffer()
    // @ts-ignore
    const base64String = Buffer.from(arrayBuffer).toString('base64')
    return base64String
  } catch (error) {
    console.error('Failed to fetch and convert image', error)
  }
}

export const load = (async ({ fetch, params }) => {
  const initData = await getVideoViews(params.videoId)

  return {
    ...initData,
    blob: await fetchImageAsBase64(
      initData.snippet.thumbnails.maxres?.url ?? initData.snippet.thumbnails.standard?.url,
    ),
  }
}) satisfies PageServerLoad

const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY })

async function getVideoViews(videoId: string) {
  try {
    const response = await youtube.videos.list({
      // @ts-ignore
      id: videoId,
      part: 'snippet,statistics,contentDetails',
    })

    // @ts-ignore
    if (response.data.items && response.data.items.length > 0) {
      // @ts-ignore
      const views = response.data.items[0].statistics?.viewCount

      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`
      log.success(`${cyan(ytUrl)} has ${green(views)} views`)

      if (!dev) {
        fetch(
          `https://discord.com/api/webhooks/1229567369396097167/SiAVwgukWmGI3FHD126Nc9BwR9V0q_xBmvCM6t8Ec4-EjBx7cR78XoHR21La4_q5wpes`,
          {
            method: `POST`,
            headers: {
              'Content-Type': `application/json`,
            },
            body: JSON.stringify({
              content: `New search: \`${ytUrl}\` has ${views} views`,
            }),
          },
        )
      }

      // @ts-ignore
      return response.data.items[0]
    } else {
      redirect(303, '/thumb-meta')
    }
  } catch (error) {
    log.error(error)
    redirect(303, '/thumb-meta')
  }
}
