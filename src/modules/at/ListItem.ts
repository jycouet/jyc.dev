import { Entity, Fields, Relations } from 'remult'
import { sqlRelations } from 'remult/internals'

import { Roles } from '$modules/auth/Roles'
import { LogHandleStats } from '$modules/logs/LogHandleStats'

@Entity<ListItem>('list-item', {
  allowApiRead: true,
  allowApiCrud: Roles.admin,
  // defaultOrderBy: {
  //   firstTimeHere: 'desc',
  // },
})
export class ListItem {
  @Fields.string({ caption: 'id / uri' })
  id!: string

  @Fields.string()
  listUri!: string

  @Fields.string()
  subject!: string

  @Fields.date()
  createdAt!: Date
}
