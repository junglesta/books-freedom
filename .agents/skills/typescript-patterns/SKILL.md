---
name: typescript-patterns
description: TypeScript conventions and Biome rules for this Svelte 5 + Vite app
---

# TypeScript Patterns — Books Freedom

## Config

- `tsconfig.json` extends `@tsconfig/svelte/tsconfig.json`
- Keep strict TS checks compatible with current app structure

## Import Rules

**CRITICAL:** Always use `import type` for type-only imports. Biome enforces this.

```typescript
// correct
import type { Book } from "./types";
import { addBook } from "./storage";

// wrong — if only used as type
import { Book } from "./types";
```

## Svelte Component Props

Prefer explicit `Props` interfaces in Svelte components:

```typescript
interface Props {
  book: Book;
  compact?: boolean;
}
```

## Biome Rules

- Keep code Biome-clean under `src/`
- Avoid unused imports/variables
- Prefer explicit types over broad `any`

## Key Principles

1. **Strict Mode** — always
3. **`import type`** — always for types
4. **Props Interface** — for non-trivial components
5. **Use `?.` and `??` where nullable data is expected**
6. **No `any` unless there is no practical typed alternative**
7. **Keep shared domain types in `src/client/lib/types.ts`**
