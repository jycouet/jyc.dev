import pLimit from 'p-limit'

import { repo } from 'remult'
import { Log } from '@kitql/helpers'

import { RecordPlc } from '$modules/at/RecordPlc'

import { _checkAndUpdatePlcRecord } from '../+server'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (event) => {
  const log = new Log('plc-check-top')
  log.info('Checking top 3000 PLCs')

  const top1000 = await repo(RecordPlc).find({
    where: { followersCount: { $gt: 0 } },
    limit: 3000,
    orderBy: { followersCount: 'desc' },
  })

  const limit = pLimit(60)

  const indexedAt = new Date()
  await Promise.all(top1000.map((plc) => limit(() => _checkAndUpdatePlcRecord(indexedAt, plc.did))))

  log.info('Done checking top 3000 PLCs')

  return new Response(JSON.stringify({}), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
