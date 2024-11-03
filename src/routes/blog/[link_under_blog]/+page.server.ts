import { getMdInfo, getMdsInfo } from '$lib/mdInfos'

import type { EntryGenerator } from './$types'

export const entries: EntryGenerator = () => {
  const data = getMdsInfo()
  return data
}

export const load = async ({ params }) => {
  return getMdInfo(params.link_under_blog)
}
