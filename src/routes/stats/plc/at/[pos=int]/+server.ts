import { json } from '@sveltejs/kit'

import { repo } from 'remult'

import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { pos } = params

  const res = await repo(RecordPlc).findFirst({ pos_atproto: parseInt(pos, 10) })

  if (res === undefined) {
    return new Response('Not found', { status: 404 })
  }

  return json(res)
}
