# Lambda Musika Coding Agent Instructions

Lambda Musika is a browser-based JavaScript Digital Audio Workstation (DAW) that uses functional programming paradigms for real-time audio synthesis and processing. This guide helps coding agents work efficiently with the codebase.

## Repository Overview

**Purpose**: Web-based DAW with JavaScript scripting language for audio synthesis
**Size**: Medium monorepo (3 workspace packages)
**Tech Stack**: TypeScript + React 19 + Vite 7 + Vitest + Web Audio API
**Target Runtime**: Modern browsers supporting Web Audio API
**Node Version**: v25.8.0 (see `.nvmrc`)

## Build Instructions

**ALWAYS run `pnpm install --frozen-lockfile` first when starting work**.

### Core Commands (in order of frequency):

- **Development**: `pnpm -F @lambda-musika/app dev` → Starts Vite dev server on `http://localhost:5173/`
- **Lint (workspace)**: `pnpm lint` → Runs workspace/package lint scripts via filters
- **Test (workspace)**: `pnpm test` → Runs package tests (`app`, `audio`, `musika`)
- **Test (non-watch / CI-style)**: `pnpm test --run` → Runs tests once and exits (preferred for coding agents/LLMs)
- **Build (app)**: `pnpm -F @lambda-musika/app build` → Vite build + TypeScript build for app package

### Individual Lint Commands:

- `pnpm -F @lambda-musika/app lint:tsc` → TypeScript compilation check (app)
- `pnpm -F @lambda-musika/audio lint:tsc` → TypeScript compilation check (audio)
- `pnpm -F @lambda-musika/musika lint:tsc` → TypeScript compilation check (musika)
- `pnpm lint:eslint` → ESLint validation (workspace)
- `pnpm lint:prettier` → Code formatting check (workspace)
- `pnpm lint:knip` → Dependency analysis (workspace)
- `pnpm lint:madge` → Circular dependency detection (workspace)

### Build Requirements:

1. **Must pass all lints before building** - CI enforces this
2. **App build currently runs Vite first, then TypeScript build** (`vite build && tsc -b`)
3. **Build outputs large vendor chunk** (~914KB) - expected behavior
4. **Source maps included** even in production builds

### Environment Setup:

- Uses **exact Node.js version** specified in `.nvmrc` (v25.8.0)
- Use **pnpm** via Corepack, then `pnpm install --frozen-lockfile`
- **No additional global dependencies** required

## Project Architecture

### Directory Structure:

```
packages/
├── app/
│   ├── src/
│   │   ├── main.tsx       # Entry point
│   │   ├── components/    # React UI components
│   │   ├── lib/           # App runtime (compile, ScriptPlayer, PCM)
│   │   ├── examples/      # Example .musika scripts
│   │   ├── hooks/         # React hooks
│   │   └── utils/         # Utility functions
│   └── vite.config.ts
├── audio/                 # Shared audio constants/types
└── musika/                # DSP library (Generator, Filter, Envelope, etc.)
```

### Key Components:

- **Script Compilation**: `packages/app/src/lib/compile.ts` - Parses user JS code, handles errors with line numbers
- **Audio Engine**: `packages/app/src/lib/ScriptPlayer/` - Plays compiled Musika scripts using Web Audio API
- **DSP Library**: `packages/musika/src/Musika/` - Audio processing functions available to user scripts
- **Code Editor**: ACE editor in `packages/app/src/components/Editor.tsx` with custom JavaScript validation

### Configuration Files:

- **TypeScript**: root project references (`tsconfig.json`) + shared bases (`tsconfig.base*.json`) + package-local `tsconfig*.json`
- **pnpm Workspace**: `pnpm-workspace.yaml` defines packages and shared dependency catalog versions
- **ESLint**: `eslint.config.js` with strict TypeScript rules
- **Vite**: `packages/app/vite.config.ts` with React, image optimization, minification plugins
- **Testing**: Uses Vitest with globals and typecheck enabled per package
- **Code Quality**: Knip for dependency analysis, Madge for circular deps

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint Jobs** (matrix): package TypeScript lints (`app`, `audio`, `musika`) + workspace ESLint/Prettier/Knip/Madge
2. **Test Jobs** (matrix): package tests (`app`, `audio`, `musika`)
3. **Build Job**: builds `@lambda-musika/app` and uploads `packages/app/build/` to Pages artifact
4. **Deploy Job** (main branch only): deploys only after lint + test + build jobs pass

**Critical**: Lint, test, and build jobs must all pass for deployment. Individual lint failures will fail the overall CI.

**Current caveat**: CI intentionally skips `@lambda-musika/app` `lint:tsc` because generated `.module.scss.d.ts` files are required for that check and are not committed.

### Lint Rules Policy:

**Lint rules must NOT be disabled** except as a last resort when absolutely necessary. This includes:

- Local file-level disable comments (e.g., `/* eslint-disable */`)
- Line-level disable comments (e.g., `// eslint-disable-next-line`)
- Global configuration changes

**When disabling is necessary:**

- Must include detailed comment explaining WHY the rule needs to be disabled
- Must explain why there was no other way to fix the issue
- Example: TypeScript `!` null assertions might be acceptable when you know the assertion is safe but TypeScript's automatic checks cannot determine this - but always explain why the assertion is safe

## Common Issues & Workarounds

### Known Technical Debt:

- **Large Bundle Size**: Vendor chunk ~914KB triggers Vite warnings (expected behavior)
- **Additional Technical Debt**: See `TODO.md` for comprehensive list of planned improvements, bug fixes, and future work that may shape development approaches

### Development Gotchas:

1. **ESLint Performance**: Takes ~7 seconds due to strict TypeScript checking
2. **Build Timing**: Full build takes 14+ seconds due to TypeScript compilation + Vite bundling
3. **Audio Context**: Web Audio requires user interaction - player won't start without user gesture
4. **Workspace Commands**: Most package-specific tasks must be run with pnpm filters (e.g., `pnpm -F @lambda-musika/app ...`)
5. **Vitest Watch Mode**: Use `--run` (for example `pnpm test --run` or `pnpm -F @lambda-musika/app test --run`) in LLM/automation flows so tests exit instead of waiting in watch mode
6. **Quick TS snippets**: For brief ad-hoc checks, use Node directly and do not use `tsx` or `--experimental-strip-types`.
   - `node --input-type=module -e` is allowed for quick eval snippets with no inline TS type annotations; it can still import from `.ts` modules.
   - If the snippet itself includes TypeScript syntax (for example `const x: number = 1`), write and run an actual `.ts` file with `node path/to/file.ts`.

### Error Patterns:

- **Compilation Errors**: Check `packages/app/src/lib/compile.ts` for how user script errors are parsed and displayed
- **Import Issues**: Check file extensions (.js) in imports due to ES modules

## Validation Steps

### Before Committing:

1. `pnpm lint` (must pass - CI requirement)
2. `pnpm test --run` (must pass - CI requirement, and ensures non-watch execution)
3. `pnpm -F @lambda-musika/app build` (should complete without errors)

### Testing Changes:

1. **Start dev server**: `pnpm -F @lambda-musika/app dev` and verify at `http://localhost:5173/`
2. **Test audio functionality**: Create/modify `.musika` script in `packages/app/src/examples`
3. **Verify compilation**: Check error handling in script editor
4. **Cross-browser**: Test in Chrome/Firefox (Web Audio API differences)

### Testing Requirements for Development:

**When developing new features:**

1. **Tests MUST be added** that ensure the new feature works correctly
2. **Tests MUST also be added** for related existing code to verify it continues working as expected and to enhance understanding of the codebase

**When working on existing code:**

- Add tests for the existing functionality you're modifying to ensure no regressions
- This helps document expected behavior and catch future issues

**Execution mode for coding agents/LLMs:**

- Run tests with `--run` first (targeted package tests where possible, then broader workspace tests)
- Avoid plain `pnpm test` in automation contexts because Vitest may stay in watch mode and never exit

## Change Impact Checklist

When making repository-level changes, update all related instructions and configuration in the same task.

- **Instruction updates are mandatory**: If a change affects setup, workflow, architecture, commands, project structure, package layout, or key file locations, update this `.github/copilot-instructions.md` file immediately.
- **Root config updates are mandatory**: If a change affects workspace/package orchestration, update root `package.json` scripts/config in the same PR/task. Example: adding a package may require updating scripts such as `lint:madge`, `lint`, `test`, or other workspace checks.
- **CI updates are mandatory**: If a change affects lint/test/build/deploy scope, package matrix entries, command names, or artifact paths, update the relevant workflows and actions under `.github/` in the same PR/task.
- **New package scaffolding**: New packages should be created by copying/adapting the skeleton of an existing package in `packages/` (matching `package.json`, tsconfig files, vitest config, and script conventions), then adjusting only what is package-specific.

## Refactoring and Code Quality

### Refactoring Workflow:

**Always include a post-step refactoring phase** after adding code:

1. **Review for repetition**: Look for duplicated logic, copy-pasted code, or similar patterns
2. **Identify clean code opportunities**: Consider readability, maintainability, and separation of concerns
3. **Apply the 3-repetition rule**: If something appears 3 times, consider extraction - but avoid over-abstraction
4. **Extract shared helpers**: Move duplicated utility functions to appropriate helper modules and import them

### Anti-Patterns to Avoid:

- **Over-abstraction**: Don't create giant functions with 2^n parameter combinations
- **Copy-paste programming**: If you copy code from another file, extract it to a shared module instead
- **Context loss**: Refactor immediately while context is fresh, not in later steps when details are forgotten
- **Premature optimization**: Focus on clean, readable code over micro-optimizations

### Abstraction Guidelines:

- **Balanced extraction**: Extract repeated code to helpers, but keep functions focused and composable
- **Prefer composition**: Build complex functionality by combining simple, pure functions
- **Maintain single responsibility**: Each function should have one clear purpose
- **Consider the call sites**: Ensure abstractions make the calling code cleaner, not more complex

## Coding and Architectural Style

Lambda Musika follows specific patterns that should be maintained:

### Functional Programming Emphasis:

- **Higher-order functions**: DSP functions return stateful functions (e.g., `Sin()` returns `(f, t) => signal`)
- **Closures for state**: Audio generators use closures to maintain phase/state over time
- **Pure functions**: Core audio processing functions are pure with no side effects
- **Function composition**: Complex behaviors built by composing simple functions

### TypeScript Patterns:

- **Strong typing**: Comprehensive type definitions with complex generics where beneficial
- **Discriminated unions**: Result types use tagged unions (e.g., `{type: 'error'} | {type: 'success'}`)
- **Utility types**: Advanced TypeScript features for type safety (see `Util.ts` for examples)
- **Null safety**: Careful null/undefined handling with explicit checks

### React Architecture:

- **Custom hooks**: Extract reusable stateful logic to custom hooks (`useInterval`, `useEditorCleanState`)
- **Ref forwarding**: Component communication through imperative refs when needed
- **CSS Modules**: Scoped styling with semantic class names
- **Controlled components**: Clear data flow with explicit state management
- **Package boundaries**: Keep app UI/runtime in `packages/app`, and reusable audio/DSP logic in `packages/audio` and `packages/musika`

### Error Handling:

- **Typed exceptions**: Structured error info with file/line details for debugging
- **Graceful degradation**: Continue operation when possible, fail safely when not
- **User-facing errors**: Parse and display compilation errors with context

### Module Organization:

- **Clear boundaries**: Separate UI (`components/`), logic (`lib/`), utilities (`utils/`), and hooks (`hooks/`)
- **Single responsibility**: Each module has a focused purpose
- **Minimal coupling**: Dependencies flow downward, avoid circular references

## Quick Reference

**File Extensions**: Use `.js` in import statements (ES modules requirement)
**Code Style**: Prettier with single quotes, 2-space indents
**Testing**: Vitest globals enabled, no explicit imports needed
**Dependencies**: Managed via pnpm workspace, use `pnpm install --frozen-lockfile`
**Audio Scripts**: JavaScript functions returning `(t) => [left, right]` samples

## About These Instructions

These instructions provide high-level context and serve as a quick reference for working with Lambda Musika. However, you are **strongly encouraged** to explore the codebase yourself to:

- Gain deeper understanding of the project structure and implementation details
- Verify that these instructions align with the current state of the project
- Discover additional nuances not covered in this guide
- Improve these instructions if you find anything lacking, outdated, or contradicting the actual codebase

The goal is to give you a solid starting point while empowering you to become familiar with the project through direct exploration.
