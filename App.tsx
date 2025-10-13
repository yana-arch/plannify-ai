
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { NewProjectWizard } from './components/NewProjectWizard';
import { ProjectPlanView } from './components/ProjectPlanView';
import { TemplatesView } from './components/TemplatesView';
import { generateProjectPlan } from './services/geminiService';
import type { ProjectPlan, ProjectInputData, FeatureSpecification, Screen, TemplateData } from './types';
import { WandSparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [projectInput, setProjectInput] = useState<ProjectInputData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('wizard');
  const [wizardInitialData, setWizardInitialData] = useState<TemplateData | undefined>(undefined);

  const handleGeneratePlan = async (data: ProjectInputData) => {
    setIsGenerating(true);
    setError(null);
    setProjectInput(data);
    try {
      const plan = await generateProjectPlan(data);
      setProjectPlan(plan);
      setScreen('plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      // Stay on the wizard screen if there's an error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeatureUpdate = (featureIndex: number, updatedFeature: FeatureSpecification) => {
    if (!projectPlan) return;

    const newFeatures = [...projectPlan.detailedFeatures];
    newFeatures[featureIndex] = updatedFeature;

    const newPlan = { ...projectPlan, detailedFeatures: newFeatures };
    setProjectPlan(newPlan);
  };

  const handleScreenChange = (newScreen: Screen) => {
    if (newScreen === 'wizard') {
        // When explicitly clicking "New Project", clear any template data
        setWizardInitialData(undefined);
    }
    setScreen(newScreen);
  }

  const handleSelectTemplate = (template: TemplateData) => {
    setWizardInitialData(template);
    setScreen('wizard');
  };

  const resetProject = () => {
    setProjectPlan(null);
    setProjectInput(null);
    setError(null);
    setWizardInitialData(undefined);
    setScreen('wizard');
  };
  
  const renderContent = () => {
    if (screen === 'plan' && projectPlan && projectInput) {
      return (
         <>
            <div className="w-full max-w-7xl">
              <ProjectPlanView
                plan={projectPlan}
                projectName={projectInput.projectName}
                onFeatureUpdate={handleFeatureUpdate}
              />
               <div className="text-center mt-4">
                 <button onClick={resetProject} className="text-sm text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 mx-auto">
                   <WandSparklesIcon className="h-4 w-4" />
                   Start a New Project Plan
                 </button>
               </div>
            </div>
          </>
      );
    }
    
    if (screen === 'templates') {
        return <TemplatesView onSelectTemplate={handleSelectTemplate} />;
    }

    // Default to wizard screen
    return (
        <>
            <NewProjectWizard 
                onGenerate={handleGeneratePlan} 
                isGenerating={isGenerating} 
                initialData={wizardInitialData}
            />
            {error && <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md">{error}</div>}
        </>
    );
  };

  return (
    <div className="min-h-screen flex font-sans bg-brand-bg bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <Sidebar activeScreen={screen} onScreenChange={handleScreenChange} />
      <div className="flex-grow p-8 flex flex-col items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
