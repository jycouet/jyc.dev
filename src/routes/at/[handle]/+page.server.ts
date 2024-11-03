import { listRecords } from "$lib/at/helper";
import type { PageServerLoad } from "./$types";
import {
  DidResolver,
  getHandle,
  HandleResolver,
  getPds,
} from "@atproto/identity";
import { AtUri } from "@atproto/syntax";
import { redirect } from "@sveltejs/kit";

export const load = (async (event) => {
  try {
    const handleResolver = new HandleResolver({});
    const did = await handleResolver.resolve(event.params.handle);

    if (did) {
      const didResolver = new DidResolver({});
      const didDocument = await didResolver.resolve(did);

      if (didDocument) {
        const pds = getPds(didDocument);

        if (pds) {
          const profile = await listRecords(
            event.fetch,
            pds,
            did,
            "app.bsky.actor.profile"
          );

          // const likes = await listRecords(
          //   event.fetch,
          //   pds,
          //   did,
          //   "app.bsky.feed.like"
          // );

          // const totalLikes = likes.records.length;

          // const today = new Date();
          // today.setHours(0, 0, 0, 0);
          // const todayLikes = likes.records.filter((record) => {
          //   const likeDate = new Date(record.value.createdAt);
          //   return likeDate >= today;
          // }).length;

          const profileData = profile.records[0]?.value;
          return {
            did,
            displayName: profileData?.displayName || event.params.handle,
            handle: event.params.handle,
            avatar: profileData?.avatar?.ref?.$link
              ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileData.avatar.ref.$link}@jpeg`
              : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
            description: profileData?.description || "",
          };
        }
      }
    }
  } catch (error) {
    redirect(307, `/at`);
  }
}) satisfies PageServerLoad;
