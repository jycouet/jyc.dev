import { repo } from 'remult'

import { getProfile } from '$modules/at/agentHelper'
import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

const CONCURRENT_LIMIT = 50 // Increased for better throughput
const BATCH_SIZE = 500 // Increased batch size for efficiency
const PROGRESS_LOG_INTERVAL = 1000

const checkPlcRecord = async (indexedAt: Date, did: string): Promise<Partial<RecordPlc>> => {
  let toRet: Partial<RecordPlc> = {
    indexedAt,
  }

  // const pds = await didToPds(plc.did, { maxAttempts: 1 })
  // if (!pds) return { ...toRet, invalidPds: true }

  try {
    const { data: profile } = await getProfile(did, { maxAttempts: 1 })

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
    // console.error(`Error processing ${plc.did}:`, error)
    // @ts-ignore
    toRet = { ...toRet, indexedError: error?.message }
  }

  return toRet
}

export const _checkAndUpdatePlcRecord = async (indexedAt: Date, did: string) => {
  try {
    const result = await checkPlcRecord(indexedAt, did)
    if (result) {
      await repo(RecordPlc).update(did, result)
      console.info(`Updated ${did}`)
    }
  } catch (error) {
    console.info(`Failed to update ${did}`, error)
    // console.info(`result`, result)
    // process.exit(1)
  }
}

function formatTimeEstimate(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

// Modified queue processing function
async function processInBatches(
  indexedAt: Date,
  startPage: number,
  maxProcessedCount: number,
  totalCount: number,
) {
  let processedCount = 0
  const startTime = Date.now()
  let currentPage = startPage

  while (processedCount < maxProcessedCount) {
    // Fetch batch of records
    const plcs = await repo(RecordPlc).find({
      limit: BATCH_SIZE,
      page: currentPage,
      where: {
        pos_bsky: { $not: null },
        indexedAt: null!,
      },
      orderBy: { createdAt: 'asc' },
    })

    if (plcs.length === 0) break

    // Process batch concurrently with limit
    const batchPromises = plcs.map((plc) => _checkAndUpdatePlcRecord(indexedAt, plc.did))

    // Process in chunks of CONCURRENT_LIMIT
    for (let i = 0; i < batchPromises.length; i += CONCURRENT_LIMIT) {
      const chunk = batchPromises.slice(i, i + CONCURRENT_LIMIT)
      await Promise.all(chunk)

      processedCount += chunk.length

      // Log progress
      if (processedCount % PROGRESS_LOG_INTERVAL === 0) {
        const elapsedTime = Date.now() - startTime
        const recordsPerMs = processedCount / elapsedTime
        const remainingRecords = Math.min(maxProcessedCount, totalCount) - processedCount
        const estimatedRemainingTime = remainingRecords / recordsPerMs

        console.info(
          `Processed ${processedCount.toLocaleString()} of ${totalCount.toLocaleString()} records ` +
            `(${((processedCount / totalCount) * 100).toFixed(2)}%) - ` +
            `Estimated time remaining: ${formatTimeEstimate(estimatedRemainingTime)}`,
        )
      }
    }

    currentPage++
  }

  return {
    processedCount,
    totalTime: Date.now() - startTime,
  }
}

export const GET: RequestHandler = async (event) => {
  const page = event.url.searchParams.get('page')
    ? parseInt(event.url.searchParams.get('page')!)
    : 1
  const maxProcessedCount = event.url.searchParams.get('max')
    ? parseInt(event.url.searchParams.get('max')!)
    : 99_999

  console.info('Start', page, maxProcessedCount)

  const indexedAt = new Date()

  // Get total count first
  const totalCount = await repo(RecordPlc).count({
    pos_bsky: { $not: null },
    indexedAt: null!,
  })

  const { processedCount, totalTime } = await processInBatches(
    indexedAt,
    page,
    maxProcessedCount,
    totalCount,
  )

  console.info('Done', processedCount, totalCount, formatTimeEstimate(totalTime))

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
