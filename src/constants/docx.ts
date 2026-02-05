/**
 * Constants for DOCX export
 * All measurements in twips (1/20 of a point, 1440 twips = 1 inch)
 */

// Page size constants (in twips)
export const PAGE_SIZES = {
  A4: {
    width: 11906, // A4 width: 210mm = 8.27"
    height: 16838, // A4 height: 297mm = 11.69"
  },
  LETTER: {
    width: 12240, // Letter width: 8.5"
    height: 15840, // Letter height: 11"
  },
} as const;

// Line spacing constants
export const LINE_SPACING = {
  SINGLE: 240,
  ONE_AND_HALF: 360,
  DOUBLE: 480,
} as const;

// Default paragraph spacing
export const DEFAULT_SPACING = {
  AFTER: 200,
  BEFORE: 0,
} as const;

// Conversion factor constants
export const CONVERSION_FACTORS = {
  TWIPS_PER_INCH: 1440,
  HALF_POINTS_PER_POINT: 2,
  POINTS_PER_INCH: 72,
} as const;

// Validation limits for formatting
export const FORMATTING_LIMITS = {
  FONT_SIZE: {
    MIN: 8, // 8pt minimum
    MAX: 72, // 72pt maximum
  },
  MARGIN: {
    MIN: 0, // 0 inches
    MAX: 3, // 3 inches maximum
  },
  SPACING: {
    MIN: 0,
    MAX: 2, // 2 inches max spacing
  },
} as const;
