import { PostHog } from 'posthog-node'

import { dbNamesOf, JsonDataProvider, repo, SqlDatabase } from 'remult'
import type { ClassType, FieldMetadata } from 'remult'
import { createPostgresDataProvider } from 'remult/postgres'
import { remultSveltekit } from 'remult/remult-sveltekit'
import { JsonEntityFileStorage } from 'remult/server'
import { Log } from '@kitql/helpers'

import { DATABASE_URL, DID_PLC_ADMIN } from '$env/static/private'
import { PUBLIC_POSTHOG_KEY } from '$env/static/public'
import { building } from '$app/environment'

import { AgentController } from '$modules/at/AgentController'
import { AtController, calcLatestGlobalStats } from '$modules/at/AtController'
import { BSkyty } from '$modules/at/BSkyty'
import { ListItem } from '$modules/at/ListItem'
import { RecordFollow } from '$modules/at/RecordFollow'
import { RecordFollower } from '$modules/at/RecordFollower'
import { RecordPlc, RecordPlcStats } from '$modules/at/RecordPlc'
import { StarterPack } from '$modules/at/StarterPack'
import { AppUser, AppUserSession } from '$modules/auth/Entities'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from '$modules/auth/lucia'
import { KeyValue } from '$modules/global/Entities'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'
import { SqlController } from '$modules/sql/SqlController'

import { Roles } from '../modules/auth/Roles'

SqlDatabase.LogToConsole = false
// SqlDatabase.LogToConsole = 'oneLiner'

export const dataProvider = DATABASE_URL
  ? await createPostgresDataProvider({
      connectionString: DATABASE_URL,
    })
  : new JsonDataProvider(new JsonEntityFileStorage('./db'))

export const api = remultSveltekit({
  logApiEndPoints: false,
  ensureSchema: !building,
  admin: Roles.admin,
  dataProvider,
  entities: [
    LogHandleStats,
    LogHandleFollow,
    AppUser,
    AppUserSession,
    BSkyty,
    RecordFollow,
    RecordFollower,
    StarterPack,
    ListItem,
    RecordPlc,
    RecordPlcStats,
    KeyValue,
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
    // await calcLatestGlobalStats()
    // SqlDatabase.LogToConsole = 'oneLiner'
    if (!building) {
      const log = new Log('apiInit')
      log.info('start')
      // @ts-ignore
      SqlController.dataProvider = dataProvider

      if (PUBLIC_POSTHOG_KEY) {
        const clientPostHog = new PostHog(PUBLIC_POSTHOG_KEY, {
          host: 'https://eu.i.posthog.com',
        })
        clientPostHog.capture({
          distinctId: new Date().toISOString(),
          event: 'server-start',
        })
        clientPostHog.flush()
      } else {
        log.info('no posthog key')
      }

      // await upsertIndex(RecordPlc, 'did')
      // await upsertIndex(RecordPlc, 'createdAt')
      // await upsertIndex(RecordPlc, 'pos_bsky')
      // await upsertIndex(StarterPack, 'updatedAt')
      // await upsertIndex(StarterPack, 'creatorDid')

      // await execute(`ALTER TABLE "bskyties" DROP COLUMN "rePostsCount";`)
      // await execute(`ALTER TABLE "record-follows" DROP CONSTRAINT "record-follows_pkey";`)
      // await execute(`UPDATE "record-follows" SET "uri" = "id"`)
      // await execute(`UPDATE "record-follows" SET "createdAt" = "on"`)
      // await execute(`ALTER TABLE "record-follows" DROP COLUMN "id";`)
      // await execute(`ALTER TABLE "record-follows" DROP COLUMN "on";`)
      // await upsertIndex(RecordFollow, 'did')
      // await upsertIndex(RecordFollow, 'didFollow')
      // await upsertIndex(RecordFollow, 'createdAt')
      // await upsertIndex(RecordFollower, 'did')
      // await upsertIndex(RecordFollower, 'didFollow')
      // await upsertIndex(RecordFollower, 'createdAt')
      await upsertIndex(ListItem, 'subject')

      // await repo(BSkyty).updateMany({
      //   where: { id: { $not: '-1' } },
      //   set: { pos_atproto: null, pos_bsky: null },
      // })
      // await repo(RecordFollower).deleteMany({ where: { did: { $ne: '1' } } })
      log.success('done')
    }
  },
})

const execute = async (sql: string) => {
  try {
    // @ts-ignore
    await dataProvider.execute(sql)
  } catch (error) {}
}

const upsertIndex = async <T>(ent: ClassType<T>, field: keyof T) => {
  const db = await dbNamesOf(ent)
  const r = repo(ent)
  const f = r.fields[field] as FieldMetadata<T, keyof T>

  const indexName = `idx_${r.metadata.key}_${f.dbName}`

  // console.log(`sql`, `CREATE INDEX "${indexName}" ON ${db} ("${f.dbName}")`)

  try {
    // TODO replace json with sqlLite to have this working?
    // @ts-ignore
    await dataProvider.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = '${r.metadata.key}' AND indexname = '${indexName}') THEN
          CREATE INDEX "${indexName}" ON ${db} ("${f.dbName}");
        END IF;
      END
      $$;
    `)
  } catch (error) {}
}

// SELECT
//   indexname AS index_name,
//   indexdef AS index_definition
// FROM
//   pg_indexes
// WHERE
//   tablename = 'plc-record2';
