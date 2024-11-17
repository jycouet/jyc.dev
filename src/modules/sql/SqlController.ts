import { BackendMethod, SqlDatabase } from 'remult'

import { Roles } from '$modules/auth/Roles'

export class SqlController {
  static dataProvider: SqlDatabase

  @BackendMethod({ allowed: Roles.admin })
  static async exec(cmd: string) {
    const start = performance.now()

    const ret = await SqlController.dataProvider.execute(cmd)

    const took = performance.now() - start

    return { ...ret, took }
  }
}
