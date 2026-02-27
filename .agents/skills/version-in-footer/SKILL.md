---
name: version-in-footer
description: Show package.json version in a Svelte footer component
---

# Version Display — Footer (Svelte)

Show app version from `package.json` in a footer component when needed.

## How it works

1. Import version from `package.json`:

```svelte
<script lang="ts">
  import { version } from "../../../package.json";
</script>
```

2. Render it in footer markup:

```svelte
<footer>
  <span>v{version}</span>
</footer>
```

## Styling

Keep it subtle — smaller text, lower contrast:

```css
.version-tag {
  font-size: 0.75em;
  opacity: 0.6;
}
```

## Result

- Footer can read: `v0.3.10`
- Version updates automatically on every `package.json` bump — no manual edits needed

## Notes

- Use this only if the UI actually has a footer
- Keep version display consistent with splash/header if both are present
