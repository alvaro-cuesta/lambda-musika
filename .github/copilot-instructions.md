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

- **Development**: `npm run dev` → Starts Vite dev server on `http://localhost:5175/` (NOT port 8888 despite README)
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

## Common Issues & Workarounds

### Known Technical Debt:

- **Audio API Migration Needed**: Currently uses deprecated `ScriptProcessorNode`, needs migration to `AudioWorkletNode`
- **Large Bundle Size**: Vendor chunk ~914KB triggers Vite warnings (expected behavior)
- **Port Confusion**: README mentions localhost:8888 but dev server uses 5175+

### Development Gotchas:

1. **TypeScript Type Complexity**: Complex exclude patterns in `tsconfig.app.json` for test files
2. **ESLint Performance**: Takes ~7 seconds due to strict TypeScript checking
3. **Build Timing**: Full build takes 14+ seconds due to TypeScript compilation + Vite bundling
4. **Audio Context**: Web Audio requires user interaction - player won't start without user gesture

### Error Patterns:

- **Compilation Errors**: Check `src/lib/compile.ts` for how user script errors are parsed and displayed
- **Audio Issues**: Usually related to ScriptProcessorNode deprecation warnings
- **Import Issues**: Check file extensions (.js) in imports due to ES modules

## Validation Steps

### Before Committing:

1. `npm run lint` (must pass - CI requirement)
2. `npm test` (must pass - CI requirement)
3. `npm run build` (should complete without errors)

### Testing Changes:

1. **Start dev server**: `npm run dev` and verify at `http://localhost:5175/`
2. **Test audio functionality**: Create/modify .musika script in examples
3. **Verify compilation**: Check error handling in script editor
4. **Cross-browser**: Test in Chrome/Firefox (Web Audio API differences)

## Quick Reference

**File Extensions**: Use `.js` in import statements (ES modules requirement)  
**Code Style**: Prettier with single quotes, 2-space indents  
**Testing**: Vitest globals enabled, no explicit imports needed  
**Dependencies**: Managed via npm, use `npm ci` for reproducible installs  
**Audio Scripts**: JavaScript functions returning `(t) => [left, right]` samples

Trust these instructions and only search the codebase if information here is incomplete or incorrect.
