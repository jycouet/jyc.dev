import { Entity, EntityBase, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

import type { JSONPLCOperation } from '../../routes/stats/plc/sync/+server'

@Entity<PlcRecord>('plc-record2', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: { createdAt: 'desc' },
  id: ['did'],
})
export class PlcRecord extends EntityBase {
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
