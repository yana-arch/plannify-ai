---
title: 'Customize DOCX Export - Section Management & Formatting'
slug: 'docx-export-customization'
created: '2026-02-06T06:43:53+07:00'
status: 'in-progress'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  [
    'React 19.2',
    'TypeScript 5.8',
    'Vite 6',
    'docx ^8.5.0',
    'markdown-it ^14.1.0',
    '@dnd-kit (to install)',
    'Jest 30',
    '@testing-library/react 16',
    'Tailwind CSS 4',
  ]
files_to_modify: [
    # Components (7 files)
    'src/components/ReportBuilder/ReportBuilderModal.tsx',
    'src/components/ReportBuilder/SectionEditor.tsx',
    'src/components/ReportBuilder/FormattingPanel.tsx',
    'src/components/ReportBuilder/FontStyleEditor.tsx',
    'src/components/ReportBuilder/HeadingStyleEditor.tsx',
    'src/components/ReportBuilder/ReportPreview.tsx',
    'src/components/NewProjectWizard.tsx', # Added - documentation fix
    # Services (2 files)
    'src/services/docxService.ts',
    'src/services/markdownParser.ts',
    # Types (2 files)
    'src/types/report.ts',
    'src/types/docx.ts',
    # NEW Utilities (3 files)
    'src/utils/fontSizeContext.ts',
    'src/utils/formattingValidation.ts',
    'src/utils/sectionConfigStorage.ts',
    # NEW Constants (1 file)
    'src/constants/sectionTemplates.ts',
    # NEW Components (3 files)
    'src/components/ReportBuilder/SortableSectionItem.tsx',
    'src/components/ReportBuilder/AddSectionModal.tsx',
    'src/components/ReportBuilder/ConfirmationModal.tsx', # Added for theme confirmation
    # NEW Tests (3 files)
    'src/services/__tests__/markdownParser.test.ts', # Added
    'src/utils/__tests__/fontSizeContext.test.ts',
    'src/utils/__tests__/sectionConfigStorage.test.ts',
  ]
code_patterns:
  [
    'React Functional Components with Hooks (useState, useEffect, useCallback)',
    'TypeScript strict mode with interface-first design',
    'Drag-and-Drop with @dnd-kit (SortableContext, useSortable, DragOverlay)',
    'localStorage persistence with error handling',
    'Service layer pattern (docxService for logic, components for UI)',
    'Preset-based theming with override support',
    'Debounced state updates for performance',
  ]
test_patterns:
  [
    'Jest 30 with @testing-library/react 16',
    '__tests__ folders co-located with source files',
    'setupTests.ts for global mocks (localStorage, IntersectionObserver, ResizeObserver)',
    'Unit tests for utilities (validation, storage)',
    'Component tests for UI behavior',
    'Manual DOCX export testing (open in Word to verify formatting)',
  ]
---

---

# Tech-Spec: Customize DOCX Export - Section Management & Formatting

**Created:** 2026-02-06T06:43:53+07:00

## Overview

### Problem Statement

The DOCX export feature lacks flexibility in section management and has formatting bugs:

1. **Section Management**: Users cannot reorder sections or add custom sections to match their specific report needs
2. **Formatting Bug**: Body text font size is hardcoded to 10pt (size: 20 half-points) in `markdownParser.ts` line 94 and 167, ignoring user's `documentFont.size` selection
3. **No Persistence**: Section configurations cannot be saved and reused across different projects

### Solution

Implement a comprehensive customization system with:

1. **Drag-and-drop** section reordering using @dnd-kit library
2. **Custom section creation** with template presets (Budget, Team Structure, Glossary, etc.)
3. **Configuration persistence** via localStorage for reusable section layouts
4. **Fix formatting application** to respect user's font size selections throughout the document

### Scope

**In Scope:**

- Drag-and-drop reordering of sections in ReportBuilderModal
- "Add Section" button with template presets and custom text sections
- Save/load section configurations to localStorage
- Fix body text font size bug in markdownParser.ts
- Add formatting validation with user feedback
- Test all formatting presets (modern, corporate, minimal)

**Out of Scope:**

- Advanced section templates with AI generation
- Multi-user shared section templates
- Export format other than DOCX (PDF, HTML)
- Section-level formatting overrides (keeping document-wide formatting)

## Context for Development

### Codebase Patterns

- React functional components with hooks (useState, useEffect)
- TypeScript strict mode with interface-first design
- Component composition pattern (ReportBuilderModal > SectionEditor > FormattingPanel)
- Service layer pattern (docxService.ts handles all export logic)
- Preset-based formatting system with override support

### Files to Reference

| File                                                   | Purpose                                               |
| ------------------------------------------------------ | ----------------------------------------------------- |
| `/src/components/ReportBuilder/ReportBuilderModal.tsx` | Main modal managing sections and formatting UI        |
| `/src/components/ReportBuilder/SectionEditor.tsx`      | Individual section content editor                     |
| `/src/components/ReportBuilder/FormattingPanel.tsx`    | Theme and formatting controls                         |
| `/src/services/docxService.ts`                         | DOCX generation and export logic                      |
| `/src/services/markdownParser.ts`                      | **BUG LOCATION**: Markdown to DOCX converter          |
| `/src/types/report.ts`                                 | Type definitions for ReportSection, FormattingOptions |
| `/src/presets/formatting.ts`                           | Theme presets and conversion utilities                |
| `/src/constants/docx.ts`                               | DOCX formatting constants                             |

### Technical Decisions

#### ADR-001: Drag-and-Drop Library Selection

**Context**: Need drag-and-drop for section reordering with React/TypeScript support.

**Options Considered**:

- `@dnd-kit`: Modern, accessible, 12KB bundle, TypeScript-first ✅ **SELECTED**
- `react-beautiful-dnd`: Deprecated, 50KB bundle, no active development ❌
- `react-dnd`: Complex API, larger bundle, overkill for simple list ❌
- Manual implementation: High effort, accessibility issues ❌

**Decision**: Use `@dnd-kit/core` and `@dnd-kit/sortable` with SortableContext for list reordering.

**Rationale**: Modern, lightweight, accessible by default, active maintenance. Previous removal likely due to scope cut, not technical issues.

**Accessibility Enhancement**: Add keyboard shortcuts (Ctrl+↑/↓) for non-mouse users.

#### ADR-002: Configuration Storage Strategy

**Options**:

- localStorage: 5-10MB, browser-only, no sync, low complexity ✅
- IndexedDB: 50MB+, browser-only, no sync, medium complexity
- Backend API: Unlimited, cross-device, yes sync, high complexity
- File export/import: Unlimited, manual sync, medium complexity

**Decision**: localStorage + JSON export/import functionality

**Rationale**: Simple for MVP, export/import mitigates cross-device limitation. Can migrate to backend later if needed.

**Trade-off Accepted**: Users must manually transfer configs between devices via export/import.

#### Other Technical Decisions

1. **Section Templates**: Provide 5-7 common business templates (Budget, Team, Glossary, References, Appendix, Methodology, Conclusion)
2. **Storage Schema**: Store as `reportSectionConfigs` in localStorage: `{ [configName: string]: ReportSection[] }`
3. **Font Size Strategy**: Create `FontSizeContext` utility for cascading font sizes:
   - Body text: User-selected `documentFont.size`
   - Code blocks: `documentFont.size - 4` (proportional, always smaller)
   - Tables: Inherit body unless `tableHeaderStyle` overrides
   - Headings: Use `formatting.headings.*.size` (independent)
4. **Section ID Generation**: Use `crypto.randomUUID()` instead of `Date.now()` to prevent duplicate IDs
5. **Drag Handle UX**: Notion-style drag handle visible on hover, positioned left of section name
6. **Validation**: Use existing `FORMATTING_LIMITS` from constants/docx.ts, add proactive validation while typing

## Implementation Plan

### Tasks

1. **Fix Formatting Bug (CRITICAL FIRST)**
   - [ ] Create `utils/fontSizeContext.ts` utility for cascading font size calculations
   - [ ] Add `calculateCodeFontSize(baseFontSize)` function: returns `Math.max(16, baseFontSize - 4)`
   - [ ] Update `markdownParser.ts` line 94: Use `calculateCodeFontSize(defaultFontSize)` instead of `size: 20`
   - [ ] Update `markdownParser.ts` line 167: Use `calculateCodeFontSize(defaultFontSize)` instead of `size: 20`
   - [ ] Add validation: `defaultFontSize = Math.max(8, Math.min(72, defaultFontSize))` to prevent division by zero
   - [ ] Add markdown parser timeout (5s) to prevent infinite loops on malformed markdown
   - [ ] Test matrix: body (8pt, 12pt, 16pt) × code blocks × headings × tables to verify cascade

2. **Add Drag-and-Drop Section Reordering**
   - [ ] Install @dnd-kit dependencies: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
   - [ ] Add browser compatibility check for @dnd-kit, show warning if unsupported
   - [ ] Update `ReportBuilderModal.tsx`: Import DndContext, SortableContext, useSortable, DragOverlay
   - [ ] Wrap sections list with DndContext and SortableContext
   - [ ] Create SortableSectionItem component with Notion-style drag handle (visible on hover)
   - [ ] Implement handleDragEnd to update sections order in state
   - [ ] Add DragOverlay for live preview during drag
   - [ ] Debounce localStorage writes (500ms) to prevent race conditions during drag
   - [ ] Add keyboard shortcuts: Ctrl/Cmd+↑ (move up), Ctrl/Cmd+↓ (move down) for accessibility
   - [ ] Add touch event polyfill for mobile drag support (test on iOS/Android)

3. **Create Section Template System**
   - [ ] Add `SECTION_TEMPLATES` constant in new file `constants/sectionTemplates.ts`
   - [ ] Templates: Budget, Team Structure, Glossary, References, Appendix, Methodology, Conclusion
   - [ ] Add "Add Section" button below sections list in ReportBuilderModal
   - [ ] Create AddSectionModal with template selection and custom name input
   - [ ] Generate unique IDs for new sections (e.g., `custom-${Date.now()}`)

4. **Implement Configuration Persistence**
   - [ ] Create `utils/sectionConfigStorage.ts` with functions: saveConfig, loadConfig, listConfigs, deleteConfig, exportToJSON, importFromJSON
   - [ ] Add "Save Configuration" button in ReportBuilderModal header
   - [ ] Create SaveConfigModal for naming configurations
   - [ ] Add "Load Configuration" dropdown in ReportBuilderModal
   - [ ] Display saved config names, allow selection to load
   - [ ] Add "Export" button to download configs as JSON file (mitigates localStorage cross-device limitation)
   - [ ] Add "Import" button to upload JSON file with configs
   - [ ] Wrap localStorage operations in try-catch for QuotaExceededError
   - [ ] Show error dialog with cleanup options if localStorage is full
   - [ ] Wrap JSON.parse in try-catch for corrupted data, fallback to default sections
   - [ ] Add confirmation dialog when switching themes: "Switching theme will reset custom formatting. Continue?"

5. **Add Formatting Validation**
   - [ ] Create `utils/formattingValidation.ts` with validation functions
   - [ ] Add validateFontSize: clamp to 8-72pt using FORMATTING_LIMITS
   - [ ] Add validateMargin: clamp to 0.25-3 inches using FORMATTING_LIMITS
   - [ ] Update FormattingPanel to show validation errors proactively (while typing, not just on blur)
   - [ ] Add error messages below inputs when validation fails
   - [ ] Add warning indicators (⚠️) for values near limits
   - [ ] Pre-export validation: check all font sizes and margins before generating DOCX

6. **Testing & Verification**
   - [ ] Test drag-and-drop with 3+ sections (desktop + mobile touch)
   - [ ] Test keyboard shortcuts (Ctrl+↑/↓) for section reordering
   - [ ] Test adding custom sections and template sections
   - [ ] Test save/load configurations across browser sessions
   - [ ] Test export/import JSON with 50+ configs to verify performance
   - [ ] Test QuotaExceededError handling by filling localStorage
   - [ ] Export DOCX with all 3 presets and verify font sizes correct (body/code/heading/table)
   - [ ] Test font size cascade: body=12pt → code=10pt, body=16pt → code=12pt
   - [ ] Test malformed markdown with parser timeout
   - [ ] Test browser compatibility (Chrome, Firefox, Safari - latest and -2 versions)
   - [ ] Test edge cases: empty sections, section names with special characters (/, \, :), concurrent localStorage writes
   - [ ] Load testing: 100 sections, 50 saved configs, verify modal opens in <3s

### Acceptance Criteria

**Given** a user is in the Custom Export Builder modal,  
**When** they drag a section to a new position,  
**Then** the section order updates immediately in the UI and preview, and exports in the new order.

**Given** a user clicks "Add Section" button,  
**When** they select a template or create custom section,  
**Then** the new section appears at the bottom of the sections list with a unique ID.

**Given** a user has customized section order and added sections,  
**When** they click "Save Configuration" and provide a name,  
**Then** the configuration is saved to localStorage and appears in the "Load Configuration" dropdown.

**Given** a user selects a saved configuration from the dropdown,  
**When** they confirm loading,  
**Then** all sections (including custom ones) are restored with the same order and content.

**Given** a user sets body text font size to 14pt in Formatting panel,  
**When** they export the DOCX,  
**Then** all body text (not in code blocks) displays at 14pt, not 10pt.

**Given** a user enters an invalid margin (e.g., -1 or 5 inches),  
**When** the input loses focus,  
**Then** an error message appears and the value is clamped to valid range (0.25-3 inches).

## Additional Context

### Dependencies

- `@dnd-kit/core`: ^6.0.0 (to be installed)
- `@dnd-kit/sortable`: ^7.0.0 (to be installed)
- `@dnd-kit/utilities`: ^3.2.0 (to be installed)
- Existing: `docx`, `markdown-it`, `react`, `typescript`

### Testing Strategy

**Manual Testing:**

1. Open Custom Export Builder with existing project
2. Drag sections to reorder, verify preview updates
3. Add 2-3 custom sections with different templates
4. Save configuration as "My Report Template"
5. Reload page, load saved configuration, verify sections restored
6. Change body font size to 16pt, export DOCX, open in Word and verify font size
7. Test validation by entering invalid margins (negative, >3), verify error messages

**Edge Cases:**

- Empty section content
- Section names with special characters (/, \, :)
- Loading configuration when current has unsaved changes
- Deleting built-in sections vs custom sections

### Failure Mode Analysis

Component-by-component failure analysis with mitigations built into Implementation Plan:

| Component             | Failure Mode                                | Impact                       | Mitigation (Task #)                        |
| --------------------- | ------------------------------------------- | ---------------------------- | ------------------------------------------ |
| @dnd-kit integration  | Drag events don't fire on touch devices     | Mobile users can't reorder   | Touch polyfill + mobile testing (Task 2)   |
| localStorage save     | QuotaExceededError when saving 100+ configs | User loses current work      | Try-catch + cleanup dialog (Task 4)        |
| Font size calculation | Division by zero if `defaultFontSize = 0`   | App crash during export      | Validation: `Math.max(8, size)` (Task 1)   |
| Section ID generation | Duplicate IDs if concurrent additions       | Section overwrites another   | Use `crypto.randomUUID()` (Task 3)         |
| Markdown parser       | Malformed markdown causes infinite loop     | Browser hangs                | Parser timeout (5s) (Task 1)               |
| Config loading        | Corrupted JSON in localStorage              | Modal won't open             | Try-catch + fallback to defaults (Task 4)  |
| Drag preview          | Preview doesn't match actual order          | User drops in wrong position | Use DragOverlay with live preview (Task 2) |
| Theme switching       | Switching loses custom formatting changes   | User frustration             | Confirmation dialog (Task 4)               |

### Pre-mortem Risk Scenarios

**Scenario: Feature Rollback (6 months from launch)**

Imagined failure: "DOCX export customization was rolled back after 2 weeks due to data loss and complaints."

**Root Causes → Mitigations:**

1. **localStorage Data Loss**: Users cleared browser data, lost configs
   - **Fixed in Task 4**: Export/import JSON functionality + warning about localStorage limits

2. **Drag-Drop State Corruption**: Race condition during auto-save duplicated sections
   - **Fixed in Task 2**: Debounce localStorage writes (500ms)

3. **Font Size Cascade Bug**: Fix created NEW bug where headings inherit body size
   - **Fixed in Task 1 + 6**: Comprehensive test matrix (body × code × headings × tables)

4. **Browser Incompatibility**: @dnd-kit didn't work on older Safari (15% of users)
   - **Fixed in Task 2**: Compatibility check + warning message

5. **Performance Degradation**: 50+ configs caused 3-second lag on modal open
   - **Fixed in Task 6**: Load testing requirement (100 sections, 50 configs, <3s)

### Notes

**Key Bug Root Cause:**  
In `markdownParser.ts`, the hardcoded values `size: 20` (10pt) are used for:

- Line 94: Code blocks
- Line 167: Inline code

While line 138 correctly uses `defaultFontSize` for regular text, the code blocks override this. This creates inconsistency where user-selected font size only applies to non-code text.

**Decision: Code vs Body Text Sizes**

- Regular body text: Use `defaultFontSize` from user selection ✅
- Code blocks/inline code: Consider using a proportional size like `defaultFontSize - 4` (e.g., if body is 24/12pt, code is 20/10pt) OR make code size a separate formatting option. **Recommend:** Use proportional for now.
