
import { remult } from 'remult'

import type { LayoutServerLoad } from './$types'

export const load = (async ({ url }) => {
  // if (url.host === 'jyc.dev') {
  //   return redirect(308, url.href.replace('jyc.dev', 'skyzoo.blue'))
  // }

  return { user: remult.user }
}) satisfies LayoutServerLoad
