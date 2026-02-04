import { validators, validateStepData, validateCompleteForm } from '../validation';
import { ProjectInputData } from '../../types';

describe('Validation Utilities', () => {
  describe('validators', () => {
    it('required returns error for empty values', () => {
      expect(validators.required('', 'Field')).toBe('Field is required');
      expect(validators.required(null, 'Field')).toBe('Field is required');
      expect(validators.required('   ', 'Field')).toBe('Field is required');
    });

    it('required returns null for valid values', () => {
      expect(validators.required('Valid', 'Field')).toBeNull();
      expect(validators.required(123, 'Field')).toBeNull();
    });

    it('minLength returns error for short strings', () => {
      expect(validators.minLength('short', 10, 'Field')).toBe(
        'Field must be at least 10 characters',
      );
    });

    it('minLength returns null for sufficient length', () => {
      expect(validators.minLength('long enough string', 10, 'Field')).toBeNull();
    });

    it('arrayRequired returns error for empty arrays', () => {
      expect(validators.arrayRequired([], 'Field')).toBe('At least one Field is required');
    });

    it('arrayRequired returns null for populated arrays', () => {
      expect(validators.arrayRequired(['item'], 'Field')).toBeNull();
    });
  });

  describe('validateStepData', () => {
    const mockData: Partial<ProjectInputData> = {
      projectName: 'Test Project',
      shortDescription: 'This is a sufficiently long description for the project.',
      businessGoals: 'These are the business goals for the project.',
      technicalGoals: 'These are the technical goals for the project.',
      targetUsers: ['User 1'],
      numberOfFeatures: 5,
      estimatedScale: '$10K-$20K',
      timeline: '3-6 months',
    };

    it('validates Step 0 (Basic Info) correctly', () => {
      const result = validateStepData(0, mockData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns errors for missing required fields in Step 0', () => {
      const invalidData = { ...mockData, projectName: '' };
      const result = validateStepData(0, invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'projectName' }));
    });

    it('validates Step 1 (Core Requirements) correctly', () => {
      const step1Data = {
        coreRequirements: [{ id: '1', description: 'Requirement 1', priority: 'High' } as any],
      };
      const result = validateStepData(1, step1Data);
      expect(result.isValid).toBe(true);
    });

    it('returns error if no core requirements', () => {
      const step1Data = {
        coreRequirements: [],
      };
      const result = validateStepData(1, step1Data);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('At least one core requirement is required');
    });
  });
});
