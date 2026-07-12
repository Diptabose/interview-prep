# useOptimistic

> Show an **optimistic** (predicted) UI state instantly while an async Action is in flight, then automatically snap back to the real state when it resolves — or reverts on failure. *(React 19.0.)*

## Overview

When you submit something (send a message, add a todo), waiting for the server round-trip before updating the UI feels sluggish. `useOptimistic` lets you render the *expected* result immediately, then reconcile with reality.

```jsx
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

- `state` → the real/current value.
- `updateFn(currentState, optimisticValue)` → merges an optimistic value into the current state (like a reducer).
- `optimisticState` → what you render. It shows the optimistic value **while a transition/Action is pending**, then automatically reverts to the real `state` once it settles.

**Intuition:** "Render what I *expect* to happen right now. When the truth arrives, React throws away my guess and shows the real state — no manual rollback."

## Example

```jsx
import { useOptimistic, useState, startTransition } from 'react';

function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newText) => [...state, { text: newText, sending: true }]
  );

  async function handleSend(text) {
    startTransition(async () => {
      addOptimistic(text);       // UI updates instantly with a "sending…" item
      await sendMessage(text);   // when this resolves, optimistic item is dropped
    });                          // and the real `messages` (with the saved item) shows
  }

  return (
    <>
      {optimisticMessages.map((m, i) => (
        <div key={i}>{m.text} {m.sending && <small>(sending…)</small>}</div>
      ))}
      <SendForm onSend={handleSend} />
    </>
  );
}
```

The optimistic item (with `sending: true`) appears the instant you submit. When the real update lands, React discards the optimistic layer and renders the actual `messages`.

<details>
<summary>Deeper dive — how the revert works, must be inside a transition</summary>

**Automatic revert.** The optimistic value only lives for the duration of the pending transition/Action that dispatched it. React does **not** need you to manually undo it: when the async work finishes and the real `state` prop updates, `optimisticState` simply returns the real value again. On failure, since the real state never changed, you naturally fall back to the pre-submit state (surface the error separately).

**Must run inside a transition.** `addOptimistic` has to be called within a transition (or an Action / form `action`), because the optimistic value is tied to that pending transition's lifecycle. Calling it outside one won't behave correctly.

**Pairs with `useActionState`.** In form flows, the Action drives the real state while `useOptimistic` provides the interim view; together they give instant feedback plus a correct final state.

</details>

## Gotchas

- **Optimistic state is temporary and derived.** It's not a source of truth — don't try to read it back as persisted state. When the transition ends it's gone.
- **Must be dispatched inside a transition/Action**, or the optimistic value won't apply/revert correctly.
- **Error handling is separate.** `useOptimistic` reverts the *view* on completion but doesn't surface errors — track those with [`useActionState`](use-action-state.md) or local state.
- Interview point: the "rollback" is automatic *because* the optimistic value is just an overlay on top of real state for the pending window — there's no imperative undo.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useActionState`](use-action-state.md) — drives the real state the optimistic view reconciles to
- [`useTransition`](use-transition.md) — optimistic updates live inside a transition

## References

- [`useOptimistic` — React reference](https://react.dev/reference/react/useOptimistic)
- [React v19: `useOptimistic`](https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates)
