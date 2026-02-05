import type { FormattingOptions } from '@/types/report';

/**
 * Predefined formatting themes for DOCX export
 * Each theme includes complete formatting specifications for professional document output
 */

export const FORMATTING_PRESETS: Record<string, FormattingOptions> = {
  /**
   * MODERN THEME
   * Clean, professional look with Calibri font and blue accent colors
   * Suitable for tech companies and modern businesses
   */
  modern: {
    documentFont: {
      family: 'Calibri',
      size: 24, // 12pt
      color: '000000',
    },
    headings: {
      title: {
        family: 'Calibri',
        size: 48, // 24pt
        color: '2E74B5',
        bold: true,
        level: 'title',
        spacingBefore: 0,
        spacingAfter: 400,
      },
      h1: {
        family: 'Calibri',
        size: 32, // 16pt
        color: '2E74B5',
        bold: true,
        level: 'h1',
        spacingBefore: 600,
        spacingAfter: 300,
      },
      h2: {
        family: 'Calibri',
        size: 28, // 14pt
        color: '2E74B5',
        bold: true,
        level: 'h2',
        spacingBefore: 400,
        spacingAfter: 200,
      },
      h3: {
        family: 'Calibri',
        size: 24, // 12pt
        color: '5FAAD5',
        bold: true,
        level: 'h3',
        spacingBefore: 300,
        spacingAfter: 150,
      },
    },
    margins: {
      top: 1440, // 1 inch
      right: 1440,
      bottom: 1440,
      left: 1440,
    },
    pageSize: 'letter',
    tableHeaderStyle: {
      family: 'Calibri',
      size: 24,
      color: '2E74B5',
      bold: true,
    },
  },

  /**
   * CORPORATE THEME
   * Traditional, formal appearance with Times New Roman and navy colors
   * Ideal for legal, financial, and formal business documents
   */
  corporate: {
    documentFont: {
      family: 'Times New Roman',
      size: 24, // 12pt
      color: '000000',
    },
    headings: {
      title: {
        family: 'Arial',
        size: 52, // 26pt
        color: '1F4E78',
        bold: true,
        level: 'title',
        spacingBefore: 0,
        spacingAfter: 600,
      },
      h1: {
        family: 'Arial',
        size: 36, // 18pt
        color: '1F4E78',
        bold: true,
        level: 'h1',
        spacingBefore: 720,
        spacingAfter: 360,
      },
      h2: {
        family: 'Arial',
        size: 30, // 15pt
        color: '1F4E78',
        bold: false,
        level: 'h2',
        spacingBefore: 480,
        spacingAfter: 240,
      },
      h3: {
        family: 'Arial',
        size: 26, // 13pt
        color: '4472C4',
        bold: false,
        level: 'h3',
        spacingBefore: 360,
        spacingAfter: 180,
      },
    },
    margins: {
      top: 1800, // 1.25 inches
      right: 1800,
      bottom: 1800,
      left: 1800,
    },
    pageSize: 'a4',
    tableHeaderStyle: {
      family: 'Arial',
      size: 24,
      color: '1F4E78',
      bold: true,
    },
  },

  /**
   * MINIMAL THEME
   * Simple, clean design with Arial and minimal color
   * Perfect for straightforward documentation and internal reports
   */
  minimal: {
    documentFont: {
      family: 'Arial',
      size: 22, // 11pt
      color: '333333',
    },
    headings: {
      title: {
        family: 'Arial',
        size: 44, // 22pt
        color: '000000',
        bold: true,
        level: 'title',
        spacingBefore: 0,
        spacingAfter: 400,
      },
      h1: {
        family: 'Arial',
        size: 30, // 15pt
        color: '000000',
        bold: true,
        level: 'h1',
        spacingBefore: 480,
        spacingAfter: 240,
      },
      h2: {
        family: 'Arial',
        size: 26, // 13pt
        color: '555555',
        bold: true,
        level: 'h2',
        spacingBefore: 360,
        spacingAfter: 180,
      },
      h3: {
        family: 'Arial',
        size: 24, // 12pt
        color: '777777',
        bold: false,
        level: 'h3',
        spacingBefore: 240,
        spacingAfter: 120,
      },
    },
    margins: {
      top: 1200, // 0.83 inches
      right: 1200,
      bottom: 1200,
      left: 1200,
    },
    pageSize: 'letter',
    tableHeaderStyle: {
      family: 'Arial',
      size: 22,
      color: '000000',
      bold: true,
    },
  },
};

/**
 * Get a formatting preset by name
 * Falls back to 'modern' if preset not found
 */
export const getFormattingPreset = (theme: string): FormattingOptions => {
  return FORMATTING_PRESETS[theme] || FORMATTING_PRESETS.modern;
};

/**
 * Convert inches to twips (for margins)
 * 1 inch = 1440 twips (twips = twentieth of a point, 72 points per inch)
 */
export const inchesToTwips = (inches: number): number => {
  return Math.round(inches * 1440);
};

/**
 * Convert twips to inches (for display)
 * 1440 twips = 1 inch
 */
export const twipsToInches = (twips: number): number => {
  return Math.round((twips / 1440) * 100) / 100;
};

/**
 * Convert points to half-points (for font sizes)
 * DOCX uses half-points: 12pt = 24 half-points
 */
export const pointsToHalfPoints = (points: number): number => {
  return points * 2;
};

/**
 * Convert half-points to points (for display)
 * 24 half-points = 12pt
 */
export const halfPointsToPoints = (halfPoints: number): number => {
  return halfPoints / 2;
};
