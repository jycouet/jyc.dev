import { writable } from 'svelte/store'

import { repo } from 'remult'
import type { ClassType, EntityFilter, QueryOptions } from 'remult'

import type { PaginatorOf } from './remultHelper'

export function paginatorStore<T>(
  ent: ClassType<T>,
  initialOptions: Omit<QueryOptions<T>, 'where'> & { aggregate?: any } = {},
) {
  const r = repo(ent)
  const query = (o: QueryOptions<T>) => r.query(o)
  let paginator: PaginatorOf<typeof query>

  const { subscribe, set, update } = writable<{
    items: T[]
    // TODO
    aggregates?: {
      $count?: number
    }
    hasNextPage: boolean
    loading: {
      init: boolean
      nextPage: boolean
      filter: boolean
    }
  }>({
    items: [] as T[],
    aggregates: {
      $count: undefined,
    },
    hasNextPage: false,
    loading: {
      init: true,
      filter: false,
      nextPage: false,
    },
  })

  const load = async (where: EntityFilter<T>) => {
    update((s) => ({
      ...s,
      loading: { ...s.loading, filter: true },
    }))

    paginator = await query({ ...initialOptions, where }).paginator()

    update((s) => ({
      ...s,
      loading: { ...s.loading, init: false, filter: false },
      items: paginator.items,
      // @ts-ignore
      aggregates: paginator.aggregates,
      hasNextPage: paginator.hasNextPage,
    }))
  }

  const loadMore = async () => {
    update((s) => ({
      ...s,
      loading: { ...s.loading, nextPage: true },
    }))

    paginator = await paginator.nextPage()

    update((s) => ({
      ...s,
      loading: { ...s.loading, nextPage: false },
      items: [...s.items, ...paginator.items],
      hasNextPage: paginator.hasNextPage,
    }))
  }

  return {
    subscribe,
    // set,
    // update,

    load,
    loadMore,
  }
}
