import React, { useState } from 'react';
import type { ProjectInputData, CoreRequirement, Priority } from '../../../types';
import { Button, Input, Textarea, Card, Modal } from '../../ui';
import { PlusCircleIcon, XIcon, WandSparklesIcon } from '../../icons';
import { generateCoreRequirements } from '../../../services/aiService';
import { useSettings } from '../../../SettingsContext';

export const Step2CoreRequirements: React.FC<{
  data: ProjectInputData;
  update: (field: keyof ProjectInputData, value: unknown) => void;
}> = ({ data, update }) => {
  const [newReq, setNewReq] = useState('');
  const [newReqPriority, setNewReqPriority] = useState<Priority>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { activeProvider } = useSettings();
  const handleConfirmGeneration = async () => {
    if (!activeProvider) {
      setGenerationError('No active AI provider configured.');
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const projectInfo: Partial<ProjectInputData> = {
        projectName: data.projectName,
        shortDescription: data.shortDescription,
        businessGoals: data.businessGoals,
        targetUsers: data.targetUsers,
        numberOfFeatures: data.numberOfFeatures,
        userFeatureRequests: data.userFeatureRequests,
      };
      const generatedReqs = await generateCoreRequirements(projectInfo, activeProvider);
      const newCoreRequirements: CoreRequirement[] = generatedReqs.map((req) => ({
        id: `${Date.now()}-${Math.random()}`,
        description: req.description,
        priority: req.priority,
      }));
      update('coreRequirements', newCoreRequirements);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  const addRequirement = () => {
    if (!newReq.trim()) return;
    const req: CoreRequirement = {
      id: Date.now().toString(),
      description: newReq.trim(),
      priority: newReqPriority,
    };
    update('coreRequirements', [...data.coreRequirements, req]);
    setNewReq('');
  };

  const removeRequirement = (id: string) => {
    update(
      'coreRequirements',
      data.coreRequirements.filter((r) => r.id !== id),
    );
  };

  return (
    <div className="space-y-4">
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmGeneration}
        title="Confirm AI Generation"
        confirmText="Generate"
        isConfirming={isGenerating}
      >
        The AI will analyze your project details and suggest a list of core requirements. This will
        replace any requirements you have already added. Do you want to continue?
      </Modal>

      <Card className="bg-brand-bg/50">
        <div>
          <h4 className="font-semibold text-brand-text-primary">Generate Requirements with AI</h4>
          <p className="text-sm text-brand-text-secondary mt-1">
            Let AI suggest core requirements based on your project details. You can also provide
            your own ideas below to guide the generation.
          </p>
        </div>

        <div className="mt-4">
          <Textarea
            label="Your feature ideas (optional, one per line)"
            id="userFeatureRequests"
            placeholder={
              'e.g., A real-time chat feature for users\nA dark mode option in the settings'
            }
            value={data.userFeatureRequests || ''}
            onChange={(e) => update('userFeatureRequests', e.target.value)}
            rows={3}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          {generationError ? (
            <p className="text-sm text-red-400 flex-grow pr-4">{generationError}</p>
          ) : (
            <div /> /* Spacer */
          )}
          <Button
            onClick={() => setShowConfirmModal(true)}
            isLoading={isGenerating}
            className="flex-shrink-0"
          >
            <WandSparklesIcon className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
        </div>
      </Card>

      {data.coreRequirements.map((req, index) => (
        <div
          key={req.id}
          className="flex items-center gap-2 p-2 bg-brand-bg rounded-md border border-brand-border"
        >
          <span className="text-sm text-brand-text-secondary">{index + 1}.</span>
          <input
            type="text"
            value={req.description}
            readOnly
            className="flex-grow bg-transparent text-brand-text-primary text-sm"
          />
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              req.priority === 'High'
                ? 'bg-red-500/20 text-red-400'
                : req.priority === 'Medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {req.priority}
          </span>
          <button onClick={() => removeRequirement(req.id)}>
            <XIcon className="h-4 w-4 text-brand-text-secondary hover:text-red-500" />
          </button>
        </div>
      ))}
      <p className="text-center text-xs text-brand-text-secondary pt-2">
        or add a requirement manually:
      </p>
      <div className="flex items-center gap-2">
        <Input
          label=""
          id="newReq"
          placeholder="Add new requirement..."
          value={newReq}
          onChange={(e) => setNewReq(e.target.value)}
          className="flex-grow"
        />
        <select
          value={newReqPriority}
          onChange={(e) => setNewReqPriority(e.target.value as Priority)}
          className="bg-brand-bg border border-brand-border rounded-md px-3 py-2 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <Button variant="secondary" onClick={addRequirement} className="!p-2">
          <PlusCircleIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
