---
name: cc-skill-frontend-patterns
description: Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.
metadata:
  model: sonnet
---

## Use this skill when

- Designing new UI components or pages
- Refactoring frontend code for better performance
- implementing complex state management
- Setting up project structure for scalability
- Working with Material UI (MUI), Tailwind, or other UI libraries

## Do not use this skill when

- Working purely on backend logic (use backend-patterns instead)
- fixing simple syntax errors (use debugger instead)

## Instructions

- Prefer functional components and hooks over class components.
- Use **Server Components** by default in Next.js 13/14+, only use 'use client' when interactivity is needed.
- Implement **Suspense** and **Lazy Loading** for non-critical components to improve initial load time.
- For data fetching, prefer **TanStack Query** (React Query) or `useSuspenseQuery` patterns over raw `useEffect`.
- Organize files by **Features** (e.g., `src/features/auth`, `src/features/dashboard`) rather than by type, to keep related code collocated.

### UI & Styling
- Maintain consistency with the design system.
- If using Tailwind, use utility classes efficiently and consider `clsx` or `tailwind-merge` for conditional styling.
- Ensure **Accessibility** (a11y) best practices: proper ARIA labels, semantic HTML, and keyboard navigation.

### Performance
- Minimize client-side bundle size.
- Use `useMemo` and `useCallback` only when necessary to prevent expensive re-renders (premature optimization can be harmful).
- Optimize images using `next/image`.

### TypeScript
- Use strict typing. Avoid `any`.
- Define interfaces for Props and State explicitly.
- Use Zod for schema validation especially for form data and API responses.

When asked to design a component, first outline the props interface, then the logic, and finally the JSX structure.
