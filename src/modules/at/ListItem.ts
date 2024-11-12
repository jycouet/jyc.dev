import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

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
