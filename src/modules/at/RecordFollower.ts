import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<RecordFollower>('record-followers', {
  allowApiCrud: Roles.admin,
  id: ['did', 'didFollow'],
})
export class RecordFollower {
  @Fields.string()
  did = ''

  @Fields.string()
  didFollow = ''

  @Fields.date({ allowNull: true })
  createdAt!: Date | null

  @Fields.string<RecordFollower>({
    sqlExpression: () => {
      return `TO_CHAR("createdAt", 'YYYY-MM-DD-HH24')`
    },
  })
  onDay!: string

  @Fields.string()
  uri!: string
}
