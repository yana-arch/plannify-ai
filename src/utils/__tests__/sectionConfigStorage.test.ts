/**
 * @jest-environment jsdom
 */

import {
  saveSectionConfig,
  loadSectionConfig,
  loadAllConfigs,
  deleteSectionConfig,
  exportConfigsToJSON,
  importConfigsFromJSON,
  listConfigNames,
  getStorageUsage,
} from '../sectionConfigStorage';
import type { ReportSection } from '@/types/report';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('sectionConfigStorage', () => {
  const mockSections: ReportSection[] = [
    { id: 'sec1', title: 'Section 1', isEnabled: true, type: 'text' },
    { id: 'sec2', title: 'Section 2', isEnabled: false, type: 'dynamic', dataSource: 'test' },
  ];

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('saveSectionConfig', () => {
    it('should save configuration to localStorage', () => {
      const result = saveSectionConfig('test-config', mockSections);
      expect(result.success).toBe(true);

      const stored = localStorage.getItem('reportSectionConfigs');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed['test-config']).toBeDefined();
      expect(parsed['test-config'].sections).toEqual(mockSections);
    });

    it('should preserve createdAt when updating existing config', async () => {
      const firstSave = saveSectionConfig('test-config', mockSections);
      expect(firstSave.success).toBe(true);

      const firstStored = JSON.parse(localStorage.getItem('reportSectionConfigs')!);
      const createdAt = firstStored['test-config'].createdAt;

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const secondSave = saveSectionConfig('test-config', [mockSections[0]]);
      expect(secondSave.success).toBe(true);

      const secondStored = JSON.parse(localStorage.getItem('reportSectionConfigs')!);
      expect(secondStored['test-config'].createdAt).toBe(createdAt);
      expect(secondStored['test-config'].updatedAt).not.toBe(createdAt);
    });

    it('should handle QuotaExceededError gracefully', () => {
      // Mock setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = saveSectionConfig('test-config', mockSections);
      expect(result.success).toBe(false);
      expect(result.error).toContain('quota exceeded');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadSectionConfig', () => {
    it('should load existing configuration', () => {
      saveSectionConfig('test-config', mockSections);
      const result = loadSectionConfig('test-config');

      expect(result.success).toBe(true);
      expect(result.data?.sections).toEqual(mockSections);
    });

    it('should return error for non-existent configuration', () => {
      const result = loadSectionConfig('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('reportSectionConfigs', '{invalid json}');

      // loadAllConfigs handles corrupted JSON and resets storage
      const allConfigs = loadAllConfigs();
      expect(allConfigs.success).toBe(false);
      expect(allConfigs.error).toContain('Corrupted');

      // After corruption, specific config load will find empty storage
      const result = loadSectionConfig('test-config');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteSectionConfig', () => {
    it('should delete configuration', () => {
      saveSectionConfig('test-config', mockSections);
      const deleteResult = deleteSectionConfig('test-config');

      expect(deleteResult.success).toBe(true);
      const loadResult = loadSectionConfig('test-config');
      expect(loadResult.success).toBe(false);
    });

    it('should not affect other configurations', () => {
      saveSectionConfig('config1', mockSections);
      saveSectionConfig('config2', [mockSections[0]]);

      deleteSectionConfig('config1');

      const result = loadSectionConfig('config2');
      expect(result.success).toBe(true);
    });
  });

  describe('exportConfigsToJSON', () => {
    it('should export all configurations as JSON', () => {
      saveSectionConfig('config1', mockSections);
      saveSectionConfig('config2', [mockSections[0]]);

      const jsonString = exportConfigsToJSON();
      const parsed = JSON.parse(jsonString);

      expect(parsed.config1).toBeDefined();
      expect(parsed.config2).toBeDefined();
    });

    it('should return empty object when no configs exist', () => {
      const jsonString = exportConfigsToJSON();
      expect(jsonString).toBe('{}');
    });
  });

  describe('importConfigsFromJSON', () => {
    it('should import configurations from valid JSON', () => {
      const exportData = {
        'imported-config': {
          name: 'imported-config',
          sections: mockSections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const result = importConfigsFromJSON(JSON.stringify(exportData));
      expect(result.success).toBe(true);
      expect(result.data).toBe(1);

      const loaded = loadSectionConfig('imported-config');
      expect(loaded.success).toBe(true);
    });

    it('should merge with existing configurations', () => {
      saveSectionConfig('existing', mockSections);

      const importData = {
        'new-config': {
          name: 'new-config',
          sections: [mockSections[0]],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      importConfigsFromJSON(JSON.stringify(importData));

      expect(loadSectionConfig('existing').success).toBe(true);
      expect(loadSectionConfig('new-config').success).toBe(true);
    });

    it('should reject invalid JSON', () => {
      const result = importConfigsFromJSON('{invalid json}');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should reject non-object data', () => {
      const result = importConfigsFromJSON('"string"');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid configuration format');
    });
  });

  describe('listConfigNames', () => {
    it('should list configurations sorted by update time', () => {
      saveSectionConfig('config1', mockSections);
      // Ensure different timestamps
      setTimeout(() => {
        saveSectionConfig('config2', [mockSections[0]]);
        const names = listConfigNames();
        expect(names).toEqual(['config2', 'config1']); // Most recent first
      }, 10);
    });

    it('should return empty array when no configs exist', () => {
      const names = listConfigNames();
      expect(names).toEqual([]);
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage size in bytes', () => {
      const usage1 = getStorageUsage();
      expect(usage1).toBe(0);

      saveSectionConfig('test', mockSections);
      const usage2 = getStorageUsage();
      expect(usage2).toBeGreaterThan(0);
    });
  });
});
