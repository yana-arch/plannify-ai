import React, { useState, useEffect } from 'react';
import type { SavedProject, Screen } from '../types';
import { Card, Button } from './ui';
import { WandSparklesIcon, FolderKanbanIcon, CopyIcon, LightbulbIcon } from './icons';
import { useProjects } from '../ProjectContext';

interface DashboardViewProps {
  onViewProject: (project: SavedProject) => void;
  onNewProject: () => void;
  onScreenChange: (screen: Screen) => void;
}

const ProjectCard: React.FC<{ project: SavedProject; onView: () => void }> = ({
  project,
  onView,
}) => (
  <Card className="flex flex-col h-full">
    <h3 className="text-md font-semibold text-brand-primary-hover mb-2">{project.projectName}</h3>
    <p className="text-sm text-brand-text-secondary flex-grow mb-4 line-clamp-2">
      {project.shortDescription}
    </p>
    <p className="text-xs text-brand-text-secondary mb-4">
      Created: {new Date(project.createdAt).toLocaleDateString()}
    </p>
    <Button variant="secondary" onClick={onView} className="mt-auto w-full">
      View Plan
    </Button>
  </Card>
);

const insights = [
  "For projects with many features, try asking the AI to 'Evolve' the plan and suggest a phased rollout in the milestones.",
  "Use the 'Enhance' feature on a specific requirement to generate detailed user stories or technical acceptance criteria.",
  "The 'Reports' feature can generate a 'Technical Spec' to provide your engineering team with a detailed starting point.",
  "Don't forget to check the 'History' tab. You can revert to any previous version of your plan if an 'Evolve' action doesn't fit your vision.",
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewProject,
  onNewProject,
  onScreenChange,
}) => {
  const { projects } = useProjects();
  const [insight, setInsight] = useState('');

  useEffect(() => {
    setInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, []);

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-brand-text-primary">Welcome to PlannifyAI</h1>
        <p className="text-brand-text-secondary mt-2 max-w-2xl">
          Your intelligent partner for transforming ideas into comprehensive project blueprints.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main CTA */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-center items-center text-center p-12 bg-gradient-to-br from-brand-primary/10 via-brand-surface to-brand-surface">
            <WandSparklesIcon className="h-12 w-12 text-brand-primary-hover mb-4" />
            <h2 className="text-2xl font-bold text-brand-text-primary">Start a New Project</h2>
            <p className="text-brand-text-secondary mt-2 mb-6 max-w-md">
              Let's begin by providing the AI with your project's core details through our guided
              wizard.
            </p>
            <Button onClick={onNewProject} className="px-8 py-3 text-lg">
              Create Project Plan
            </Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-6">
          <Card className="flex items-center gap-4 hover:border-brand-primary/50 transition-colors">
            <div className="p-3 bg-brand-border rounded-lg">
              <CopyIcon className="h-6 w-6 text-brand-primary-hover" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-text-primary">Explore Templates</h3>
              <button
                onClick={() => onScreenChange('templates')}
                className="text-sm text-brand-primary hover:underline"
              >
                Kickstart your work
              </button>
            </div>
          </Card>
          <Card className="flex items-center gap-4 hover:border-brand-primary/50 transition-colors">
            <div className="p-3 bg-brand-border rounded-lg">
              <FolderKanbanIcon className="h-6 w-6 text-brand-primary-hover" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-text-primary">My Projects</h3>
              <button
                onClick={() => onScreenChange('projects')}
                className="text-sm text-brand-primary hover:underline"
              >
                View all your plans
              </button>
            </div>
          </Card>
          {/* AI Insights Widget */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-border rounded-lg flex-shrink-0">
                <LightbulbIcon className="h-6 w-6 text-brand-primary-hover" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-text-primary">AI Insight</h3>
                <p className="text-sm text-brand-text-secondary mt-1">{insight}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {recentProjects.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-brand-text-primary mb-6">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => onViewProject(project)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
