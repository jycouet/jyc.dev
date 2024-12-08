import { BskyAgent } from '@atproto/api'

import { getProfile } from '$modules/at/agentHelper'

export async function load() {
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  })

  try {
    // Replace with your Bluesky handle
    const profile = await getProfile('jyc.dev')

    return {
      profile: {
        avatar: profile.data.avatar,
      },
    }
  } catch (error) {
    console.error('Error fetching Bluesky profile:', error)
    return {
      profile: {
        displayName: 'Your Name',
        description: 'Fallback description',
        avatar: '/fallback-avatar.png',
      },
    }
  }
}
