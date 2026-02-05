import React from 'react';
import type { ProjectInputData } from '../../../types';
import { TagInput } from '../../TagInput';

export const Step3TechStack: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const updateStack = (category: keyof ProjectInputData['techStack'], value: string[]) => {
    update('techStack', { ...data.techStack, [category]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Frontend</label>
        <TagInput
          values={data.techStack.frontend}
          onValuesChange={(v) => updateStack('frontend', v)}
          placeholder="e.g., React, Vue.js"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Backend</label>
        <TagInput
          values={data.techStack.backend}
          onValuesChange={(v) => updateStack('backend', v)}
          placeholder="e.g., Node.js, Django"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Database</label>
        <TagInput
          values={data.techStack.database}
          onValuesChange={(v) => updateStack('database', v)}
          placeholder="e.g., PostgreSQL, MongoDB"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">
          Other Tools / Libraries
        </label>
        <TagInput
          values={data.techStack.otherTools}
          onValuesChange={(v) => updateStack('otherTools', v)}
          placeholder="e.g., Docker, Jest"
        />
      </div>
    </div>
  );
};
