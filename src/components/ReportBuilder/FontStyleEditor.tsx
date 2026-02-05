import React from 'react';
import type { FontStyle } from '@/types/report';
import { halfPointsToPoints, pointsToHalfPoints } from '@/presets/formatting';
import {
  validateFontSize,
  validateHexColor,
  isPartialHexValid,
} from '@/utils/formattingValidation';

interface FontStyleEditorProps {
  label?: string;
  style: FontStyle;
  onChange: (style: FontStyle) => void;
  showBoldItalic?: boolean;
}

const AVAILABLE_FONTS = [
  'Calibri',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Cambria',
  'Garamond',
];

export const FontStyleEditor: React.FC<FontStyleEditorProps> = ({
  label,
  style,
  onChange,
  showBoldItalic = false,
}) => {
  const handleFamilyChange = (family: string) => {
    onChange({ ...style, family });
  };

  const handleSizeChange = (points: number) => {
    const validatedPoints = validateFontSize(points);
    onChange({ ...style, size: pointsToHalfPoints(validatedPoints) });
  };

  const handleColorChange = (color: string) => {
    // Remove '#' prefix
    const hexColor = color.startsWith('#') ? color.substring(1) : color;

    // Validate hex color format (6 characters, 0-9 A-F)
    const isValidHex = /^[0-9A-Fa-f]{0,6}$/.test(hexColor);

    if (isValidHex) {
      onChange({ ...style, color: hexColor.toUpperCase() });
    }
    // If invalid, silently ignore to prevent breaking user input flow
  };

  const handleBoldToggle = () => {
    onChange({ ...style, bold: !style.bold });
  };

  const handleItalicToggle = () => {
    onChange({ ...style, italic: !style.italic });
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

      <div className="grid grid-cols-3 gap-2">
        {/* Font Family */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Font</label>
          <select
            value={style.family}
            onChange={(e) => handleFamilyChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Size (pt)</label>
          <input
            type="number"
            min="8"
            max="72"
            step="0.5"
            value={halfPointsToPoints(style.size)}
            onChange={(e) => handleSizeChange(parseFloat(e.target.value) || 12)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={`#${style.color || '000000'}`}
              onChange={(e) => handleColorChange(e.target.value)}
              aria-label="Color picker"
              className="w-12 h-9 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={style.color || '000000'}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="HEX"
              maxLength={6}
              aria-label="Hex color code"
              className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
            />
          </div>
        </div>
      </div>

      {/* Bold & Italic Toggles */}
      {showBoldItalic && (
        <div className="flex gap-2">
          <button
            onClick={handleBoldToggle}
            className={`flex-1 px-3 py-1.5 text-sm font-bold rounded-md border transition-colors ${
              style.bold
                ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            B
          </button>
          <button
            onClick={handleItalicToggle}
            className={`flex-1 px-3 py-1.5 text-sm italic rounded-md border transition-colors ${
              style.italic
                ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            I
          </button>
        </div>
      )}
    </div>
  );
};
