import { remult, repo } from 'remult'

import type { LatestGlobalStats } from '$modules/at/AtController'
import { GlobalKey, KeyValue } from '$modules/global/Entities'

import type { PageLoad } from './$types'

export const load = (async (event) => {
  remult.useFetch(event.fetch)
  const kv = await repo(KeyValue).findFirst({ key: GlobalKey.LATEST_GLOBAL_STATS })
  if (!kv) {
    return null
  }
  return kv.value as LatestGlobalStats
}) satisfies PageLoad
