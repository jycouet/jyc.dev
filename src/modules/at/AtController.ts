import { BackendMethod } from 'remult'

import type { getFollowsPeriods, getHandleStats } from './AtController.server'

export class AtController {
  static getHandleStatsAbscact: typeof getHandleStats
  static getFollowsPeriodsAbscact: typeof getFollowsPeriods

  @BackendMethod({ allowed: true })
  static async getHandleStats(tzOffset: number, did: string) {
    return AtController.getHandleStatsAbscact(tzOffset, did)
  }

  @BackendMethod({ allowed: true })
  static async getFollowsPeriods(tzOffset: number, did: string) {
    return AtController.getFollowsPeriodsAbscact(tzOffset, did)
  }
}
