import React from 'react';
import type { HeadingStyle } from '@/types/report';
import { FontStyleEditor } from './FontStyleEditor';
import { twipsToInches, inchesToTwips } from '@/presets/formatting';
import { validateSpacing } from '@/utils/formattingValidation';

interface HeadingStyleEditorProps {
  label: string;
  style: HeadingStyle;
  onChange: (style: HeadingStyle) => void;
}

export const HeadingStyleEditor: React.FC<HeadingStyleEditorProps> = ({
  label,
  style,
  onChange,
}) => {
  const handleFontStyleChange = (fontStyle: Partial<HeadingStyle>) => {
    onChange({ ...style, ...fontStyle });
  };

  const handleSpacingBeforeChange = (inches: number) => {
    const validatedInches = validateSpacing(inches);
    onChange({ ...style, spacingBefore: inchesToTwips(validatedInches) });
  };

  const handleSpacingAfterChange = (inches: number) => {
    const validatedInches = validateSpacing(inches);
    onChange({ ...style, spacingAfter: inchesToTwips(validatedInches) });
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
      {/* Font Style Section */}
      <FontStyleEditor
        label={label}
        style={style}
        onChange={handleFontStyleChange}
        showBoldItalic
      />

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Spacing Controls */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Spacing
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Spacing Before */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Before (inches)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.05"
              value={twipsToInches(style.spacingBefore || 0)}
              onChange={(e) => handleSpacingBeforeChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Spacing After */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              After (inches)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.05"
              value={twipsToInches(style.spacingAfter || 0)}
              onChange={(e) => handleSpacingAfterChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Level Indicator */}
      <div className="pt-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
          {style.level.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
