import React, { useState } from 'react';
import { projectTemplates } from '../templates';
import type { TemplateData } from '../types';
import { Card, Button, Tag } from './ui';
import { WandSparklesIcon, DownloadIcon, UploadIcon } from './icons';

interface TemplateCardProps {
  template: TemplateData;
  onSelect: () => void;
  onExport: (template: TemplateData) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onExport, onImport }) => {
  const allTech = [
    ...(template.techStack?.frontend ?? []),
    ...(template.techStack?.backend ?? []),
    ...(template.techStack?.database ?? []),
  ];

  const handleExportTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(template);
  };

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-brand-primary-hover mb-2">{template.projectName}</h3>
      <p className="text-sm text-brand-text-secondary flex-grow mb-4">{template.shortDescription}</p>
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">Key Technologies</h4>
        <div className="flex flex-wrap gap-2">
          {allTech.slice(0, 4).map(tech => (
            <Tag key={tech}>{tech}</Tag>
          ))}
          {allTech.length > 4 && <Tag>+{allTech.length - 4} more</Tag>}
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <Button onClick={onSelect} className="flex-1">
          <WandSparklesIcon className="h-4 w-4 mr-2" />
          Use Template
        </Button>
        <Button variant="secondary" onClick={handleExportTemplate} className="!px-3">
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

interface TemplatesViewProps {
  onSelectTemplate: (template: TemplateData) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  const [customTemplates, setCustomTemplates] = useState<TemplateData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allTemplates = [...projectTemplates, ...customTemplates];

  const handleExportTemplates = () => {
    try {
      const jsonData = JSON.stringify(projectTemplates, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project-templates.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export templates');
    }
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTemplates: TemplateData[] = JSON.parse(content);

        // Basic validation
        if (!Array.isArray(importedTemplates)) {
          throw new Error('Invalid format: root must be an array');
        }

        importedTemplates.forEach((template, index) => {
          if (!template.projectName || typeof template.projectName !== 'string') {
            throw new Error(`Invalid template at index ${index}: missing or invalid projectName`);
          }
        });

        setCustomTemplates(importedTemplates);
        setError(null);
      } catch (err) {
        setError(`Failed to import templates: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleExportTemplate = (template: TemplateData) => {
    try {
      const jsonData = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.projectName.replace(/\s+/g, '_')}_template.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export template');
    }
  };

  const handleImportSingleTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTemplate: TemplateData = JSON.parse(content);

        // Basic validation for single template
        if (!importedTemplate.projectName || typeof importedTemplate.projectName !== 'string') {
          throw new Error('Invalid template format: missing or invalid projectName');
        }

        // Check if template with same name already exists
        const existingNames = allTemplates.map(t => t.projectName);
        if (existingNames.includes(importedTemplate.projectName)) {
          throw new Error(`Template with name "${importedTemplate.projectName}" already exists`);
        }

        setCustomTemplates(prev => [...prev, importedTemplate]);
        setError(null);
      } catch (err) {
        setError(`Failed to import template: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-brand-text-primary">Project Templates</h2>
        <p className="text-brand-text-secondary mt-2 max-w-2xl mx-auto">
          Kickstart your planning process with a predefined template. Select a foundation that best fits your project, then customize it before generating your AI-powered plan.
        </p>
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-700">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Template Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Export/import templates individually or in bulk</p>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button onClick={handleExportTemplates} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white font-medium">
              <DownloadIcon className="h-4 w-4" />
              Export All
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplates}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="import-templates"
              />
              <Button as="label" htmlFor="import-templates" className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 px-4 py-2 text-white font-medium">
                <UploadIcon className="h-4 w-4" />
                Import Multiple
              </Button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportSingleTemplate}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="import-single-template"
              />
              <Button as="label" htmlFor="import-single-template" className="flex items-center gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white font-medium">
                <UploadIcon className="h-4 w-4" />
                Import Single
              </Button>
            </div>
          </div>
        </div>
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTemplates.map((template, index) => (
          <TemplateCard
            key={index}
            template={template}
            onSelect={() => onSelectTemplate(template)}
            onExport={handleExportTemplate}
          />
        ))}
      </main>
    </div>
  );
};
