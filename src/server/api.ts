import { SqlDatabase } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { remultSveltekit } from 'remult/remult-sveltekit'

import { DATABASE_URL } from '$env/static/private'
import { building } from '$app/environment'

import { AtController } from '$modules/at/AtController'
import { getHandleFollow, getHandleStats } from '$modules/at/AtController.server'
import { LogHandle } from '$modules/logs/LogHandle'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

// import { Roles } from '../modules/auth/Roles'
SqlDatabase.LogToConsole = false

export const dataProvider = await createPostgresDataProvider({
  connectionString: DATABASE_URL,
})

export const api = remultSveltekit({
  logApiEndPoints: false,
  // admin: Roles.admin,
  ensureSchema: !building,
  admin: false,
  dataProvider,
  entities: [LogHandle, LogHandleStats, LogHandleFollow],
  controllers: [AtController],
  initApi: () => {
    AtController.getHandleStatsAbscact = getHandleStats
    AtController.getHandleFollowAbscact = getHandleFollow
  },
})
