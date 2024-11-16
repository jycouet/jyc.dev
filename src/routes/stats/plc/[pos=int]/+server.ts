import { json } from '@sveltejs/kit'

import { repo } from 'remult'

import { PlcRecord } from '$modules/at/PlcRecord'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { pos } = params

  const res = await repo(PlcRecord).findFirst({ id: parseInt(pos, 10) })

  return json(res)
}
