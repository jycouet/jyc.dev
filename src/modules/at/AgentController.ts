import { Agent } from '@atproto/api'

import { BackendMethod } from 'remult'

import { Roles } from '$modules/auth/Roles'

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
    let allFollowers = []
    let cursor: string | undefined

    do {
      const followers = await agent.getFollowers({
        actor: profile.data.handle,
        limit: 100,
        cursor,
      })
      const ttt = followers.data.followers.map((f) => {
        return { handle: f.handle, indexedAt: f.indexedAt }
      })
      // console.log(`followers.data.followers`, ttt[0])
      // console.log(`followers.data.followers`, ttt[1])
      // console.log(`followers.data.followers`, ttt[2])

      // console.log(
      //   `followers.data.followers`,
      //   followers.data.followers[followers.data.followers.length - 1],
      // )
      // throw new Error('sdsd3')

      const rateLimit = parseRateLimitHeaders(followers.headers as Record<string, string>)
      console.info('Rate limit:', rateLimit)

      // console.log(`followers.data`, followers.data)
      // throw new Error('stop')
      allFollowers.push(...followers.data.followers)
      cursor = followers.data.cursor
    } while (cursor)

    const nbFollowers = allFollowers.length
    // console.log(`allFollowers`, allFollowers)
    allFollowers = allFollowers.sort(
      (a, b) => new Date(a.indexedAt!).getTime() - new Date(b.indexedAt!).getTime(),
    )
    // console.log(`allFollowers`, allFollowers[0])
    // console.log(`allFollowers`, allFollowers[allFollowers.length - 1])

    // const followersPeriods = chunkRecords(allFollowers)
    // console.log(`followersPeriods`, followersPeriods)

    // Get current timestamp adjusted for timezone
    const now = new Date()
    now.setMinutes(now.getMinutes() - tzOffset)

    return {
      nbFollowers,
      followersPeriods: [],
    }
  }
}
