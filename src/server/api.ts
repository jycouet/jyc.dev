import { remultSveltekit } from 'remult/remult-sveltekit'

import { AtController } from '$lib/modules/at/AtController'
import { getFollowsPeriods, getHandleStats } from '$lib/modules/at/AtController.server'

export const api = remultSveltekit({
  controllers: [AtController],
  initApi: () => {
    AtController.getHandleStatsAbscact = getHandleStats
    AtController.getFollowsPeriodsAbscact = getFollowsPeriods
  },
})
