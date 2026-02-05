import { FORMATTING_LIMITS } from '@/constants/docx';

/**
 * Validation and sanitization utilities for formatting inputs
 */

/**
 * Clamp a number between min and max values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Validate and clamp font size in points
 * @param points - Font size in points
 * @returns Clamped font size between 8pt and 72pt
 */
export function validateFontSize(points: number): number {
  if (isNaN(points) || !isFinite(points)) {
    return 12; // Default fallback
  }
  return clamp(points, FORMATTING_LIMITS.FONT_SIZE.MIN, FORMATTING_LIMITS.FONT_SIZE.MAX);
}

/**
 * Validate and clamp margin in inches
 * @param inches - Margin in inches
 * @returns Clamped margin between 0 and 3 inches
 */
export function validateMargin(inches: number): number {
  if (isNaN(inches) || !isFinite(inches)) {
    return 1; // Default 1 inch
  }
  return clamp(inches, FORMATTING_LIMITS.MARGIN.MIN, FORMATTING_LIMITS.MARGIN.MAX);
}

/**
 * Validate and clamp spacing in inches
 * @param inches - Spacing in inches
 * @returns Clamped spacing between 0 and 2 inches
 */
export function validateSpacing(inches: number): number {
  if (isNaN(inches) || !isFinite(inches)) {
    return 0;
  }
  return clamp(inches, FORMATTING_LIMITS.SPACING.MIN, FORMATTING_LIMITS.SPACING.MAX);
}

/**
 * Validate hex color code
 * @param color - Hex color with or without '#'
 * @returns Valid 6-character hex color (without '#'), or '000000' if invalid
 */
export function validateHexColor(color: string): string {
  // Remove '#' if present
  const hexColor = color.startsWith('#') ? color.substring(1) : color;

  // Validate hex color format (6 characters, 0-9 A-F)
  const isValidHex = /^[0-9A-Fa-f]{6}$/.test(hexColor);

  return isValidHex ? hexColor.toUpperCase() : '000000';
}

/**
 * Validate partial hex color input (allows incomplete input during typing)
 * @param color - Partial hex color input
 * @returns true if valid partial hex (0-6 hex characters)
 */
export function isPartialHexValid(color: string): boolean {
  const hexColor = color.startsWith('#') ? color.substring(1) : color;
  return /^[0-9A-Fa-f]{0,6}$/.test(hexColor);
}
