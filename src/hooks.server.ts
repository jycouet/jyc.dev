import { error, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

import { handleProxies } from '@kitql/handles'

export const handleLang: Handle = ({ event, resolve }) => {
  const locales = parseAcceptLanguage(event.request.headers.get('accept-language') || '')
  event.locals.locale = locales.length ? locales[0] : 'en-US'

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
  })
}

export const handle = sequence(
  handleLang,
  handleProxies([
    ['/posthog/static', { to: 'https://eu-assets.i.posthog.com/static' }],
    ['/posthog', { to: 'https://eu.i.posthog.com' }],
  ]),
)
