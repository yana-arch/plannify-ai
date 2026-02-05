import React from 'react';
import type { SavedProject } from '../types';
import { Card, Button } from './ui';
import { Trash2Icon, WandSparklesIcon } from './icons';
import { useProjects } from '../ProjectContext';

interface MyProjectsViewProps {
  onViewProject: (project: SavedProject) => void;
  onNewProject: () => void;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({ onViewProject, onNewProject }) => {
  const { projects, deleteProject } = useProjects();
  return (
    <div className="w-full h-full p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-brand-text-primary">My Projects</h2>
          <p className="text-brand-text-secondary mt-2">
            Review, manage, and continue working on your saved project plans.
          </p>
        </div>
        <Button onClick={onNewProject}>
          <WandSparklesIcon className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </header>
      <main>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {projects
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((project) => (
                <Card key={project.id} className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-brand-primary-hover mb-2">
                    {project.projectName}
                  </h3>
                  <p className="text-sm text-brand-text-secondary flex-grow mb-4 line-clamp-3">
                    {project.shortDescription}
                  </p>
                  <p className="text-xs text-brand-text-secondary mb-6">
                    Created on: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-brand-border">
                    <Button
                      variant="primary"
                      onClick={() => onViewProject(project)}
                      className="w-full mr-2"
                    >
                      View Plan
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => deleteProject(project.id)}
                      className="!p-2 group hover:border-red-500/50"
                    >
                      <Trash2Icon className="h-4 w-4 text-brand-text-secondary group-hover:text-red-400 transition-colors" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-lg">
            <h3 className="text-xl font-semibold text-brand-text-primary">No Projects Found</h3>
            <p className="text-brand-text-secondary mt-2 mb-6">
              You haven't generated any project plans yet.
            </p>
            <Button onClick={onNewProject}>
              <WandSparklesIcon className="h-4 w-4 mr-2" />
              Start Your First Project
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
