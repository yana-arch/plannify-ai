import React, { useState } from 'react';
import { ProjectPlan } from '../../types';
import { ReportSection, ReportConfig } from '../../types/report';
import { SectionEditor } from './SectionEditor';
import { ReportPreview } from './ReportPreview';
// dnd-kit imports removed as requested in review

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectPlan: ProjectPlan;
  projectName: string;
  onExport: (config: ReportConfig) => void;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'title', title: 'Title Page', isEnabled: true, type: 'static' },
  { id: 'toc', title: 'Table of Contents', isEnabled: true, type: 'static' },
  {
    id: 'summary',
    title: 'Executive Summary',
    isEnabled: true,
    type: 'text',
    dataSource: 'summary',
  },
  {
    id: 'components',
    title: 'Key Components',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'keyComponents',
  },
  {
    id: 'techStack',
    title: 'Technology Stack',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'recommendedTechStack',
  },
  {
    id: 'features',
    title: 'Feature Specifications',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'detailedFeatures',
  },
  {
    id: 'timeline',
    title: 'Development Timeline',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'developmentPlan',
  },
  {
    id: 'challenges',
    title: 'Challenges & Risks',
    isEnabled: true,
    type: 'dynamic',
    dataSource: 'potentialChallenges',
  },
];

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  projectPlan,
  projectName,
  onExport,
}) => {
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('summary');
  const [reportTitle, setReportTitle] = useState(projectName || 'Project Plan');

  const handleUpdateSection = (updatedSection: ReportSection) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Custom Export Builder
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your report structure and content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onExport({ title: reportTitle, sections, theme: 'modern' })}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Sections List */}
          <div className="w-1/4 min-w-[280px] border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900/30 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Report Structure
            </h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedSectionId(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSectionId(section.id);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selectedSectionId === section.id
                      ? 'bg-white dark:bg-gray-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={section.isEnabled}
                    tabIndex={-1} // Prevent double-tabbing, handle via parent click
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSections = sections.map((s) =>
                        s.id === section.id ? { ...s, isEnabled: e.target.checked } : s,
                      );
                      setSections(newSections);
                    }}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span
                    className={`text-sm font-medium ${section.isEnabled ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 decoration-slate-400'}`}
                  >
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel: Editor */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800 p-6">
            {selectedSection ? (
              <div className="max-w-3xl mx-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Editing: {selectedSection.title}
                </h3>
                <SectionEditor
                  key={selectedSectionId}
                  section={selectedSection}
                  onUpdate={handleUpdateSection}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-4">👈</span>
                <p>Select a section to edit content</p>
              </div>
            )}
          </div>

          {/* Right Panel: Preview (Collapsible?) */}
          <div className="w-1/3 min-w-[320px] bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto hidden xl:block">
            <ReportPreview title={reportTitle} sections={sections} projectPlan={projectPlan} />
          </div>
        </div>
      </div>
    </div>
  );
};
