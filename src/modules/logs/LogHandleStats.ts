import { Entity, Fields } from 'remult'

@Entity<LogHandleStats>('log-handles-stats', {
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

  @Fields.number()
  tzOffset = -1

  @Fields.number()
  execTime = -1

  @Fields.number()
  nbRequests = -1

  @Fields.string()
  emoji = ''

  @Fields.json()
  metadata = {}
}
