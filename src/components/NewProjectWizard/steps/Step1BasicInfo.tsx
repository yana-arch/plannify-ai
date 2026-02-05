import React from 'react';
import type { ProjectInputData } from '../../../types';
import type { ValidationResult } from '../../../utils/validation';
import { getFieldTooltip } from '../../../utils/validation';
import { InfoIcon } from '../../icons';
import { TagInput } from '../../TagInput';
import { ValidatedInput } from '../ValidatedInput';

export const Step1BasicInfo: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
  validation?: ValidationResult;
}> = ({ data, update, validation }) => {
  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Project Name"
        id="projectName"
        value={data.projectName}
        onChange={(e) => update('projectName', e.target.value)}
        required
        tooltip={getFieldTooltip('projectName')}
        validation={validation}
      />
      <ValidatedInput
        label="Short Description"
        id="shortDescription"
        value={data.shortDescription}
        onChange={(e) => update('shortDescription', e.target.value)}
        type="textarea"
        required
        minLength={20}
        tooltip={getFieldTooltip('shortDescription')}
      />
      <ValidatedInput
        label="Business Goals"
        id="businessGoals"
        value={data.businessGoals}
        onChange={(e) => update('businessGoals', e.target.value)}
        required
        minLength={30}
        tooltip={getFieldTooltip('businessGoals')}
      />
      <ValidatedInput
        label="Technical Goals"
        id="technicalGoals"
        value={data.technicalGoals}
        onChange={(e) => update('technicalGoals', e.target.value)}
        required
        minLength={30}
        tooltip={getFieldTooltip('technicalGoals')}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-brand-text-secondary">
            Target Users
          </label>
          <span className="text-red-500">*</span>
          <div className="group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {getFieldTooltip('targetUsers')}
            </div>
          </div>
        </div>
        <TagInput
          values={data.targetUsers}
          onValuesChange={(v) => update('targetUsers', v)}
          placeholder="Type and press Enter..."
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="numFeatures"
          className="block text-sm font-medium text-brand-text-secondary"
        >
          Approximate Number of Core Features: {data.numberOfFeatures}
          <div className="inline-block ml-2 group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help inline" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {getFieldTooltip('numberOfFeatures')}
            </div>
          </div>
        </label>
        <input
          type="range"
          id="numFeatures"
          min="3"
          max="20"
          value={data.numberOfFeatures}
          onChange={(e) => update('numberOfFeatures', parseInt(e.target.value))}
          className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ValidatedInput
          label="Estimated Budget"
          id="estimatedScale"
          value={data.estimatedScale}
          onChange={(e) => update('estimatedScale', e.target.value)}
          required
          placeholder="$10K-$50K"
          tooltip={getFieldTooltip('estimatedScale')}
        />
        <ValidatedInput
          label="Timeline"
          id="timeline"
          value={data.timeline}
          onChange={(e) => update('timeline', e.target.value)}
          required
          placeholder="3-6 months"
          tooltip={getFieldTooltip('timeline')}
        />
      </div>
    </div>
  );
};
