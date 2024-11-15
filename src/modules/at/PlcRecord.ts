import { Entity, EntityBase, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<PlcRecord>('plc-record', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: { createdAt: 'desc' },
})
export class PlcRecord extends EntityBase {
  @Fields.number()
  id!: number

  @Fields.string({ caption: 'DID' })
  did!: string

  // @Fields.string()
  // cid!: string

  // @Fields.boolean()
  // nullified!: boolean

  @Fields.date()
  createdAt!: Date

  // @Fields.json()
  // operation!: {
  //   sig: string
  //   prev: string | null
  //   type: 'create' | 'plc_operation'
  //   handle: string
  //   service: string
  //   signingKey: string
  //   recoveryKey: string
  // }
}
