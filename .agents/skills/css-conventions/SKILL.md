---
name: css-conventions
description: CSS naming and style rules for this Svelte/Vite client app
---

# CSS Conventions

Conventions for styles in `src/client/assets/styles.css` and component styles.

## Naming Convention: kebab-case

Use `kebab-case` class names to match existing codebase patterns.

```css
/* correct */
.scan-page
.library-header
.book-card
.export-section

/* wrong */
.scanPage
.library_header
```

## CSS Organization

- Prefer global tokens/variables in `src/client/assets/styles.css`
- Keep component-specific rules close to component only when it improves readability
- Avoid deep selector chains; prefer class-based selectors

## Key Principles

1. **kebab-case classes**
2. **Use CSS variables for shared colors/sizing**
3. **Mobile-first responsive rules**
4. **No `!important` unless unavoidable**
5. **No SCSS/LESS; plain CSS only**
