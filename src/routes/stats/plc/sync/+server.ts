import { remult, SqlDatabase } from 'remult'
import type { EntityBase } from 'remult'
import { Log, sleep } from '@kitql/helpers'
import { read, write } from '@kitql/internals'

import { dev } from '$app/environment'

import { RecordPlc } from '$modules/at/RecordPlc'

import { dataProvider } from '../../../../server/api'
import type { RequestHandler } from './$types'

export interface PLCOperation {
  sig: string
  prev: string | null
  type: 'create' | 'plc_operation'
  handle: string
  service: string
  services: { atproto_pds: { endpoint: string } }
  signingKey: string
  recoveryKey: string
}

interface Plc {
  pos: number
  did: string
  operation: PLCOperation
  cid: string
  nullified: boolean
  createdAt: string
}

export const GET: RequestHandler = async ({ fetch }) => {
  const repo = remult.repo(RecordPlc)
  const TOTAL_EXPECTED_RECORDS = 17_000_000
  const startTime = Date.now()
  let loopStartTime: number

  // Get the latest record to determine both cursor and position
  const latestRecord = await repo.findFirst(
    {},
    {
      orderBy: { createdAt: 'desc' },
    },
  )
  const latestRecordBSky = await repo.findFirst(
    {
      pos_bsky: { $not: null },
    },
    {
      orderBy: { createdAt: 'desc' },
    },
  )

  type Mode = 'plc-to-localfile' | 'localfile-to-db' | 'plc-to-db'
  let mode: Mode = 'plc-to-db' as Mode
  if (!dev) {
    mode = 'plc-to-db'
  }
  let cursor = latestRecord ? latestRecord.createdAt.toISOString() : '1986-11-07T00:35:16.390Z'
  let nextPosition = latestRecord ? latestRecord.pos_atproto + 1 : 1
  let nextPositionBsky = latestRecordBSky ? latestRecordBSky.pos_bsky! + 1 : 1
  let totalProcessed = 0

  let hasMore = true
  const batchSize = 1000
  let i = 0
  while (hasMore) {
    i++
    loopStartTime = Date.now()

    let emptyResponseCount = 0
    const maxEmptyResponses = 30
    const retryDelay = 10_000 // 10 seconds in milliseconds
    let records: Plc[] = []

    while (emptyResponseCount < maxEmptyResponses) {
      if (mode.includes('plc-to')) {
        const url = new URL(`https://plc.directory/export`)
        url.searchParams.set('count', batchSize.toString())
        url.searchParams.set('after', cursor)
        const res = await fetch(url.toString())

        const text = await res.text()

        records = text
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => JSON.parse(line) as Plc)

        if (records.length > 0) {
          emptyResponseCount = 0
          break
        }

        console.info(
          `Empty response #${emptyResponseCount + 1}, waiting ${retryDelay / 1000} seconds before retry...`,
        )
        await sleep(retryDelay)
        emptyResponseCount++
      } else if (mode === 'localfile-to-db') {
        const text = read(
          `../backup/jyc.dev/bsky/plc-directory-${cursor.replaceAll(':', '_')}.json`,
        )

        if (text === null) {
          console.info(`No records found in file ${cursor.replaceAll(':', '_')}.json`)
          hasMore = false
          break
        }
        records = JSON.parse(text) as Plc[]
        break
      }
    }

    if (emptyResponseCount === maxEmptyResponses) {
      console.info(`No records found after ${maxEmptyResponses} attempts`)
      hasMore = false
      break
    }

    // console.dir(records, { depth: null })
    const createdRecords =
      mode === 'plc-to-localfile' ? records : records.filter((c) => c.operation.prev === null)

    if (mode.includes('to-db')) {
      const exiting = await repo.find({
        where: {
          did: { $in: createdRecords.map((c) => c.did) },
        },
      })

      const toInsert = createdRecords
        .filter((c) => !exiting.find((e) => e.did === c.did))
        .map((record) => {
          const service =
            record.operation.service ||
            record.operation.services?.atproto_pds?.endpoint ||
            'no.service.endpoint'

          const data = repo.create({
            did: record.did,
            pos_atproto: nextPosition++,
            pos_bsky: service.includes('bsky.') ? nextPositionBsky++ : null,
            createdAt: new Date(record.createdAt),
            // metadata: {
            //   cid: record.cid,
            //   nullified: record.nullified,
            //   operation: record.operation,
            // },
          })
          return data
        })

      await bulkInsert(toInsert, dataProvider)
    }

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

    // Write records to file
    if (mode === 'plc-to-localfile') {
      write(`../backup/jyc.dev/bsky/plc-directory-${cursor.replaceAll(':', '_')}.json`, [
        '[',
        records.map((record) => JSON.stringify(record)).join(',\n'),
        ']',
      ])
    }

    cursor = records[records.length - 1]?.createdAt

    // Let's go out
    if (records.length < 100) {
      hasMore = false
      break
    }
  }

  const totalDurationSeconds = (Date.now() - startTime) / 1000
  new Log('sync').success(`Sync completed in ${totalDurationSeconds.toFixed(2)} minutes`)

  return new Response(
    JSON.stringify({
      totalProcessed,
      totalDurationSeconds,
      finalPosition: nextPosition - 1,
      last: await repo.findFirst({}),
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

    // sql += ' ON CONFLICT DO NOTHING'
    // console.log(`sql`, sql)

    await c.execute(sql)
  }
}
