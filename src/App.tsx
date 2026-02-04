import React, { useState, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { useProjects } from './ProjectContext';
import { SettingsProvider } from './SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import type { Screen, TemplateData, ProjectInputData, SavedProject } from './types';
import { WandSparklesIcon } from './components/icons';

// Lazy load components for code splitting
const NewProjectWizard = lazy(() =>
  import('./components/NewProjectWizard').then((module) => ({ default: module.NewProjectWizard })),
);
const ProjectPlanView = lazy(() =>
  import('./components/ProjectPlanView').then((module) => ({ default: module.ProjectPlanView })),
);
const TemplatesView = lazy(() =>
  import('./components/TemplatesView').then((module) => ({ default: module.TemplatesView })),
);
const MyProjectsView = lazy(() =>
  import('./components/MyProjectsView').then((module) => ({ default: module.MyProjectsView })),
);
const DashboardView = lazy(() =>
  import('./components/DashboardView').then((module) => ({ default: module.DashboardView })),
);
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((module) => ({ default: module.SettingsView })),
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [wizardInitialData, setWizardInitialData] = useState<TemplateData | undefined>(undefined);

  const {
    currentProject,
    createNewProject,
    loadProject,
    isLoading: isGenerating,
    error,
    clearCurrentProject,
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
    switch (screen) {
      case 'dashboard':
        return (
          <DashboardView
            onViewProject={handleViewProject}
            onNewProject={startNewProject}
            onScreenChange={setScreen}
          />
        );

      case 'plan':
        if (currentProject) {
          return (
            <div className="w-full max-w-7xl">
              <ProjectPlanView project={currentProject} />
              <div className="text-center mt-4">
                <button
                  onClick={startNewProject}
                  className="text-sm text-brand-text-secondary hover:text-brand-primary transition-colors flex items-center gap-2 mx-auto"
                >
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

      case 'settings':
        return <SettingsView />;

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
    <ErrorBoundary>
      <div className="min-h-screen flex font-sans bg-brand-bg bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <Sidebar activeScreen={screen} onScreenChange={handleScreenChange} />
        <div className="flex-grow p-8 flex flex-col items-center justify-center">
          <Suspense
            fallback={<LoadingSpinner size="lg" message="Loading component..." className="p-8" />}
          >
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
