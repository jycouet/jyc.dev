import { Agent } from '@atproto/api'

import { BackendMethod } from 'remult'
import { Log } from '@kitql/helpers'

import { Roles } from '$modules/auth/Roles'

import { getProfile } from './agentHelper'
import { didToPds, listRecordsAll } from './helper'

export class AgentController {
  @BackendMethod({ allowed: Roles.admin })
  static async getHandleFollowers(tzOffset: number) {
    const agent = new Agent(new URL('https://public.api.bsky.app'))

    // Get the user's handle from the session
    const profile = await getProfile('jyc.dev')
    if (!profile) {
      return null
    }

    // Get all followers using cursor pagination
    const allFollowers = []
    let cursor: string | undefined

    do {
      const followers = await agent.getFollowers({
        actor: profile.data.handle,
        limit: 100,
        cursor,
      })
      allFollowers.push(...followers.data.followers)
      cursor = followers.data.cursor
    } while (cursor)

    const log = new Log('Agent')
    log.info(`profile`, profile.data.followersCount, allFollowers.length)
    const nbFollowers = profile.data.followersCount

    // console.log(`allFollowers`, allFollowers.slice(0, 3))
    const followers = allFollowers.slice(0, 3)
    // console.log(`followers`, followers)

    const ret = await Promise.all(
      followers.map(async (follower) => await getFollows(follower.did, profile.data.did)),
    )
    // console.log(`ret`, ret)

    // Get current timestamp adjusted for timezone

    // Get current timestamp adjusted for timezone
    const now = new Date()
    now.setMinutes(now.getMinutes() - tzOffset)

    return {
      nbFollowers,
      followersPeriods: [],
    }
  }
}

const getFollows = async (did: string, didFollow: string) => {
  // console.log(`didFollow`, didFollow)

  // const alreadyInDb = await repo(RecordFollow).findFirst({ did, didFollow })
  // return alreadyInDb
  const pds = await didToPds(did)
  // console.log(`pds`, pds)

  if (pds) {
    const follows = await listRecordsAll(pds, did, 'app.bsky.graph.follow', {
      while: (r) => r.value.subject !== didFollow,
      takeTheBreakingWhile: true,
    })
    const whenItHappen = follows.records[follows.records.length - 1]
    // console.dir(follows, { depth: null })
    // console.log(`whenItHappen`, whenItHappen.value.createdAt)
    return whenItHappen.value.createdAt
  }
}
