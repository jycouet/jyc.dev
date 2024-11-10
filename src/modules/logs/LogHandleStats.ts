import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<LogHandleStats>('log-handles-stats', {
  allowApiCrud: Roles.admin,
  allowApiRead: true,
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class LogHandleStats {
  @Fields.cuid({ includeInApi: Roles.admin })
  id!: string

  @Fields.updatedAt({ includeInApi: Roles.admin })
  updatedAt = new Date()

  @Fields.string({ required: true, includeInApi: Roles.admin })
  did!: string

  @Fields.string()
  handle = ''

  @Fields.string()
  displayName = ''

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
