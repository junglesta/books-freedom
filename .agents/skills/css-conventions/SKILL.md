---
name: css-conventions
description: CSS naming and style rules for this Svelte/Vite client app
---

# CSS Conventions

Conventions for styles in `src/client/assets/styles.css` and component styles.

## Naming Convention: snake_case

Use `snake_case` class names to match existing codebase patterns.

```css
/* correct */
.scan_page
.library_header
.book_card
.export_section

/* wrong */
.scanPage
.library-header
```

## CSS Organization

- Prefer global tokens/variables in `src/client/assets/styles.css`
- Make use of CSS layers and all Base 2025 API and Standards.
- Keep component-specific rules close to component only when it improves readability
- Avoid deep selector chains; prefer class-based selectors

## Key Principles

1. **kebab-case classes**
2. **Use CSS variables for shared colors/sizing**
3. **Mobile-first responsive rules**
4. **No `!important` unless unavoidable**
5. **No SCSS/LESS; plain CSS only**
6. **Prefer using or re-styling with `var()`**. Extract 'vars' from existing CSS when asked to refactor.
7. **Use the least number of `var()s` possible**. Reduce them by expressing other `var()s` using `calc()` where possible.
