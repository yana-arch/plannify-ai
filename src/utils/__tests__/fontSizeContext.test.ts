import { validateFontSize, calculateCodeFontSize, createFontSizeContext } from '../fontSizeContext';

describe('fontSizeContext', () => {
  describe('validateFontSize', () => {
    it('should clamp font size to minimum (16 half-points = 8pt)', () => {
      expect(validateFontSize(10)).toBe(16); // 5pt -> 8pt
      expect(validateFontSize(0)).toBe(16);
      expect(validateFontSize(-10)).toBe(16);
    });

    it('should clamp font size to maximum (144 half-points = 72pt)', () => {
      expect(validateFontSize(200)).toBe(144); // 100pt -> 72pt
      expect(validateFontSize(1000)).toBe(144);
    });

    it('should allow valid font sizes unchanged', () => {
      expect(validateFontSize(24)).toBe(24); // 12pt
      expect(validateFontSize(32)).toBe(32); // 16pt
      expect(validateFontSize(48)).toBe(48); // 24pt
    });

    it('should handle edge cases with NaN and Infinity', () => {
      // Note: Implementation returns NaN for NaN input (Math.min/max behavior)
      expect(isNaN(validateFontSize(NaN))).toBe(true);
      expect(validateFontSize(Infinity)).toBe(144); // Clamp to max
      expect(validateFontSize(-Infinity)).toBe(16); // Clamp to min
    });
  });

  describe('calculateCodeFontSize', () => {
    it('should return body size minus 4 half-points (2pt)', () => {
      expect(calculateCodeFontSize(24)).toBe(20); // 12pt body -> 10pt code
      expect(calculateCodeFontSize(32)).toBe(28); // 16pt body -> 14pt code
    });

    it('should enforce minimum code size of 16 (8pt)', () => {
      expect(calculateCodeFontSize(18)).toBe(16); // 9pt body -> 8pt code (min)
      expect(calculateCodeFontSize(16)).toBe(16); // 8pt body -> 8pt code (min)
      expect(calculateCodeFontSize(10)).toBe(16); // Invalid input -> clamped -> 8pt min
    });

    it('should validate base font size first', () => {
      expect(calculateCodeFontSize(200)).toBe(140); // 100pt -> 72pt, then 72pt - 2pt = 70pt
      expect(calculateCodeFontSize(0)).toBe(16); // Invalid -> 8pt min, then 8pt - 2pt < min, so 8pt
    });
  });

  describe('createFontSizeContext', () => {
    it('should create context with validated body and code sizes', () => {
      const context = createFontSizeContext(24);
      expect(context.bodySize).toBe(24); // 12pt
      expect(context.codeSize).toBe(20); // 10pt
      expect(context.isValidated).toBe(true);
    });

    it('should handle invalid input with validation', () => {
      const context = createFontSizeContext(0);
      expect(context.bodySize).toBe(16); // Clamped to min 8pt
      expect(context.codeSize).toBe(16); // 8pt (enforced min)
      expect(context.isValidated).toBe(true);
    });

    it('should cascade validation to code sizes', () => {
      const context = createFontSizeContext(300);
      expect(context.bodySize).toBe(144); // Clamped to max 72pt
      expect(context.codeSize).toBe(140); // 72pt - 2pt = 70pt
      expect(context.isValidated).toBe(true);
    });
  });
});
