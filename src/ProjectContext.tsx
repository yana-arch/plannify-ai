import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import type {
  SavedProject,
  ProjectInputData,
  ProjectPlan,
  PlanHistoryEntry,
  FeatureSpecification,
  Milestone,
  ProjectsContextType,
} from './types';
import { generateProjectPlan } from './services/aiService';
import { useSettings } from './SettingsContext';

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { activeProvider } = useSettings();

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('plannifyai_projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage', e);
      setError('Could not load projects from local storage.');
    }
  }, []);

  const saveProjectsToStorage = (updatedProjects: SavedProject[]) => {
    try {
      localStorage.setItem('plannifyai_projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
      setError('Could not save projects. Your changes might not persist.');
    }
  };

  const createNewProject = useCallback(
    async (data: ProjectInputData): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        if (!activeProvider) {
          throw new Error('No active AI provider configured. Please check your settings.');
        }
        const plan = await generateProjectPlan(data, activeProvider);
        const newProject: SavedProject = {
          id: Date.now().toString(),
          projectName: data.projectName,
          shortDescription: data.shortDescription,
          createdAt: new Date().toISOString(),
          inputData: data,
          projectPlan: plan,
          history: [],
        };
        const updatedProjects = [...projects, newProject];
        saveProjectsToStorage(updatedProjects);
        setCurrentProjectId(newProject.id);
        return newProject.id;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred during plan generation.',
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [projects, activeProvider],
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<SavedProject>) => {
      const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
      saveProjectsToStorage(updatedProjects);
    },
    [projects],
  );

  const addHistoryAndSaveChanges = (projectId: string, newPlan: ProjectPlan) => {
    const projectToUpdate = projects.find((p) => p.id === projectId);
    if (!projectToUpdate) return;

    const newHistoryEntry: PlanHistoryEntry = {
      plan: projectToUpdate.projectPlan,
      savedAt: new Date().toISOString(),
    };

    updateProject(projectId, {
      projectPlan: newPlan,
      history: [...(projectToUpdate.history || []), newHistoryEntry],
    });
  };

  const updateCurrentProjectPlan = (newPlan: ProjectPlan) => {
    if (!currentProjectId) return;
    addHistoryAndSaveChanges(currentProjectId, newPlan);
  };

  const updateCurrentProjectFeatures = (
    featureIndex: number,
    updatedFeature: FeatureSpecification,
  ) => {
    const currentProject = projects.find((p) => p.id === currentProjectId);
    if (!currentProject) return;

    const newFeatures = [...currentProject.projectPlan.detailedFeatures];
    newFeatures[featureIndex] = updatedFeature;
    const newPlan = { ...currentProject.projectPlan, detailedFeatures: newFeatures };
    addHistoryAndSaveChanges(currentProjectId, newPlan);
  };

  const updateCurrentProjectDevPlan = (newMilestones: Milestone[]) => {
    const currentProject = projects.find((p) => p.id === currentProjectId);
    if (!currentProject) return;

    const newPlan: ProjectPlan = {
      ...currentProject.projectPlan,
      developmentPlan: { milestones: newMilestones },
    };
    addHistoryAndSaveChanges(currentProjectId, newPlan);
  };

  const restoreProjectVersion = (historyEntry: PlanHistoryEntry) => {
    const currentProject = projects.find((p) => p.id === currentProjectId);
    if (!currentProject) return;

    const currentPlanHistoryEntry: PlanHistoryEntry = {
      plan: currentProject.projectPlan,
      savedAt: new Date().toISOString(),
    };

    const newHistory = [
      ...(currentProject.history || []).filter((h) => h.savedAt !== historyEntry.savedAt),
      currentPlanHistoryEntry,
    ];

    updateProject(currentProjectId, {
      projectPlan: historyEntry.plan,
      history: newHistory,
    });
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    saveProjectsToStorage(updatedProjects);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  const loadProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  const clearCurrentProject = () => {
    setCurrentProjectId(null);
  };

  const importProject = (project: SavedProject) => {
    // Validate project structure (basic check)
    if (!project.id || !project.projectName || !project.projectPlan) {
      setError('Invalid project file format.');
      return;
    }

    // Check if project already exists to avoid duplicates (optional, or overwrite)
    // For now, let's treat it as a new import or update if ID matches
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    let updatedProjects: SavedProject[];

    if (existingIndex >= 0) {
      updatedProjects = [...projects];
      updatedProjects[existingIndex] = project;
    } else {
      updatedProjects = [...projects, project];
    }

    saveProjectsToStorage(updatedProjects);
    setCurrentProjectId(project.id);
  };

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === currentProjectId) || null;
  }, [currentProjectId, projects]);

  const value = {
    projects,
    currentProject,
    isLoading,
    error,
    createNewProject,
    loadProject,
    deleteProject,
    updateCurrentProjectPlan,
    updateCurrentProjectFeatures,
    updateCurrentProjectDevPlan,
    restoreProjectVersion,
    clearCurrentProject,
    importProject,
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};
