# Lambda Musika Coding Agent Instructions

Lambda Musika is a browser-based JavaScript Digital Audio Workstation (DAW) that uses functional programming paradigms for real-time audio synthesis and processing. This guide helps coding agents work efficiently with the codebase.

## Repository Overview

**Purpose**: Web-based DAW with JavaScript scripting language for audio synthesis  
**Size**: Medium (~39 TypeScript files, ~510 npm packages)  
**Tech Stack**: TypeScript + React 19.1.1 + Vite 7.1.4 + Vitest + Web Audio API  
**Target Runtime**: Modern browsers supporting Web Audio API  
**Node Version**: v22.18.0 (see `.nvmrc`)

## Build Instructions

**ALWAYS run `npm ci` first when starting work** - installs dependencies (~6 seconds).

### Core Commands (in order of frequency):

- **Development**: `npm run dev` → Starts Vite dev server on `http://localhost:5173/`
- **Lint**: `npm run lint` → Runs all 5 linters (~10 seconds total)
- **Test**: `npm test` → Runs Vitest with type checking (~1 second)
- **Build**: `npm run build` → TypeScript compilation + Vite build (~14 seconds)

### Individual Lint Commands:

- `npm run lint:tsc` → TypeScript compilation check (~3 seconds)
- `npm run lint:eslint` → ESLint validation (~7 seconds)
- `npm run lint:prettier` → Code formatting check (fast)
- `npm run lint:knip` → Dependency analysis (fast)
- `npm run lint:madge` → Circular dependency detection (fast)

### Build Requirements:

1. **Must pass all lints before building** - CI enforces this
2. **TypeScript compilation happens first** in build process
3. **Build outputs large vendor chunk** (~914KB) - expected behavior
4. **Source maps included** even in production builds

### Environment Setup:

- Uses **exact Node.js version** specified in `.nvmrc` (v22.18.0)
- **npm ci** (not npm install) for reproducible builds
- **No additional global dependencies** required

## Project Architecture

### Directory Structure:

```
src/
├── main.tsx                 # Entry point
├── components/              # React UI components
│   ├── App.tsx             # Main application container
│   ├── Editor.tsx          # ACE code editor wrapper
│   ├── Player/             # Audio player controls
│   └── BottomBar/          # Status and controls
├── lib/                    # Core libraries
│   ├── Musika/             # DSP library (Generator, Filter, Envelope, etc.)
│   ├── compile.ts          # Script compilation & error handling
│   ├── PCM.ts              # Audio data processing
│   └── ScriptProcessorPlayer.ts  # Audio playback (legacy Web Audio)
├── examples/               # Example .musika scripts
├── utils/                  # Utility functions
├── hooks/                  # React hooks
└── styles/                 # SCSS stylesheets
```

### Key Components:

- **Script Compilation**: `src/lib/compile.ts` - Parses user JS code, handles errors with line numbers
- **Audio Engine**: `src/lib/ScriptProcessorPlayer.ts` - **LEGACY**: Uses deprecated ScriptProcessorNode (TODO: migrate to AudioWorkletNode)
- **DSP Library**: `src/lib/Musika/` - Audio processing functions available to user scripts
- **Code Editor**: ACE editor in `src/components/Editor.tsx` with custom JavaScript validation

### Configuration Files:

- **TypeScript**: `tsconfig.json` (composite project), `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.test.json`
- **ESLint**: `eslint.config.js` with strict TypeScript rules
- **Vite**: `vite.config.ts` with React, image optimization, minification plugins
- **Testing**: Uses Vitest with globals and typecheck enabled
- **Code Quality**: Knip for dependency analysis, Madge for circular deps

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint Jobs** (parallel): TypeScript, ESLint, Prettier, Knip, Madge
2. **Build Job** (depends on lint): TypeScript + Vite build, uploads to GitHub Pages
3. **Deploy Job** (main branch only): Deploys to GitHub Pages

**Critical**: All lints must pass before build runs. Individual lint failures will fail the entire CI.

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

- **Audio API Migration Needed**: Currently uses deprecated `ScriptProcessorNode`, needs migration to `AudioWorkletNode`
- **Large Bundle Size**: Vendor chunk ~914KB triggers Vite warnings (expected behavior)
- **Additional Technical Debt**: See `TODO.md` for comprehensive list of planned improvements, bug fixes, and future work that may shape development approaches

### Development Gotchas:

1. **ESLint Performance**: Takes ~7 seconds due to strict TypeScript checking
2. **Build Timing**: Full build takes 14+ seconds due to TypeScript compilation + Vite bundling
3. **Audio Context**: Web Audio requires user interaction - player won't start without user gesture

### Error Patterns:

- **Compilation Errors**: Check `src/lib/compile.ts` for how user script errors are parsed and displayed
- **Import Issues**: Check file extensions (.js) in imports due to ES modules

## Validation Steps

### Before Committing:

1. `npm run lint` (must pass - CI requirement)
2. `npm test` (must pass - CI requirement)
3. `npm run build` (should complete without errors)

### Testing Changes:

1. **Start dev server**: `npm run dev` and verify at `http://localhost:5173/`
2. **Test audio functionality**: Create/modify .musika script in examples
3. **Verify compilation**: Check error handling in script editor
4. **Cross-browser**: Test in Chrome/Firefox (Web Audio API differences)

### Testing Requirements for Development:

**When developing new features:**

1. **Tests MUST be added** that ensure the new feature works correctly
2. **Tests MUST also be added** for related existing code to verify it continues working as expected and to enhance understanding of the codebase

**When working on existing code:**

- Add tests for the existing functionality you're modifying to ensure no regressions
- This helps document expected behavior and catch future issues

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
**Dependencies**: Managed via npm, use `npm ci` for reproducible installs  
**Audio Scripts**: JavaScript functions returning `(t) => [left, right]` samples

## About These Instructions

These instructions provide high-level context and serve as a quick reference for working with Lambda Musika. However, you are **strongly encouraged** to explore the codebase yourself to:

- Gain deeper understanding of the project structure and implementation details
- Verify that these instructions align with the current state of the project
- Discover additional nuances not covered in this guide
- Improve these instructions if you find anything lacking, outdated, or contradicting the actual codebase

The goal is to give you a solid starting point while empowering you to become familiar with the project through direct exploration.
