import { remultSveltekit } from 'remult/remult-sveltekit'

import { AtController } from '$lib/modules/at/AtController'

export const api = remultSveltekit({ controllers: [AtController] })
