import { PostHog } from 'posthog-node'

import { dbNamesOf, repo, SqlDatabase } from 'remult'
import type { ClassType, FieldMetadata } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { Log } from '@kitql/helpers'

import { DATABASE_URL, DID_PLC_ADMIN } from '$env/static/private'
import { PUBLIC_POSTHOG_KEY } from '$env/static/public'
import { building } from '$app/environment'

import { AgentController } from '$modules/at/AgentController'
import { AtController } from '$modules/at/AtController'
import { BSkyty } from '$modules/at/BSkyty'
import { ListItem } from '$modules/at/ListItem'
import { RecordFollow } from '$modules/at/RecordFollow'
import { RecordPlc } from '$modules/at/RecordPlc'
import { StarterPack } from '$modules/at/StarterPack'
import { AppUser, AppUserSession } from '$modules/auth/Entities'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from '$modules/auth/lucia'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'
import { SqlController } from '$modules/sql/SqlController'

import { Roles } from '../modules/auth/Roles'

SqlDatabase.LogToConsole = false
// SqlDatabase.LogToConsole = 'oneLiner'

export const dataProvider = await createPostgresDataProvider({
  connectionString: DATABASE_URL,
})

export const api = remultSveltekit({
  logApiEndPoints: false,
  // ensureSchema: !building,
  ensureSchema: false,
  admin: Roles.admin,
  dataProvider,
  entities: [
    LogHandleStats,
    LogHandleFollow,
    AppUser,
    AppUserSession,
    BSkyty,
    RecordFollow,
    StarterPack,
    ListItem,
    RecordPlc,
  ],
  controllers: [AtController, AgentController, SqlController],
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
  initApi: async () => {
    if (!building) {
      SqlController.dataProvider = dataProvider

      const clientPostHog = new PostHog(PUBLIC_POSTHOG_KEY, {
        host: 'https://eu.i.posthog.com',
      })
      clientPostHog.capture({
        distinctId: new Date().toISOString(),
        event: 'server-start',
      })
      clientPostHog.flush()

      // await upsertIndex(RecordPlc, 'did')
      // await upsertIndex(RecordPlc, 'createdAt')
      // await upsertIndex(RecordPlc, 'pos_bsky')
      // await upsertIndex(StarterPack, 'updatedAt')
      // await upsertIndex(StarterPack, 'creatorDid')

      new Log('apiInit').success('done')

      // await repo(BSkyty).updateMany({
      //   where: { id: { $not: '-1' } },
      //   set: { pos_atproto: null, pos_bsky: null },
      // })
    }
  },
})

const upsertIndex = async <T>(ent: ClassType<T>, field: keyof T) => {
  const db = await dbNamesOf(ent)
  const r = repo(ent)
  const f = r.fields[field] as FieldMetadata<T, keyof T>

  const indexName = `idx_${r.metadata.key}_${f.dbName}`

  // console.log(`sql`, `CREATE INDEX "${indexName}" ON ${db} ("${f.dbName}")`)

  await dataProvider.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = '${r.metadata.key}' AND indexname = '${indexName}') THEN
        CREATE INDEX "${indexName}" ON ${db} ("${f.dbName}");
      END IF;
    END
    $$;
  `)
}

// SELECT
//   indexname AS index_name,
//   indexdef AS index_definition
// FROM
//   pg_indexes
// WHERE
//   tablename = 'plc-record2';
