import { Agent } from '@atproto/api'

import { sleep } from '@kitql/helpers'

export const getProfile = async (cleanHandle_or_did: string) => {
  const agent = new Agent(new URL('https://public.api.bsky.app'))

  let profile

  for (let i = 0; i < 6; i++) {
    try {
      profile = await agent.getProfile({ actor: cleanHandle_or_did })
      break
    } catch (error) {
      if (i >= 2) throw error
      await sleep(500 * (i + 1))
    }
  }

  return profile
}
