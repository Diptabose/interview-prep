# useActionState

> Wrap an async **Action** and get back `[state, formAction, isPending]` — React runs the Action inside a transition, stores its return value as state, and tracks pending automatically. The ergonomic core of React 19 form handling. *(React 19.0.)*

## Overview

Form submissions usually mean juggling three pieces of state by hand: the result/error, whether it's submitting, and re-wiring the submit handler. `useActionState` collapses all of that into one call.

```jsx
const [state, formAction, isPending] = useActionState(actionFn, initialState, permalink?);
```

- `actionFn(previousState, formData)` → the async Action. Its **return value becomes the new `state`**.
- `initialState` → the state before the first run.
- `formAction` → pass this to a `<form action={formAction}>` (or a button `formAction`). React wraps the call in a transition for you.
- `isPending` → `true` while the Action is running.
- `permalink?` → URL for progressive enhancement (form works before JS hydrates, on Server Components).

**Intuition:** "`useReducer` for async form submits — the reducer is an async function, and React hands me the pending flag and result for free."

## Example

```jsx
import { useActionState } from 'react';

async function updateName(previousState, formData) {
  const error = await submitName(formData.get('name'));
  if (error) return { error };          // returned value → next `state`
  return { error: null, success: true };
}

function ChangeName() {
  const [state, formAction, isPending] = useActionState(updateName, { error: null });

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? 'Saving…' : 'Update'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

Note the Action signature is `(previousState, formData)` — the first arg is the previous state, **not** the event. React passes the form's `FormData` as the second argument automatically.

<details>
<summary>Deeper dive — Actions, calling outside a form, permalink, useFormState rename</summary>

**Renamed from `useFormState`.** In the React Canary this hook was `useFormState` (from `react-dom`). React 19 renamed it to **`useActionState`** and moved it to **`react`**, and added the `isPending` value. `react-dom`'s `useFormState` is deprecated — migrate the import.

**You don't need a `<form>`.** `formAction` is just a dispatch function. You can call it directly, but it **must run inside a transition** (calling it as a form `action` does this automatically):

```jsx
import { useActionState, startTransition } from 'react';

const [state, submitAction, isPending] = useActionState(reducerAction, 0);
startTransition(() => submitAction(payload)); // manual dispatch
```

**Progressive enhancement / `permalink`.** With Server Components, if the form is submitted before JS loads, the browser navigates to `permalink` and the Server Action still runs — so the form works without hydration.

**Chaining state.** Because the Action receives `previousState`, you can accumulate — e.g. a counter or a multi-step wizard — just like a reducer.

</details>

## Gotchas

- **Argument order trap:** the Action is `(previousState, formData)`, not `(formData)` or `(event)`. Forgetting `previousState` is the #1 mistake.
- **The return value is the state.** If your Action returns nothing, `state` becomes `undefined` on the next render.
- **Import from `react`**, not `react-dom` (that's the old `useFormState`).
- Pending state is per-Action; to expose pending to *children* of the form without prop-drilling, use [`useFormStatus`](use-form-status.md) instead.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useFormStatus`](use-form-status.md) — read pending state deep inside the form
- [`useOptimistic`](use-optimistic.md) — show instant feedback while the Action runs
- [`useTransition`](use-transition.md) — the async-transition machinery underneath

## References

- [`useActionState` — React reference](https://react.dev/reference/react/useActionState)
- [React v19: Actions & `useActionState`](https://react.dev/blog/2024/12/05/react-19#actions)
