import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<RecordFollow>('record-follows', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    did: 'asc',
  },
})
export class RecordFollow {
  @Fields.string({ caption: 'uri' })
  id!: string

  @Fields.string()
  did = ''

  @Fields.string()
  rkey!: string

  @Fields.date()
  on!: Date

  @Fields.string<RecordFollow>({
    sqlExpression: () => {
      return `TO_CHAR("on", 'YYYY-MM-DD-HH24')`
    },
  })
  onDay!: string

  @Fields.string()
  didFollow = ''
}
