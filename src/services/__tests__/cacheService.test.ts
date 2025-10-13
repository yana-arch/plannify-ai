import { cacheService } from '../cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('should set and get a value', () => {
    const testData = { message: 'test' };
    cacheService.set('test-key', testData);

    const result = cacheService.get('test-key');
    expect(result).toEqual(testData);
  });

  it('should return null for non-existent key', () => {
    const result = cacheService.get('non-existent');
    expect(result).toBeNull();
  });

  it('should check if key exists', () => {
    expect(cacheService.has('test-key')).toBe(false);

    cacheService.set('test-key', 'test-value');
    expect(cacheService.has('test-key')).toBe(true);
  });

  it('should delete a key', () => {
    cacheService.set('test-key', 'test-value');
    expect(cacheService.has('test-key')).toBe(true);

    const deleted = cacheService.delete('test-key');
    expect(deleted).toBe(true);
    expect(cacheService.has('test-key')).toBe(false);
  });

  it('should clear all cache', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    expect(cacheService.size()).toBe(2);

    cacheService.clear();
    expect(cacheService.size()).toBe(0);
  });

  it('should generate project plan cache key', () => {
    const data = { projectName: 'Test Project' };
    const key = cacheService.generateProjectPlanKey(data);
    expect(key).toMatch(/^project_plan_/);
    expect(key.length).toBeLessThanOrEqual(32 + 13); // hash length + prefix
  });

  it('should generate requirements cache key', () => {
    const data = { projectName: 'Test Project' };
    const key = cacheService.generateRequirementsKey(data);
    expect(key).toMatch(/^requirements_/);
    expect(key.length).toBeLessThanOrEqual(32 + 13); // hash length + prefix
  });

  it('should handle TTL expiration', () => {
    jest.useFakeTimers();

    // Set with very short TTL
    cacheService.set('test-key', 'test-value', 100);

    // Should exist immediately
    expect(cacheService.has('test-key')).toBe(true);

    // Advance time past TTL
    jest.advanceTimersByTime(101);

    // Should be expired and cleaned up
    expect(cacheService.has('test-key')).toBe(false);

    jest.useRealTimers();
  });

  it('should clean expired entries when checking size', () => {
    jest.useFakeTimers();

    cacheService.set('key1', 'value1', 100);
    cacheService.set('key2', 'value2', 1000); // Longer TTL

    expect(cacheService.size()).toBe(2);

    // Advance time to expire first key
    jest.advanceTimersByTime(101);

    // Size should clean up expired entries
    expect(cacheService.size()).toBe(1);

    jest.useRealTimers();
  });
});
