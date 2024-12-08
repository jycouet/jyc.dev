import { Agent } from '@atproto/api'

import { retries } from './helper'

export const getProfile = async (
  cleanHandle_or_did: string,
  options?: { maxAttempts?: number; withLog?: boolean },
) => {
  const agent = new Agent(new URL('https://public.api.bsky.app'))
  const withLog = options?.withLog ?? true
  return await retries(
    async () => {
      return await agent.getProfile({ actor: cleanHandle_or_did })
    },
    {
      maxAttempts: options?.maxAttempts ?? 6,
      withLog,
    },
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

export const getLabels = (profile: Awaited<ReturnType<typeof getProfile>>['data']) => {
  return (profile.labels ?? []).map((c) => c.val)
}

export const has_NoUnauthenticated = (labels: string[]) => {
  return labels.some((c) => c === '!no-unauthenticated')
}

export const has_AnExcluder = (labels: string[]) => {
  const toExclude = ['porn', 'nsfw', 'adult']
  return labels.some((c) => toExclude.includes(c))
}
