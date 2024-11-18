import { Entity, EntityBase, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<RecordPlc>('record-plcs', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: { createdAt: 'desc' },
  id: ['did'],
})
export class RecordPlc extends EntityBase {
  @Fields.string({ caption: 'DID' })
  did!: string

  @Fields.number()
  pos_atproto!: number

  @Fields.number({ allowNull: true })
  pos_bsky!: number | null

  // @Fields.string()
  // cid!: string

  // @Fields.boolean()
  // nullified!: boolean

  @Fields.date()
  createdAt!: Date

  // @Fields.json({ includeInApi: Roles.admin })
  // metadata!: {
  //   cid: string
  //   nullified: boolean
  //   operation: JSONPLCOperation
  // }
}

export class RecordPlcStats extends RecordPlc {
  @Fields.string<RecordPlcStats>({
    sqlExpression: () => {
      // return `TO_CHAR("createdAt", 'YYYY-MM-DD')`
      return `DATE("createdAt")`
    },
  })
  onDay!: string
}
