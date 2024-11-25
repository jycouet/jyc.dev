import { repo, SqlDatabase } from 'remult'

import { getProfile } from '$modules/at/agentHelper'
import { didToPds, getRecord, listRecords } from '$modules/at/helper'
import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

const BATCH_SIZE = 100 // Process 100 records at a time
const CONCURRENT_BATCHES = 5 // Run 5 batches in parallel
const MAX_CONCURRENT_REQUESTS = 10 // Max concurrent API requests within a batch
const PROGRESS_LOG_INTERVAL = 1000 // Log progress every 1000 records

async function processBatch(records: RecordPlc[], indexedAt: Date, inactiveDate: Date) {
  // Process records in chunks to limit concurrent API requests
  const chunks = chunk(records, MAX_CONCURRENT_REQUESTS)
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (plc) => {
        try {
          const result = await checkPlcRecord(indexedAt, inactiveDate, plc)
          if (result) {
            await repo(RecordPlc).update(plc.did, result)
            // console.log(`Updated ${plc.did}`)
          }
        } catch (error) {
          console.error(`Failed to process DID: ${plc.did}`, error)
        }
      }),
    )
  }
}

// Helper function to split array into chunks
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  )
}

const checkPlcRecord = async (indexedAt: Date, inactiveDate: Date, plc: RecordPlc) => {
  let toRet: Partial<RecordPlc> = {
    indexedAt,
  }

  const pds = await didToPds(plc.did, { maxAttempts: 1 })
  if (!pds) return { ...toRet, invalidPds: true }

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

    toRet = {
      ...toRet,
      // isInactive: lastDate ? lastDate < inactiveDate : true,
    }
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
  let cursor = 0
  const startTime = Date.now()

  // Get total count first
  const totalCount = await repo(RecordPlc).count({
    pos_bsky: { $not: null },
    indexedAt: null!,
  })

  while (true) {
    // Get next batch of records
    const plcs = await repo(RecordPlc).find({
      limit: BATCH_SIZE * CONCURRENT_BATCHES,
      page: parseInt(event.params.page) ?? 1,
      where: {
        // pos_bsky: 8,
        pos_bsky: { $not: null },
        indexedAt: null!,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (plcs.length === 0) break

    // Split records into concurrent batches
    const batches = chunk(plcs, BATCH_SIZE)

    // Process batches concurrently
    await Promise.all(batches.map((batch) => processBatch(batch, indexedAt, inactiveDate)))

    processedCount += plcs.length
    cursor += plcs.length

    // Calculate and log progress with time estimates
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
