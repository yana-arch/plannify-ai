# Developer Guide

This document provides essential information for AI agents and developers working on the Plannify AI codebase.

## 1. Environment & Commands

### Build & Run

- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev` (Runs on `http://localhost:3000`)
- **Build for Production:** `npm run build` (Output in `dist/`)
- **Preview Build:** `npm run preview`
- **Type Check:** `npx tsc --noEmit`

### Testing (Jest + React Testing Library)

- **Run All Tests:** `npm test`
- **Run a Single Test:** `npm test -t "test name pattern"`
  - _Example:_ `npm test -t "renders dashboard"`
- **Run Tests in Watch Mode:** `npm run test:watch`
- **Run with Coverage:** `npm run test:coverage`

### Linting

- **Type Checking:** Run `npx tsc --noEmit` to verify type safety.
- **Formatting:** Adhere to existing code style (2 spaces indentation, single quotes).

## 2. Project Structure

- **Framework:** React 19 + Vite + TypeScript.
- **Styling:** Tailwind CSS (v4).
- **State Management:** React Context (`ProjectContext`, `SettingsContext`).
- **Source Root:** `src/` is the source of truth.
  - **Components:** `src/components/` (Functional components).
  - **Contexts:** `src/contexts/` (or root `src/` for older contexts like `ProjectContext`).
  - **Services:** `src/services/` (API logic, e.g., `geminiService`).
  - **Types:** `src/types/` or `src/types.ts`.
- **Entry Point:** `src/main.tsx`.
- **Note:** Ignore root-level `components/` and `contexts/` directories if they duplicate `src/` content; prefer `src/`.

## 3. Code Style Guidelines

### General

- **Indentation:** 2 spaces.
- **Quotes:** Single quotes (`'`) for string literals and imports.
- **Semicolons:** Always use semicolons.
- **Trailing Commas:** ES5 trailing commas where appropriate.

### Naming Conventions

- **Components/Files:** PascalCase (e.g., `NewProjectWizard.tsx`, `App.tsx`).
- **Functions/Variables:** camelCase (e.g., `handleGeneratePlan`, `isLoading`).
- **Interfaces/Types:** PascalCase (e.g., `ProjectInputData`, `Screen`).
- **Constants:** UPPER_SNAKE_CASE (if global/static).

### TypeScript

- **Strictness:** Avoid `any`. Define interfaces/types for props and state.
- **Props:** Use `interface` for component props (e.g., `interface Props { ... }`).
- **Components:** `React.FC` is used (e.g., `const App: React.FC = () => ...`).

### Component Structure

- **Functional Components:** Use functional components with hooks.
- **Lazy Loading:** Use `React.lazy` and `Suspense` for route-level or heavy components.
- **Imports:**
  1. React and external libraries.
  2. Internal components.
  3. Contexts/Services.
  4. Types/Utils.
  5. Styles/Icons.

### Error Handling

- Use `try/catch` blocks for async operations (especially API calls).
- UI errors should be caught by `ErrorBoundary` components.
- Display user-friendly error messages (e.g., using `error` state).

### Styling (Tailwind CSS)

- Use utility classes directly in `className`.
- Group related classes (layout, spacing, typography, colors).
- Use `brand-*` custom colors defined in `tailwind.config.ts` (e.g., `bg-brand-bg`, `text-brand-primary`).

## 4. Testing Guidelines

- **File Location:** Co-located `__tests__` folders or `*.test.tsx` files.
- **Library:** `@testing-library/react`.
- **Pattern:**
  - Render the component.
  - Mock necessary contexts/providers.
  - Interact with elements using `userEvent` or `fireEvent`.
  - Assertions using `expect(...).toBeInTheDocument()`, etc.
- **Mocks:** Use `jest.mock` for external services or heavy components.

## 5. AI Rules (Implicit)

- **Modify Existing Code:** thorough analysis first; do not break existing functionality.
- **Dependencies:** Do not add new npm packages unless absolutely necessary and requested.
- **Refactoring:** Maintain existing patterns; do not rewrite working code into a different style/paradigm without reason.
