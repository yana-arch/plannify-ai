import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { NewProjectWizard } from './components/NewProjectWizard';
import { ProjectPlanView } from './components/ProjectPlanView';
import { TemplatesView } from './components/TemplatesView';
import { MyProjectsView } from './components/MyProjectsView';
import { DashboardView } from './components/DashboardView';
import { generateProjectPlan } from './services/geminiService';
import type { ProjectPlan, ProjectInputData, FeatureSpecification, Screen, TemplateData, SavedProject } from './types';
import { WandSparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [projectInput, setProjectInput] = useState<ProjectInputData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [wizardInitialData, setWizardInitialData] = useState<TemplateData | undefined>(undefined);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('plannifyai_projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        setSavedProjects(projects);
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
      setSavedProjects([]);
    }
  }, []);

  const saveProjectsToStorage = (projects: SavedProject[]) => {
    try {
      localStorage.setItem('plannifyai_projects', JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects to localStorage", error);
    }
  };

  const handleGeneratePlan = async (data: ProjectInputData) => {
    setIsGenerating(true);
    setError(null);
    setProjectInput(data);
    try {
      const plan = await generateProjectPlan(data);
      setProjectPlan(plan);

      const newProject: SavedProject = {
        id: Date.now().toString(),
        projectName: data.projectName,
        shortDescription: data.shortDescription,
        createdAt: new Date().toISOString(),
        inputData: data,
        projectPlan: plan,
      };
      const updatedProjects = [...savedProjects, newProject];
      setSavedProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);

      setScreen('plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeatureUpdate = (featureIndex: number, updatedFeature: FeatureSpecification) => {
    if (!projectPlan || !projectInput) return;

    const newFeatures = [...projectPlan.detailedFeatures];
    newFeatures[featureIndex] = updatedFeature;
    const newPlan = { ...projectPlan, detailedFeatures: newFeatures };
    setProjectPlan(newPlan);

    // Update the saved project as well
    const projectToUpdate = savedProjects.find(p => p.inputData.projectName === projectInput.projectName);
    if (projectToUpdate) {
        const updatedProject = { ...projectToUpdate, projectPlan: newPlan };
        const updatedProjects = savedProjects.map(p => p.id === updatedProject.id ? updatedProject : p);
        setSavedProjects(updatedProjects);
        saveProjectsToStorage(updatedProjects);
    }
  };

  const handleScreenChange = (newScreen: Screen) => {
    if (newScreen === 'wizard') {
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
  
  const startNewProject = () => {
    setProjectPlan(null);
    setProjectInput(null);
    setError(null);
    setWizardInitialData(undefined);
    setScreen('wizard');
  };

  const handleViewProject = (project: SavedProject) => {
    setProjectInput(project.inputData);
    setProjectPlan(project.projectPlan);
    setScreen('plan');
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };
  
  const renderContent = () => {
    if (screen === 'dashboard') {
      return <DashboardView 
        projects={savedProjects}
        onViewProject={handleViewProject}
        onNewProject={startNewProject}
        onScreenChange={handleScreenChange}
      />;
    }

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
                 <button onClick={startNewProject} className="text-sm text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 mx-auto">
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

    if (screen === 'projects') {
      return <MyProjectsView
        projects={savedProjects}
        onViewProject={handleViewProject}
        onDeleteProject={handleDeleteProject}
        onNewProject={startNewProject}
      />;
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
