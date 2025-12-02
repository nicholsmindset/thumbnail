# ThumbGen AI - Architecture Documentation

## Overview

ThumbGen AI is an AI-powered YouTube thumbnail generator built with React, TypeScript, and Google's Gemini API. The application allows users to create high-CTR thumbnails by combining a reference style with their own face.

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 19.2 |
| **Language** | TypeScript | 5.8 |
| **Build Tool** | Vite | 6.2 |
| **Styling** | Tailwind CSS | CDN |
| **Icons** | Lucide React | 0.555 |
| **AI Integration** | @google/genai | 1.30 |
| **Testing** | Vitest + React Testing Library | Latest |
| **Linting** | ESLint + Prettier | Latest |

## Directory Structure

```
thumbnail/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── components/
│   ├── Dashboard.tsx           # User profile/credits modal
│   ├── Header.tsx              # Navigation header
│   ├── ImageUploader.tsx       # Reusable file upload component
│   ├── LandingPage.tsx         # Marketing landing page
│   └── ThumbnailGenerator.tsx  # Main application component
├── constants/
│   └── index.ts                # Centralized configuration values
├── docs/
│   └── ARCHITECTURE.md         # This file
├── hooks/
│   ├── index.ts                # Hook exports
│   ├── useHistory.ts           # Thumbnail history management
│   ├── useLocalStorage.ts      # LocalStorage sync hook
│   ├── useTemplates.ts         # Prompt templates management
│   └── useUserProfile.ts       # User credits/plan management
├── services/
│   ├── geminiService.ts        # Google Generative AI integration
│   └── geminiService.test.ts   # Service unit tests
├── test/
│   ├── example.test.ts         # Example tests
│   └── setup.ts                # Test environment setup
├── App.tsx                     # Root component with routing
├── index.html                  # HTML entry point
├── index.tsx                   # React DOM mount point
├── types.ts                    # TypeScript interfaces
├── vite.config.ts              # Vite + Vitest configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint configuration
├── .prettierrc                 # Prettier configuration
└── package.json                # Dependencies and scripts
```

## Architecture Patterns

### 1. Component Architecture

```
App.tsx
├── LandingPage (Marketing)
│   └── Static content, CTA buttons
└── ThumbnailGenerator (Main App)
    ├── Header
    │   └── Dashboard (Modal)
    ├── ImageUploader (×2)
    ├── Configuration Panel
    ├── Results Display
    └── History Gallery
```

### 2. State Management

The application uses React hooks for state management with localStorage persistence:

```
┌─────────────────────────────────────────────────────┐
│                    Component State                   │
├─────────────────────────────────────────────────────┤
│  useUserProfile    │  User credits, plan, stats     │
│  useHistory        │  Generated thumbnails history  │
│  useTemplates      │  Saved prompt templates        │
│  useLocalStorage   │  Generic localStorage sync     │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  localStorage │
                    └───────────────┘
```

### 3. Service Layer

All AI operations are encapsulated in `geminiService.ts`:

```
┌─────────────────────────────────────────────────────┐
│                  geminiService.ts                    │
├─────────────────────────────────────────────────────┤
│  checkApiKey()           │  Verify API key exists   │
│  detectTextInImage()     │  OCR on thumbnails       │
│  enhancePrompt()         │  AI prompt improvement   │
│  analyzeThumbnail()      │  CTR score & feedback    │
│  generateYoutubeMetadata │  Titles, desc, tags      │
│  generateThumbnail()     │  Main image generation   │
│  generateVideoFromThumbnail │  Video from image     │
└─────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Gemini API   │
                    │  (Google AI)  │
                    └───────────────┘
```

### 4. Data Flow

```
User Input → React Component → Hook (State) → Service → Gemini API
                                    │
                                    ▼
                              localStorage
```

## Key Components

### ThumbnailGenerator.tsx (Main)

The central component managing:
- Image upload for inspiration and user photos
- Prompt configuration and enhancement
- Quality and aspect ratio settings
- Text replacement options
- Generation history
- Result display with tabs (Mockup, Audit, Metadata, Edit)

**Note:** This is a large component (1200+ lines) that should be refactored into smaller sub-components.

### Custom Hooks

| Hook | Purpose | Storage Key |
|------|---------|-------------|
| `useUserProfile` | Credits, plan, generation count | `thumbgen_user` |
| `useHistory` | Generated thumbnails with filters | `thumbgen_history` |
| `useTemplates` | Saved prompt templates | `thumbgen_templates` |
| `useLocalStorage` | Generic localStorage wrapper | N/A |

### Constants

All magic numbers and configuration values are centralized in `/constants/index.ts`:

- Credit costs per operation
- Plan configurations
- File upload limits
- Timing delays
- Aspect ratios
- Quality levels
- API model names

## API Integration

### Gemini Models Used

| Model | Purpose |
|-------|---------|
| `gemini-2.5-flash` | Text analysis, prompts, metadata |
| `gemini-3-pro-image-preview` | Image generation |
| `veo-3.1-fast-generate-preview` | Video generation |

### Request Flow

1. User uploads images (base64 encoded)
2. Service constructs prompt with instructions
3. API call to appropriate Gemini model
4. Response parsed (image data or JSON)
5. Result displayed and saved to history

## Credit System

| Operation | Cost |
|-----------|------|
| Standard Thumbnail | 10 credits |
| High Quality | 15 credits |
| Ultra HD | 25 credits |
| Video Generation | 50 credits |
| Thumbnail Audit | 5 credits |
| Metadata Generation | 5 credits |

## Testing

### Test Setup

- **Framework:** Vitest
- **DOM Environment:** jsdom
- **Mocking:** vi.mock for external dependencies
- **Coverage:** v8 provider

### Running Tests

```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage # With coverage report
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint** - ESLint + Prettier check
2. **Type Check** - TypeScript compilation
3. **Test** - Vitest with coverage
4. **Build** - Production build verification

## Security Considerations

### Current Issues (To Address)

1. **API Key Exposure** - Key is bundled in client code
2. **Client-side Credits** - Stored in localStorage (manipulable)
3. **No Authentication** - No user verification
4. **No Rate Limiting** - API calls unrestricted

### Recommended Improvements

1. Add backend proxy for API calls
2. Implement server-side credit validation
3. Add user authentication (Firebase/Supabase)
4. Implement rate limiting middleware

## Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run typecheck    # TypeScript type checking
```

## Future Improvements

### Short Term
- [ ] Refactor ThumbnailGenerator into smaller components
- [ ] Add component tests for UI components
- [ ] Implement error boundaries
- [ ] Add loading skeletons

### Medium Term
- [ ] Create backend API proxy
- [ ] Add user authentication
- [ ] Server-side credit validation
- [ ] Implement proper logging

### Long Term
- [ ] A/B testing for thumbnails
- [ ] Batch generation
- [ ] Template marketplace
- [ ] Analytics dashboard
