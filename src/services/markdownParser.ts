/**
 * Improved Markdown to DOCX parser with proper formatting state management
 */

import type { MarkdownToken, TextFormattingState } from '@/types/docx';
import type { Paragraph as ParagraphType, TextRun as TextRunType } from 'docx';
import { calculateCodeFontSize, validateFontSize } from '@/utils/fontSizeContext';

/**
 * Parse markdown tokens to DOCX paragraphs with proper formatting
 * @param tokens - Markdown tokens from markdown-it parser
 * @param Paragraph - DOCX Paragraph constructor
 * @param TextRun - DOCX TextRun constructor
 * @param defaultFontSize - Default font size in half-points (e.g., 24 = 12pt)
 * @param timeoutMs - Maximum parsing time in milliseconds (default: 5000ms)
 * @returns Array of DOCX paragraph elements
 * @throws Error if parsing exceeds timeout
 */
export function parseMarkdownTokensToDocx(
  tokens: MarkdownToken[],
  Paragraph: typeof ParagraphType,
  TextRun: typeof TextRunType,
  defaultFontSize: number = 24, // Default to 12pt if not specified
  timeoutMs: number = 5000, // 5 second timeout
): InstanceType<typeof ParagraphType>[] {
  // Timeout protection against malformed markdown
  const startTime = Date.now();
  const checkTimeout = () => {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(
        'Markdown parsing timeout exceeded. The markdown may be malformed or too complex.',
      );
    }
  };

  // Validate font size to prevent edge cases (division by zero, out of range)
  const validatedFontSize = validateFontSize(defaultFontSize);
  const codeFontSize = calculateCodeFontSize(validatedFontSize);
  const paragraphs: InstanceType<typeof ParagraphType>[] = [];
  let currentTextRuns: InstanceType<typeof TextRunType>[] = [];

  // Stack-based state management for nested formatting
  const stateStack: TextFormattingState[] = [{ bold: false, italic: false, code: false }];

  const getCurrentState = (): TextFormattingState => {
    return stateStack[stateStack.length - 1];
  };

  const pushState = (changes: Partial<TextFormattingState>) => {
    const current = getCurrentState();
    stateStack.push({ ...current, ...changes });
  };

  const popState = () => {
    if (stateStack.length > 1) {
      stateStack.pop();
    }
  };

  for (const token of tokens) {
    // Check timeout periodically to prevent infinite loops
    checkTimeout();

    switch (token.type) {
      case 'paragraph_open':
      case 'heading_open':
        // Reset for new paragraph
        currentTextRuns = [];
        break;

      case 'paragraph_close':
      case 'heading_close':
        // Create paragraph from accumulated text runs
        if (currentTextRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: currentTextRuns,
            }),
          );
          currentTextRuns = [];
        }
        // Reset state stack to base
        stateStack.length = 1;
        break;

      case 'inline':
        // Process inline tokens (text with formatting)
        if (token.children) {
          for (const child of token.children) {
            processInlineToken(child, currentTextRuns, TextRun, validatedFontSize, codeFontSize, {
              getCurrentState,
              pushState,
              popState,
            });
          }
        }
        break;

      case 'bullet_list_open':
      case 'ordered_list_open':
        // TODO: Handle lists properly in future enhancement
        break;

      case 'code_block':
      case 'fence':
        // Handle code blocks
        if (token.content) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: token.content,
                  font: 'Courier New',
                  size: codeFontSize, // Dynamic code font size based on body text
                }),
              ],
            }),
          );
        }
        break;

      default:
        // Ignore other token types for now
        break;
    }
  }

  return paragraphs;
}

/**
 * Process individual inline token (text, strong, em, code, etc.)
 */
function processInlineToken(
  token: MarkdownToken,
  textRuns: InstanceType<typeof TextRunType>[],
  TextRun: typeof TextRunType,
  defaultFontSize: number,
  codeFontSize: number,
  state: {
    getCurrentState: () => TextFormattingState;
    pushState: (changes: Partial<TextFormattingState>) => void;
    popState: () => void;
  },
): void {
  const { getCurrentState, pushState, popState } = state;

  switch (token.type) {
    case 'text':
      // Create text run with current formatting state
      if (token.content) {
        const currentState = getCurrentState();
        textRuns.push(
          new TextRun({
            text: token.content,
            bold: currentState.bold,
            italics: currentState.italic,
            font: currentState.code ? 'Courier New' : undefined,
            size: defaultFontSize, // Use provided font size
          }),
        );
      }
      break;

    case 'strong_open':
      pushState({ bold: true });
      break;

    case 'strong_close':
      popState();
      break;

    case 'em_open':
      pushState({ italic: true });
      break;

    case 'em_close':
      popState();
      break;

    case 'code_inline':
      // Inline code
      if (token.content) {
        textRuns.push(
          new TextRun({
            text: token.content,
            font: 'Courier New',
            size: codeFontSize, // Dynamic code font size based on body text
          }),
        );
      }
      break;

    case 'softbreak':
    case 'hardbreak':
      // Add space for line breaks
      textRuns.push(new TextRun({ text: ' ' }));
      break;

    default:
      // Process children if present
      if (token.children) {
        for (const child of token.children) {
          processInlineToken(child, textRuns, TextRun, defaultFontSize, codeFontSize, state);
        }
      }
      break;
  }
}
