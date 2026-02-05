import { createBrowserRouter, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import { useProjects } from './ProjectContext';
import type { ProjectInputData, TemplateData } from './types';

// Lazy load all route components
const DashboardView = lazy(() =>
  import('./components/DashboardView').then((module) => ({ default: module.DashboardView })),
);
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
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((module) => ({ default: module.SettingsView })),
);

// Layout wrapper with Sidebar
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex font-sans bg-brand-bg bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
        <Sidebar />
        <div className="flex-grow p-8 flex flex-col items-center justify-center">
          <Suspense
            fallback={<LoadingSpinner size="lg" message="Loading component..." className="p-8" />}
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Route wrapper components that bridge props to router hooks

const DashboardRoute = () => {
  const navigate = useNavigate();
  const { loadProject } = useProjects();

  return (
    <DashboardView
      onViewProject={(project) => {
        loadProject(project.id);
        navigate(`/projects/${project.id}`);
      }}
      onNewProject={() => navigate('/wizard')}
      onScreenChange={(screen) => navigate(`/${screen}`)}
    />
  );
};

const WizardRoute = () => {
  const navigate = useNavigate();
  const { templateId: _templateId } = useParams();
  const { createNewProject, isLoading, error, clearCurrentProject } = useProjects();

  // Clear current project when entering wizard
  useEffect(() => {
    clearCurrentProject();
  }, [clearCurrentProject]);

  const handleGenerate = async (data: ProjectInputData) => {
    const newProjectId = await createNewProject(data);
    if (newProjectId) {
      navigate(`/projects/${newProjectId}`);
    }
  };

  // TODO: Load template data by _templateId if present
  const initialData: TemplateData | undefined = undefined;

  return (
    <>
      <NewProjectWizard
        onGenerate={handleGenerate}
        isGenerating={isLoading}
        initialData={initialData}
      />
      {error && <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md">{error}</div>}
    </>
  );
};

const ProjectRoute = () => {
  const { projectId } = useParams();
  const { loadProject, currentProject } = useProjects();

  // Load project when projectId changes
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (!currentProject) {
    return <LoadingSpinner size="lg" message="Loading project..." className="p-8" />;
  }

  return <ProjectPlanView project={currentProject} />;
};

const TemplatesRoute = () => {
  const navigate = useNavigate();

  return (
    <TemplatesView
      onSelectTemplate={(_template) => {
        // Navigate to wizard with template - for now just go to /wizard
        // TODO: Store template in context or pass via location state
        navigate('/wizard');
      }}
    />
  );
};

const ProjectsRoute = () => {
  const navigate = useNavigate();
  const { loadProject } = useProjects();

  return (
    <MyProjectsView
      onViewProject={(project) => {
        loadProject(project.id);
        navigate(`/projects/${project.id}`);
      }}
      onNewProject={() => navigate('/wizard')}
    />
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardRoute />,
      },
      {
        path: 'wizard',
        element: <WizardRoute />,
      },
      {
        path: 'wizard/:templateId',
        element: <WizardRoute />,
      },
      {
        path: 'projects',
        element: <ProjectsRoute />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectRoute />,
      },
      {
        path: 'templates',
        element: <TemplatesRoute />,
      },
      {
        path: 'settings',
        element: <SettingsView />,
      },
      {
        path: '*',
        element: (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-brand-text-primary mb-4">
              404 - Page Not Found
            </h2>
            <p className="text-brand-text-secondary mb-6">
              The page you're looking for doesn't exist.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        ),
      },
    ],
  },
]);
