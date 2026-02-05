import React from 'react';
import type { FormattingOptions } from '@/types/report';
import { FontStyleEditor } from './FontStyleEditor';
import { HeadingStyleEditor } from './HeadingStyleEditor';
import {
  FORMATTING_PRESETS,
  twipsToInches,
  inchesToTwips,
} from '@/presets/formatting';
import { validateMargin } from '@/utils/formattingValidation';

// Export props interface for reusability and testing
export interface FormattingPanelProps {
  formatting: FormattingOptions;
  onUpdate: (formatting: FormattingOptions) => void;
  onSelectPreset: (theme: string) => void;
  currentTheme: string;
}

export const FormattingPanel: React.FC<FormattingPanelProps> = ({
  formatting,
  onUpdate,
  onSelectPreset,
  currentTheme,
}) => {
  const handleMarginChange = (side: keyof typeof formatting.margins, inches: number) => {
    const validatedInches = validateMargin(inches);
    onUpdate({
      ...formatting,
      margins: {
        ...formatting.margins,
        [side]: inchesToTwips(validatedInches),
      },
    });
  };

  const handlePageSizeChange = (pageSize: 'letter' | 'a4') => {
    onUpdate({ ...formatting, pageSize });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Theme Presets */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Theme Presets
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(FORMATTING_PRESETS).map((theme) => (
            <button
              key={theme}
              onClick={() => onSelectPreset(theme)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all text-left ${
                currentTheme === theme
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize">{theme}</span>
                {currentTheme === theme && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={() => onSelectPreset('custom')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all text-left ${
              currentTheme === 'custom'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Custom</span>
              {currentTheme === 'custom' && (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Select a preset or customize below
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Body Text */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Body Text</h4>
        <FontStyleEditor
          style={formatting.documentFont}
          onChange={(font) => onUpdate({ ...formatting, documentFont: font })}
          showBoldItalic={false}
        />
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Headings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Headings</h4>
        <div className="space-y-4">
          <HeadingStyleEditor
            label="Title"
            style={formatting.headings.title}
            onChange={(h) =>
              onUpdate({
                ...formatting,
                headings: { ...formatting.headings, title: h },
              })
            }
          />

          <HeadingStyleEditor
            label="Heading 1"
            style={formatting.headings.h1}
            onChange={(h) =>
              onUpdate({
                ...formatting,
                headings: { ...formatting.headings, h1: h },
              })
            }
          />

          <HeadingStyleEditor
            label="Heading 2"
            style={formatting.headings.h2}
            onChange={(h) =>
              onUpdate({
                ...formatting,
                headings: { ...formatting.headings, h2: h },
              })
            }
          />

          <HeadingStyleEditor
            label="Heading 3"
            style={formatting.headings.h3}
            onChange={(h) =>
              onUpdate({
                ...formatting,
                headings: { ...formatting.headings, h3: h },
              })
            }
          />
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Page Margins */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Page Margins
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Top (inches)
            </label>
            <input
              type="number"
              min="0.25"
              max="3"
              step="0.25"
              value={twipsToInches(formatting.margins.top)}
              onChange={(e) => handleMarginChange('top', parseFloat(e.target.value) || 1)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Right (inches)
            </label>
            <input
              type="number"
              min="0.25"
              max="3"
              step="0.25"
              value={twipsToInches(formatting.margins.right)}
              onChange={(e) => handleMarginChange('right', parseFloat(e.target.value) || 1)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Bottom (inches)
            </label>
            <input
              type="number"
              min="0.25"
              max="3"
              step="0.25"
              value={twipsToInches(formatting.margins.bottom)}
              onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value) || 1)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Left (inches)
            </label>
            <input
              type="number"
              min="0.25"
              max="3"
              step="0.25"
              value={twipsToInches(formatting.margins.left)}
              onChange={(e) => handleMarginChange('left', parseFloat(e.target.value) || 1)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Page Size */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Page Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePageSizeChange('letter')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
              formatting.pageSize === 'letter'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            Letter
            <div className="text-xs opacity-75">8.5" × 11"</div>
          </button>
          <button
            onClick={() => handlePageSizeChange('a4')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
              formatting.pageSize === 'a4'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            A4
            <div className="text-xs opacity-75">210 × 297 mm</div>
          </button>
        </div>
      </div>

      {/* Table Header Style */}
      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Table Headers
        </h4>
        <FontStyleEditor
          style={formatting.tableHeaderStyle || formatting.documentFont}
          onChange={(font) => onUpdate({ ...formatting, tableHeaderStyle: font })}
          showBoldItalic
        />
      </div>
    </div>
  );
};
