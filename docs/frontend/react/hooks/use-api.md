# use

> Read a **promise** (suspending until it resolves) or a **context** during render — and unlike every hook, you *can* call it inside conditions and loops. *(React 19.0.)*

## Overview

`use` is an API, not a hook, so it isn't bound by the Rules of Hooks about call order. It reads a "resource" and unwraps it:

```jsx
const value = use(resource); // resource is a Promise or a Context
```

- **Promise:** `use(promise)` suspends the component (shows the nearest `<Suspense>` fallback) until the promise resolves, then returns its value. Errors bubble to the nearest error boundary.
- **Context:** `use(Context)` returns the context value, like `useContext` — but callable conditionally.

**Intuition:** "Await a promise (or grab context) right in render — and I'm allowed to do it inside an `if`."

## Example

**Reading a promise (with Suspense):**

```jsx
'use client';
import { use, Suspense } from 'react';

function Albums({ albumsPromise }) {
  const albums = use(albumsPromise); // suspends until resolved
  return <ul>{albums.map(a => <li key={a.id}>{a.title}</li>)}</ul>;
}

function Page({ albumsPromise }) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Albums albumsPromise={albumsPromise} />
    </Suspense>
  );
}
```

**Reading context conditionally** (impossible with `useContext`):

```jsx
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext); // ✅ allowed inside a condition
    return <hr className={theme} />;
  }
  return null;
}
```

<details markdown="1">
<summary>Deeper dive — where the promise must come from, error handling</summary>

**Don't create the promise during render.** `use(fetch('/x'))` creates a *new* promise every render, so React suspends forever / refetches endlessly. The promise must be **stable across renders**:

- **Preferred:** create it in a **Server Component** and pass it down to a Client Component that calls `use`. React streams the result.
- **Otherwise:** cache it (e.g. a framework-integrated cache or a module-level `Map`). A raw `useMemo` isn't a guaranteed cache and isn't the sanctioned pattern.

**Error handling.** Don't wrap `use(promise)` in `try/catch` — it throws internally to drive Suspense. Handle rejections with an `<ErrorBoundary>` (optionally combined with the promise's `.catch`).

**Server Components caveat.** Reading *context* with `use` is not supported in Server Components (context is a client concept). Reading promises is the primary server→client pattern.

</details>

## Gotchas

- **Callable in conditions/loops — that's the headline difference** from `useContext` and all hooks. But it must still be called inside a component or a custom hook, not at module top level.
- **Never create the promise inline in render.** Stable reference or endless suspense. Create it in a Server Component or cache it.
- **No `try/catch`** around `use` for promises — use an error boundary.
- It doesn't *start* the fetch — it only reads a promise you already have. Kicking off data fetching is still your (or the framework's) job.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useTransition`](use-transition.md) — Suspense + transitions keep the old UI during loads

## References

- [`use` — React reference](https://react.dev/reference/react/use)
- [React v19: the `use` API](https://react.dev/blog/2024/12/05/react-19#new-feature-use)
