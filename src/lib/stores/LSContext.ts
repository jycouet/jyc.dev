import { writable } from 'svelte/store'

const browser = typeof window !== 'undefined'

export type TLSContext = {
  linkToSkyzooSquad: boolean
  linkToSkyzooStats: boolean
}

const LSContextKey = 'Skyzoo_2024_12_03'

const LSContextDefaults: TLSContext = {
  linkToSkyzooSquad: false,
  linkToSkyzooStats: false,
}

const LSCurrentContext = browser
  ? JSON.parse(localStorage.getItem(LSContextKey)!) || LSContextDefaults
  : LSContextDefaults

/**
 * Local storage context store
 */
const store = () => {
  const { set, subscribe, update } = writable<TLSContext>(LSCurrentContext)

  return {
    set,
    subscribe,
    update,
    reset: () => {
      set(LSContextDefaults)
      window.location.reload()
    },
  }
}

export const LSContext = store()

LSContext.subscribe((value) => {
  if (browser) {
    if (!value) {
      localStorage.setItem(LSContextKey, JSON.stringify(LSContextDefaults))
    } else {
      localStorage.setItem(LSContextKey, JSON.stringify(value))
    }
  }
})
