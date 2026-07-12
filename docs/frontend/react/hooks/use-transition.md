# useTransition

> Mark a state update as **non-urgent** so React can render it in the background, keep it interruptible, and give you a `isPending` flag — without blocking urgent updates like typing. *(React 18.0; async transitions added in React 19.)*

## Overview

Some updates are urgent (typing in an input, a button toggling) and some are not (rendering a huge filtered list, switching a heavy tab). If an expensive update runs synchronously, it blocks the urgent one and the UI feels frozen.

`useTransition` lets you wrap the expensive `setState` in `startTransition`. React then:

- Renders that update at **lower priority**, so urgent updates (keystrokes) interrupt and go first.
- Keeps showing the **old UI** while the transition renders, instead of a jarring blank/fallback.
- Gives you `isPending` to show a subtle loading indicator.

```jsx
const [isPending, startTransition] = useTransition();
```

**Intuition:** "This update can wait. Don't freeze the page for it — and tell me while it's still working."

## Example

```jsx
import { useState, useTransition } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    // The click (urgent) stays instant; the heavy tab render is deferred.
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <TabButton onClick={() => selectTab('posts')}>
        Posts {isPending && '⏳'}
      </TabButton>
      <TabPanel tab={tab} />
    </>
  );
}
```

Without the transition, clicking the "Posts" tab (which renders a slow list) would freeze the button. With it, the button responds instantly and the old tab stays visible until the new one is ready.

<details markdown="1">
<summary>Deeper dive — async transitions (React 19 Actions), rules & internals</summary>

**Async transitions (React 19).** `startTransition` now accepts an **async** function. Everything from the call until the last `await` resolves stays part of the transition, so `isPending` stays `true` across the await. This is the foundation of "Actions":

```jsx
function UpdateName() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleSubmit() {
    startTransition(async () => {
      const err = await updateName(name); // isPending stays true across the await
      if (err) { setError(err); return; }
      redirect('/path');
    });
  }
  // ...
}
```

**Rules / internals**

- The function passed to `startTransition` must be **synchronous in its state updates** relative to the call — updates scheduled outside it (e.g. in a later `setTimeout`) are *not* part of the transition.
- Transitions are **interruptible**: if a new urgent update arrives, React can throw away the in-progress render and restart.
- A transition does **not** block the browser — unlike a synchronous update, React yields so the paint stays smooth.
- Don't put text-input `value` updates in a transition; controlled inputs need synchronous updates or they feel laggy. Defer the *consumer* of that value instead (see [`useDeferredValue`](use-deferred-value.md)).

</details>

## Gotchas

- **`startTransition` vs the hook.** There's a standalone `startTransition` import too, but only the `useTransition` version gives you `isPending`. Use the hook when you need the pending flag.
- **Not for controlled inputs.** Marking the input's own `setState` as a transition makes typing lag. Keep the input urgent; defer the expensive derived render.
- **Interview trap:** transitions make a render *low-priority and interruptible* — they do **not** make the work faster or run it off the main thread. The perceived speedup comes from not blocking urgent updates.
- `isPending` cannot be read *inside* the `startTransition` callback to gate logic — it's for rendering UI.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useDeferredValue`](use-deferred-value.md) — the "defer the value" sibling
- [`useActionState`](use-action-state.md) — Actions build on async transitions

## References

- [`useTransition` — React reference](https://react.dev/reference/react/useTransition)
- [`startTransition` — React reference](https://react.dev/reference/react/startTransition)
