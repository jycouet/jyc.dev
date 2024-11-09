import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<LogHandleStats>('log-handles-stats', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class LogHandleStats {
  @Fields.cuid()
  id!: string

  @Fields.updatedAt()
  updatedAt = new Date()

  @Fields.string({ required: true })
  did!: string

  @Fields.string()
  emoji = ''

  @Fields.number()
  tzOffset = -1

  @Fields.number()
  execTime = -1

  @Fields.number()
  nbRequests = -1

  @Fields.json()
  metadata = {}
}
