import { DidResolver, getPds } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { repo, SqlDatabase } from 'remult'
import { Log } from '@kitql/helpers'

import { upsert } from '$lib/remultHelper'
import { getProfile } from '$modules/at/agentHelper'
import { BSkyty } from '$modules/at/BSkyty'
import { listRecords, listRecordsAll } from '$modules/at/helper'
import { ListItem } from '$modules/at/ListItem'
import { RecordPlc } from '$modules/at/RecordPlc'
import { StarterPack } from '$modules/at/StarterPack'

import type { LayoutServerLoad } from './$types'

const log = new Log('at/[handle]/+page.server.ts')

export const load = (async (event) => {
  // Remove @ if user included it
  let cleanHandle = event.params.handle.replace('@', '').toLowerCase()

  try {
    const profile = await getProfile(cleanHandle)
    if (!profile) {
      throw new Error('Profile not found')
    }
    cleanHandle = profile.data.handle

    let bskyty = await repo(BSkyty).upsert({
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

    // Don't await this
    if (profile.data.associated?.starterPacks) {
      addStarterPack(profile.data.did)
    }

    let createdAt = bskyty.createdAt
    let pos_atproto = bskyty.pos_atproto
    let pos_bsky = bskyty.pos_bsky
    let mushroom = bskyty.mushroom
    if (!createdAt || !pos_atproto) {
      const recordPlc = await repo(RecordPlc).findFirst({ did: profile.data.did })
      createdAt = recordPlc?.createdAt ?? null
      pos_atproto = recordPlc?.pos_atproto ?? null
      pos_bsky = recordPlc?.pos_bsky ?? null
    }

    if (!bskyty.startedToBeActiveOn || !bskyty.pos_atproto || !bskyty.mushroom) {
      const didResolver = new DidResolver({})
      const didDocument = await didResolver.resolve(bskyty.id)

      // Extract and log the mushroom name from the PDS endpoint
      const pdsEndpoint = didDocument?.service?.find(
        (s) => s.id === '#atproto_pds',
      )?.serviceEndpoint
      if (pdsEndpoint && typeof pdsEndpoint === 'string') {
        mushroom = new URL(pdsEndpoint).hostname.split('.')[0]
      }
      if (didDocument) {
        const pds = getPds(didDocument)
        if (pds) {
          const firstPosts = await listRecords(pds, bskyty.id, 'app.bsky.feed.post', {
            limit: 100,
            reverse: true,
          })

          const sortedDates = firstPosts.records.map(
            (r: { value: { createdAt: string } }) => new Date(r.value.createdAt),
          ) as Date[]

          if (!createdAt) {
            createdAt = sortedDates[0]
          }

          if (!pos_atproto && profile.data.did.startsWith('did:web')) {
            const recordPlcWeb = await repo(RecordPlc).findFirst(
              { createdAt: { $gte: createdAt } },
              { orderBy: { createdAt: 'asc' } },
            )
            pos_atproto = recordPlcWeb?.pos_atproto ?? null
            pos_bsky = recordPlcWeb?.pos_bsky ?? null
          }

          // Calculate average delta days between posts
          const datesWithDeltas = sortedDates.map((date: Date, i: number) => {
            const prevDate = i > 0 ? sortedDates[i - 1] : null
            const delta = prevDate
              ? Math.ceil(Math.abs(date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0
            return {
              date,
              deltaDays: delta,
            }
          })

          // Calculate average delta days
          const avgDeltaDays =
            datesWithDeltas.reduce((sum: number, curr: any) => sum + curr.deltaDays, 0) /
            (datesWithDeltas.length - 1)

          // Find the median index
          const midIndex = Math.floor(sortedDates.length / 2)

          // Start from median and go backwards until we find a gap larger than average
          let startedToBeActiveOn = sortedDates[0] // Default to first post if no significant gap found
          for (let i = midIndex; i > 0; i--) {
            if (datesWithDeltas[i].deltaDays > avgDeltaDays * 2) {
              // Using 2x average as threshold
              startedToBeActiveOn = datesWithDeltas[i].date
              break
            }
          }

          // Update the BSkyty record with the start date
          bskyty = await repo(BSkyty).update(bskyty.id, {
            createdAt,
            startedToBeActiveOn,
            pos_atproto,
            pos_bsky,
            mushroom,
          })

          // console.log({
          //   startedToBeActiveOn: startedToBeActiveOn.toISOString(),
          //   avgDeltaDays,
          //   datesWithDeltas: datesWithDeltas.map((d) => ({
          //     date: d.date.toISOString(),
          //     deltaDays: d.deltaDays,
          //   })),
          // })
        }
      }
    }

    return {
      did: profile.data.did,
      handle: profile.data.handle,
      displayName: profile.data.displayName || profile.data.handle,
      avatar: profile.data.avatar,
      description: profile.data.description || '',
      pos_atproto,
      pos_bsky,
      createdAt,
      startedToBeActiveOn: bskyty.startedToBeActiveOn,
      mushroom,
      followersCount: profile.data.followersCount,
      followsCount: profile.data.followsCount,
      postsCount: profile.data.postsCount,
    }
  } catch (error) {
    const notValidError = ['Profile not found', 'Error: actor must be a valid did or a handle']
    if (error instanceof Error && notValidError.includes(error.message)) {
      redirect(307, `/at?h=${cleanHandle}&e=not-valid`)
    } else {
      console.error(`error in PageServerLoad`, cleanHandle, error)
      redirect(307, `/at`)
    }
  }
}) satisfies LayoutServerLoad

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
        // console.log(`starterPack`, starterPack)

        try {
          // await repo(StarterPack).upsert({
          await upsert(StarterPack, {
            where: { id: starterPack.uri },
            set: {
              creatorDid: did,
              listUri: starterPack.value.list,
              name: starterPack.value.name,
              createdAt: starterPack.value.createdAt,
              updatedAt: starterPack.value.updatedAt ?? starterPack.value.createdAt,
              description: starterPack.value.description,
            },
          })
        } catch (error) {
          log.error(`error adding StarterPack`, error)
        }
      }
      for (const listItem of listitems.records) {
        try {
          // await repo(ListItem).upsert({
          await upsert(ListItem, {
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
