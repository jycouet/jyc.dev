import { YOUTUBE_API_KEY } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { google } from "googleapis";

async function fetchImageAsBase64(url: string) {
  try {
    const response = await fetch(url, {
      mode: "cors",
      redirect: "follow",
    });
    const arrayBuffer = await response.arrayBuffer();
    // @ts-ignore
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    return base64String;
  } catch (error) {
    console.error("Failed to fetch and convert image", error);
  }
}

export const load = (async ({ params }) => {
  const initData = await getVideoViews(params.videoId);

  return {
    ...initData,
    blob: await fetchImageAsBase64(initData.snippet.thumbnails.maxres.url),
  };
}) satisfies PageServerLoad;

const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });

async function getVideoViews(videoId: string) {
  try {
    const response = await youtube.videos.list({
      // @ts-ignore
      id: videoId,
      part: "snippet,statistics,contentDetails",
    });

    // @ts-ignore
    if (response.data.items && response.data.items.length > 0) {
      // @ts-ignore
      const views = response.data.items[0].statistics?.viewCount;
      console.log(`views`, views);

      // @ts-ignore
      return response.data.items[0];
    } else {
      redirect(303, "/thumb-meta");
    }
  } catch (error) {
    redirect(303, "/thumb-meta");
  }
}
