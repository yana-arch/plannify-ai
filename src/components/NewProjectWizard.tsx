import React, { useState, useEffect, useCallback } from 'react';
import type { ProjectInputData, TemplateData } from '../types';
import { Button, Card } from './ui';
import { WandSparklesIcon } from './icons';
import { validateStepData, validateCompleteForm } from '../utils/validation';
import type { ValidationResult } from '../utils/validation';

import { ValidationPanel } from './NewProjectWizard/ValidationPanel';
import { StepIndicator } from './NewProjectWizard/StepIndicator';
import { PreviewModal } from './NewProjectWizard/PreviewModal';

import { Step1BasicInfo } from './NewProjectWizard/steps/Step1BasicInfo';
import { Step2CoreRequirements } from './NewProjectWizard/steps/Step2CoreRequirements';
import { Step3TechStack } from './NewProjectWizard/steps/Step3TechStack';
import { Step4CoreModules } from './NewProjectWizard/steps/Step4CoreModules';
import { Step5RolePermissions } from './NewProjectWizard/steps/Step5RolePermissions';
import { Step6StandardFlows } from './NewProjectWizard/steps/Step6StandardFlows';
import { Step7RiskAssessmentAndMetrics } from './NewProjectWizard/steps/Step7RiskAssessmentAndMetrics';
import { Step8Review } from './NewProjectWizard/steps/Step8Review';

const defaultFormData: ProjectInputData = {
  projectName: '',
  shortDescription: '',
  businessGoals: '',
  technicalGoals: '',
  targetUsers: [],
  numberOfFeatures: 10,
  estimatedScale: '',
  timeline: '',
  coreRequirements: [],
  userFeatureRequests: '',
  techStack: {
    frontend: [],
    backend: [],
    database: [],
    otherTools: [],
  },
  marketAnalysis: '',
  competitors: [],
  riskAssessment: [],
  featureDependencies: {},
  successMetrics: [],
  coreModules: [],
  rolePermissions: [],
  standardFlows: [],
};

const WIZARD_DRAFT_STORAGE_KEY = 'plannifyai_wizard_draft';

const STEPS = [
  {
    title: 'Basic Information',
    component: Step1BasicInfo,
    description: 'Provide the essential details about your project',
  },
  {
    title: 'Core Requirements',
    component: Step2CoreRequirements,
    description: 'List the high-level requirements and goals',
  },
  {
    title: 'Technology Stack',
    component: Step3TechStack,
    description: 'Select the technologies you plan to use',
  },
  {
    title: 'Core Modules',
    component: Step4CoreModules,
    description: 'Define the main modules/components of your system',
  },
  {
    title: 'Role & Permissions',
    component: Step5RolePermissions,
    description: 'Define user roles and their permissions',
  },
  {
    title: 'Standard Flows',
    component: Step6StandardFlows,
    description: 'Define key business processes and workflows',
  },
  {
    title: 'Risk Assessment & Metrics',
    component: Step7RiskAssessmentAndMetrics,
    description: 'Identify potential risks and success metrics',
  },
  {
    title: 'Review & Generate',
    component: Step8Review,
    description: 'Review your project details before generating the plan',
  },
];

export const NewProjectWizard: React.FC<{
  onGenerate: (
    data: ProjectInputData,
    options?: { useBatched?: boolean; onProgress?: (batch: string, progress: number) => void },
  ) => void;
  isGenerating: boolean;
  initialData?: TemplateData;
}> = ({ onGenerate, isGenerating, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize state lazily to avoid effect-based initialization for the first render
  const [formData, setFormData] = useState<ProjectInputData>(() => {
    if (initialData) {
      return { ...defaultFormData, ...initialData } as ProjectInputData;
    }
    try {
      const storedDraft = localStorage.getItem(WIZARD_DRAFT_STORAGE_KEY);
      if (storedDraft) {
        return { ...defaultFormData, ...JSON.parse(storedDraft) };
      }
    } catch (e) {
      console.error('Failed to load wizard draft from localStorage', e);
    }
    return defaultFormData;
  });

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Handle updates to initialData after mount (e.g. template selection changes)
  const serializedInitialData = initialData ? JSON.stringify(initialData) : null;
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      setCurrentStep(0);
      setValidationResult({ isValid: true, errors: [], warnings: [] });
      setShowValidationPanel(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedInitialData]);

  // Validate current step when it changes or when form data updates
  useEffect(() => {
    // Defer validation to next frame to avoid immediate state update loops if triggered by render
    const timer = setTimeout(() => {
      const result = validateStepData(currentStep, formData);
      setValidationResult(result);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentStep, formData]);

  // Auto-save draft to localStorage whenever the form data changes
  useEffect(() => {
    try {
      const draftPayload = JSON.stringify(formData);
      localStorage.setItem(WIZARD_DRAFT_STORAGE_KEY, draftPayload);
    } catch (e) {
      console.error('Failed to save wizard draft to localStorage', e);
    }
  }, [formData]);

  const updateFormData = useCallback((field: keyof ProjectInputData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = () => {
    if (validationResult.isValid || currentStep === STEPS.length - 1) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      setShowValidationPanel(true);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleGenerate = () => {
    const completeValidation = validateCompleteForm(formData);
    if (completeValidation.isValid) {
      setShowPreviewModal(true);
    } else {
      setValidationResult(completeValidation);
      setShowValidationPanel(true);
    }
  };

  const handleConfirmGenerate = (useBatched: boolean) => {
    setShowPreviewModal(false);
    setGenerationProgress('Starting generation...');
    onGenerate(formData, {
      useBatched,
      onProgress: (batch, _progress) => {
        setGenerationProgress(batch);
      },
    });
  };

  const handleResetForm = () => {
    // Only reset if confirmed, or just direct reset
    if (window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      setFormData(defaultFormData);
      setCurrentStep(0);
      setValidationResult({ isValid: true, errors: [], warnings: [] });
      setShowValidationPanel(false);
      try {
        localStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear wizard draft from localStorage', e);
      }
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <>
      <div className="w-full h-full flex flex-col p-6">
        <header className="flex-none mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-primary">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-brand-text-secondary text-sm">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleResetForm} className="text-sm">
                Reset
              </Button>
            </div>
          </div>
          <StepIndicator
            current={currentStep}
            total={STEPS.length}
            isValid={validationResult.isValid}
          />
        </header>

        <main className="flex-grow flex flex-col lg:flex-row gap-8 min-h-0">
          {/* Left Panel: Form Content */}
          <div className="flex-grow flex flex-col min-w-0">
            <Card className="flex-grow flex flex-col min-h-[500px] p-6">
              <CurrentStepComponent
                data={formData}
                update={updateFormData}
                validation={validationResult}
              />
            </Card>
          </div>

          {/* Right Panel: Context & Validation */}
          <div className="w-full lg:w-80 xl:w-96 flex-none flex flex-col gap-6">
            {/* Validation Panel - Always visible if there are issues, or just a place for it */}
            {showValidationPanel && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <ValidationPanel
                  result={validationResult}
                  show={true}
                  onDismiss={() => setShowValidationPanel(false)}
                />
              </div>
            )}

            {/* Guide / Context Placeholder */}
            {!showValidationPanel && (
              <Card className="flex-grow bg-brand-surface-muted/50 border-brand-border/50 p-6">
                <div className="flex items-center gap-2 mb-4 text-brand-primary">
                  <div className="p-1.5 bg-brand-primary/10 rounded-md">
                    <WandSparklesIcon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide">AI Assistant</h3>
                </div>
                <div className="space-y-4 text-sm text-brand-text-secondary">
                  <p>I'm here to help you define your project.</p>
                  <p>
                    <strong>Tip:</strong> Be as specific as possible in this step to get the most
                    accurate project plan.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </main>

        <footer className="flex-none mt-8 pt-6 border-t border-brand-border">
          {/* Progress indicator when generating */}
          {isGenerating && generationProgress && (
            <div className="mb-4 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-md">
              <p className="text-brand-primary text-sm font-medium">{generationProgress}</p>
            </div>
          )}


          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0 || isGenerating}
            >
              Back
            </Button>

            <div className="flex gap-4">
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={nextStep}>Continue</Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  <WandSparklesIcon className="h-4 w-4 mr-2" />
                  Generate Project Plan
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handleConfirmGenerate}
        data={formData}
      />
    </>
  );
};
