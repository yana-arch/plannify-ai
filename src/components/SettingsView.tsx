import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import type { APIProvider, APIProviderType } from '../types';
import { Card, Button } from './ui';
import { PlusCircleIcon, CheckCircleIcon, XIcon, Trash2Icon } from './icons';

// Simple icons for missing ones
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m16.24-3.76a3 3 0 0 0-4.24 0l-1.42 1.42a3 3 0 0 1-4.24 0L7.76 4.24a3 3 0 0 0 0 4.24l1.42 1.42a3 3 0 0 1 0 4.24l-1.42 1.42a3 3 0 0 0 0 4.24l2.83 2.83a3 3 0 0 0 4.24 0l1.42-1.42a3 3 0 0 1 4.24 0l1.42 1.42a3 3 0 0 0 4.24 0l2.83-2.83a3 3 0 0 0 0-4.24l-1.42-1.42a3 3 0 0 1 0-4.24l1.42-1.42a3 3 0 0 0 0-4.24L19.07 2.93a3 3 0 0 0-4.24 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

interface ProviderFormData {
  name: string;
  type: APIProviderType;
  baseUrl: string;
  apiKey: string;
  model: string;
}

const PROVIDER_CONFIGS = {
  gemini: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    docsUrl: 'https://ai.google.dev/docs',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-405b-instruct'],
    docsUrl: 'https://openrouter.ai/docs',
  },
  ollama: {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434',
    models: ['llama3.2', 'llama3.1', 'mistral', 'codellama'],
    docsUrl: 'https://github.com/ollama/ollama',
  },
  anthropic: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-sonnet-20240229'],
    docsUrl: 'https://docs.anthropic.com/claude/docs',
  },
  custom: {
    name: 'Custom Provider',
    baseUrl: '',
    models: [],
    docsUrl: '',
  },
};

const ProviderForm: React.FC<{
  provider?: APIProvider;
  onSave: (data: ProviderFormData) => void;
  onCancel: () => void;
}> = ({ provider, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProviderFormData>({
    name: provider?.name || '',
    type: provider?.type || 'openrouter',
    baseUrl: provider?.baseUrl || PROVIDER_CONFIGS.openrouter.baseUrl,
    apiKey: provider?.apiKey || '',
    model: provider?.model || PROVIDER_CONFIGS.openrouter.models[0],
  });

  const handleTypeChange = (type: APIProviderType) => {
    const config = PROVIDER_CONFIGS[type];
    setFormData({
      ...formData,
      type,
      baseUrl: config.baseUrl,
      model: config.models[0] || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const config = PROVIDER_CONFIGS[formData.type];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-brand-text-primary mb-4">
        {provider ? 'Edit Provider' : 'Add New Provider'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text-primary mb-1">
            Provider Name <span className="text-xs text-brand-text-secondary">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-surface text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="My Custom Provider"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-primary mb-1">
            Provider Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as APIProviderType)}
            className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-surface text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-primary mb-1">Base URL</label>
          <input
            type="url"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-surface text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="https://api.example.com"
            required
          />
          {config.docsUrl && (
            <a
              href={config.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 mt-1"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              View documentation
            </a>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-primary mb-1">
            API Key{' '}
            {formData.type === 'ollama' && (
              <span className="text-xs text-brand-text-secondary">
                (not required for local Ollama)
              </span>
            )}
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-surface text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder={formData.type === 'ollama' ? 'Leave empty for local Ollama' : 'sk-...'}
            required={formData.type !== 'ollama'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text-primary mb-1">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-surface text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="gpt-4o, claude-3.5-sonnet, llama3.2, gemini-2.5-flash, etc."
            required
          />
          {config.models.length > 0 && (
            <p className="text-xs text-brand-text-secondary mt-1">
              Popular models: {config.models.join(', ')}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">{provider ? 'Update Provider' : 'Add Provider'}</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

const ProviderCard: React.FC<{
  provider: APIProvider;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: () => void;
  onTestConnection: () => void;
}> = ({ provider, isActive, onEdit, onDelete, onSetActive, onTestConnection }) => {
  const { isLoading, testProviderConnection } = useSettings();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testProviderConnection(provider);
      setTestResult(result);
    } catch (error) {
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  const config = PROVIDER_CONFIGS[provider.type];

  return (
    <Card className={`p-4 ${isActive ? 'ring-2 ring-brand-primary' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-brand-text-primary">{provider.name}</h4>
            {isActive && (
              <span className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-brand-text-secondary">{config.name}</p>
          <p className="text-xs text-brand-text-secondary mt-1">Model: {provider.model}</p>
          <p className="text-xs text-brand-text-secondary">
            Added: {new Date(provider.createdAt).toLocaleDateString()}
          </p>
          {provider.lastUsed && (
            <p className="text-xs text-brand-text-secondary">
              Last used: {new Date(provider.lastUsed).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="p-1 text-brand-text-secondary hover:text-brand-primary disabled:opacity-50"
            title="Test connection"
          >
            {isTesting ? (
              <CogIcon className="h-4 w-4 animate-spin" />
            ) : testResult === true ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : testResult === false ? (
              <XIcon className="h-4 w-4 text-red-500" />
            ) : (
              <CogIcon className="h-4 w-4" />
            )}
          </button>

          {!isActive && (
            <button
              onClick={onSetActive}
              className="p-1 text-brand-text-secondary hover:text-brand-primary"
              title="Set as active"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-1 text-brand-text-secondary hover:text-brand-primary"
            title="Edit provider"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-1 text-brand-text-secondary hover:text-red-500"
            title="Delete provider"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export const SettingsView: React.FC = () => {
  const {
    settings,
    activeProvider,
    addProvider,
    updateProvider,
    deleteProvider,
    setActiveProvider,
    error,
    clearError,
  } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<APIProvider | undefined>();

  const handleAddProvider = (data: ProviderFormData) => {
    addProvider(data);
    setShowForm(false);
    clearError();
  };

  const handleUpdateProvider = (data: ProviderFormData) => {
    if (editingProvider) {
      updateProvider(editingProvider.id, data);
      setEditingProvider(undefined);
      clearError();
    }
  };

  const handleEditProvider = (provider: APIProvider) => {
    setEditingProvider(provider);
    clearError();
  };

  const handleDeleteProvider = (provider: APIProvider) => {
    if (window.confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      deleteProvider(provider.id);
    }
  };

  const handleSetActive = (provider: APIProvider) => {
    setActiveProvider(provider.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-brand-text-primary">Settings</h2>
        <p className="text-brand-text-secondary mt-2">
          Configure external API providers for AI-powered project planning
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={clearError} className="mt-2 text-xs text-red-300 hover:text-red-200">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-brand-text-primary">API Providers</h3>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <PlusCircleIcon className="h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {activeProvider && (
          <div className="mb-4 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-brand-primary" />
              <div>
                <p className="font-medium text-brand-text-primary">Active Provider</p>
                <p className="text-sm text-brand-text-secondary">
                  {activeProvider.name} ({PROVIDER_CONFIGS[activeProvider.type].name})
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {settings.providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isActive={provider.id === settings.activeProviderId}
              onEdit={() => handleEditProvider(provider)}
              onDelete={() => handleDeleteProvider(provider)}
              onSetActive={() => handleSetActive(provider)}
              onTestConnection={() => {}} // Handled internally in ProviderCard
            />
          ))}
        </div>
      </div>

      {(showForm || editingProvider) && (
        <div className="mb-6">
          <ProviderForm
            provider={editingProvider}
            onSave={editingProvider ? handleUpdateProvider : handleAddProvider}
            onCancel={() => {
              setShowForm(false);
              setEditingProvider(undefined);
            }}
          />
        </div>
      )}

      <div className="mt-8 p-6 bg-brand-surface rounded-lg">
        <h4 className="font-semibold text-brand-text-primary mb-2">Supported Providers</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
              <span className="text-brand-text-secondary">{config.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
