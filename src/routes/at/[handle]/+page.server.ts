import { DidResolver, getPds, HandleResolver } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

import { listRecords, listRecordsAll } from '$lib/at/helper'

import type { PageServerLoad } from './$types'

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

const log = new Log('at/[handle]/+page.server.ts')

export const load = (async (event) => {
  try {
    const handleResolver = new HandleResolver({})
    const did = await handleResolver.resolve(event.params.handle)

    if (did) {
      const didResolver = new DidResolver({})
      const didDocument = await didResolver.resolve(did)

      if (didDocument) {
        const pds = getPds(didDocument)
        // console.log(`pds`, pds);
        // const repo = await describeRepo(event.fetch, pds!, did);
        // console.log(`repo`, repo);

        const four_weeks_ago = new Date()
        four_weeks_ago.setDate(four_weeks_ago.getDate() - 7 * 4)

        if (pds) {
          const [profile, likes, posts, reposts, follows] = await Promise.all([
            listRecords(event.fetch, pds, did, 'app.bsky.actor.profile'),
            listRecordsAll(event.fetch, pds, did, 'app.bsky.feed.like', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(event.fetch, pds, did, 'app.bsky.feed.post', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(event.fetch, pds, did, 'app.bsky.feed.repost', {
              while: (record) => new Date(record.value.createdAt) > four_weeks_ago,
            }),
            listRecordsAll(event.fetch, pds, did, 'app.bsky.graph.follow'),
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
              kind: 'post',
              data: generatePunchCardData(posts.records),
            },
            {
              kind: 'repost',
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
            { key: '🐣 Hatchlings - Your started something', value: nbPostStared },
            { key: '🦜 Parrot Replies - In your threads', value: nbPostRepliesToAStartedOne },
            { key: '🐒 Swing-by Replies', value: nbPostRepliesToOthers },
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

          // Calculate totals and ratios
          let totalReplies = nbPostRepliesToAStartedOne + nbPostRepliesToOthers
          let totalInteractions = nbPostStared + totalReplies

          let replyToOwnRatio = nbPostRepliesToAStartedOne / totalReplies
          let replyToOthersRatio = nbPostRepliesToOthers / totalReplies
          let postsStartedRatio = nbPostStared / totalInteractions

          const totalEmbed = posts.records.length
          const pointerRatio =
            kindOfEmbed.reduce((acc, embed) => {
              if (embed.kind.includes('record')) {
                return acc + embed.count
              }
              return acc
            }, 0) / totalEmbed
          const linkRatio =
            kindOfEmbed.reduce((acc, embed) => {
              if (embed.kind.includes('link')) {
                return acc + embed.count
              }
              return acc
            }, 0) / totalEmbed
          const artRatio =
            kindOfEmbed.reduce((acc, embed) => {
              if (embed.kind.includes('image')) {
                return acc + embed.count
              }
              if (embed.kind.includes('video')) {
                return acc + embed.count
              }
              return acc
            }, 0) / totalEmbed

          // Update the categories definition
          const categories: Record<string, { trait: string }> = {
            'Social Butterfly': {
              trait:
                "You're fluttering from conversation to conversation, pollinating discussions with your replies.",
            },
            Peacock: {
              trait:
                'You love showcasing your own thoughts, strutting through threads with self-assured elegance.',
            },
            'Wise Owl': {
              trait:
                "You're the one starting thoughtful discussions, sharing wisdom from your perch.",
            },
            'Sleepy Sloth': {
              trait:
                'Minimal movement through the social jungle, just hanging around occasionally.',
            },
            'Busy Bee': {
              trait: 'Always working to connect the hive, buzzing between different conversations.',
            },
            'Curious Cat': {
              trait: 'Poking your whiskers into every interesting conversation you find.',
            },
            'Social Spider': {
              trait: 'Weaving complex webs of conversations, connecting multiple threads together.',
            },
          }

          const specialties: Record<string, { trait: string }> = {
            Artist: {
              trait:
                'Your visual creativity shines through in every post, painting the digital canvas with images and videos.',
            },
            Connector: {
              trait:
                'You excel at bridging conversations across the platform, creating a web of interconnected discussions.',
            },
            Explorer: {
              trait:
                'Always venturing beyond, bringing external knowledge and resources to enrich conversations.',
            },
            Conversationalist: {
              trait:
                'Your strength lies in pure dialogue, weaving words into meaningful exchanges.',
            },
          }

          function determineCategory(): { title: string; traits: string } {
            // First determine the animal base
            let animalBase: string
            if (replyToOwnRatio > 0.5 && replyToOwnRatio > replyToOthersRatio) {
              animalBase = 'Peacock'
            } else if (replyToOthersRatio > 0.7 && postsStartedRatio < 0.2) {
              animalBase = 'Social Butterfly'
            } else if (postsStartedRatio > 0.5 && nbPostStared > totalReplies) {
              animalBase = 'Wise Owl'
            } else if (replyToOthersRatio > 0.9 && postsStartedRatio < 0.1) {
              animalBase = 'Curious Cat'
            } else if (replyToOthersRatio > 0.6 && postsStartedRatio > 0.2) {
              animalBase = 'Busy Bee'
            } else if (totalInteractions < 10) {
              animalBase = 'Sleepy Sloth'
            } else {
              animalBase = 'Social Spider'
            }

            // Then determine specialty
            let specialty: string
            if (artRatio > 0.3) {
              specialty = 'Artist'
            } else if (pointerRatio > 0.3) {
              specialty = 'Connector'
            } else if (linkRatio > 0.3) {
              specialty = 'Explorer'
            } else {
              specialty = 'Conversationalist'
            }

            // Combine title and traits
            const title = `The ${animalBase} ${specialty}`
            const traits = `${categories[animalBase].trait} ${specialties[specialty].trait}`

            return {
              title,
              traits,
            }
          }

          // **********
          // PERSONNALYTY - END
          // **********

          const profileData = profile.records[0]?.value
          return {
            did,
            displayName: profileData?.displayName || event.params.handle,
            handle: event.params.handle,
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
            category: determineCategory(),
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
    redirect(307, `/at`)
  }
}) satisfies PageServerLoad
