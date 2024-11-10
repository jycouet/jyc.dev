import { writable } from 'svelte/store'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: number
  message: string
  link: string
  type: NotificationType
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([])
  let nextId = 0

  return {
    subscribe,
    add: (message: string, link: string = '', type: NotificationType = 'info') => {
      const id = nextId++
      update((notifications) => [...notifications, { id, message, link, type }])
      setTimeout(() => {
        update((notifications) => notifications.filter((n) => n.id !== id))
      }, 4444)
    },
  }
}

export const notifications = createNotificationStore()
