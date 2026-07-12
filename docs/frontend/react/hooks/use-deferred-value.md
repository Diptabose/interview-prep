# useDeferredValue

> Get a **deferred copy** of a value that "lags behind" during heavy renders, so the fresh value updates urgent UI (the input) while the expensive consumer catches up in the background. *(React 18.0; optional `initialValue` added in React 19.)*

## Overview

`useDeferredValue` is the "defer the **value**" counterpart to [`useTransition`](use-transition.md)'s "defer the **update**". You use it when the slow work is driven by a value you *don't control the setter of* — e.g. a prop, or a controlled input's state you must keep instant.

```jsx
const deferredValue = useDeferredValue(value); // React 18
const deferredValue = useDeferredValue(value, initialValue); // React 19 (optional)
```

On a fast update, React first re-renders with the **old** `deferredValue` (non-blocking), then re-renders in the background with the new one. The keystroke stays instant; the expensive list trails slightly behind.

**Intuition:** "Keep the input snappy. Let the expensive thing that reads this value show a slightly stale version until it can catch up."

## Example

```jsx
import { useState, useDeferredValue } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      {/* Urgent: the input uses the live `query`, so typing never lags */}
      <input value={query} onChange={e => setQuery(e.target.value)} />

      {/* Non-urgent: SlowResults reads the deferred value and trails behind */}
      <SlowResults query={deferredQuery} />
    </>
  );
}
```

For the deferral to actually save work, the slow child should be wrapped in [`memo`](https://react.dev/reference/react/memo) so it only re-renders when `deferredQuery` changes — not on every keystroke.

<details>
<summary>Deeper dive — staleness signal, initialValue, internals</summary>

**Showing "stale" state.** You can compare the live and deferred values to dim old content while the new render is pending:

```jsx
const deferredQuery = useDeferredValue(query);
const isStale = query !== deferredQuery;
return (
  <div style={{ opacity: isStale ? 0.5 : 1 }}>
    <SlowResults query={deferredQuery} />
  </div>
);
```

**`initialValue` (React 19).** The optional second argument is used for the *first* render, before the real value is available — handy for the initial mount so you can defer even the first (potentially expensive) render:

```jsx
const deferredQuery = useDeferredValue(query, ''); // renders with '' first, then query
```

**Internals.** Like transitions, the deferred re-render is **interruptible** and low-priority; a new keystroke abandons the in-progress background render and restarts. React only ever renders *one extra* background pass, not one per intermediate value — it always converges to the latest.

</details>

## Gotchas

- **`memo` is usually required.** Without `React.memo` (or the same-reference trick), the slow child re-renders anyway and the deferral buys nothing.
- **useTransition vs useDeferredValue — the interview question.** Use `useTransition` when you *own the setState* and can wrap it; use `useDeferredValue` when you only receive a *value* (prop / controlled input state) and can't wrap its update. They use the same concurrent machinery underneath.
- It **doesn't debounce or throttle.** There's no fixed delay — the lag is exactly "however long the background render takes," and React always catches up to the latest value.
- Values are compared with `Object.is`; passing a fresh object/array every render defeats it.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useTransition`](use-transition.md) — the "defer the update" sibling

## References

- [`useDeferredValue` — React reference](https://react.dev/reference/react/useDeferredValue)
