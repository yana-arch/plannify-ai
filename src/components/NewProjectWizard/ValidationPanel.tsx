import React from 'react';
import { Card } from '../ui';
import { InfoIcon, AlertTriangleIcon } from '../icons';
import type { ValidationResult } from '../../utils/validation';

export const ValidationPanel: React.FC<{
  result: ValidationResult;
  show: boolean;
  onDismiss: () => void;
}> = ({ result, show, onDismiss }) => {
  if (!show || (result.errors.length === 0 && result.warnings.length === 0)) return null;

  return (
    <Card className="mt-4 border-l-4 border-l-red-500 bg-red-500/10">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {result.errors.length > 0 ? (
            <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <InfoIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
        </div>
        <div className="flex-grow">
          <h4
            className={`font-semibold ${result.errors.length > 0 ? 'text-red-700' : 'text-yellow-700'}`}
          >
            {result.errors.length > 0
              ? 'Please fix the following issues:'
              : 'Consider these suggestions:'}
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            {result.errors.map((error, i) => (
              <li key={`error-${i}`} className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span className="text-red-700">{error.message}</span>
              </li>
            ))}
            {result.warnings.map((warning, i) => (
              <li key={`warning-${i}`} className="flex items-start gap-2">
                <span className="text-yellow-500 font-bold">•</span>
                <span className="text-yellow-700">{warning.message}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onDismiss}
            className="mt-3 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Card>
  );
};
