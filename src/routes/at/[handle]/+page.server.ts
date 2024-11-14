import { Agent } from '@atproto/api'
import { DidResolver, getPds } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { repo } from 'remult'
import { Log } from '@kitql/helpers'

import { BSkyty } from '$modules/at/BSkyty'
import { listRecordsAll } from '$modules/at/helper'
import { ListItem } from '$modules/at/ListItem'
import { PlcRecord } from '$modules/at/PlcRecord'
import { StarterPack } from '$modules/at/StarterPack'

import type { PageServerLoad } from './$types'

const log = new Log('at/[handle]/+page.server.ts')

export const load = (async (event) => {
  try {
    const agent = new Agent(new URL('https://public.api.bsky.app'))

    // Remove @ if user included it
    const cleanHandle = event.params.handle.replace('@', '').toLowerCase()

    let profile
    for (let i = 0; i < 3; i++) {
      try {
        profile = await agent.getProfile({ actor: cleanHandle })
        break
      } catch (error) {
        if (i >= 2) throw error
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    // const toto = await agent.getFollows({ actor: cleanHandle })
    // console.log(`toto`, toto.data.follows[0])

    // console.dir(profile, { depth: null })

    profile = profile!

    // Don't await this
    addStarterPack(profile.data.did)

    await repo(BSkyty).upsert({
      where: { id: profile.data.did },
      set: {
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
        followersCount: profile.data.followersCount,
        followsCount: profile.data.followsCount,
        postsCount: profile.data.postsCount,
      },
    })

    const plcRecord = await repo(PlcRecord).findFirst({ did: profile.data.did })

    return {
      did: profile.data.did,
      handle: profile.data.handle,
      displayName: profile.data.displayName,
      avatar: profile.data.avatar,
      description: profile.data.description || '',
      pos: plcRecord?.id,
      createdAt: plcRecord?.createdAt,
    }

    // const handleResolver = new HandleResolver({})
    // let did = undefined
    // if ((cleanHandle ?? '').startsWith('did:plc:')) {
    //   did = cleanHandle
    // } else {
    //   did = await handleResolver.resolve(cleanHandle)
    // }

    // if (did) {
    //   const didResolver = new DidResolver({})
    //   const didDocument = await didResolver.resolve(did)

    //   if (didDocument) {
    //     const pds = getPds(didDocument)
    //     // console.log(`pds`, pds);
    //     // const repo = await describeRepo(event.fetch, pds!, did);
    //     // console.log(`repo`, repo);

    //     if (pds) {
    //       log.info(cleanHandle)
    //       const profile = await listRecords(pds, did, 'app.bsky.actor.profile', { limit: 1 })
    //       const profileData = profile.records[0]?.value

    //       const handle = cleanHandle
    //       const displayName = profileData?.displayName || handle

    //       return {
    //         did,
    //         handle,
    //         displayName,
    //         avatar: profileData?.avatar?.ref?.$link
    //           ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileData.avatar.ref.$link}@jpeg`
    //           : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
    //         description: profileData?.description || '',
    //       }
    //     }
    //   }
    // }
  } catch (error) {
    const notValidError = ['Profile not found', 'Error: actor must be a valid did or a handle']
    if (error instanceof Error && notValidError.includes(error.message)) {
      redirect(307, `/at?h=${cleanHandle}&e=not-valid`)
    } else {
      console.error(`error in PageServerLoad`, cleanHandle, error)
      redirect(307, `/at`)
    }
  }
}) satisfies PageServerLoad

const addStarterPack = async (did: string) => {
  const didResolver = new DidResolver({})
  const didDocument = await didResolver.resolve(did)
  if (didDocument) {
    const pds = getPds(didDocument)
    if (pds) {
      const [starterPacks, listitems] = await Promise.all([
        listRecordsAll(pds, did, 'app.bsky.graph.starterpack'),
        listRecordsAll(pds, did, 'app.bsky.graph.listitem'),
      ])
      for (const starterPack of starterPacks.records) {
        try {
          await repo(StarterPack).upsert({
            where: { id: starterPack.uri },
            set: {
              creatorDid: did,
              listUri: starterPack.value.list,
              name: starterPack.value.name,
              createdAt: starterPack.value.createdAt,
              updatedAt: starterPack.value.updatedAt,
              description: starterPack.value.description,
            },
          })
        } catch (error) {
          log.error(`error adding StarterPack`, error)
        }
      }
      for (const listItem of listitems.records) {
        try {
          await repo(ListItem).upsert({
            where: { id: listItem.uri },
            set: {
              listUri: listItem.value.list,
              subject: listItem.value.subject,
              createdAt: listItem.value.createdAt,
            },
          })
        } catch (error) {
          log.error(`error adding ListItem`, error)
        }
      }
    }
  }
}
