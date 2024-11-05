import { DidResolver, getPds, HandleResolver } from '@atproto/identity'

import { BackendMethod } from 'remult'
import { Log, sleep } from '@kitql/helpers'

import { listRecords, listRecordsAll } from '$lib/at/helper'

import { determineCategory } from './determineCategory'

interface ActivityCounts {
  yesterday: number
  today: number
}

interface PunchCardEntry {
  weekday: string
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

function generatePunchCardData(records: any[]): PunchCardEntry[] {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const countMap = new Map<string, number>()

  records.forEach((record) => {
    const date = new Date(record.value.createdAt)
    const weekday = weekdays[date.getDay()]
    const hour = date.getHours()
    const key = `${weekday}-${hour}`
    countMap.set(key, (countMap.get(key) || 0) + 1)
  })

  const result: PunchCardEntry[] = []

  // Only include entries where there is activity
  countMap.forEach((count, key) => {
    const [weekday, hour] = key.split('-')
    result.push({
      weekday,
      hour: parseInt(hour),
      count,
    })
  })

  return result
}

const log = new Log('AtController')

export async function getHandleStats(tzOffset: number, handle: string) {
  const dt = new Date()
  const serverDate = new Date(dt)
  const clientDate = new Date(dt.setTime(dt.getTime() - tzOffset * 60000))

  try {
    const handleResolver = new HandleResolver({})
    let did = undefined
    if ((handle ?? '').startsWith('did:plc:')) {
      did = handle
    } else {
      did = await handleResolver.resolve(handle)
    }

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
          log.info(`starting to fetch`, handle)
          const [profile, likes, posts, reposts, follows] = await Promise.all([
            listRecords(pds, did, 'app.bsky.actor.profile'),
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
            likes.nbRequest + posts.nbRequest + reposts.nbRequest + follows.nbRequest + 1

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
              data: generatePunchCardData(likes.records),
            },
            {
              kind: 'skeet',
              data: generatePunchCardData(posts.records),
            },
            {
              kind: 'reskeet',
              data: generatePunchCardData(reposts.records),
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

          const profileData = profile.records[0]?.value

          return {
            did,
            displayName: profileData?.displayName || handle,
            handle: handle,
            avatar: profileData?.avatar?.ref?.$link
              ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileData.avatar.ref.$link}@jpeg`
              : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            description: profileData?.description || '',
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
