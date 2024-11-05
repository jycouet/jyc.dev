import { BackendMethod } from 'remult'

import type { getHandleStats } from './AtController.server'

export class AtController {
  static getHandleStatsAbscact: typeof getHandleStats

  @BackendMethod({ allowed: true })
  static async getHandleStats(tzOffset: number, handle: string) {
    return AtController.getHandleStatsAbscact(tzOffset, handle)
  }
}
