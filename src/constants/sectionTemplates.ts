/**
 * Section templates for DOCX export customization
 * Provides common business report sections for quick insertion
 */

import { ReportSection } from '@/types/report';

export interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  type: 'static' | 'dynamic' | 'text';
  defaultContent?: string;
  icon: string;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'budget',
    title: 'Budget Analysis',
    description: 'Financial breakdown and cost analysis',
    type: 'text',
    defaultContent:
      '## Budget Overview\n\n### Cost Breakdown\n- Development: $[amount]\n- Infrastructure: $[amount]\n- Marketing: $[amount]\n\n### Total Estimated Cost: $[total]',
    icon: '💰',
  },
  {
    id: 'team',
    title: 'Team Structure',
    description: 'Team composition and roles',
    type: 'text',
    defaultContent:
      '## Team Organization\n\n### Core Team\n- Project Manager: [Name]\n- Lead Developer: [Name]\n- Designer: [Name]\n\n### Responsibilities\n[Description of team responsibilities and structure]',
    icon: '👥',
  },
  {
    id: 'glossary',
    title: 'Glossary',
    description: 'Technical terms and definitions',
    type: 'text',
    defaultContent:
      '## Glossary of Terms\n\n**API**: Application Programming Interface\n\n**MVP**: Minimum Viable Product\n\n**[Term]**: [Definition]',
    icon: '📚',
  },
  {
    id: 'references',
    title: 'References',
    description: 'Citations and external resources',
    type: 'text',
    defaultContent:
      '## References\n\n1. [Reference 1]\n2. [Reference 2]\n3. [Reference 3]\n\n### External Resources\n- [Resource name]: [URL]\n- [Resource name]: [URL]',
    icon: '🔗',
  },
  {
    id: 'appendix',
    title: 'Appendix',
    description: 'Supplementary information and data',
    type: 'text',
    defaultContent:
      '## Appendix\n\n### A. Additional Data\n[Supplementary data and information]\n\n### B. Technical Specifications\n[Detailed technical specifications]',
    icon: '📎',
  },
  {
    id: 'methodology',
    title: 'Methodology',
    description: 'Approach and process description',
    type: 'text',
    defaultContent:
      '## Methodology\n\n### Development Approach\n[Description of development methodology]\n\n### Quality Assurance\n[Description of QA processes]\n\n### Deployment Strategy\n[Description of deployment approach]',
    icon: '🔬',
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    description: 'Summary and next steps',
    type: 'text',
    defaultContent:
      '## Conclusion\n\n### Summary\n[Summary of key points and findings]\n\n### Next Steps\n1. [Next step 1]\n2. [Next step 2]\n3. [Next step 3]\n\n### Contact Information\n[Contact details for follow-up]',
    icon: '✅',
  },
  {
    id: 'custom',
    title: 'Custom Section',
    description: 'Create your own custom section',
    type: 'text',
    defaultContent: '## [Section Title]\n\n[Your content here]',
    icon: '✏️',
  },
];

/**
 * Generate a unique ID with fallback for older browsers
 * @returns Unique UUID string
 */
function generateUniqueId(): string {
  // Modern browsers: use crypto.randomUUID()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older browsers (Safari < 15.4, Firefox < 95)
  // Uses timestamp + random string for uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${randomPart}`;
}

/**
 * Create a new report section from a template
 * @param template - Section template to use
 * @param customTitle - Optional custom title (defaults to template title)
 * @returns New ReportSection ready to be added to the report
 */
export function createSectionFromTemplate(
  template: SectionTemplate,
  customTitle?: string,
): ReportSection {
  return {
    id: `${template.id}-${generateUniqueId()}`,
    title: customTitle || template.title,
    isEnabled: true,
    type: template.type,
    content: template.defaultContent,
  };
}
