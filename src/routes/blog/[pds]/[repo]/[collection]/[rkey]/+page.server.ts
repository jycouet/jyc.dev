import { getRecord } from '$lib/at/helper'

// export const entries: EntryGenerator = () => {
//   const data = getMdsInfo();
//   return data;
// };

export const load = async ({ fetch, params }) => {
  const record = await getRecord(
    fetch,
    `https://${params.pds}`,
    params.repo,
    params.collection,
    params.rkey,
  )
  return { title: record.value.title, source: record.value.content }
}
