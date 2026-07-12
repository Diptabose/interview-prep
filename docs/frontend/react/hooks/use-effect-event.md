# useEffectEvent

> Extract non-reactive logic out of an Effect into an "Effect Event": a function that always reads the **latest** props/state when called, but is **not** a reactive dependency — so it doesn't re-run your Effect. Kills the stale-closure vs. over-firing dilemma. *(Experimental in React 19.0–19.1; **stable in React 19.2**, imported from `react`.)*

## Overview

Effects re-run when their dependencies change. But often an Effect uses two kinds of values:

- **Reactive** values that *should* trigger re-synchronization (e.g. `roomId` → reconnect).
- **Latest** values you want to *read* but that should **not** cause a reconnect (e.g. a `theme` for a notification, the current `muted` flag).

Before, you were stuck: include the value in deps (Effect re-runs too often) or omit it (stale closure, lint warning). `useEffectEvent` gives you a third option.

```jsx
import { useEffectEvent } from 'react';
const onSomething = useEffectEvent((args) => { /* reads latest props/state */ });
```

**Intuition:** "Pull the part of my Effect that should *see the latest values* but *not trigger a re-run* into a separate function. React always calls it with fresh values."

## Example

```jsx
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  // Reads the LATEST theme, but is NOT a dependency of the Effect below.
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', () => onConnected());
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ only roomId — changing `theme` does NOT reconnect

  // ...
}
```

Change `theme` → no reconnect, but the *next* "connected" notification uses the new theme. Change `roomId` → reconnect, as it should. `onConnected` is deliberately **absent** from the dependency array.

<details markdown="1">
<summary>Deeper dive — why it works & the strict usage rules</summary>

**Why it's not reactive.** An Effect Event's function identity **intentionally changes every render**, and the linter special-cases it so you never put it in deps. Conceptually it's like a ref to "the latest version of this callback" — calling it reaches through to the most recent render's values.

**Strict rules (the linter enforces these):**

1. **Only call it from inside Effects** (or other Effect Events) — never during render or from regular event handlers.
2. **Never pass it** to other components or hooks (it's local, unstable by design).
3. **Never put it in a dependency array.**
4. Declare it at the top level of the component/hook (normal Hook rules).

**Not a license to hide deps.** If a value genuinely should re-synchronize the Effect (like `roomId`), it belongs in deps — *not* hidden inside an Effect Event. Use it only for logic that should read fresh values but not drive re-runs (analytics, notifications, logging the latest state on an event).

</details>

## Gotchas

- **Version-gated:** stable only from **React 19.2**. In 19.0/19.1 it was `experimental_useEffectEvent`; in React 18 it wasn't available (ponyfills exist). Confirm the runtime version before relying on the bare `useEffectEvent` import.
- **Don't call it during render or in plain event handlers** — Effects/Effect Events only. (For an ordinary click handler, just read state directly.)
- **Don't pass it down as a prop** — its identity is unstable on purpose.
- **Interview framing:** it solves the "stale closure vs. Effect re-running too often" tension that `useCallback`/refs only worked around awkwardly.

## Related

- [Overview: New & Concurrent Hooks](index.md)

## References

- [`useEffectEvent` — React reference](https://react.dev/reference/react/useEffectEvent)
- [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)
