/**
 * Section configuration storage utilities
 * Handles saving, loading, and managing section configurations in localStorage
 */

import { ReportSection } from '@/types/report';

const STORAGE_KEY = 'reportSectionConfigs';

export interface SectionConfig {
  name: string;
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Save a section configuration to localStorage
 * @param configName - Name of the configuration
 * @param sections - Sections to save
 * @returns Result indicating success or failure
 */
export function saveSectionConfig(
  configName: string,
  sections: ReportSection[],
): StorageResult<void> {
  try {
    const configs = loadAllConfigs().data || {};
    const timestamp = new Date().toISOString();

    configs[configName] = {
      name: configName,
      sections,
      createdAt: configs[configName]?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error:
          'Storage quota exceeded. Please delete some configurations or export them to free up space.',
      };
    }
    return {
      success: false,
      error: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Load a specific section configuration
 * @param configName - Name of the configuration to load
 * @returns Result containing the configuration or error
 */
export function loadSectionConfig(configName: string): StorageResult<SectionConfig> {
  try {
    const configs = loadAllConfigs().data || {};
    const config = configs[configName];

    if (!config) {
      return {
        success: false,
        error: `Configuration "${configName}" not found`,
      };
    }

    return { success: true, data: config };
  } catch (error) {
    return {
      success: false,
      error: `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Load all saved configurations
 * @returns Result containing all configurations or error
 */
export function loadAllConfigs(): StorageResult<Record<string, SectionConfig>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: true, data: {} };
    }

    const configs = JSON.parse(stored);
    return { success: true, data: configs };
  } catch (error) {
    // If JSON is corrupted, reset storage
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: false,
      error: 'Corrupted configuration data. Storage has been reset.',
    };
  }
}

/**
 * Delete a configuration
 * @param configName - Name of the configuration to delete
 * @returns Result indicating success or failure
 */
export function deleteSectionConfig(configName: string): StorageResult<void> {
  try {
    const configs = loadAllConfigs().data || {};
    delete configs[configName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Export configurations to JSON file
 * @returns JSON string of all configurations
 */
export function exportConfigsToJSON(): string {
  const configs = loadAllConfigs().data || {};
  return JSON.stringify(configs, null, 2);
}

/**
 * Import configurations from JSON string
 * @param jsonString - JSON string containing configurations
 * @returns Result indicating success or failure
 */
export function importConfigsFromJSON(jsonString: string): StorageResult<number> {
  try {
    const importedConfigs = JSON.parse(jsonString);

    if (typeof importedConfigs !== 'object' || importedConfigs === null) {
      return {
        success: false,
        error: 'Invalid configuration format',
      };
    }

    const existingConfigs = loadAllConfigs().data || {};
    const mergedConfigs = { ...existingConfigs, ...importedConfigs };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfigs));

    return {
      success: true,
      data: Object.keys(importedConfigs).length,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Invalid JSON format',
      };
    }
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: 'Storage quota exceeded. Please delete some existing configurations first.',
      };
    }
    return {
      success: false,
      error: `Failed to import configurations: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get storage usage information
 * @returns Approximate storage usage in bytes
 */
export function getStorageUsage(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? new Blob([stored]).size : 0;
}

/**
 * List all configuration names sorted by update time (most recent first)
 * @returns Array of configuration names
 */
export function listConfigNames(): string[] {
  const configs = loadAllConfigs().data || {};
  return Object.values(configs)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((config) => config.name);
}
