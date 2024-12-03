import { Entity, EntityBase, Field, Fields, ValueListFieldType } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<RecordPlc>('record-plcs', {
  // allowApiRead: true,
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

  @Field(() => RecordPlcState)
  state = RecordPlcState.UNKNOWN

  @Fields.date()
  createdAt!: Date

  @Fields.string({ allowNull: true })
  handle?: string | null
  @Fields.string({ allowNull: true })
  displayName?: string | null
  @Fields.string({ allowNull: true })
  avatar?: string | null
  @Fields.string({ allowNull: true })
  description?: string | null
  @Fields.number({ allowNull: true })
  followersCount?: number | null
  @Fields.number({ allowNull: true })
  followsCount?: number | null
  @Fields.number({ allowNull: true })
  postsCount?: number | null

  @Fields.date({ allowNull: true })
  indexedAt?: Date | null = null
  @Fields.string({ allowNull: true })
  indexedError?: string | null

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

@ValueListFieldType()
export class RecordPlcState {
  static UNKNOWN = new RecordPlcState('')
  static NOT_BSKY = new RecordPlcState('not_bsky')
  static HANDLE_INVALID = new RecordPlcState('handle.invalid')
  static SUSPENDED = new RecordPlcState('suspended')
  static DEACTIVATED = new RecordPlcState('deactivated')

  static LABELER = new RecordPlcState('labeler') // https://bsky.app/profile/github-labeler.bsky.social
  static FILTERED = new RecordPlcState('filtered')

  static CHECKED = new RecordPlcState('checked')

  constructor(public id: string | null) {}
}
