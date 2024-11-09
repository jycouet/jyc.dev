import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<LogHandleFollow>('log-handles-follows', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class LogHandleFollow {
  @Fields.cuid()
  id!: string

  @Fields.updatedAt()
  updatedAt = new Date()

  @Fields.string({ required: true })
  did!: string

  @Fields.number()
  tzOffset = -1

  @Fields.number()
  execTime = -1

  @Fields.number()
  nbRequests = -1

  @Fields.json()
  metadata = {}
}
