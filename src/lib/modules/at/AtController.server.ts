import { DidResolver, getPds } from '@atproto/identity'

import { Log } from '@kitql/helpers'

import { listRecordsAll } from '$lib/at/helper'

import { determineCategory } from './determineCategory'

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

const log = new Log('AtController')

export async function getHandleStats(tzOffset: number, did: string) {
  log.info(`getHandleStats`, did, tzOffset)
  // const dt = new Date()
  // const serverDate = new Date(dt)
  // const clientDate = new Date(dt.setTime(dt.getTime() - tzOffset * 60000))
  // console.log(`clientDate`, serverDate, clientDate)

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
          const [likes, posts, reposts, follows] = await Promise.all([
            listRecordsAll(pds, did, 'app.bsky.feed.like', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(pds, did, 'app.bsky.feed.post', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(pds, did, 'app.bsky.feed.repost', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(pds, did, 'app.bsky.graph.follow'),
          ])

          const totalRequests =
            likes.nbRequest + posts.nbRequest + reposts.nbRequest + follows.nbRequest

          log.info(`totalRequests`, totalRequests)

          // **********
          // FOLLOW CHART - START
          // **********
          const followsTotal = follows.records.length
          const followsPeriods: { timestamp: Date; count: number }[] = []

          // Get current time and round down to nearest 12h period
          const currentPeriodStart = new Date()
          followsPeriods.unshift({
            timestamp: new Date(currentPeriodStart),
            count: followsTotal,
          })
          currentPeriodStart.setMinutes(0, 0, 0)
          if (currentPeriodStart.getHours() >= 12) {
            currentPeriodStart.setHours(12)
          } else {
            currentPeriodStart.setHours(0)
          }

          // Get periods for last 7 days with cumulative counts
          const sevenDaysAgo = new Date(currentPeriodStart)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

          follows.records.reverse()

          // Loop through follows from newest to oldest to build cumulative counts
          for (let i = follows.records.length - 1; i >= 0; i--) {
            const followDate = new Date(follows.records[i].value.createdAt)
            // console.log(`currentPeriodStart`, followDate, currentPeriodStart)

            // Skip if before 7 days ago
            if (followDate < sevenDaysAgo) continue

            if (followDate < currentPeriodStart) {
              followsPeriods.unshift({
                timestamp: new Date(currentPeriodStart),
                count: i + 1,
              })
              currentPeriodStart.setTime(currentPeriodStart.getTime() - 12 * 60 * 60 * 1000)
            }
          }

          // If this... That mean that nothing happened in the last 7 days
          if (followsPeriods.length === 1) {
            followsPeriods.unshift({
              timestamp: new Date(currentPeriodStart),
              count: followsTotal,
            })
          }

          // **********
          // FOLLOW CHART - END
          // **********

          // **********
          // PUNCH CARD - START
          // **********
          const punchCard = [
            {
              kind: 'like',
              data: generatePunchCardData(likes.records, tzOffset),
            },
            {
              kind: 'skeet',
              data: generatePunchCardData(posts.records, tzOffset),
            },
            {
              kind: 'reskeet',
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
            { key: '🐣 Your new skeets', value: nbPostStared },
            { key: '🦜 Replies in skeets you started', value: nbPostRepliesToAStartedOne },
            { key: '🐒 Replies to the community', value: nbPostRepliesToOthers },
          ]

          const kindOfEmbed = posts.records.reduce(
            (acc, post) => {
              const embedType = (post.value.embed?.$type || 'text only')
                .replaceAll('app.bsky.embed.', '')
                .replaceAll('record', 'link to other post')
                .replaceAll('external', 'link to outside')
                .replaceAll('images', 'image')
              const existingType = acc.find((t) => t.kind === embedType)
              if (existingType) {
                existingType.count++
              } else {
                acc.push({ kind: embedType, count: 1 })
              }
              return acc
            },
            [] as Array<{ kind: string; count: number }>,
          )

          // **********
          // PERSONNALYTY - END
          // **********

          return {
            likes: getActivityCounts(likes),
            posts: getActivityCounts(posts),
            reposts: getActivityCounts(reposts),
            followsPeriods,
            followsTotal,
            punchCard,
            totalLikes: likes.records.length,
            totalPosts: posts.records.length,
            totalReposts: reposts.records.length,
            kindOfPost,
            kindOfEmbed,
            category: determineCategory({
              nbPostStared,
              nbPostRepliesToAStartedOne,
              nbPostRepliesToOthers,
              kindOfEmbed,
            }),
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
  }
  return null
}
