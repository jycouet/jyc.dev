import { DidResolver, getPds } from '@atproto/identity'

import { green, Log, magenta } from '@kitql/helpers'

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
  log.info(green(did), magenta(`getHandleStats   `), tzOffset)
  let start = new Date()
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

          const totalRequests = likes.nbRequest + posts.nbRequest + reposts.nbRequest

          let end = new Date()
          log.info(
            green(did),
            magenta(`getHandleStats   `),
            ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's',
            totalRequests,
          )
          start = end

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

          let imageAltRatio = 0
          let kindOfEmbed = posts.records.reduce(
            (acc, post) => {
              let embedType = (post.value.embed?.$type || 'Text only')
                .replaceAll('app.bsky.embed.', '')
                .replaceAll('recordWithMedia', 'Link to other post')
                .replaceAll('record', 'Link to other post')
                .replaceAll('external', 'Link to outside')
                .replaceAll('images', 'Image')

              embedType = embedType.charAt(0).toUpperCase() + embedType.slice(1)

              let inc = 1
              if (embedType === 'Image') {
                const hasAlt = post.value.embed.images.filter(
                  (img: { alt: string }) => img.alt?.trim().length > 0,
                ).length
                const totalImages = post.value.embed.images.length
                const altRatio = hasAlt / totalImages
                imageAltRatio += altRatio
                inc = totalImages
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
          // console.log(`images`, images)
          // console.log(`imageAltRatio`, imageAltRatio)
          kindOfEmbed = kindOfEmbed.map((embed) => {
            if (embed.kind === 'Image') {
              const altPercentage =
                embed.count > 0 ? Math.round((imageAltRatio / embed.count) * 100) : 100

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

          end = new Date()
          log.info(
            green(did),
            magenta(`getHandleStats   `),
            ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's',
          )

          return {
            likes: getActivityCounts(likes),
            posts: getActivityCounts(posts),
            reposts: getActivityCounts(reposts),
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

export async function getFollowsPeriods(tzOffset: number, did: string) {
  log.info(green(did), magenta(`getFollowsPeriods`), tzOffset)
  let start = new Date()
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
          const follows = await listRecordsAll(pds, did, 'app.bsky.graph.follow')

          const totalRequests = follows.nbRequest

          let end = new Date()
          log.info(
            green(did),
            magenta(`getFollowsPeriods`),
            ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's',
            totalRequests,
          )
          start = end

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

          end = new Date()
          log.info(
            green(did),
            magenta(`getFollowsPeriods`),
            ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's',
          )

          return {
            followsPeriods,
            followsTotal,
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
  }
  return null
}
