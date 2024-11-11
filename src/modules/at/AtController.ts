import { DidResolver, getPds } from '@atproto/identity'

import { BackendMethod } from 'remult'

import type { getHandleFollow, getHandleStats } from './AtController.server'

export class AtController {
  static getHandleStatsAbscact: typeof getHandleStats
  static getHandleFollowAbscact: typeof getHandleFollow

  @BackendMethod({ allowed: true })
  static async getHandleStats(
    tzOffset: number,
    did: string,
    handle: string,
    displayName: string,
    avatar: string,
  ) {
    // console.time('getHandleStats')
    // const didResolver = new DidResolver({})
    // const didDocument = await didResolver.resolve(did)
    // console.log(`didDocument`, didDocument)
    // if (didDocument) {
    //   const pds = getPds(didDocument)
    //   console.log(`pds`, pds)
    // }
    // console.timeEnd('getHandleStats')

    return AtController.getHandleStatsAbscact(tzOffset, did, handle, displayName, avatar)
  }

  @BackendMethod({ allowed: true })
  static async getHandleFollow(tzOffset: number, did: string) {
    return AtController.getHandleFollowAbscact(tzOffset, did)
  }
}
