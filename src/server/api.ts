import { PostHog } from 'posthog-node'

import { dbNamesOf, repo, SqlDatabase } from 'remult'
import type { ClassType } from 'remult'
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
import { PlcRecord } from '$modules/at/PlcRecord'
import { RecordFollow } from '$modules/at/Record'
import { StarterPack } from '$modules/at/StarterPack'
import { AppUser, AppUserSession } from '$modules/auth/Entities'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from '$modules/auth/lucia'
import { LogHandleFollow } from '$modules/logs/LogHandleFollow'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

import { Roles } from '../modules/auth/Roles'

SqlDatabase.LogToConsole = false
// SqlDatabase.LogToConsole = 'oneLiner'

export const dataProvider = await createPostgresDataProvider({
  connectionString: DATABASE_URL,
})

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
    StarterPack,
    ListItem,
    PlcRecord,
  ],
  controllers: [AtController, AgentController],
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
      const clientPostHog = new PostHog(PUBLIC_POSTHOG_KEY, {
        host: 'https://eu.i.posthog.com',
      })
      clientPostHog.capture({
        distinctId: new Date().toISOString(),
        event: 'server-start',
      })
      clientPostHog.flush()

      // await dataProvider.execute(`
      //   DO $$
      //   BEGIN
      //     IF EXISTS (
      //       SELECT 1 FROM information_schema.columns
      //       WHERE table_name = 'log-handles-follows'
      //       AND column_name = 'handle'
      //     ) THEN
      //       ALTER TABLE "log-handles-follows" DROP COLUMN handle;
      //     END IF;
      //     IF EXISTS (
      //       SELECT 1 FROM information_schema.columns
      //       WHERE table_name = 'log-handles-follows'
      //       AND column_name = 'displayName'
      //     ) THEN
      //       ALTER TABLE "log-handles-follows" DROP COLUMN "displayName";
      //     END IF;
      //   END $$;
      // `)
      // await dataProvider.execute(`
      //   DROP TABLE IF EXISTS "log-handles";
      // `)
      // console.log(`res`, res)// const allStats = await repo(LogHandleStats).find({
      //   orderBy: {
      //     updatedAt: 'asc',
      //   },
      // })
      // for (const stat of allStats) {
      //   await repo(BSkyty).upsert({
      //     where: { id: stat.did },
      //     set: {
      //       handle: stat.handle,
      //       displayName: stat.displayName,
      //       firstTimeHere: stat.updatedAt,
      //       avatar: stat.avatar,
      //     },
      //   })
      // }

      // await dataProvider.execute(`
      //   ALTER TABLE "plc-record" DROP CONSTRAINT IF EXISTS "plc-record_pkey";
      // `)

      // await dataProvider.execute(`
      //   DO $$
      //   BEGIN
      //     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'plc-record' AND indexname = 'idx_plc_record_did') THEN
      //       CREATE INDEX idx_plc_record_did ON "plc-record" (did);
      //     END IF;
      //   END
      //   $$;
      // `)
      await upsertIndex(PlcRecord, 'createdAt')
      await upsertIndex(PlcRecord, 'pos_atproto')
      await upsertIndex(PlcRecord, 'pos_bsky')
      new Log('apiInit').success('done')
      // await dataProvider.execute(`
      //   DO $$
      //   BEGIN
      //     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'plc-record' AND indexname = 'idx_plc_record_createdAt') THEN
      //       CREATE INDEX "idx_plc_record_createdAt" ON "plc-record" ("createdAt");
      //     END IF;
      //   END
      //   $$;
      // `)
    }
  },
})

const upsertIndex = async <T extends ClassType<unknown>>(ent: T, index: string) => {
  const db = await dbNamesOf(ent)
  const r = repo(ent)

  await dataProvider.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = '${r.metadata.key}' AND indexname = 'idx_${r.metadata.key}_${index}') THEN
        CREATE INDEX "idx_${r.metadata.key}_${index}" ON ${db} ("${index}");
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
