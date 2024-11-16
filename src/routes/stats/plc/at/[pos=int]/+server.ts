import { json } from '@sveltejs/kit'

import { repo } from 'remult'

import { PlcRecord } from '$modules/at/PlcRecord'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { pos } = params

  const res = await repo(PlcRecord).findFirst({ pos_atproto: parseInt(pos, 10) })

  if (res === undefined) {
    return new Response('Not found', { status: 404 })
  }

  return json(res)
}
