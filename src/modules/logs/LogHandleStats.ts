import { Entity, Fields, Relations } from 'remult'

import { BSkyty } from '$modules/at/BSkyty'
import { Roles } from '$modules/auth/Roles'

@Entity<LogHandleStats>('log-handles-stats', {
  allowApiRead: true,
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class LogHandleStats {
  @Fields.cuid({ includeInApi: Roles.admin })
  id!: string

  @Fields.updatedAt({ includeInApi: Roles.admin })
  updatedAt = new Date()

  @Fields.string({ required: true })
  did!: string

  @Relations.toOne<LogHandleStats, BSkyty>(() => BSkyty, { fields: { id: 'did' } })
  bskyty?: BSkyty

  @Fields.string()
  handle = ''

  @Fields.string()
  displayName = ''

  @Fields.string()
  avatar = ''

  @Fields.string()
  emoji = ''

  @Fields.number({ includeInApi: Roles.admin })
  tzOffset = -1

  @Fields.number({ includeInApi: Roles.admin })
  execTime = -1

  @Fields.number({ includeInApi: Roles.admin })
  nbRequests = -1

  @Fields.json({ includeInApi: Roles.admin })
  metadata = {}
}
