# AI Coding Agent Instructions

Quick reference for AI agents working on ChurchPrompt.Directory (Astro + React + Convex).

## 1. Build, Test & Development Commands

```bash
# Development
npm run dev                    # Start Astro dev server (localhost:4321)
npx convex dev                 # Start Convex backend (optional separate terminal)

# Building
npm run build                  # Production build → dist/
npm run preview                # Preview production build locally

# Testing
npm test                       # Run all Vitest tests
npm run test:watch             # Run tests in watch mode
npx vitest run tests/blogs.test.ts  # Run single test file

# Database & Deployment
npm run migrate:seed           # Seed Convex with JSON data (requires env vars)
npx convex deploy              # Deploy Convex backend functions
```

## 2. Project Architecture Overview

- **Framework**: Astro v5 (hybrid SSR/SSG) + React 19 islands (`client:load`)
- **Backend**: Convex (serverless real-time DB + functions)
- **Auth**: Clerk via `@clerk/astro` with middleware protection
- **Styling**: TailwindCSS v3 + Radix UI primitives + CSS variables
- **Layout Chain**: Page → `MainLayout.astro` → `BaseLayout.astro`
- **Routing**: File-based in `src/pages/` (e.g., `[id].astro` for dynamic routes)

## 3. Import & Module Conventions

### Path Aliases
- **ALWAYS** use `@/` alias for imports: `import { Button } from '@/components/ui/button'`
- **NEVER** use relative paths like `../../components/ui/button`
- Configured in `tsconfig.json`: `"@/*": ["./src/*"]`

### Import Order Pattern
```typescript
// 1. External libraries
import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';

// 2. Convex API imports
import { api } from '../../../convex/_generated/api';
import type { DirectoryBootData } from '../../../convex/directory';

// 3. Internal components (use @/ alias)
import { Sidebar, type Category } from './Sidebar';
import PromptGrid from '@/components/prompts/PromptGrid';
```

### Named vs Default Exports
- **UI Components**: Default exports (`export default function Button()`)
- **Type Interfaces**: Named exports with `export interface` or `export type`
- **Utilities**: Named exports (`export function cn()`)

## 4. TypeScript & Type Conventions

### Strict Mode
- Extends `astro/tsconfigs/strict` - enforce explicit types
- **AVOID** `any` - use `unknown` or proper types
- **PREFER** interfaces over types for object shapes

### Type Definition Patterns
```typescript
// Component props - define inline at top of file
export interface PromptCardProps {
  prompt: Prompt;
  onFavorite?: (id: string) => void;
  isAuthenticated: boolean;
}

// Data models - import from Convex or define locally
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
}
```

### Type Imports
- Use `import type` for type-only imports: `import type { Id } from 'convex/_generated/dataModel'`
- Reduces bundle size and clarifies intent

## 5. Component & File Naming

### File Names
- **React Components**: PascalCase - `PromptCard.tsx`, `DirectoryContent.tsx`
- **Astro Pages**: kebab-case or `[param].astro` - `index.astro`, `[id].astro`
- **Utilities**: camelCase - `utils.ts`, `anonymousTracking.ts`
- **Types**: Match component name - `DirectoryContent.tsx` defines `DirectoryContentProps`

### Component Naming
- **Pages**: Match route - `/directory` uses `DirectoryWithProvider`
- **Provider Wrappers**: Suffix with `WithProvider` - `PromptDetailWithProvider.tsx`
- **UI Primitives**: Lowercase filenames - `button.tsx`, `card.tsx`, `dialog.tsx`

## 6. Code Style & Formatting

### React Patterns
```typescript
// Destructure props immediately
export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onFavorite, isAuthenticated }) => {
  // State declarations first
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Hooks in order: useQuery, useMutation, useEffect, useMemo
  const data = useQuery(api.prompts.getPromptById, { id: prompt.id });
  
  useEffect(() => {
    // Side effects
  }, [dependency]);
  
  const computedValue = useMemo(() => {
    // Expensive calculations
  }, [dependency]);
  
  // Event handlers
  const handleClick = () => {
    // Handle event
  };
  
  // Return JSX
  return <div>...</div>;
};
```

### Styling Conventions
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Compose Tailwind classes, never inline styles
- CSS variables for colors: `bg-primary`, `text-muted-foreground`
- **NO** raw hex values - extend `tailwind.config.mjs` instead

```typescript
import { cn } from '@/lib/utils';

<button className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-primary text-primary-foreground",
  disabled && "opacity-50 cursor-not-allowed"
)} />
```

## 7. State Management & Data Fetching

### URL State Pattern
```typescript
// Read from URL on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category) setSelectedCategory(category);
}, []);

// Sync to URL on state change
useEffect(() => {
  const params = new URLSearchParams();
  if (selectedCategory) params.set('category', selectedCategory);
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}, [selectedCategory]);
```

### Convex Query Pattern
```typescript
// Always wrap in ConvexClientProvider
const prompts = useQuery(api.prompts.getApprovedPrompts, {
  category: selectedCategory || undefined,
  limit: 50,
  sort: 'recent'
});

// Handle loading states
if (prompts === undefined) {
  return <SkeletonGrid />;
}
```

## 8. Error Handling

### Try-Catch for External Calls
```typescript
try {
  const response = await fetch(`${convexUrl}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'prompts:getApprovedPrompts', args: {} }),
  });
  if (response.ok) {
    const json = await response.json();
    return json.value;
  }
} catch (error) {
  console.error('Error fetching prompts:', error);
  return [];
}
```

### Validation Patterns
```typescript
// Guard clauses early
if (!id) return Astro.redirect('/404');
if (!promptData) return Astro.redirect('/404');

// Provide fallbacks
const title = promptData?.title || 'Untitled Prompt';
const tags = promptData?.tags || [];
```

## 9. Astro-Specific Patterns

### Page Meta & SEO
```astro
---
export const prerender = true; // or false for SSR

const title = "Page Title | Church Prompt Directory";
const description = "SEO-optimized description";
const canonicalUrl = new URL(Astro.url.pathname, Astro.site).toString();
---

<MainLayout title={title} description={description} canonicalUrl={canonicalUrl}>
  <!-- Content -->
</MainLayout>
```

### Client Directives
- `client:load` - Hydrate on page load (most common)
- `client:only="react"` - Only render client-side (Convex components)
- `client:visible` - Hydrate when visible (below fold)

## 10. Testing Conventions

### Test File Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });
});
```

### Test Naming
- Files: `*.test.ts` in `/tests` directory
- Descriptions: Clear, specific behavior - `'should validate blog slug format'`
- Use test fixtures for common data patterns

## 11. Convex Integration Patterns

### Query Arguments
```typescript
// Always validate with v.object()
export const getPrompts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Protected Routes
- Add to `isProtectedRoute` matcher in `src/middleware.ts`
- Admin routes require role check: `user.role === 'admin'`

## 12. Common Pitfalls to Avoid

❌ **Don't:**
- Use relative imports (`../../components`)
- Mutate arrays/objects directly - use `.filter()`, `.map()`, `.slice()`
- Call `useQuery` outside `ConvexClientProvider`
- Add inline styles - use Tailwind classes
- Use `any` type without justification
- Create duplicate sitemap files (use `sitemap.xml.ts` only)

✅ **Do:**
- Use `@/` path alias for all imports
- Return new arrays from filters/sorts
- Wrap Convex components in provider
- Extend Tailwind config for new colors
- Add explicit types for props and returns
- Strip query params from canonical URLs

## 13. Key Files Reference

- `src/middleware.ts` - Auth, caching, compression middleware
- `src/components/providers/ConvexClientProvider.tsx` - Clerk-Convex bridge
- `src/components/directory/DirectoryContent.tsx` - URL state reference
- `tailwind.config.mjs` - Design tokens and theme
- `convex/schema.ts` - Database schema and indexes
- `.github/copilot-instructions.md` - Detailed architecture docs

## 14. Environment Variables

Required in `.env.local`:
```bash
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
PUBLIC_SITE_URL=https://churchprompt.directory
```

When unclear about patterns, examine existing code in key files above before introducing new approaches.
