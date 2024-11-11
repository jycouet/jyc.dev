import { Agent } from '@atproto/api'
import { DidResolver, getPds } from '@atproto/identity'

import { BackendMethod, repo } from 'remult'

import { listRecordsAll, parseUri } from '$lib/at/helper'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

import { BSkyty } from './BSkyty'
import { determineCategory } from './determineCategory'
import { RecordFollow } from './Record'

interface ActivityCounts {
  yesterday: number
  today: number
}

interface PunchCardEntry {
  weekday: number
  hour: number
  count: number
}

function getActivityCounts(records: { records: any[] }): ActivityCounts {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const toRet = {
    yesterday: records.records.filter(
      (record) =>
        new Date(record.value.createdAt) >= yesterday && new Date(record.value.createdAt) < today,
    ).length,
    today: records.records.filter((record) => new Date(record.value.createdAt) >= today).length,
  }
  // console.log(`toRet`, toRet)

  return toRet
}

function generatePunchCardData(records: any[], tzOffset: number): PunchCardEntry[] {
  const countMap = new Map<string, number>()
  records.forEach((record) => {
    const dt = new Date(record.value.createdAt)
    const clientDate = new Date(dt.setTime(dt.getTime() - tzOffset * 60000))

    const weekday = clientDate.getDay()
    const hour = clientDate.getHours()
    const key = `${weekday}-${hour + 0.5}`
    countMap.set(key, (countMap.get(key) || 0) + 1)
  })

  const result: PunchCardEntry[] = []

  // Only include entries where there is activity
  countMap.forEach((count, key) => {
    const [weekday, hour] = key.split('-')
    result.push({
      weekday: parseInt(weekday),
      hour: parseFloat(hour),
      count,
    })
  })

  return result
}

export class AtController {
  @BackendMethod({ allowed: true })
  static async getHandleStats(
    tzOffset: number,
    did: string,
    handle: string,
    displayName: string,
    avatar: string,
  ) {
    const startTime = performance.now()

    try {
      if (did) {
        const didResolver = new DidResolver({})
        const didDocument = await didResolver.resolve(did)

        if (didDocument) {
          const pds = getPds(didDocument)
          // console.log(`pds`, pds);
          // const repo = await describeRepo( pds!, did);
          // console.log(`repo`, repo);

          const four_weeks_ago = new Date()
          four_weeks_ago.setDate(four_weeks_ago.getDate() - 7 * 4)

          if (pds) {
            const [likes, posts, reposts] = await Promise.all([
              listRecordsAll(pds, did, 'app.bsky.feed.like', {
                while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
              }),
              listRecordsAll(pds, did, 'app.bsky.feed.post', {
                while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
              }),
              listRecordsAll(pds, did, 'app.bsky.feed.repost', {
                while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
              }),
            ])

            const nbRequests = likes.nbRequest + posts.nbRequest + reposts.nbRequest

            // **********
            // PUNCH CARD - START
            // **********
            const punchCard = [
              {
                kind: 'like',
                data: generatePunchCardData(likes.records, tzOffset),
              },
              {
                kind: 'post',
                data: generatePunchCardData(posts.records, tzOffset),
              },
              {
                kind: 'repost',
                data: generatePunchCardData(reposts.records, tzOffset),
              },
            ]

            // **********
            // PUNCH CARD - END
            // **********

            // **********
            // PERSONNALYTY - START
            // **********
            // Calculate the ratio of starting a post vs replying to a convo
            // Your convo score
            // convo score in general
            const postStarted = posts.records.filter((p) => !p.value.reply).map((c) => c.cid)
            const nbPostStared = postStarted.length
            const nbPostRepliesToAStartedOne = posts.records.filter(
              (p) => p.value.reply?.root.cid && postStarted.includes(p.value.reply?.root.cid),
            ).length
            const nbPostRepliesToOthers =
              posts.records.length - postStarted.length - nbPostRepliesToAStartedOne

            const kindOfPost = [
              { key: '🐣 Your new posts', value: nbPostStared },
              { key: '🦜 Replies in posts you started', value: nbPostRepliesToAStartedOne },
              { key: '🐒 Replies to the community', value: nbPostRepliesToOthers },
            ]

            let imageWithAlt = 0
            let kindOfEmbed = posts.records.reduce(
              (acc, post) => {
                let embedType = (post.value.embed?.$type || 'Text only')
                  .replaceAll('app.bsky.embed.', '')
                  .replaceAll('recordWithMedia', 'Link to other post')
                  .replaceAll('record', 'Link to other post')
                  .replaceAll('external', 'Link to outside')
                  .replaceAll('images', 'Image')

                embedType = embedType.charAt(0).toUpperCase() + embedType.slice(1)

                // https://atproto-browser.vercel.app/at/did:plc:dacfxuonkf2qtqft22sc23tu/app.bsky.feed.post/3lahlaoiohs2j
                // GIF is considered as external. Maybe I should consider it as GIF?

                let inc = 1
                if (embedType === 'Image') {
                  const hasAlt = post.value.embed.images.filter((img: { alt: string }) => {
                    return img.alt?.trim().length > 0
                  }).length

                  imageWithAlt += hasAlt
                  inc = post.value.embed.images.length
                }

                const existingType = acc.find((t) => t.kind === embedType)
                if (existingType) {
                  existingType.count = existingType.count + inc
                } else {
                  acc.push({ kind: embedType, count: inc })
                }
                return acc
              },
              [] as Array<{ kind: string; count: number }>,
            )

            let altPercentage = 0
            kindOfEmbed = kindOfEmbed.map((embed) => {
              if (embed.kind === 'Image') {
                altPercentage =
                  embed.count > 0 ? Math.round((imageWithAlt / embed.count) * 100) : 50

                const kind =
                  altPercentage === 0
                    ? 'Image (Would be better with alt! 🙏)'
                    : altPercentage < 25
                      ? `Image (Good start, keep going! 🌱 ${altPercentage}% alted)`
                      : altPercentage < 75
                        ? `Image (Great, you are getting it! ✨ ${altPercentage}% alted)`
                        : altPercentage < 100
                          ? `Image (Almost perfect! 🎉 ${altPercentage}% alted)`
                          : `Image (You rock! 🎸 ${altPercentage}% alted)`

                return {
                  ...embed,
                  kind,
                }
              }
              return embed
            })

            // **********
            // PERSONNALYTY - END
            // **********

            const category = determineCategory({
              nbPostStared,
              nbPostRepliesToAStartedOne,
              nbPostRepliesToOthers,
              kindOfEmbed,
              altPercentage,
            })

            const totalLikes = likes.records.length
            const totalPosts = posts.records.length
            const totalReposts = reposts.records.length

            const execTime = Math.round(performance.now() - startTime)
            await repo(LogHandleStats).insert({
              did,
              handle,
              displayName,
              avatar,
              tzOffset,
              execTime,
              nbRequests,
              emoji: category.emoji,
              metadata: {
                altPercentage,
                totalLikes,
                totalPosts,
                totalReposts,
                posts: { nbPostStared, nbPostRepliesToAStartedOne, nbPostRepliesToOthers },
                kindOfEmbed,
              },
            })

            return {
              likes: getActivityCounts(likes),
              posts: getActivityCounts(posts),
              reposts: getActivityCounts(reposts),
              punchCard,

              totalLikes,
              totalPosts,
              totalReposts,

              kindOfPost,
              kindOfEmbed,
              altPercentage,
              category,
            }
          }
        }
      }
    } catch (error) {
      console.error(`error`, error)
    }
    return null
    // return AtController.getHandleStatsAbscact(tzOffset, did, handle, displayName, avatar)
  }

  @BackendMethod({ allowed: true })
  static async getHandleFollow(tzOffset: number, did: string) {
    const startTime = performance.now()

    try {
      if (did) {
        const didResolver = new DidResolver({})
        const didDocument = await didResolver.resolve(did)

        if (didDocument) {
          const pds = getPds(didDocument)

          if (pds) {
            const bSkyty = await repo(BSkyty).findFirst({
              id: did,
            })
            const one_weeks_ago = new Date()
            one_weeks_ago.setDate(one_weeks_ago.getDate() - 7)

            const follows = await listRecordsAll(pds, did, 'app.bsky.graph.follow', {
              while: (r) =>
                new Date(r.value.createdAt) > one_weeks_ago &&
                r.value.subject !== bSkyty?.lastFollowDid,
            })
            const nbRequests = follows.nbRequest

            for (const follow of follows.records) {
              const uriMeta = parseUri(follow.uri)
              await repo(RecordFollow).upsert({
                where: { id: follow.uri },
                set: {
                  did: uriMeta.did,
                  rkey: uriMeta.rkey,
                  on: follow.value.createdAt,
                  didFollow: follow.value.subject,
                },
              })
            }

            if (follows.records.length > 0) {
              await repo(BSkyty).upsert({
                where: { id: did },
                set: {
                  lastFollowDid: follows.records[0].value.subject,
                },
              })
            }

            // **********
            // FOLLOW CHART - START
            // **********

            // const nbFollow = follows.records.length
            // const followsPeriods = chunkRecords(follows.records)

            // Reverse array so it goes from oldest to newest
            // followsPeriods.reverse()

            const agent = new Agent(new URL('https://public.api.bsky.app'))
            const profile = await agent.getProfile({ actor: did })

            const nbFollow = profile.data.followsCount ?? 0

            // Start from current hour
            const now = new Date()
            const startDate = new Date(now)
            startDate.setDate(startDate.getDate() - 7) // Go back 7 days

            const followsPeriods = await repo(RecordFollow).groupBy({
              group: ['onDay'],
              where: { did, on: { $gte: startDate } },
              orderBy: { onDay: 'desc' },
            })

            // Create array starting from now and walking back 7 days
            const followsPeriodsToRet: Array<{ timestamp: Date; count: number }> = []
            let nbFollowNow = nbFollow

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

            // **********
            // FOLLOW CHART - END
            // **********

            const execTime = Math.round(performance.now() - startTime)

            await repo(LogHandleFollow).insert({
              did,
              tzOffset,
              execTime,
              nbRequests,
              nbFollow,
            })

            return {
              // followsPeriods,
              followsPeriods: followsPeriodsToRet,
              followsTotal: nbFollow,
            }
          }
        }
      }
    } catch (error) {
      console.error(`error`, error)
    }
    return null
  }
}
