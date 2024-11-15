import { json } from '@sveltejs/kit'

import { repo } from 'remult'

import { PlcRecord } from '$modules/at/PlcRecord'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  // It's just faster with the new index
  const res = await repo(PlcRecord).findFirst({}, { orderBy: { createdAt: 'desc' } })
  return json(res?.id)
  // SqlDatabase.LogToConsole = true
  // const res = await repo(PlcRecord).count()
  // return json(res)
}
