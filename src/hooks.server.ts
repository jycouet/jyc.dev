import { Log } from "@kitql/helpers";
import { error, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export type proxyDefinition = { from: string; to: string };
export type handleProxiesOptions = { proxies: proxyDefinition[] };

export const handleProxies: (options: handleProxiesOptions) => Handle = (
  options
) => {
  return async ({ event, resolve }) => {
    const proxies_found = options.proxies.filter((c) =>
      event.url.pathname.startsWith(c.from)
    );

    // We should not find more than 1
    if (proxies_found.length > 1) {
      error(
        403,
        JSON.stringify({
          error: "Multiple proxies found",
          proxies_found,
          url: event.url.pathname,
        })
      );
    }
    // We find one, perfect, let's use it
    else if (proxies_found.length === 1) {
      const proxy = proxies_found[0];

      const origin = event.request.headers.get("Origin");

      // reject requests that don't come from the webapp, to avoid your proxy being abused.
      if (!origin || new URL(origin).origin !== event.url.origin) {
        error(403, "Request Forbidden.");
      }

      // strip "from" from the request path
      const strippedPath = event.url.pathname.substring(proxy.from.length);

      // build the new URL
      const urlPath = `${proxy.to}${strippedPath}${event.url.search}`;
      const proxiedUrl = new URL(urlPath);
      console.log(`proxiedUrl`, proxiedUrl.toString());

      const requestHeaders = new Headers(event.request.headers);
      requestHeaders.set("host", event.url.hostname);

      try {
        const d = event.fetch(proxiedUrl.toString(), {
          body: event.request.body,
          method: event.request.method,
          headers: requestHeaders,
          // @ts-ignore
          duplex: "half",
        });

        return d;
      } catch (error) {
        const log = new Log("handleProxies");
        console.error(error);
        log.error("handleProxies ERROR");
        throw error;
      }
    }

    // Fallback to normal request
    return resolve(event);
  };
};

export const handle = sequence(
  handleProxies({
    proxies: [
      { from: "/posthog/static", to: "https://eu-assets.i.posthog.com/static" },
      { from: "/posthog", to: "https://eu.i.posthog.com" },
    ],
  })
);
