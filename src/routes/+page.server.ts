import { getMdInfo, getMdsInfo } from "$lib/mdInfos";

export const load = async () => {
  const mds = getMdsInfo().map((i) => {
    const { date_and_slug, date, title } = getMdInfo(i.date_and_slug);
    return {
      date_and_slug,
      date,
      title,
    };
  });

  return { mds };
};
