export interface ReportSection {
  id: string;
  title: string;
  isEnabled: boolean;
  type: 'static' | 'dynamic' | 'text';
  content?: string; // For customized text content
  dataSource?: string; // Key mapping to ProjectPlan data for dynamic sections
  aiPrompt?: string; // Custom prompt for AI generation
}

export type ReportSectionType = 'static' | 'dynamic' | 'text';

// ==================== Formatting Types ====================

export interface FontStyle {
  family: string; // 'Calibri', 'Arial', 'Times New Roman', etc.
  size: number; // Size in half-points (24 = 12pt)
  color?: string; // Hex color without '#': '2E74B5'
  bold?: boolean;
  italic?: boolean;
}

export interface HeadingStyle extends FontStyle {
  level: 'title' | 'h1' | 'h2' | 'h3' | 'h4'; // Heading hierarchy
  numberingStyle?: 'none' | 'decimal' | 'roman'; // For auto-numbering (future)
  spacingBefore?: number; // In twips (1/20 pt), e.g., 600 = 0.3 inches
  spacingAfter?: number;
}

export interface DocumentMargins {
  top: number; // In twips (1440 = 1 inch)
  right: number;
  bottom: number;
  left: number;
}

export interface FormattingOptions {
  documentFont: FontStyle; // Body text default
  headings: {
    title: HeadingStyle; // Document title
    h1: HeadingStyle; // Main sections
    h2: HeadingStyle; // Sub-sections
    h3: HeadingStyle; // Sub-sub-sections
    h4?: HeadingStyle; // Optional 4th level
  };
  margins: DocumentMargins;
  pageSize: 'letter' | 'a4';
  tableHeaderStyle?: FontStyle; // For table headers
}

export interface ReportConfig {
  title: string;
  sections: ReportSection[];
  theme: 'modern' | 'corporate' | 'minimal' | 'custom';
  formatting?: FormattingOptions; // Custom formatting overrides theme defaults
}
