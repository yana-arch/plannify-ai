interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries before returning size
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }

  // Helper function to create safe cache key with Unicode support
  private createSafeCacheKey(data: any): string {
    try {
      // Normalize Unicode characters to ensure consistency
      const normalizedData = JSON.stringify(data, (key, value) => {
        if (typeof value === 'string') {
          return value.normalize('NFC');
        }
        return value;
      });
      return btoa(normalizedData).slice(0, 32);
    } catch (error) {
      // Fallback to simple hash if btoa fails
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).slice(0, 32);
    }
  }

  // Generate cache key for project plan requests
  generateProjectPlanKey(data: any): string {
    const hash = this.createSafeCacheKey(data);
    return `project_plan_${hash}`;
  }

  // Generate cache key for requirements generation
  generateRequirementsKey(data: any): string {
    const hash = this.createSafeCacheKey(data);
    return `requirements_${hash}`;
  }
}

export const cacheService = new CacheService();
