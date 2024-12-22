import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

import { handleProxies } from '@kitql/handles'

import { api as handleRemult } from './server/api'

export const handleRedirects: Handle = async ({ event, resolve }) => {
  // Check the current path
  const { pathname } = event.url

  // Define a permanent redirect condition
  if (pathname.startsWith('/at')) {
    throw redirect(308, pathname.replace('/at', '/stats')) // Permanent redirect
  }

  // Default behavior
  return resolve(event)
}

export const handleLang: Handle = ({ event, resolve }) => {
  const locales = parseAcceptLanguage(event.request.headers.get('accept-language') || '')
  event.locals.locale = locales.length ? locales[0] : 'en-US'

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', 'en'),
  })
}

export const handleCors: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)

  if (event.url.pathname.startsWith('/stats/plc')) {
    response.headers.append('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS')
  }

  return response
}

export const handle = sequence(
  handleRedirects,
  handleLang,
  handleProxies([
    ['/posthog/static', { to: 'https://eu-assets.i.posthog.com/static' }],
    ['/posthog', { to: 'https://eu.i.posthog.com' }],
  ]),
  handleCors,
  handleRemult,
)
