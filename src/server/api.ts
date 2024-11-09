import { SqlDatabase } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { remultSveltekit } from 'remult/remult-sveltekit'

import { DATABASE_URL } from '$env/static/private'

import { AtController } from '$modules/at/AtController'
import { getFollowsPeriods, getHandleStats } from '$modules/at/AtController.server'
import { LogHandle } from '$modules/logs/LogHandle'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

// import { Roles } from '../modules/auth/Roles'
// SqlDatabase.LogToConsole = 'oneLiner'

export const dataProvider = await createPostgresDataProvider({
  connectionString: DATABASE_URL,
})

export const api = remultSveltekit({
  // admin: Roles.admin,
  admin: true,
  dataProvider,
  entities: [LogHandle, LogHandleStats],
  controllers: [AtController],
  initApi: () => {
    AtController.getHandleStatsAbscact = getHandleStats
    AtController.getFollowsPeriodsAbscact = getFollowsPeriods
  },
})
