import { writable } from 'svelte/store'

export type Notification = {
  id: string
  bskyProfile: {
    displayName: string
    handle: string
    avatar: string
    did: string
  }
  emoji: string
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([])
  const nextId = 0

  return {
    subscribe,
    add: (n: Notification) => {
      const id = n.id
      update((notifications) => [...notifications, n])
      setTimeout(() => {
        update((notifications) => notifications.filter((n) => n.id !== id))
      }, 5555)
    },
  }
}

export const notifications = createNotificationStore()
