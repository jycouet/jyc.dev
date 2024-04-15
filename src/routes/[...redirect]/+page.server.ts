import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, url }) => {
  if (params.redirect.includes("youtube")) {
    const videoId = url.searchParams.get("v");
    redirect(302, `/thumb-meta/${videoId}`);
  } else {
    redirect(302, `/blog`);
  }

  return {};
}) satisfies PageServerLoad;
