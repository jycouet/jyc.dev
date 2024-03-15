import { getMdInfo, getMdsInfo } from "$lib/mdInfos";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  const data = getMdsInfo();
  console.log(`data`, data);

  return data;
};

export const load = async ({ params }) => {
  return getMdInfo(params.date_and_slug);
};
