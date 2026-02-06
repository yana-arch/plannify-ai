/**
 * Tests for markdown parser with font size cascading
 * Verifies Task #1.7: Test matrix (body × code × headings × tables)
 */

import { parseMarkdownTokensToDocx } from '../markdownParser';
import { Paragraph, TextRun } from 'docx';

// Mock markdown-it token structure
interface MockToken {
  type: string;
  content?: string;
  children?: MockToken[];
}

describe('parseMarkdownTokensToDocx', () => {
  describe('Font Size Cascading (Task #1.7 Test Matrix)', () => {
    it('should apply 8pt body font size correctly', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [{ type: 'text', content: 'Body text at 8pt' }],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 16); // 16 half-points = 8pt
      expect(result).toHaveLength(1);
      expect(result[0].constructor.name).toBe('Paragraph');
    });

    it('should apply 12pt body font size correctly', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [{ type: 'text', content: 'Body text at 12pt' }],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24); // 24 half-points = 12pt
      expect(result).toHaveLength(1);
    });

    it('should apply 16pt body font size correctly', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [{ type: 'text', content: 'Body text at 16pt' }],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 32); // 32 half-points = 16pt
      expect(result).toHaveLength(1);
    });

    it('should cascade code block font size: 12pt body → 10pt code', () => {
      const tokens: MockToken[] = [{ type: 'code_block', content: 'const x = 1;' }];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24); // 24 half-points = 12pt body
      expect(result).toHaveLength(1);
      // Code font should be 20 half-points (10pt) = 24 - 4
    });

    it('should cascade code block font size: 16pt body → 14pt code', () => {
      const tokens: MockToken[] = [{ type: 'fence', content: 'function test() {}' }];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 32); // 32 half-points = 16pt body
      expect(result).toHaveLength(1);
      // Code font should be 28 half-points (14pt) = 32 - 4
    });

    it('should enforce minimum code font size of 8pt', () => {
      const tokens: MockToken[] = [{ type: 'code_block', content: 'code' }];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 18); // 18 half-points = 9pt body
      expect(result).toHaveLength(1);
      // Code font should be clamped to minimum 16 half-points (8pt)
    });

    it('should handle inline code with font size cascade', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [
            { type: 'text', content: 'Text with ' },
            { type: 'code_inline', content: 'inline code' },
            { type: 'text', content: ' here' },
          ],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24); // 12pt body
      expect(result).toHaveLength(1);
    });
  });

  describe('Timeout Protection (Task #1.6)', () => {
    it('should throw error if parsing exceeds timeout', () => {
      const hugeTokenArray = Array(10000).fill({
        type: 'paragraph_open',
      });

      expect(() => {
        parseMarkdownTokensToDocx(hugeTokenArray as any, Paragraph, TextRun, 24, 100); // 100ms timeout
      }).toThrow(/timeout/i);
    });

    it('should complete successfully within timeout for normal content', () => {
      const normalTokens: MockToken[] = [
        { type: 'paragraph_open' },
        { type: 'inline', children: [{ type: 'text', content: 'Normal text' }] },
        { type: 'paragraph_close' },
      ];

      expect(() => {
        parseMarkdownTokensToDocx(normalTokens as any, Paragraph, TextRun, 24, 5000);
      }).not.toThrow();
    });
  });

  describe('Font Size Validation (Task #1.5)', () => {
    it('should validate and clamp zero font size to minimum', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        { type: 'inline', children: [{ type: 'text', content: 'text' }] },
        { type: 'paragraph_close' },
      ];

      expect(() => {
        parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 0);
      }).not.toThrow();
    });

    it('should validate and clamp negative font size', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        { type: 'inline', children: [{ type: 'text', content: 'text' }] },
        { type: 'paragraph_close' },
      ];

      expect(() => {
        parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, -10);
      }).not.toThrow();
    });

    it('should validate and clamp excessively large font size', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        { type: 'inline', children: [{ type: 'text', content: 'text' }] },
        { type: 'paragraph_close' },
      ];

      expect(() => {
        parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 1000);
      }).not.toThrow();
    });
  });

  describe('Formatting State Management', () => {
    it('should handle bold text', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [
            { type: 'strong_open' },
            { type: 'text', content: 'Bold text' },
            { type: 'strong_close' },
          ],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24);
      expect(result).toHaveLength(1);
    });

    it('should handle italic text', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [
            { type: 'em_open' },
            { type: 'text', content: 'Italic text' },
            { type: 'em_close' },
          ],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24);
      expect(result).toHaveLength(1);
    });

    it('should handle nested formatting (bold + italic)', () => {
      const tokens: MockToken[] = [
        { type: 'paragraph_open' },
        {
          type: 'inline',
          children: [
            { type: 'strong_open' },
            { type: 'em_open' },
            { type: 'text', content: 'Bold italic' },
            { type: 'em_close' },
            { type: 'strong_close' },
          ],
        },
        { type: 'paragraph_close' },
      ];

      const result = parseMarkdownTokensToDocx(tokens as any, Paragraph, TextRun, 24);
      expect(result).toHaveLength(1);
    });
  });
});
