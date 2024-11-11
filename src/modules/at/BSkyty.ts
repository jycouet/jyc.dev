import { Entity, Fields, Relations } from 'remult'
import { sqlRelations } from 'remult/internals'

import { Roles } from '$modules/auth/Roles'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

@Entity<BSkyty>('bskyties', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    firstTimeHere: 'desc',
  },
})
export class BSkyty {
  @Fields.string({ caption: 'id / did' })
  id!: string

  @Fields.string()
  handle = ''

  @Fields.string()
  displayName = ''

  @Fields.string({
    sqlExpression: () => {
      return sqlRelations(BSkyty).stats.$first({ orderBy: { updatedAt: 'desc' } }).emoji
    },
  })
  lastEmoji = ''

  @Fields.string()
  avatar = ''

  @Fields.date()
  firstTimeHere = new Date()

  @Relations.toMany<BSkyty, LogHandleStats>(() => LogHandleStats, {
    field: 'did',
  })
  stats: LogHandleStats[] = []

  @Fields.string()
  lastFollowDid = ''

  @Fields.number()
  followersCount = 0

  @Fields.number()
  followsCount = 0

  @Fields.number()
  postsCount = 0
}
