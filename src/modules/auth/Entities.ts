import type { AtpSessionData } from '@atproto/api'

import { Entity, Fields } from 'remult'

import { Roles } from '$modules/auth/Roles'

@Entity<AppUser>('app-users', {
  allowApiCrud: Roles.admin,
  defaultOrderBy: {
    createdAt: 'desc',
  },
})
export class AppUser {
  @Fields.cuid({ caption: 'did' })
  id!: string

  @Fields.createdAt({ includeInApi: Roles.admin })
  createdAt = new Date()

  @Fields.string()
  handle!: string

  @Fields.string()
  displayName!: string

  @Fields.string()
  avatar!: string

  @Fields.string({ includeInApi: Roles.admin })
  email!: string

  @Fields.json({ includeInApi: Roles.admin })
  atpSessionData!: AtpSessionData

  @Fields.number()
  followersCount = -1

  @Fields.number()
  followsCount = -1

  @Fields.number()
  postsCount = -1
}

@Entity<AppUserSession>('app-user-sessions', {
  allowApiCrud: Roles.admin,
})
export class AppUserSession {
  @Fields.string()
  id!: string

  @Fields.string()
  userId!: string

  @Fields.date()
  expiresAt!: Date
}
