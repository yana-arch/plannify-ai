import React, { useState } from 'react';
import { SECTION_TEMPLATES, createSectionFromTemplate } from '@/constants/sectionTemplates';
import { ReportSection } from '@/types/report';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: ReportSection) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  const handleAdd = () => {
    const template = SECTION_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    const newSection = createSectionFromTemplate(template, customTitle.trim() || undefined);
    onAddSection(newSection);

    // Reset and close
    setSelectedTemplateId(null);
    setCustomTitle('');
    onClose();
  };

  if (!isOpen) return null;

  const selectedTemplate = SECTION_TEMPLATES.find((t) => t.id === selectedTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Section</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a template or create a custom section
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {SECTION_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTemplateId === template.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {template.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>

          {/* Custom Title Input */}
          {selectedTemplate && (
            <div className="mt-6 space-y-2">
              <label
                htmlFor="custom-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Custom Title (Optional)
              </label>
              <input
                id="custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={selectedTemplate.title}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Leave blank to use the default title: "{selectedTemplate.title}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedTemplateId}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
};
