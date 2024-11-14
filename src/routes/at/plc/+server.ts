import { remult, SqlDatabase } from 'remult'
import type { EntityBase } from 'remult'
import { sleep } from '@kitql/helpers'

import { PlcRecord } from '$modules/at/PlcRecord'

import { dataProvider } from '../../../server/api'
import type { RequestHandler } from './$types'

interface PLCOperation {
  sig: string
  prev: string | null
  type: 'create' | 'plc_operation'
  handle: string
  service: string
  signingKey: string
  recoveryKey: string
}

interface PLCRecord {
  pos: number
  did: string
  operation: PLCOperation
  cid: string
  nullified: boolean
  createdAt: string
}

export const GET: RequestHandler = async ({ fetch }) => {
  const repo = remult.repo(PlcRecord)
  const TOTAL_EXPECTED_RECORDS = 15_000_000
  const startTime = Date.now()
  let loopStartTime: number

  // Get the latest record to determine both cursor and position
  const latestRecord = await repo.findFirst(
    {},
    {
      orderBy: { createdAt: 'desc' },
    },
  )

  let cursor = latestRecord ? latestRecord.createdAt.toISOString() : '2022-11-17T00:35:16.390Z'
  let nextPosition = latestRecord ? latestRecord.id + 1 : 1
  let totalProcessed = 0

  let hasMore = true
  const batchSize = 1000

  while (hasMore) {
    loopStartTime = Date.now()

    let emptyResponseCount = 0
    const maxEmptyResponses = 1
    const retryDelay = 10_000 // 10 seconds in milliseconds
    let records: PLCRecord[] = []

    while (emptyResponseCount < maxEmptyResponses) {
      const url = new URL(`https://plc.directory/export`)
      url.searchParams.set('count', batchSize.toString())
      url.searchParams.set('after', cursor)
      const res = await fetch(url.toString())

      const text = await res.text()
      records = text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line) as PLCRecord)

      if (records.length > 0) {
        emptyResponseCount = 0
        break
      }

      console.info(
        `Empty response #${emptyResponseCount + 1}, waiting ${retryDelay / 1000} seconds before retry...`,
      )
      await sleep(retryDelay)
      emptyResponseCount++
    }

    if (emptyResponseCount === maxEmptyResponses) {
      console.info(`No records found after ${maxEmptyResponses} attempts`)
      hasMore = false
      break
    }

    // Insert records into the repository with incrementing positions
    // await repo.insert(
    //   records.map((record) => {
    //     return {
    //       id: nextPosition++,
    //       did: record.did,
    //       cid: record.cid,
    //       nullified: record.nullified,
    //       createdAt: new Date(record.createdAt),
    //       operation: record.operation,
    //     }
    //   }),
    // )
    const createdRecords = records
      .filter((c) => c.operation.prev === null)
      .map((record) => {
        return repo.create({
          id: nextPosition++,
          did: record.did,
          // cid: record.cid,
          // nullified: record.nullified,
          createdAt: new Date(record.createdAt),
          // operation: record.operation,
        })
      })

    await bulkInsert(createdRecords, dataProvider)

    totalProcessed += records.length
    const loopDuration = Date.now() - loopStartTime

    // Calculate based on total progress, not just current batch
    const totalElapsedSeconds = (Date.now() - startTime) / 1000
    const overallRecordsPerSecond = totalProcessed / totalElapsedSeconds
    const remainingRecords = TOTAL_EXPECTED_RECORDS - nextPosition + 1
    const estimatedSecondsRemaining = remainingRecords / overallRecordsPerSecond
    const estimatedHoursRemaining = estimatedSecondsRemaining / 3600

    console.info(`
      Batch Stats:
      - Processed ${records.length} records in ${loopDuration}ms
      - records created: ${createdRecords.length}
      - Current position: ${nextPosition - 1}
      - Total processed: ${totalProcessed}
      - Overall speed: ${overallRecordsPerSecond.toFixed(2)} records/second
      - Estimated time remaining: ${estimatedHoursRemaining.toFixed(2)} hours
      - Total time elapsed: ${(totalElapsedSeconds / 60).toFixed(2)} minutes
    `)

    cursor = records[records.length - 1].createdAt
    // await new Promise((resolve) => setTimeout(resolve, 100))

    // Let's go out
    if (records.length < 100) {
      hasMore = false
      break
    }
  }

  const totalDuration = (Date.now() - startTime) / 1000 / 60

  return new Response(
    JSON.stringify({
      totalProcessed,
      totalDurationMinutes: totalDuration.toFixed(2),
      finalPosition: nextPosition - 1,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

async function bulkInsert<entityType extends EntityBase>(array: entityType[], db: SqlDatabase) {
  if (array.length == 0) return

  const chunkSize = 250
  for (let i = 0; i < array.length; i += chunkSize) {
    const items = array.slice(i, i + chunkSize)
    // do whatever

    const c = db.createCommand()
    let sql =
      'insert into "' +
      (await items[0]._.metadata.dbName) +
      '" (' +
      (await Promise.all(items[0]._.metadata.fields.toArray().map((f) => `"${f.dbName}"`))).join(
        ',',
      ) +
      ') values '

    sql += items
      .map(
        (row) =>
          '(' +
          row.$.toArray()
            .map((f) => c.param(f.metadata.valueConverter.toDb!(f.value)))
            .join(', ') +
          ')',
      )
      .join(',')
    // console.log(`sql`, sql)

    await c.execute(sql)
  }
}
