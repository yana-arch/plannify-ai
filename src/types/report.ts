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

export interface ReportConfig {
  title: string;
  sections: ReportSection[];
  theme: 'modern' | 'corporate' | 'minimal';
}
