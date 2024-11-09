import { Entity, Fields } from 'remult'

@Entity<LogHandle>('log-handles', {
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class LogHandle {
  @Fields.cuid()
  id!: string

  @Fields.updatedAt()
  updatedAt = new Date()

  @Fields.string({ required: true })
  did!: string

  @Fields.string()
  handle = ''

  @Fields.number()
  execTime = -1

  @Fields.json()
  metadata = {}
}
