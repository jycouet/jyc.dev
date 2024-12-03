import { repo } from 'remult'

import { RecordPlc } from '$modules/at/RecordPlc'

import type { PageServerLoad } from './$types'

export const load = (async () => {
  const topProfiles = await repo(RecordPlc).find({
    where: { followersCount: { $gt: 0 } },
    orderBy: { followersCount: 'desc' },
    limit: 300,
  })

  return {
    topProfiles: topProfiles.map((p, i) => ({
      displayName: p.displayName,
      handle: p.handle,
      avatar: p.avatar,
      followersCount: p.followersCount,
      pos: i + 1,
    })),
  }
}) satisfies PageServerLoad
