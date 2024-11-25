import { DidResolver, getPds } from '@atproto/identity'
import { AtUri } from '@atproto/syntax'

import { Log, sleep } from '@kitql/helpers'

export async function retries<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number
    baseDelay?: number
    msgError?: string
  },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 6 // delayMs 6&10 => 1270
  const baseDelay = options?.baseDelay ?? 10

  const log = new Log(`retries`)

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      if (i >= maxAttempts - 1) {
        log.error(options?.msgError ?? 'Error')
        throw error
      }
      const delayMs = baseDelay * 2 ** i
      log.info(`Retrying in ${delayMs}ms...`)
      await sleep(delayMs)
    }
  }

  throw new Error('Unreachable code')
}

export const describeRepo = async (pds: string, repo: string) => {
  const describeRepoUrl = new URL(`${pds}/xrpc/com.atproto.repo.describeRepo`)
  describeRepoUrl.searchParams.set('repo', repo)
  const res = await fetch(describeRepoUrl.toString())
  if (!res.ok && res.status !== 400) {
    throw new Error(`Failed to describe repo: ${res.statusText}`)
  }
  const body = await res.json()

  if (res.status === 400 && 'error' in body && body.error === 'RepoNotFound') {
    return null
  }

  return body as {
    collections: string[]
  }
}

export const listRecords = async (
  pds: string,
  repo: string,
  collection: string,
  options?: {
    cursor?: string
    limit?: number
    reverse?: boolean
    maxAttempts?: number
  },
) => {
  const listRecordsUrl = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`)
  listRecordsUrl.searchParams.set('repo', repo)
  listRecordsUrl.searchParams.set('collection', collection)
  listRecordsUrl.searchParams.set('limit', options?.limit?.toString() ?? '50')
  if (options?.cursor) {
    listRecordsUrl.searchParams.set('cursor', options.cursor)
  }
  if (options?.reverse) {
    listRecordsUrl.searchParams.set('reverse', 'true')
  }
  const url = listRecordsUrl.toString()

  return retries(
    async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`${repo} | ${collection} | Failed to list records: ${res.statusText}`)
        }
        return res.json()
      } catch (error) {
        throw new Error(`${repo} | ${collection} | Failed to list records(decode): ${error}`)
      }
    },
    {
      maxAttempts: options?.maxAttempts ?? 6,
    },
  )
}

export const getRecord = async (pds: string, repo: string, collection: string, rkey: string) => {
  const getRecordUrl = new URL(`${pds}/xrpc/com.atproto.repo.getRecord`)
  getRecordUrl.searchParams.set('repo', repo)
  getRecordUrl.searchParams.set('collection', collection)
  getRecordUrl.searchParams.set('rkey', rkey)

  return retries(async () => {
    const res = await fetch(getRecordUrl.toString())
    if (!res.ok) {
      throw new Error(`Failed to get record: ${res.statusText}`)
    }
    return res.json()
  })
}

export const listRecordsAll = async (
  pds: string,
  repo: string,
  collection: string,
  options?: {
    while?: (record: any) => boolean
    takeTheBreakingWhile?: boolean
    reverse?: boolean
  },
) => {
  const allRecords: Array<{
    uri: string
    cid: string
    value: any
  }> = []

  let cursor: string | undefined = undefined
  let nbRequest = 0
  while (true) {
    const response = await listRecords(pds, repo, collection, {
      cursor,
      limit: 100,
      reverse: options?.reverse,
    })
    nbRequest++

    let theEnd = false
    if (options?.while) {
      try {
        for (const record of response.records) {
          if (options.while(record)) {
            allRecords.push(record)
          } else {
            if (options.takeTheBreakingWhile) {
              allRecords.push(record)
            }
            theEnd = true
            break
          }
        }
      } catch (error) {}
    } else {
      allRecords.push(...response.records)
    }

    if (!response.cursor || theEnd) {
      break
    }
    cursor = response.cursor
  }

  return { records: allRecords, nbRequest }
}

export function chunkRecords(records: any[]) {
  const periods: { timestamp: Date; count: number }[] = []
  const count = records.length

  // Get current time and round down to nearest 12h period
  const currentPeriodStart = new Date()
  periods.unshift({
    timestamp: new Date(currentPeriodStart),
    count: count,
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

  records.reverse()

  // Loop through records from newest to oldest to build cumulative counts
  for (let i = records.length - 1; i >= 0; i--) {
    const date = new Date(records[i].value.createdAt)

    // Skip if before 7 days ago
    if (date < sevenDaysAgo) continue

    if (date < currentPeriodStart) {
      periods.unshift({
        timestamp: new Date(currentPeriodStart),
        count: i + 1,
      })
      currentPeriodStart.setTime(currentPeriodStart.getTime() - 12 * 60 * 60 * 1000)
    }
  }

  // If this... That mean that nothing happened in the last 7 days
  if (periods.length === 1) {
    periods.unshift({
      timestamp: new Date(currentPeriodStart),
      count: count,
    })
  }

  return periods
}

export const parseUri = (uri: string) => {
  const aturi = new AtUri(uri)

  const segments = aturi.pathname.split('/')

  return {
    did: aturi.host,
    collection: segments[1],
    rkey: segments[2],
  }
}

export const didToPds = async (did?: string, options?: { maxAttempts?: number }) => {
  if (!did) {
    return null
  }

  const didResolver = new DidResolver({})

  return await retries(
    async () => {
      const didDocument = await didResolver.resolve(did)

      if (didDocument) {
        const pds = getPds(didDocument)
        // console.log(`pds`, pds);
        // const repo = await describeRepo( pds!, did);
        // console.log(`repo`, repo);

        if (pds) {
          return pds
        }
      }
      return null
    },
    {
      maxAttempts: options?.maxAttempts ?? 6,
      msgError: `didToPds(${did})`,
    },
  )
}
