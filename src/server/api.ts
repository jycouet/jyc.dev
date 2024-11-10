import { SqlDatabase } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { remultSveltekit } from 'remult/remult-sveltekit'

import { DATABASE_URL, DID_PLC_ADMIN } from '$env/static/private'
import { building } from '$app/environment'

import { AtController } from '$modules/at/AtController'
import { getHandleFollow, getHandleStats } from '$modules/at/AtController.server'
import { AppUser, AppUserSession } from '$modules/auth/Entities'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from '$modules/auth/lucia'
import { LogHandle } from '$modules/logs/LogHandle'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

import { Roles } from '../modules/auth/Roles'

SqlDatabase.LogToConsole = false

export const dataProvider = await createPostgresDataProvider({
  connectionString: DATABASE_URL,
})

export const api = remultSveltekit({
  logApiEndPoints: false,
  ensureSchema: !building,
  admin: Roles.admin,
  dataProvider,
  entities: [LogHandle, LogHandleStats, LogHandleFollow, AppUser, AppUserSession],
  controllers: [AtController],
  getUser: async (event) => {
    const token = event.cookies.get('s-jyc-dev') ?? null
    if (token === null) {
      return undefined
    }
    const { session, user } = await validateSessionToken(token)
    if (session !== null) {
      setSessionTokenCookie(event, token, session.expiresAt)
    } else {
      deleteSessionTokenCookie(event)
    }

    const roles = []

    if (user?.id === DID_PLC_ADMIN) {
      roles.push(Roles.admin)
    }

    return user ? { ...user, roles } : undefined
  },
  initApi: () => {
    AtController.getHandleStatsAbscact = getHandleStats
    AtController.getHandleFollowAbscact = getHandleFollow
  },
})
