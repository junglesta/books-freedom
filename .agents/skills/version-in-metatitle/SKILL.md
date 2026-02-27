---
name: version-in-metatitle
description: Show package.json version in browser title or metadata for this Svelte app
---

# Version Display — Title/Meta (Svelte)

Show the version from `package.json` in the browser tab title.

## How it works

1. Import `version` from `package.json` in the relevant Svelte file:

```svelte
<script lang="ts">
  import { version } from "../../../package.json";
</script>
```

2. Option A: render version in visible page chrome (splash/header).
3. Option B: set document title in `onMount`:

```ts
onMount(() => {
  document.title = `Books Freedom v${version}`;
});
```

## Where to apply

- App-level component such as `src/client/App.svelte`
- Keep title changes centralized, not scattered per page

## Result

- Browser tab can read: `Books Freedom v0.3.10`
- Version updates automatically on every `package.json` bump — no manual edits needed
