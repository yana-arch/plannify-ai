import React, { useState } from 'react';
import { useSettings } from '../../SettingsContext';
import { ReportSection } from '../../types/report';
import { aiService } from '../../services/aiService';
// import { useProjects } from '../../ProjectContext'; // Correct hook name
import { validateAndSanitizePrompt } from '../../services/aiServiceUtils';

interface SectionEditorProps {
  section: ReportSection;
  onUpdate: (updatedSection: ReportSection) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate }) => {
  const { activeProvider } = useSettings();
  const [content, setContent] = useState(section.content || '');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [prompt, setPrompt] = useState(section.aiPrompt || '');
  const [error, setError] = useState<string | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate({ ...section, content: newContent });
  };

  const handleAiGenerate = async () => {
    if (!activeProvider) {
      setError('No AI provider configured.');
      return;
    }

    // Validate and sanitize the prompt
    const validation = validateAndSanitizePrompt(prompt, {
      maxLength: 5000,
      minLength: 5,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Invalid prompt');
      return;
    }

    setIsAiGenerating(true);
    setError(null);

    try {
      const generatedContent = await aiService.generateSectionContent(
        section.title,
        content, // Pass current content as context
        validation.sanitized, // Use sanitized prompt
        activeProvider,
      );

      setContent(generatedContent);
      onUpdate({
        ...section,
        content: generatedContent,
        aiPrompt: validation.sanitized,
      });
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setError(err.message || 'Failed to generate content.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (section.type === 'static') {
    return (
      <div className="rounded-md bg-gray-50 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        This section is static and cannot be edited.
      </div>
    );
  }

  if (section.type === 'dynamic' && !section.content) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-xl mr-3">🔗</span>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Data Linked Section</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This section pulls data directly from your project plan (<b>{section.dataSource}</b>
                ). You can override it with custom text below.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              const placeholder = `(Snapshot of ${section.dataSource} data would go here...)`;
              setContent(placeholder);
              onUpdate({ ...section, content: placeholder });
            }}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            Convert to Custom Text
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
            AI Assistant
          </h4>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`E.g., "Rewrite ${section.title} for a non-technical audience"`}
            className="flex-1 text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
          />
          <button
            onClick={handleAiGenerate}
            disabled={isAiGenerating || !prompt.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
          >
            {isAiGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Manual Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Content (Markdown)
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          rows={12}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm font-mono leading-relaxed"
          placeholder="Enter your custom report content here..."
        />
        <div className="mt-2 text-xs text-gray-500 flex justify-end">
          {content.length} characters
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
