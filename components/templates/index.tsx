import React from 'react';
import { projectTemplates } from '../../data/templates';
import type { TemplateData } from '../../types';
import { Card, Button, Tag } from '../ui';
import { WandSparklesIcon } from '../icons';

interface TemplateCardProps {
  template: TemplateData;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const allTech = [
    ...(template.techStack?.frontend ?? []),
    ...(template.techStack?.backend ?? []),
    ...(template.techStack?.database ?? []),
  ];

  return (
    <Card className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-brand-primary-hover mb-2">{template.projectName}</h3>
      <p className="text-sm text-brand-text-secondary flex-grow mb-4">{template.shortDescription}</p>
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">Key Technologies</h4>
        <div className="flex flex-wrap gap-2">
          {allTech.slice(0, 4).map(tech => (
            <Tag key={tech}>{tech}</Tag>
          ))}
          {allTech.length > 4 && <Tag>+{allTech.length - 4} more</Tag>}
        </div>
      </div>
      <Button onClick={onSelect} className="mt-auto w-full">
        <WandSparklesIcon className="h-4 w-4 mr-2" />
        Use this Template
      </Button>
    </Card>
  );
};

interface TemplatesViewProps {
  onSelectTemplate: (template: TemplateData) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-brand-text-primary">Project Templates</h2>
        <p className="text-brand-text-secondary mt-2 max-w-2xl mx-auto">
          Kickstart your planning process with a predefined template. Select a foundation that best fits your project, then customize it before generating your AI-powered plan.
        </p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectTemplates.map((template, index) => (
          <TemplateCard
            key={index}
            template={template}
            onSelect={() => onSelectTemplate(template)}
          />
        ))}
      </main>
    </div>
  );
};