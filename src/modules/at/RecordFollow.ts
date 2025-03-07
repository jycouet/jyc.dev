import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<RecordFollow>('record-follows', {
  allowApiCrud: Roles.admin,
  id: ['did', 'didFollow'],
})
export class RecordFollow {
  @Fields.string()
  did = ''

  @Fields.string()
  didFollow = ''

  @Fields.date({ allowNull: true })
  createdAt!: Date | null

  @Fields.string<RecordFollow>({
    sqlExpression: () => {
      return `TO_CHAR("createdAt", 'YYYY-MM-DD-HH24')`
    },
  })
  onDay!: string

  @Fields.string()
  uri!: string
}
