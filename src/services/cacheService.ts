interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size?: number; // For size-based eviction
  accessCount?: number; // For LRU eviction
}

interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of entries
  private stats = { hits: 0, misses: 0, evictions: 0 };

  private generateKey(data: any): string {
    try {
      // Create a more robust hash for project data
      const str = JSON.stringify(data, Object.keys(data).sort());
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).slice(0, 16);
    } catch (error) {
      // Fallback for circular references or other issues
      return `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
  }

  private evictOldEntries(): void {
    const now = Date.now();

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }

    // If still too large, remove oldest entries (LRU)
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => (b.accessCount || 0) - (a.accessCount || 0),
      );

      while (this.cache.size > this.MAX_CACHE_SIZE) {
        const [oldestKey] = entries.pop()!;
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.evictOldEntries();

    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    // Estimate data size (rough approximation)
    const sizeEstimate = JSON.stringify(data).length;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
      size: sizeEstimate,
      accessCount: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    // Update access count for LRU
    entry.accessCount = (entry.accessCount || 0) + 1;
    this.stats.hits++;
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
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).slice(0, 32);
    }
  }

  // Generate cache key for project plan requests
  generateProjectPlanKey(data: any, provider?: any): string {
    const dataWithProvider = provider ? { ...data, provider: provider.id } : data;
    const hash = this.createSafeCacheKey(dataWithProvider);
    return `project_plan_${hash}`;
  }

  // Generate cache key for requirements generation
  generateRequirementsKey(data: any): string {
    const hash = this.createSafeCacheKey(data);
    return `requirements_${hash}`;
  }
}

export const cacheService = new CacheService();
