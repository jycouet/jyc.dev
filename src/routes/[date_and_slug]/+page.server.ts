import { getMdInfo, getMdsInfo } from "$lib/mdInfos";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return getMdsInfo();
};

export const load = async ({ params }) => {
  return getMdInfo(params.date_and_slug);
};
