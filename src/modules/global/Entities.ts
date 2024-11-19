import { Entity, Field, Fields, ValueListFieldType } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<KeyValue>('key-values', {
  allowApiRead: true,
  allowApiCrud: Roles.admin,
  id: ['key'],
})
export class KeyValue {
  @Field(() => GlobalKey)
  key!: GlobalKey

  @Fields.json()
  value = {}
}

@ValueListFieldType()
export class GlobalKey {
  static LATEST_GLOBAL_STATS = new GlobalKey('LATEST_GLOBAL_STATS')

  constructor(public id: string) {}
}
