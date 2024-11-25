import { Agent } from '@atproto/api'
import type { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'

import { BackendMethod, repo } from 'remult'
import { Log } from '@kitql/helpers'

import { sponsors } from '$lib/sponsors'
import { Roles } from '$modules/auth/Roles'

import { getProfile } from './agentHelper'
import { didToPds, listRecordsAll, parseUri } from './helper'
import { RecordFollow } from './RecordFollow'
import { RecordFollower } from './RecordFollower'

export class AgentController {
  @BackendMethod({ allowed: true })
  static async getHandleFollowers(tzOffset: number, handle: string) {
    const startTime = performance.now()
    const log = new Log('Agent')
    log.success('start', handle)
    const agent = new Agent(new URL('https://public.api.bsky.app'))

    // Get the user's handle from the session
    const profile = await getProfile(handle)
    if (!profile) {
      return null
    }

    sponsors.push({ handle: 'jyc.dev', avatar: '', displayName: 'jyc' })
    if (!sponsors.some((s) => s.handle === handle)) {
      return {
        nbFollowers: profile.data.followersCount,
        followersPeriods: [],
        msg: "Not yet open to everyone! Let's see where it goes...",
      }
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

    log.info(`profile`, profile.data.followersCount, allFollowers.length)
    const nbFollowers = profile.data.followersCount

    const didFollow = profile.data.did
    const weAlreadyHaveTheInfo2 = await repo(RecordFollower).find({ where: { didFollow } })
    const weAlreadyHaveTheInfo = await repo(RecordFollow).find({ where: { didFollow } })
    log.info(`weAlreadyHaveTheInfo`, weAlreadyHaveTheInfo.length, weAlreadyHaveTheInfo2.length)
    const followsToCheck = allFollowers.filter(
      (f) =>
        !weAlreadyHaveTheInfo.some((wai) => wai.did === f.did) &&
        !weAlreadyHaveTheInfo2.some((wai) => wai.did === f.did),
    )
    log.info(`followsToCheck`, followsToCheck.length)

    const results = await sidequest(followsToCheck, didFollow)
    log.info(`results`, results.length)

    // CHART
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 21) // Go back 7 days

    const followsPeriods = await repo(RecordFollower).groupBy({
      group: ['onDay'],
      where: { didFollow: profile.data.did },
      orderBy: { onDay: 'desc' },
    })

    // Create array starting from now and walking back 7 days
    const followsPeriodsToRet: Array<{ timestamp: Date; count: number }> = []
    let nbFollowNow = profile.data.followersCount ?? 0

    // Walk through each hour from now back to startDate
    for (let date = new Date(now); date >= startDate; date.setHours(date.getHours() - 1)) {
      const hourStr =
        date.toISOString().split('T')[0] + '-' + date.getHours().toString().padStart(2, '0')

      const periodData = followsPeriods.find((p) => p.onDay === hourStr)

      followsPeriodsToRet.unshift({
        timestamp: new Date(date),
        count: nbFollowNow,
      })

      // Subtract the follows that happened in this hour
      if (periodData) {
        nbFollowNow -= periodData.$count
      }
    }

    const execTime = Math.round(performance.now() - startTime)

    log.info(`Execution time: ${(execTime / 1000).toFixed(2)}s`)

    return {
      nbFollowers,
      followersPeriods: followsPeriodsToRet,
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
  const results: any[] = []
  const concurrentLimit = 200
  let currentIndex = 0

  // Create a queue of promises that maintains concurrent operations
  const queue = new Set<Promise<void>>()

  while (currentIndex < followers.length || queue.size > 0) {
    // Fill queue up to limit
    while (queue.size < concurrentLimit && currentIndex < followers.length) {
      const follower = followers[currentIndex]
      const index = currentIndex

      const promise = (async () => {
        try {
          const result = await getFollows(follower.did, didFollow)
          console.log(`Finished ${index + 1}/${followers.length}`)
          results.push(result)
        } catch (error) {
          console.error(`Error getting follows for ${follower.did}:`, error)
          results.push(undefined)
        } finally {
          // @ts-ignore
          queue.delete(promise)
        }
      })()

      queue.add(promise)
      currentIndex++
    }

    // Wait for at least one promise to complete before next iteration
    if (queue.size > 0) {
      await Promise.race(queue)
    }
  }

  return results
}
