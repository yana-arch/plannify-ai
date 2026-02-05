import React from 'react';
import { Input, Textarea } from '../ui';
import { InfoIcon, AlertTriangleIcon } from '../icons';
import type { ValidationResult } from '../../utils/validation';

export const ValidatedInput: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  tooltip?: string;
  validation?: ValidationResult;
  fieldName?: string;
}> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  tooltip,
  validation,
  fieldName = id,
}) => {
  const fieldErrors = validation?.errors.filter((e) => e.field === fieldName) || [];
  const fieldWarnings = validation?.warnings.filter((w) => w.field === fieldName) || [];
  const hasErrors = fieldErrors.length > 0;
  const hasWarnings = fieldWarnings.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && (
          <div className="group relative">
            <InfoIcon className="h-4 w-4 text-brand-text-secondary/60 hover:text-brand-text-secondary cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-brand-surface border border-brand-border rounded-md text-xs text-brand-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={hasErrors ? 'border-red-500 focus:ring-red-500' : ''}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={hasErrors ? 'border-red-500 focus:ring-red-500' : ''}
        />
      )}
      {hasErrors && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{fieldErrors[0].message}</span>
        </div>
      )}
      {hasWarnings && !hasErrors && (
        <div className="flex items-start gap-2 text-sm text-yellow-600">
          <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{fieldWarnings[0].message}</span>
        </div>
      )}
    </div>
  );
};
