import { Agent, CredentialSession } from '@atproto/api'
import { fail, redirect, type Actions } from '@sveltejs/kit'

import { repo } from 'remult'

import { route } from '$lib/ROUTES'
import { AppUser } from '$modules/auth/Entities'
import { createSession, generateSessionToken, setSessionTokenCookie } from '$modules/auth/lucia'

import type { PageServerLoad } from './$types'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions = {
  login: async (event) => {
    const data = await event.request.formData()
    const handle = data.get('handle')
    const appPassword = data.get('appPassword')

    if (!handle || !appPassword) {
      return {
        success: false,
        error: 'Missing handle or appPassword',
      }
    }

    const cleanHandle = handle.toString().replace('@', '').toLowerCase()

    const credentialSession = new CredentialSession(new URL('https://bsky.social'))
    await credentialSession.login({
      identifier: cleanHandle,
      password: appPassword.toString(),
    })

    if (credentialSession.session) {
      const agent = new Agent(credentialSession)
      const profile = await agent.getProfile({ actor: cleanHandle })

      // console.log(`profile`, profile.data)

      await repo(AppUser).upsert({
        where: { id: credentialSession.did },
        set: {
          handle: credentialSession.session.handle,
          email: credentialSession.session.email,
          displayName: profile.data.displayName,
          avatar: profile.data.avatar,
          atpSessionData: credentialSession.session,
          followersCount: profile.data.followersCount,
          followsCount: profile.data.followsCount,
          postsCount: profile.data.postsCount,
        },
      })

      const token = generateSessionToken()
      const session = await createSession(token, credentialSession.did!)
      setSessionTokenCookie(event, token, session.expiresAt)

      return redirect(302, route('/crab/[handle]', { handle: credentialSession.session.handle }))
    }

    fail(401)
  },
} satisfies Actions
