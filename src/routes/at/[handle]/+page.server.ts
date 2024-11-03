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
    // did
    const handleResolver = new HandleResolver({});
    const did = await handleResolver.resolve(event.params.handle);

    // didDocument
    if (did) {
      const didResolver = new DidResolver({});
      const didDocument = await didResolver.resolve(did);

      if (didDocument) {
        const pds = getPds(didDocument);

        if (pds) {
          const app_bsky_actor_profile = await listRecords(
            event.fetch,
            pds,
            did,
            "app.bsky.actor.profile"
          );

          return { did, didDocument, app_bsky_actor_profile };
        }
      }
    }
  } catch (error) {
    redirect(307, `/at`);
  }
}) satisfies PageServerLoad;
