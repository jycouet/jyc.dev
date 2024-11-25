import { repo, SqlDatabase } from 'remult'

import { getProfile } from '$modules/at/agentHelper'
import { didToPds, getRecord, listRecords } from '$modules/at/helper'
import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

const CONCURRENT_LIMIT = 20 // Maximum concurrent operations
const BATCH_SIZE = 500 // Number of records to fetch per database query
const PROGRESS_LOG_INTERVAL = 1000 // Log progress every 1000 records

const checkPlcRecord = async (indexedAt: Date, inactiveDate: Date, plc: RecordPlc) => {
  let toRet: Partial<RecordPlc> = {
    indexedAt,
  }

  // const pds = await didToPds(plc.did, { maxAttempts: 1 })
  // if (!pds) return { ...toRet, invalidPds: true }

  try {
    const { data: profile } = await getProfile(plc.did, { maxAttempts: 1 })

    toRet = {
      ...toRet,
      handle: profile?.handle,
      displayName: profile?.displayName,
      avatar: profile?.avatar,
      description: profile?.description,
      followersCount: profile?.followersCount,
      followsCount: profile?.followsCount,
      postsCount: profile?.postsCount,
    }

    if (profile?.handle === 'handle.invalid') {
      return { ...toRet, invalidHandle: true }
    }

    // const [likes, posts] = await Promise.all([
    //   listRecords(pds, plc.did, 'app.bsky.feed.like', { limit: 1, maxAttempts: 1 }),
    //   listRecords(pds, plc.did, 'app.bsky.feed.post', { limit: 1, maxAttempts: 1 }),
    //   getProfile(plc.did, { maxAttempts: 1 }),
    // ])

    // const lastLike = likes.records.length > 0 ? new Date(likes.records[0].value.createdAt) : null
    // const lastPost = posts.records.length > 0 ? new Date(posts.records[0].value.createdAt) : null
    // const lastDate = !lastLike
    //   ? lastPost
    //   : !lastPost
    //     ? lastLike
    //     : lastLike > lastPost
    //       ? lastLike
    //       : lastPost

    // toRet = {
    //   ...toRet,
    //   // isInactive: lastDate ? lastDate < inactiveDate : true,
    // }
  } catch (error) {
    console.error(`Error processing ${plc.did}:`, error)
    // @ts-ignore
    toRet = { ...toRet, indexedError: error?.message }
  }

  return toRet
}

function formatTimeEstimate(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export const GET: RequestHandler = async (event) => {
  const indexedAt = new Date()
  const inactiveThreshold = indexedAt.valueOf() - 90 * 24 * 60 * 60 * 1000
  const inactiveDate = new Date(inactiveThreshold)

  let processedCount = 0
  const startTime = Date.now()

  // Get total count first
  const totalCount = await repo(RecordPlc).count({
    pos_bsky: { $not: null },
    indexedAt: null!,
  })

  // Create a queue to manage concurrent operations
  const queue = new Set<Promise<void>>()

  while (true) {
    // Get next batch of records
    const plcs = await repo(RecordPlc).find({
      limit: BATCH_SIZE,
      page: parseInt(event.params.page) ?? 1,
      where: {
        pos_bsky: { $not: null },
        indexedAt: null!,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (plcs.length === 0) break

    // Process records with controlled concurrency
    for (const plc of plcs) {
      // Wait if queue is at capacity
      while (queue.size >= CONCURRENT_LIMIT) {
        await Promise.race(queue)
      }

      const promise = (async () => {
        try {
          const result = await checkPlcRecord(indexedAt, inactiveDate, plc)
          if (result) {
            try {
              await repo(RecordPlc).update(plc, result)
            } catch (error) {
              console.log(`result`, result)
              process.exit(1)
            }
          }
          processedCount++

          // Log progress
          if (processedCount % PROGRESS_LOG_INTERVAL === 0) {
            const elapsedTime = Date.now() - startTime
            const recordsPerMs = processedCount / elapsedTime
            const remainingRecords = totalCount - processedCount
            const estimatedRemainingTime = remainingRecords / recordsPerMs

            console.log('')
            console.log('')
            console.log('')
            console.log('')
            console.log('')
            console.log('')
            console.log('')
            console.log('')
            console.log(
              `Processed ${processedCount.toLocaleString()} of ${totalCount.toLocaleString()} records ` +
                `(${((processedCount / totalCount) * 100).toFixed(2)}%) - ` +
                `Estimated time remaining: ${formatTimeEstimate(estimatedRemainingTime)}`,
            )
          }
        } catch (error) {
          console.error(`Failed to process DID: ${plc.did}`, error)
        } finally {
          // @ts-ignore
          queue.delete(promise)
        }
      })()

      queue.add(promise)
    }
  }

  // Wait for remaining operations to complete
  while (queue.size > 0) {
    await Promise.race(queue)
  }

  const totalTime = Date.now() - startTime

  return new Response(
    JSON.stringify({
      success: true,
      processedCount,
      totalCount,
      timeElapsed: formatTimeEstimate(totalTime),
      averageSpeed: `${Math.round(processedCount / (totalTime / 1000))} records/second`,
    }),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  )
}
