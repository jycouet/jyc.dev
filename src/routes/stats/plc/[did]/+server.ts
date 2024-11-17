import { json } from '@sveltejs/kit'

import { repo } from 'remult'

import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { did } = params

  const res = await repo(RecordPlc).findFirst({ did })

  return json(res)
}
