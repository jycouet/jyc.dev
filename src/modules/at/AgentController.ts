import { Agent, CredentialSession } from '@atproto/api'
import { DidResolver, getPds } from '@atproto/identity'

import { BackendMethod, remult, repo } from 'remult'

import { AppUser } from '$modules/auth/Entities'
import { Roles } from '$modules/auth/Roles'

import { chunkRecords, listRecordsAll } from '../../lib/at/helper'

interface RateLimitInfo {
  remaining: number
  resetDate: Date
}

function parseRateLimitHeaders(headers: Record<string, string>): RateLimitInfo {
  const remaining = parseInt(headers['ratelimit-remaining'] || '0', 10)
  const resetTimestamp = parseInt(headers['ratelimit-reset'] || '0', 10)

  return {
    remaining,
    resetDate: new Date(resetTimestamp * 1000), // Convert Unix timestamp to Date
  }
}

export class AgentController {
  @BackendMethod({ allowed: Roles.admin })
  static async getHandleFollowers(tzOffset: number) {
    // const didResolver = new DidResolver({})
    // const didDocument = await didResolver.resolve('did:plc:dacfxuonkf2qtqft22sc23tu')
    // const pds = getPds(didDocument!)
    // const ttt = await listRecordsAll(pds!, 'did:plc:dacfxuonkf2qtqft22sc23tu', 'app.bsky.graph.getFollowers')
    // console.log(`ttt`, ttt)

    // throw new Error('stop')
    // https://public.api.bsky.app
    //     const credentialSession = new CredentialSession(new URL('https://bsky.social'))
    // // const u = await repo(AppUser).findId(remult.user!.id)
    // const u = await repo(AppUser).findFirst({ handle: 'jyc.dev' })
    // if (!u?.atpSessionData) throw new Error('User not authenticated with Bluesky')

    // credentialSession.resumeSession(u.atpSessionData)
    // const agent = new Agent(credentialSession)
    const agent = new Agent(new URL('https://public.api.bsky.app'))

    // Get the user's handle from the session
    const profile = await agent.getProfile({ actor: 'jyc.dev' })

    // Get all followers using cursor pagination
    const allFollowers = []
    let cursor: string | undefined

    do {
      const followers = await agent.getFollowers({
        actor: profile.data.handle,
        limit: 100,
        cursor,
      })

      const rateLimit = parseRateLimitHeaders(followers.headers as Record<string, string>)
      // console.log('Rate limit:', rateLimit)

      console.log(`followers.data`, followers.data)
      throw new Error('stop')
      allFollowers.push(...followers.data.followers)
      cursor = followers.data.cursor
    } while (cursor)

    const nbFollowers = allFollowers.length
    const followersPeriods = chunkRecords(allFollowers, { createdAtLocation: 'createdAt' })
    console.log(`followersPeriods`, followersPeriods)

    // Get current timestamp adjusted for timezone
    const now = new Date()
    now.setMinutes(now.getMinutes() - tzOffset)

    return {
      nbFollowers,
      followersPeriods,
    }
  }
}
