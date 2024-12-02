import { Entity, Fields, Filter, Relations } from 'remult'
import { sqlRelations, sqlRelationsFilter } from 'remult/internals'

import { BSkyty } from '$modules/at/BSkyty'
import { ListItem } from '$modules/at/ListItem'
import { Roles } from '$modules/auth/Roles'

@Entity<StarterPack>('starter-packs', {
  allowApiRead: true,
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    updatedAt: 'desc',
  },
})
export class StarterPack {
  @Fields.string({ caption: 'id / uri' })
  id!: string

  @Fields.string({ includeInApi: Roles.admin })
  listUri!: string

  @Fields.string()
  creatorDid!: string

  @Relations.toOne<StarterPack, BSkyty>(() => BSkyty, { fields: { id: 'creatorDid' } })
  creator!: BSkyty

  @Fields.string()
  name!: string

  @Fields.date({ includeInApi: Roles.admin })
  createdAt!: Date

  @Fields.date({ includeInApi: Roles.admin })
  updatedAt!: Date

  @Fields.string()
  description!: string

  @Relations.toMany<StarterPack, ListItem>(() => ListItem, { fields: { listUri: 'listUri' } })
  items!: ListItem[]

  @Fields.number({
    sqlExpression() {
      return sqlRelations(StarterPack).items.$count()
    },
  })
  nbMembers!: number

  // @Fields.number({
  //   sqlExpression() {
  //     return sqlRelations(StarterPack).creator.followersCount
  //   },
  // })
  // creatorFollowersCount!: number

  // @Fields.number({
  //   sqlExpression() {
  //     // Higher followers count and lower members count = higher index
  //     return (await sqlRelations(StarterPack).creator.followersCount) /
  //       ((await sqlRelations(StarterPack).items.$count()) )

  //   },
  // })
  // popularityIndex!: number

  static filterByCreator = Filter.createCustom<StarterPack, { str: string }>(
    // REMULT ?
    // @ts-ignore
    async ({ str }) => {
      return sqlRelationsFilter(StarterPack).creator.some({
        $or: [
          { displayName: { $contains: str } },
          { handle: { $contains: str } },
          { id: { $contains: str } },
        ],
      })
    },
  )
}
