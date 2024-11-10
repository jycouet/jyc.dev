import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import type { RequestEvent } from '@sveltejs/kit'

import { repo, type UserInfo } from 'remult'

import { AppUser, AppUserSession } from './Entities'

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }
  await repo(AppUserSession).insert({
    id: sessionId,
    userId,
    expiresAt: session.expiresAt,
  })
  return session
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const row = await repo(AppUserSession).findFirst({ id: sessionId })
  if (row === null || row === undefined) {
    return { session: null, user: null }
  }
  const session: Session = {
    id: row.id,
    userId: row.userId,
    expiresAt: row.expiresAt,
  }

  const userDb = await repo(AppUser).findId(row.userId)

  const user: UserInfo = {
    id: row.userId,
    name: userDb!.displayName,
    handle: userDb!.handle,
    avatar: userDb!.avatar,
    followersCount: userDb!.followersCount,
    followsCount: userDb!.followsCount,
    postsCount: userDb!.postsCount,
  }
  if (Date.now() >= session.expiresAt.getTime()) {
    await repo(AppUserSession).delete(session.id)
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await repo(AppUserSession).update(session.id, {
      expiresAt: session.expiresAt,
    })
  }
  return { session, user }
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
  event.cookies.set('s-jyc-dev', token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
  event.cookies.set('s-jyc-dev', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await repo(AppUserSession).delete(sessionId)
}

export type SessionValidationResult =
  | { session: Session; user: UserInfo }
  | { session: null; user: null }

export interface Session {
  id: string
  userId: string
  expiresAt: Date
}

// export interface User {
//   id: string
//   handle: string
// }
