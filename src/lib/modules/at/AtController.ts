import { BackendMethod } from 'remult'

export class AtController {
  @BackendMethod({ allowed: true })
  static async getHandleStats(completed: boolean) {
    return { coucou: 'yes' }
  }
}
