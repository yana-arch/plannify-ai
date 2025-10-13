import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { NewProjectWizard } from './components/wizard';
import { ProjectPlanView } from './components/plan';
import { TemplatesView } from './components/templates';
import { MyProjectsView } from './components/projects';
import { DashboardView } from './components/dashboard';
import { useProjects } from './contexts/ProjectContext';
import type { Screen, TemplateData, ProjectInputData, SavedProject } from './types';
import { WandSparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [wizardInitialData, setWizardInitialData] = useState<TemplateData | undefined>(undefined);

  const {
    currentProject,
    createNewProject,
    loadProject,
    isLoading: isGenerating,
    error,
    clearCurrentProject
  } = useProjects();

  const handleGeneratePlan = async (data: ProjectInputData) => {
    const newProjectId = await createNewProject(data);
    if (newProjectId) {
      setScreen('plan');
    }
  };
  
  const handleScreenChange = (newScreen: Screen) => {
    if (newScreen === 'wizard') {
      setWizardInitialData(undefined);
      clearCurrentProject();
    }
    setScreen(newScreen);
  };
  
  const handleSelectTemplate = (template: TemplateData) => {
    setWizardInitialData(template);
    setScreen('wizard');
  };

  const startNewProject = () => {
    clearCurrentProject();
    setWizardInitialData(undefined);
    setScreen('wizard');
  };

  const handleViewProject = (project: SavedProject) => {
    loadProject(project.id);
    setScreen('plan');
  };

  const renderContent = () => {
    switch(screen) {
      case 'dashboard':
        return <DashboardView onViewProject={handleViewProject} onNewProject={startNewProject} onScreenChange={setScreen} />;

      case 'plan':
        if (currentProject) {
          return (
            <div className="w-full max-w-7xl">
              <ProjectPlanView project={currentProject} />
               <div className="text-center mt-4">
                 <button onClick={startNewProject} className="text-sm text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 mx-auto">
                   <WandSparklesIcon className="h-4 w-4" />
                   Start a New Project Plan
                 </button>
               </div>
            </div>
          );
        }
        // If no current project, fallback to wizard to avoid errors
        startNewProject();
        return null;

      case 'templates':
        return <TemplatesView onSelectTemplate={handleSelectTemplate} />;

      case 'projects':
        return <MyProjectsView onViewProject={handleViewProject} onNewProject={startNewProject} />;

      case 'wizard':
      default:
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
    }
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