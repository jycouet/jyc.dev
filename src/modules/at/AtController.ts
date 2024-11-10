import { BackendMethod } from 'remult'

import type { getHandleFollow, getHandleStats } from './AtController.server'

export class AtController {
  static getHandleStatsAbscact: typeof getHandleStats
  static getHandleFollowAbscact: typeof getHandleFollow

  @BackendMethod({ allowed: true })
  static async getHandleStats(tzOffset: number, did: string, handle: string, displayName: string) {
    return AtController.getHandleStatsAbscact(tzOffset, did, handle, displayName)
  }

  @BackendMethod({ allowed: true })
  static async getHandleFollow(tzOffset: number, did: string) {
    return AtController.getHandleFollowAbscact(tzOffset, did)
  }
}
