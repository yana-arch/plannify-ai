// Validation utilities for project data input
import type { ProjectInputData } from '../types';

export type ValidationError = {
  field: string;
  message: string;
  type: 'error' | 'warning';
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
};

// Custom validation rules
export const validators = {
  required: (value: unknown, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  arrayRequired: (value: unknown[], fieldName: string): string | null => {
    if (!value || value.length === 0) {
      return `At least one ${fieldName} is required`;
    }
    return null;
  },

  emailFormat: (value: string, fieldName: string): string | null => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  numberRange: (value: number, min: number, max: number, fieldName: string): string | null => {
    if (value < min || value > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  budgetFormat: (value: string, _fieldName: string): string | null => {
    if (value && !/\$\d+K?-\$\d+K?|\d+K?-\d+K?/.test(value.replace(/\s/g, ''))) {
      return 'Budget should follow format like "$10K-$25K" or "10000-25000"';
    }
    return null;
  },

  timelineFormat: (value: string, _fieldName: string): string | null => {
    if (
      value &&
      !/\d+-\d+\s*months?|\d+-\d+\s*weeks?|\d+\s*months?|\d+\s*weeks?/.test(value.toLowerCase())
    ) {
      return 'Timeline should follow format like "3-6 months" or "12 weeks"';
    }
    return null;
  },

  wordCount: (value: string, min: number, max: number, fieldName: string): string | null => {
    if (value) {
      const words = value.trim().split(/\s+/).length;
      if (words < min) {
        return `${fieldName} should include at least ${min} words for better planning`;
      }
      if (words > max) {
        return `${fieldName} is too verbose (${words} words). Consider ${max} words or less`;
      }
    }
    return null;
  },

  techStackRequired: (techStack: ProjectInputData['techStack']): string | null => {
    const hasAnyTech = Object.values(techStack).some((arr) => arr.length > 0);
    if (!hasAnyTech) {
      return 'At least one technology in any category is required';
    }
    return null;
  },
};

// Main validation function for step data
export const validateStepData = (
  step: number,
  data: Partial<ProjectInputData>,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const addError = (field: string, message: string) => {
    errors.push({ field, message, type: 'error' });
  };

  const addWarning = (field: string, message: string) => {
    warnings.push({ field, message, type: 'warning' });
  };

  switch (step) {
    case 0: {
      // Basic Information
      const reqErr = validators.required(data.projectName, 'Project Name');
      if (reqErr) addError('projectName', reqErr);

      const descErr = validators.minLength(data.shortDescription || '', 20, 'Project Description');
      if (descErr) addError('shortDescription', descErr);

      const descWarning = validators.wordCount(
        data.shortDescription || '',
        10,
        100,
        'Project Description',
      );
      if (descWarning) addWarning('shortDescription', descWarning);

      const businessErr = validators.minLength(data.businessGoals || '', 30, 'Business Goals');
      if (businessErr) addError('businessGoals', businessErr);

      const techGoalsErr = validators.minLength(data.technicalGoals || '', 30, 'Technical Goals');
      if (techGoalsErr) addError('technicalGoals', techGoalsErr);

      if (!data.targetUsers || data.targetUsers.length === 0) {
        addError('targetUsers', 'At least one target user group is required');
      } else if (data.targetUsers.length > 5) {
        addWarning('targetUsers', 'Consider limiting to 5 primary user groups for better focus');
      }

      const numErr = validators.numberRange(
        data.numberOfFeatures || 0,
        3,
        20,
        'Number of Features',
      );
      if (numErr) addError('numberOfFeatures', numErr);

      const budgetErr = validators.budgetFormat(data.estimatedScale || '', 'Estimated Budget');
      if (budgetErr) addError('estimatedScale', budgetErr);

      const timelineErr = validators.timelineFormat(data.timeline || '', 'Timeline');
      if (timelineErr) addError('timeline', timelineErr);

      break;
    }

    case 1: // Core Requirements
      if (!data.coreRequirements || data.coreRequirements.length === 0) {
        addError('coreRequirements', 'At least one core requirement is required');
      } else {
        data.coreRequirements.forEach((req, index) => {
          if (!req.description.trim()) {
            addError(
              `coreRequirements[${index}].description`,
              `Requirement ${index + 1} description cannot be empty`,
            );
          } else if (req.description.length < 10) {
            addWarning(
              `coreRequirements[${index}].description`,
              `Requirement ${index + 1} description is quite brief`,
            );
          }
        });

        if (data.coreRequirements.length > (data.numberOfFeatures || 10) + 3) {
          addWarning(
            'coreRequirements',
            `You have ${data.coreRequirements.length} requirements but planned for ${data.numberOfFeatures || 10} features. Consider consolidating.`,
          );
        }
      }
      break;

    case 2: {
      // Technology Stack
      const techErr = validators.techStackRequired(data.techStack!);
      if (techErr) addError('techStack', techErr);

      // Check for conflicting technologies
      const conflictingTechs = checkTechConflicts(data.techStack!);
      conflictingTechs.forEach((conflict) => addWarning('techStack', conflict));

      break;
    }

    case 6: // Risk Assessment & Metrics
      // Risk Assessment validation
      if (!data.riskAssessment || data.riskAssessment.length === 0) {
        addWarning(
          'riskAssessment',
          'Consider adding at least one risk assessment for better project planning',
        );
      } else {
        data.riskAssessment.forEach((risk, index) => {
          if (!risk.risk.trim()) {
            addError(
              `riskAssessment[${index}].risk`,
              `Risk ${index + 1} description cannot be empty`,
            );
          }
          if (!risk.mitigation.trim()) {
            addError(
              `riskAssessment[${index}].mitigation`,
              `Risk ${index + 1} must have a mitigation strategy`,
            );
          }
        });
      }

      // Success Metrics validation
      if (!data.successMetrics || data.successMetrics.length === 0) {
        addWarning(
          'successMetrics',
          'Consider defining success metrics to measure project outcomes',
        );
      } else {
        data.successMetrics.forEach((metric, index) => {
          if (!metric.metric.trim()) {
            addError(
              `successMetrics[${index}].metric`,
              `Success metric ${index + 1} name cannot be empty`,
            );
          }
          if (!metric.target.trim()) {
            addError(
              `successMetrics[${index}].target`,
              `Success metric ${index + 1} must have a target`,
            );
          }
          if (!metric.timeframe.trim()) {
            addWarning(
              `successMetrics[${index}].timeframe`,
              `Success metric ${index + 1} should have a timeframe`,
            );
          }
        });
      }

      break;

    case 7: // Market Analysis
      if (!data.marketAnalysis || data.marketAnalysis.trim().length < 50) {
        addWarning(
          'marketAnalysis',
          'Market analysis should be detailed (at least 50 characters) for better planning',
        );
      }

      if (!data.competitors || data.competitors.length === 0) {
        addWarning('competitors', 'Consider adding known competitors for competitive analysis');
      }

      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Check for conflicting or unusual technology combinations
const checkTechConflicts = (techStack: ProjectInputData['techStack']): string[] => {
  const conflicts: string[] = [];
  const frontend = techStack.frontend;
  const backend = techStack.backend;
  const database = techStack.database;

  // React with server-side rendering tech
  if (frontend.includes('React') && backend.includes('Next.js')) {
    conflicts.push('Next.js is typically used for frontend - consider removing from backend stack');
  }

  // Inconsistent database choices
  if (
    database.includes('SQLite') &&
    techStack.otherTools.some(
      (tool) =>
        tool.toLowerCase().includes('kubernetes') || tool.toLowerCase().includes('docker swarm'),
    )
  ) {
    conflicts.push('SQLite may not be suitable for containerized/distributed deployments');
  }

  // Language/framework mismatches
  if (backend.includes('Django') && !backend.includes('Python')) {
    conflicts.push('Django requires Python - consider adding Python to backend stack');
  }

  if (backend.includes('Spring Boot') && !backend.includes('Java')) {
    conflicts.push('Spring Boot requires Java - consider adding Java to backend stack');
  }

  return conflicts;
};

// Get field-specific tooltip content
export const getFieldTooltip = (fieldName: string): string => {
  const tooltips: Record<string, string> = {
    projectName: 'Choose a descriptive name that clearly identifies your project',
    shortDescription: 'Briefly describe what your project does and its main purpose',
    businessGoals:
      'What business objectives will this project achieve? (revenue growth, customer satisfaction, etc.)',
    technicalGoals:
      'What technical objectives should this project meet? (performance, scalability, security, etc.)',
    numberOfFeatures: 'Estimate the number of core features (3-20 is typical for most projects)',
    estimatedScale: 'Total project budget range in thousands (e.g., $10K-$50K)',
    timeline: 'Expected project duration (e.g., 3-6 months)',
    targetUsers: 'Who will use your application? (customers, admin staff, partners, etc.)',
    coreRequirements: 'Key functional requirements that define what the system must do',
    techStack: 'Technologies for frontend, backend, database, and development tools',
  };

  return tooltips[fieldName] || '';
};

// Validate entire form before submission
export const validateCompleteForm = (data: ProjectInputData): ValidationResult => {
  let allErrors: ValidationError[] = [];
  let allWarnings: ValidationError[] = [];

  for (let step = 0; step < 7; step++) {
    const result = validateStepData(step, data);
    allErrors = [...allErrors, ...result.errors];
    allWarnings = [...allWarnings, ...result.warnings];
  }

  // Additional cross-form validations
  if (data.coreRequirements.length > data.numberOfFeatures * 1.5) {
    allWarnings.push({
      field: 'coreRequirements',
      message:
        'You have many requirements relative to planned features. Consider consolidating some.',
      type: 'warning',
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// Functions are already exported above
