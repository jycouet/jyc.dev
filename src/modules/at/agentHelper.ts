import { Agent } from '@atproto/api'

import { retries } from './helper'

export const getProfile = async (
  cleanHandle_or_did: string,
  options?: { maxAttempts?: number },
) => {
  const agent = new Agent(new URL('https://public.api.bsky.app'))

  const maxAttempts = options?.maxAttempts ?? 6

  return await retries(
    async () => {
      return await agent.getProfile({ actor: cleanHandle_or_did })
    },
    { maxAttempts },
  )
}

interface RateLimitInfo {
  remaining: number
  resetDate: Date
}

export function parseRateLimitHeaders(headers: Record<string, string>): RateLimitInfo {
  const remaining = parseInt(headers['ratelimit-remaining'] || '0', 10)
  const resetTimestamp = parseInt(headers['ratelimit-reset'] || '0', 10)

  return {
    remaining,
    resetDate: new Date(resetTimestamp * 1000), // Convert Unix timestamp to Date
  }
}
