import React from 'react';
import type { ProjectInputData } from '../../../types';

export const Step8Review: React.FC<{ data: ProjectInputData }> = ({ data }) => {
  return (
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
      <h3 className="text-lg font-semibold text-brand-text-primary">Review Your Project Details</h3>
      <p className="text-sm text-brand-text-secondary">
        Please review the information below before generating the plan.
      </p>
      <div className="space-y-3 text-sm">
        <p>
          <strong>Project Name:</strong> {data.projectName}
        </p>
        <p>
          <strong>Description:</strong> {data.shortDescription}
        </p>
        <p>
          <strong>Business Goals:</strong> {data.businessGoals}
        </p>
        <p>
          <strong>Technical Goals:</strong> {data.technicalGoals}
        </p>
        <p>
          <strong>Target Users:</strong> {data.targetUsers.join(', ')}
        </p>
        <p>
          <strong>Number of Features:</strong> {data.numberOfFeatures}
        </p>
        <p>
          <strong>Estimated Budget:</strong> {data.estimatedScale}
        </p>
        <p>
          <strong>Timeline:</strong> {data.timeline}
        </p>
        <p>
          <strong>Core Requirements:</strong> {data.coreRequirements.length} item(s)
        </p>

        {data.coreModules && data.coreModules.length > 0 && (
          <div>
            <p>
              <strong>Core Modules:</strong> {data.coreModules.length} module(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.coreModules.map((module, i) => (
                <li key={i}>
                  {module.moduleName} ({module.flows.length} flows)
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.rolePermissions && data.rolePermissions.length > 0 && (
          <div>
            <p>
              <strong>Roles:</strong> {data.rolePermissions.length} role(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.rolePermissions.map((role, i) => (
                <li key={i}>
                  {role.role} ({role.permissions.length} permissions)
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.standardFlows && data.standardFlows.length > 0 && (
          <div>
            <p>
              <strong>Standard Flows:</strong> {data.standardFlows.length} flow(s)
            </p>
            <ul className="list-disc list-inside ml-4">
              {data.standardFlows.map((flow, i) => (
                <li key={i}>
                  {flow.flowName} ({flow.steps.length} steps)
                </li>
              ))}
            </ul>
          </div>
        )}

        <p>
          <strong>Tech Stack:</strong>
        </p>
        <div className="ml-4">
          <p>• Frontend: {data.techStack.frontend.join(', ') || 'N/A'}</p>
          <p>• Backend: {data.techStack.backend.join(', ') || 'N/A'}</p>
          <p>• Database: {data.techStack.database.join(', ') || 'N/A'}</p>
          <p>• Other Tools: {data.techStack.otherTools.join(', ') || 'N/A'}</p>
        </div>

        <p>
          <strong>Market Analysis:</strong> {data.marketAnalysis || 'N/A'}
        </p>
        <p>
          <strong>Competitors:</strong> {data.competitors.join(', ') || 'N/A'}
        </p>
      </div>
    </div>
  );
};
