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

  @Fields.string()
  didFollow = ''
}
