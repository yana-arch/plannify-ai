/**
 * Font size context and cascading utilities for DOCX export
 * Provides consistent font size calculations across document elements
 */

import { FORMATTING_LIMITS } from '@/constants/docx';

/**
 * Validates and clamps font size to acceptable range
 * @param fontSize - Font size in half-points (24 = 12pt)
 * @returns Validated font size within limits
 */
export function validateFontSize(fontSize: number): number {
  const minSize = FORMATTING_LIMITS.FONT_SIZE.MIN * 2; // Convert pt to half-points
  const maxSize = FORMATTING_LIMITS.FONT_SIZE.MAX * 2;
  return Math.max(minSize, Math.min(maxSize, fontSize));
}

/**
 * Calculates proportional code font size based on body text size
 * Code font is always smaller than body text for better readability
 * @param baseFontSize - Base font size in half-points (e.g., 24 = 12pt)
 * @returns Code font size in half-points, minimum 16 (8pt)
 */
export function calculateCodeFontSize(baseFontSize: number): number {
  // Validate base font size first
  const validatedBase = validateFontSize(baseFontSize);

  // Code font is 4 half-points (2pt) smaller than body text
  const codeFontSize = validatedBase - 4;

  // Ensure minimum size of 16 (8pt) for readability
  return Math.max(16, codeFontSize);
}

/**
 * Font size context for different document elements
 * Provides cascading font sizes based on body text size
 */
export interface FontSizeContext {
  /** Body text font size in half-points */
  bodySize: number;
  /** Code block and inline code font size in half-points */
  codeSize: number;
  /** Whether font sizes are validated */
  isValidated: boolean;
}

/**
 * Creates a font size context with validated, cascading sizes
 * @param bodyFontSize - Desired body text font size in half-points
 * @returns FontSizeContext with validated sizes
 */
export function createFontSizeContext(bodyFontSize: number): FontSizeContext {
  const validatedBodySize = validateFontSize(bodyFontSize);

  return {
    bodySize: validatedBodySize,
    codeSize: calculateCodeFontSize(validatedBodySize),
    isValidated: true,
  };
}
