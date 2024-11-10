import { Agent, CredentialSession } from '@atproto/api'

import { BackendMethod, remult, repo } from 'remult'

import { AppUser } from '$modules/auth/Entities'
import { Roles } from '$modules/auth/Roles'

import type { getHandleFollow, getHandleStats } from './AtController.server'

export class AgentController {
  @BackendMethod({ allowed: Roles.admin })
  static async getExtraInfo(tzOffset: number) {
    const credentialSession = new CredentialSession(new URL('https://bsky.social'))
    const u = await repo(AppUser).findId(remult.user!.id)
    // console.log(`u`, u)
    credentialSession.resumeSession(u!.atpSessionData)
    const agent = new Agent(credentialSession)

    // const res3 = await agent.app.bsky.feed.post.create(
    //   { repo: u!.id },
    //   {
    //     text: 'Is it working to post something in the future ?',
    //     createdAt: new Date('2024-11-11T10:00:00Z').toISOString(),

    //   },
    // )
    // console.log(`res3`, res3)

    // const uu = await agent.getLikes({
    //   uri: 'at://did:plc:dacfxuonkf2qtqft22sc23tu/app.bsky.feed.post/3lamowjvknc2q',
    //   limit: 10000,
    // })
    // console.log(`uu`, uu)

    // const tt = await agent.getProfile({ actor: 'jyc.dev' })
    // console.log(tt.data.viewer?.knownFollowers)

    // const tt = await agent.getFollowers({ actor: 'jyc.dev', limit: 100 })
    // console.log(tt)

    // const tt = await agent.app.bsky.actor.getProfile({ actor: 'jyc.dev' })
    // console.log(tt)
  }
}
