/**
 * Type definitions for DOCX library
 * These provide proper typing for dynamically imported DOCX module
 */

import type {
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  PageBreak,
} from 'docx';

/**
 * Represents the dynamically imported DOCX module
 * Provides type safety for dynamic imports
 */
export interface DocxModule {
  Document: typeof import('docx').Document;
  Packer: typeof import('docx').Packer;
  Paragraph: typeof Paragraph;
  TextRun: typeof TextRun;
  HeadingLevel: typeof HeadingLevel;
  AlignmentType: typeof AlignmentType;
  Table: typeof Table;
  TableCell: typeof TableCell;
  TableRow: typeof TableRow;
  WidthType: typeof WidthType;
  PageBreak: typeof PageBreak;
}

/**
 * Markdown token from markdown-it parser
 */
export interface MarkdownToken {
  type: string;
  tag?: string;
  content?: string;
  children?: MarkdownToken[];
  level?: number;
  markup?: string;
  info?: string;
  meta?: unknown;
  block?: boolean;
  hidden?: boolean;
  nesting?: number;
}

/**
 * Formatting state for markdown text runs
 */
export interface TextFormattingState {
  bold: boolean;
  italic: boolean;
  code: boolean;
}

/**
 * Result of importing DOCX module
 */
export type DocxImportResult = typeof import('docx');
