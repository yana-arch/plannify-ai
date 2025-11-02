import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { AppSettings, APIProvider, APIProviderType } from './types';

interface SettingsContextType {
  settings: AppSettings;
  activeProvider: APIProvider | null;
  isLoading: boolean;
  error: string | null;
  addProvider: (provider: Omit<APIProvider, 'id' | 'createdAt' | 'isActive'>) => void;
  updateProvider: (id: string, updates: Partial<APIProvider>) => void;
  deleteProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
  testProviderConnection: (provider: APIProvider) => Promise<boolean>;
  clearError: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default Gemini provider for backward compatibility
const createDefaultGeminiProvider = (): APIProvider => ({
  id: 'default-gemini',
  name: 'Default Gemini',
  type: 'gemini',
  baseUrl: 'https://generativelanguage.googleapis.com',
  apiKey: process.env.API_KEY || '',
  model: 'gemini-2.5-flash',
  isActive: true,
  createdAt: new Date().toISOString(),
});

const getDefaultSettings = (): AppSettings => ({
  activeProviderId: 'default-gemini',
  providers: [createDefaultGeminiProvider()],
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('plannifyai_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Ensure default provider exists for backward compatibility
        const hasDefaultProvider = parsedSettings.providers?.some((p: APIProvider) => p.id === 'default-gemini');
        if (!hasDefaultProvider) {
          parsedSettings.providers = [createDefaultGeminiProvider(), ...(parsedSettings.providers || [])];
        }
        setSettings(parsedSettings);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      setError("Could not load settings from local storage.");
    }
  }, []);

  // Save settings to localStorage whenever settings change
  const saveSettingsToStorage = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem('plannifyai_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
      setError("Could not save settings. Your changes might not persist.");
    }
  }, []);

  const addProvider = useCallback((providerData: Omit<APIProvider, 'id' | 'createdAt' | 'isActive'>) => {
    const newProvider: APIProvider = {
      ...providerData,
      id: Date.now().toString(),
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    const newSettings = {
      ...settings,
      providers: [...settings.providers, newProvider],
    };

    saveSettingsToStorage(newSettings);
  }, [settings, saveSettingsToStorage]);

  const updateProvider = useCallback((id: string, updates: Partial<APIProvider>) => {
    const newSettings = {
      ...settings,
      providers: settings.providers.map(provider =>
        provider.id === id ? { ...provider, ...updates } : provider
      ),
    };

    saveSettingsToStorage(newSettings);
  }, [settings, saveSettingsToStorage]);

  const deleteProvider = useCallback((id: string) => {
    // Don't allow deleting the default provider
    if (id === 'default-gemini') {
      setError("Cannot delete the default Gemini provider.");
      return;
    }

    const newProviders = settings.providers.filter(provider => provider.id !== id);
    let newActiveProviderId = settings.activeProviderId;

    // If we're deleting the active provider, switch to default
    if (settings.activeProviderId === id) {
      newActiveProviderId = 'default-gemini';
    }

    const newSettings = {
      activeProviderId: newActiveProviderId,
      providers: newProviders,
    };

    saveSettingsToStorage(newSettings);
  }, [settings, saveSettingsToStorage]);

  const setActiveProvider = useCallback((id: string) => {
    const provider = settings.providers.find(p => p.id === id);
    if (!provider) {
      setError("Provider not found.");
      return;
    }

    // Update all providers to set only the selected one as active
    const newSettings = {
      ...settings,
      activeProviderId: id,
      providers: settings.providers.map(p => ({
        ...p,
        isActive: p.id === id,
        lastUsed: p.id === id ? new Date().toISOString() : p.lastUsed,
      })),
    };

    saveSettingsToStorage(newSettings);
  }, [settings, saveSettingsToStorage]);

  const testProviderConnection = useCallback(async (provider: APIProvider): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simple test request - just check if we can reach the API
      const testUrl = provider.type === 'ollama'
        ? `${provider.baseUrl}/api/tags`
        : `${provider.baseUrl}/v1/models`;

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': provider.apiKey ? `Bearer ${provider.apiKey}` : undefined,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      return response.ok;
    } catch (err) {
      console.error('Provider connection test failed:', err);
      setError(`Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const activeProvider = settings.providers.find(p => p.id === settings.activeProviderId) || null;

  const value: SettingsContextType = {
    settings,
    activeProvider,
    isLoading,
    error,
    addProvider,
    updateProvider,
    deleteProvider,
    setActiveProvider,
    testProviderConnection,
    clearError,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
