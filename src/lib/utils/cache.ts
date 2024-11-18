interface CacheEntry<T> {
  timestamp: number
  isLoading: boolean
  data: T | null
}

interface CachedResult<T> extends CacheEntry<T> {
  isCached: boolean
}

export class Cache<T> {
  private cache: CacheEntry<T> = {
    timestamp: 0,
    isLoading: false,
    data: null,
  }
  private cacheDuration: number

  constructor(cacheDuration: number) {
    this.cacheDuration = cacheDuration
  }

  async getOrFetch(fetchFn: () => Promise<T>): Promise<CachedResult<T>> {
    const now = Date.now()

    // If data is fresh, return it immediately
    if (this.cache.data && now - this.cache.timestamp < this.cacheDuration) {
      return {
        ...this.cache,
        isCached: true,
      }
    }

    // If already fetching new data, return cached data with loading state
    if (this.cache.isLoading) {
      return {
        ...this.cache,
        isLoading: true,
        isCached: true,
      }
    }

    try {
      // Set loading state
      this.cache.isLoading = true

      // Fetch new data
      const result = await fetchFn()

      // Update cache
      this.cache.data = result
      this.cache.timestamp = now
      this.cache.isLoading = false

      return {
        ...this.cache,
        isLoading: false,
        isCached: false,
      }
    } catch (error) {
      // Reset loading state on error
      this.cache.isLoading = false
      throw error
    }
  }
}
