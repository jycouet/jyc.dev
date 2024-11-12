import { Entity, Fields, Relations } from 'remult'
import { sqlRelations } from 'remult/internals'

import { Roles } from '$modules/auth/Roles'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

@Entity<BSkyty>('bskyties', {
  allowApiRead: true,
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
    includeInApi: Roles.admin,
    sqlExpression: () => {
      return sqlRelations(BSkyty).stats.$first({ orderBy: { updatedAt: 'desc' } }).emoji
    },
  })
  lastEmoji = ''

  @Fields.string()
  avatar = ''

  @Fields.date({ includeInApi: Roles.admin })
  firstTimeHere = new Date()

  @Relations.toMany<BSkyty, LogHandleStats>(() => LogHandleStats, {
    field: 'did',
  })
  stats: LogHandleStats[] = []

  @Fields.string({ includeInApi: Roles.admin })
  lastFollowDid = ''

  @Fields.number({ includeInApi: Roles.admin })
  followersCount = 0

  @Fields.number({ includeInApi: Roles.admin })
  followsCount = 0

  @Fields.number({ includeInApi: Roles.admin })
  postsCount = 0
}
