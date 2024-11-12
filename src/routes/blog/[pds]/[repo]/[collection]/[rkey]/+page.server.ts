import { getRecord } from '$modules/at/helper'

// export const entries: EntryGenerator = () => {
//   const data = getMdsInfo();
//   return data;
// };

export const load = async ({ params }) => {
  const record = await getRecord(
    `https://${params.pds}`,
    params.repo,
    params.collection,
    params.rkey,
  )
  return { title: record.value.title, source: record.value.content }
}
