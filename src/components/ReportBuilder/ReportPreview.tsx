import React from 'react';
import { ProjectPlan } from '../../types';
import { ReportSection } from '../../types/report';
import ReactMarkdown from 'react-markdown';

interface ReportPreviewProps {
  title: string;
  sections: ReportSection[];
  projectPlan?: ProjectPlan;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ title, sections, projectPlan }) => {
  return (
    <div className="bg-white text-black text-[10px] shadow-lg min-h-[800px] p-8 origin-top transform scale-90 select-none cursor-default border border-gray-200">
      {/* Title Page Preview */}
      <div className="text-center py-20 border-b-2 border-gray-100 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-500 uppercase tracking-widest text-xs">Project Plan Report</p>
        <p className="text-gray-400 mt-2">{new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 max-w-[90%] mx-auto">
        {sections
          .filter((s) => s.isEnabled)
          .map((section) => (
            <div key={section.id} className="relative group">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-100 flex items-center justify-between">
                {section.title}
                {section.type === 'dynamic' && !section.content && (
                  <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase font-medium">
                    Auto
                  </span>
                )}
                {section.content && (
                  <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-medium">
                    Custom
                  </span>
                )}
              </h2>

              {section.type === 'static' && (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 italic rounded">
                  [Standard {section.title} Layout]
                </div>
              )}

              {section.content ? (
                <div className="prose prose-sm max-w-none text-gray-600">
                  <ReactMarkdown>
                    {section.content.slice(0, 300) + (section.content.length > 300 ? '...' : '')}
                  </ReactMarkdown>
                </div>
              ) : section.type === 'dynamic' && projectPlan ? (
                // Live Preview for Dynamic Data
                <div className="text-xs text-gray-700 space-y-2">
                  {section.dataSource === 'summary' && <p>{projectPlan.summary}</p>}

                  {section.dataSource === 'recommendedTechStack' && (
                    <div className="grid grid-cols-2 gap-2 text-[9px] border border-gray-100 p-2 rounded">
                      <div className="font-semibold">Frontend</div>
                      <div>{projectPlan.recommendedTechStack.frontend.join(', ')}</div>
                      <div className="font-semibold">Backend</div>
                      <div>{projectPlan.recommendedTechStack.backend.join(', ')}</div>
                      <div className="font-semibold">Database</div>
                      <div>{projectPlan.recommendedTechStack.database.join(', ')}</div>
                    </div>
                  )}

                  {section.dataSource === 'detailedFeatures' && (
                    <ul className="list-disc pl-4 space-y-1">
                      {projectPlan.detailedFeatures.slice(0, 3).map((f) => (
                        <li key={f.name}>
                          <span className="font-semibold">{f.name}</span>: {f.description}
                        </li>
                      ))}
                      {projectPlan.detailedFeatures.length > 3 && (
                        <li className="italic text-gray-400">
                          + {projectPlan.detailedFeatures.length - 3} more...
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Fallback for others */}
                  {!['summary', 'recommendedTechStack', 'detailedFeatures'].includes(
                    section.dataSource || '',
                  ) && (
                    <div className="italic text-gray-400">
                      [Dynamic content from {section.dataSource} will appear here]
                    </div>
                  )}
                </div>
              ) : (
                // Skeleton UI if no project plan or generic dynamic
                <div className="space-y-2 opacity-50">
                  <div className="h-2 bg-gray-100 rounded w-full"></div>
                  <div className="h-2 bg-gray-100 rounded w-11/12"></div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
