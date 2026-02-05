import React, { useState } from 'react';
import { Modal } from '../ui';
import { InfoIcon, AlertTriangleIcon } from '../icons';
import type { ProjectInputData } from '../../types';

export const PreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useBatched: boolean) => void;
  data: ProjectInputData;
}> = ({ isOpen, onClose, onConfirm, data }) => {
  const [useBatchedGeneration, setUseBatchedGeneration] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(useBatchedGeneration);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Preview Plan Generation"
      confirmText="Generate Plan"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-700">AI Plan Generation Preview</h4>
            <p className="text-sm text-blue-600 mt-1">
              The following AI generation process will be performed:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium text-brand-text-primary">📋 Requirements Analysis</h5>
            <p className="text-sm text-brand-text-secondary">
              AI will analyze {data.coreRequirements.length} core requirements
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-brand-text-primary">🛠️ Architecture Design</h5>
            <p className="text-sm text-brand-text-secondary">
              System architecture diagram based on your modules
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-brand-text-primary">📊 Development Timeline</h5>
            <p className="text-sm text-brand-text-secondary">
              {data.timeline} with {data.numberOfFeatures} features
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-brand-text-primary">🎯 Feature Specification</h5>
            <p className="text-sm text-brand-text-secondary">
              Detailed breakdown of all {data.numberOfFeatures} features
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h6 className="font-semibold text-yellow-700 mb-1">Important Notes:</h6>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>
                  • Generation typically takes{' '}
                  {useBatchedGeneration ? '20-40 seconds with progress updates' : '10-30 seconds'}
                </li>
                <li>• AI will generate comprehensive Mermaid diagrams for visualization</li>
                <li>• All generated content can be edited and refined afterwards</li>
                <li>• Previous plan versions are automatically saved</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/20">
          <p className="text-sm text-green-600">
            ✨ <strong>Ready to proceed!</strong> Your project data looks comprehensive for
            high-quality AI plan generation.
          </p>
        </div>
        {/* Batch Mode Selection - AT TOP */}
        <div className="p-4 bg-brand-surface-muted/50 rounded-lg border border-brand-border">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useBatchedGeneration}
              onChange={(e) => setUseBatchedGeneration(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-brand-border bg-brand-surface text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
            />
            <div className="flex-1">
              <div className="font-medium text-brand-text-primary">
                ⚡ Use Batched AI Generation (Recommended)
              </div>
              <p className="text-sm text-brand-text-secondary mt-1">
                Splits the generation into 6 optimized batches with real-time progress tracking.
                Faster, more efficient, and provides better results.
              </p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
};
