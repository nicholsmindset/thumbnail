# CLAUDE.md - AI Assistant Guide for ThumbGen AI

This document provides essential context for AI assistants working on the ThumbGen AI codebase.

## Project Overview

ThumbGen AI is a YouTube thumbnail generator that uses Google's Gemini API for AI-powered image generation, face-swapping, video creation, and CTR analysis. Built with React 19, TypeScript, and Vite.

## Quick Start Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)

# Quality checks
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Watch mode
npm run test:run     # Single run
npm run test:coverage # With coverage report

# Build
npm run build        # Production build
npm run preview      # Preview production build
```

## Architecture Overview

```
App.tsx (Simple router: landing vs app)
├── LandingPage.tsx     → Marketing page
└── ThumbnailGenerator.tsx → Main application
    ├── Header + Dashboard (modal)
    ├── ImageUploader (×2 - inspiration + face)
    ├── ConfigurationPanel
    ├── Results Display (tabs: Mockup, Edit, Audit, Metadata)
    └── HistoryGallery
```

### State Management
- React hooks with localStorage persistence
- No external state library - custom hooks in `/hooks/`
- Data persisted via `useLocalStorage` hook

### Service Layer
- All AI operations in `services/geminiService.ts`
- Uses `@google/genai` SDK directly
- Three Gemini models: `gemini-2.5-flash` (text), `gemini-3-pro-image-preview` (images), `veo-3.1-fast-generate-preview` (video)

## Directory Structure

```
/components/           # React components
  ├── generator/       # Sub-components for ThumbnailGenerator
  ├── *.tsx           # Main components
  └── *.test.tsx      # Colocated tests

/constants/           # Centralized config values (credits, limits, models)
/hooks/               # Custom React hooks (useHistory, useTemplates, useUserProfile)
/services/            # API integration (geminiService.ts)
/server/              # Optional Express backend proxy
/test/                # Test setup and examples
/docs/                # Architecture documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces/types |
| `constants/index.ts` | Credit costs, plans, limits, model names |
| `services/geminiService.ts` | All Gemini API calls |
| `hooks/useUserProfile.ts` | Credit/plan management |
| `hooks/useHistory.ts` | Generated thumbnails history |
| `components/ThumbnailGenerator.tsx` | Main app logic (1200+ lines) |

## Coding Conventions

### TypeScript
- Strict mode enabled
- Define interfaces for all data shapes in `types.ts`
- Use path alias `@/` for imports (e.g., `import { CREDIT_COSTS } from '@/constants'`)
- Prefer `interface` over `type` for object shapes
- Export types alongside constants when related

### React Patterns
- Functional components only
- Custom hooks for reusable stateful logic
- Props drilling (no Context API used)
- Colocate tests with components (`Component.test.tsx`)

### Naming
- Components: `PascalCase` (e.g., `ThumbnailGenerator`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useUserProfile`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `CREDIT_COSTS`)
- Files: Match component name or `camelCase` for utilities

### Styling
- Tailwind CSS (loaded via CDN in `index.html`)
- Dark theme: slate background with indigo/purple accents
- Use Tailwind classes inline (no separate CSS files)

### Code Style (Prettier)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Testing Guidelines

### Framework
- Vitest with jsdom environment
- React Testing Library for component tests
- Setup file: `test/setup.ts` (mocks localStorage, URL, matchMedia)

### Writing Tests
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Mocking
- Mock `geminiService` for component tests
- Mock `localStorage` via setup file
- Use `vi.mock()` for module mocking

### Test Location
- Component tests: `components/Component.test.tsx`
- Service tests: `services/service.test.ts`
- Example tests: `test/example.test.ts`

## Credit System

Operations have costs defined in `constants/index.ts`:

| Operation | Cost |
|-----------|------|
| Standard Thumbnail | 10 |
| High Quality | 15 |
| Ultra HD | 25 |
| Video Generation | 50 |
| Audit | 5 |
| Metadata | 5 |

Always use `CREDIT_COSTS` constants, never hardcode values.

## API Integration Patterns

### Gemini Service Functions
```typescript
// Text analysis
detectTextInImage(base64Image): Promise<string[]>
enhancePrompt(prompt): Promise<string>
analyzeThumbnail(base64Image): Promise<AnalysisResult>
generateYoutubeMetadata(base64Image, context): Promise<YoutubeMetadataResult>

// Image generation
generateThumbnail(request: ThumbnailRequest): Promise<string>

// Video generation (async polling)
generateVideoFromThumbnail(imageBase64, prompt, aspectRatio): Promise<string>
```

### Image Handling
- Images are base64 encoded with data URL prefix
- Use `cleanBase64()` helper to extract mimeType and data
- Response images are returned as `data:image/png;base64,...`

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Lint** - ESLint + Prettier check
2. **Type Check** - TypeScript compilation
3. **Test** - Vitest with coverage
4. **Build** - Production build (requires lint/typecheck/test to pass)

All PRs must pass CI before merge.

## Important Constraints

### Security Considerations
- API key exposed in client code (use backend proxy for production)
- Credits stored in localStorage (client-side, manipulable)
- No server-side validation (add for production)

### Known Technical Debt
- `ThumbnailGenerator.tsx` is 1200+ lines - needs refactoring into sub-components
- Some sub-components exist in `components/generator/` but more extraction needed

### Environment Variables
- `GEMINI_API_KEY` - Required for API calls
- Set in `.env.local` for local development
- Available via `process.env.API_KEY` in services

## Common Tasks

### Adding a New Feature
1. Define types in `types.ts`
2. Add constants to `constants/index.ts` if needed
3. Implement service methods in `services/geminiService.ts`
4. Create/update components
5. Add tests
6. Run `npm run lint && npm run typecheck && npm run test:run`

### Adding a New Hook
1. Create `hooks/useFeature.ts`
2. Export from `hooks/index.ts`
3. Follow pattern from existing hooks (useCallback, proper deps)

### Adding a New Component
1. Create `components/ComponentName.tsx`
2. Create `components/ComponentName.test.tsx`
3. Use TypeScript interfaces for props
4. Follow existing component patterns

### Debugging API Issues
- Check browser console for Gemini errors
- Verify API key is set (`npm run dev` needs `.env.local`)
- Check `window.aistudio` availability for AI Studio environment

## LocalStorage Keys

```typescript
const STORAGE_KEYS = {
  USER: 'thumbgen_user',      // UserProfile
  HISTORY: 'thumbgen_history', // HistoryItem[]
  TEMPLATES: 'thumbgen_templates', // SavedTemplate[]
};
```

## File Size Limits

- Max upload: 5MB
- Allowed types: JPEG, PNG, WebP
- Max history items: 50

## Useful Patterns in Codebase

### Hook with localStorage persistence
See `hooks/useUserProfile.ts` for pattern

### Service with error handling
See `services/geminiService.ts` - try/catch with console.error

### Component with tabs
See `ThumbnailGenerator.tsx` - activeTab state pattern

## Getting Help

- Architecture details: `docs/ARCHITECTURE.md`
- README: Basic setup instructions
- CI workflow: `.github/workflows/ci.yml`
