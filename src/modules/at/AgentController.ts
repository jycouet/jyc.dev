import { Agent } from '@atproto/api'
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'

import { BackendMethod, repo } from 'remult'
import { Log } from '@kitql/helpers'

import { Roles } from '$modules/auth/Roles'

import { getProfile } from './agentHelper'
import { didToPds, listRecordsAll, parseUri } from './helper'
import { RecordFollow } from './RecordFollow'
import { RecordFollower } from './RecordFollower'

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

    const didFollow = profile.data.did
    const weAlreadyHaveTheInfo = await repo(RecordFollow).find({ where: { didFollow } })
    const weAlreadyHaveTheInfo2 = await repo(RecordFollower).find({ where: { didFollow } })
    log.info(`weAlreadyHaveTheInfo`, weAlreadyHaveTheInfo.length, weAlreadyHaveTheInfo2.length)
    const followsToCheck = allFollowers.filter(
      (f) =>
        !weAlreadyHaveTheInfo.some((wai) => wai.did === f.did) &&
        !weAlreadyHaveTheInfo2.some((wai) => wai.did === f.did),
    )
    log.info(`followsToCheck`, followsToCheck.length)

    const results = await sidequest(followsToCheck, didFollow)
    log.info(`results`, results.length)

    // Get current timestamp adjusted for timezone
    const now = new Date()
    now.setMinutes(now.getMinutes() - tzOffset)

    return {
      nbFollowers,
      followersPeriods: [],
    }
  }
}

let globalcount = 0
const getFollows = async (did: string, didFollow: string) => {
  const alreadyInDb = await repo(RecordFollower).findFirst({ did, didFollow })
  if (alreadyInDb) {
    console.log(`alreadyInDb`, alreadyInDb.createdAt)
    return alreadyInDb.createdAt
  }

  const alreadyInDb2 = await repo(RecordFollow).findFirst({ did, didFollow })
  if (alreadyInDb2) {
    console.log(`alreadyInDb2 GREAT`, alreadyInDb2.createdAt)
    await repo(RecordFollower).upsert({
      where: {
        did,
        didFollow,
      },
      set: {
        createdAt: alreadyInDb2.createdAt,
        uri: alreadyInDb2.uri,
      },
    })
    return alreadyInDb2.createdAt
  }

  const pds = await didToPds(did)

  if (pds) {
    try {
      const follows = await listRecordsAll(pds, did, 'app.bsky.graph.follow', {
        while: (r) => r.value.subject !== didFollow,
        takeTheBreakingWhile: true,
      })

      globalcount += follows.nbRequest
      console.log(`nbRequest`, follows.nbRequest, globalcount)
      const follow = follows.records[follows.records.length - 1]
      const ins = await repo(RecordFollower).upsert({
        where: {
          did,
          didFollow,
        },
        set: {
          createdAt: new Date(follow.value.createdAt),
          uri: follow.uri,
        },
      })

      return ins.createdAt
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('TypeError: fetch failed')) {
          // To not trigger again... The did probably changed / was deleted / ...
          await repo(RecordFollower).upsert({
            where: {
              did,
              didFollow,
            },
            set: {
              uri: '',
              createdAt: null,
            },
          })
        }
        new Log(`getFollows`).error(error.message)
      } else {
        new Log(`getFollows`).error(error)
      }
    }
  }
  return undefined
}

const sidequest = async (followers: ProfileView[], didFollow: string) => {
  // // console.log(`allFollowers`, allFollowers.slice(0, 3))
  // const followers = allFollowers //.slice(0, 20)
  // // console.log(`followers`, followers)

  const results = []

  // for (let i = 0; i < followers.length; i++) {
  //   const follower = followers[i]
  //   console.log(`i`, i, follower.did)
  //   const ret = await getFollows(follower.did, didFollow)
  //   results.push(ret)
  // }

  // Process followers in batches of 10
  const batchSize = 80
  for (let i = 0; i < followers.length; i += batchSize) {
    console.log(`batch POS`, i)

    const batch = followers.slice(i, i + batchSize)

    const batchResults = await Promise.allSettled(
      batch.map(async (follower) => {
        try {
          return await getFollows(follower.did, didFollow)
        } catch (error) {
          console.error(`Error getting follows for ${follower.did}:`, error)
          return undefined
        }
      }),
    ).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : undefined)))
    console.log(`i DONE`, i)
    results.push(...batchResults)
  }

  // console.log(`ret`, results)
  return results
}
