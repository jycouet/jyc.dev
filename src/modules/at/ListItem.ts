import { Entity, Fields, Relations } from 'remult'

import { StarterPack } from '$modules/at/StarterPack'
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

  @Relations.toOne<ListItem, StarterPack>(() => StarterPack, { fields: { listUri: 'listUri' } })
  starterPack!: StarterPack
}
