
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { NewProjectWizard } from './components/NewProjectWizard';
import { ProjectPlanView } from './components/ProjectPlanView';
import { generateProjectPlan } from './services/geminiService';
import type { ProjectPlan, ProjectInputData } from './types';
import { WandSparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [projectInput, setProjectInput] = useState<ProjectInputData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async (data: ProjectInputData) => {
    setIsGenerating(true);
    setError(null);
    setProjectInput(data);
    try {
      const plan = await generateProjectPlan(data);
      setProjectPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetProject = () => {
    setProjectPlan(null);
    setProjectInput(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex font-sans bg-brand-bg bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <Sidebar />
      <div className="flex-grow p-8 flex flex-col items-center justify-center">
        {!projectPlan ? (
          <>
            <NewProjectWizard onGenerate={handleGeneratePlan} isGenerating={isGenerating} />
            {error && <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md">{error}</div>}
          </>
        ) : projectInput ? (
          <>
            <div className="w-full max-w-7xl">
              <ProjectPlanView plan={projectPlan} projectName={projectInput.projectName} />
               <div className="text-center mt-4">
                 <button onClick={resetProject} className="text-sm text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 mx-auto">
                   <WandSparklesIcon className="h-4 w-4" />
                   Start a New Project Plan
                 </button>
               </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default App;
