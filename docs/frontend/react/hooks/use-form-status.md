# useFormStatus

> Read the pending state and data of the **parent `<form>`** from a child component — no prop-drilling. Ideal for shared submit buttons and form-aware inputs. Imported from **`react-dom`**. *(React 19.0.)*

## Overview

A reusable `<SubmitButton>` needs to know whether the surrounding form is submitting — but it doesn't own the form's state. `useFormStatus` reads the status of the nearest ancestor `<form>` directly, like a mini context provided by the form itself.

```jsx
import { useFormStatus } from 'react-dom';
const { pending, data, method, action } = useFormStatus();
```

| Field | Meaning |
|-------|---------|
| `pending` | `true` while the parent form is submitting. |
| `data` | The `FormData` being submitted (`null` if idle). |
| `method` | `'get'` or `'post'`. |
| `action` | Reference to the form's `action` function (or `null`). |

**Intuition:** "`useContext` for the form I'm rendered inside — tell me if it's submitting, without the parent passing me a prop."

## Example

```jsx
import { useFormStatus } from 'react-dom';

// Reusable, form-agnostic submit button
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting…' : 'Submit'}
    </button>
  );
}

function CheckoutForm({ action }) {
  return (
    <form action={action}>
      <input name="card" />
      <SubmitButton />   {/* reads the form's pending state itself */}
    </form>
  );
}
```

## Gotchas

- **The one rule that trips everyone up:** `useFormStatus` only works from a component **rendered inside** the `<form>`. Calling it in the *same* component that renders `<form>` returns `pending: false` forever — it reads the *parent* form, and there isn't one at that level.

  ```jsx
  // ❌ Won't track — hook is in the component that renders the form
  function Form() {
    const { pending } = useFormStatus(); // always idle
    return <form action={submit}><button disabled={pending}/></form>;
  }
  // ✅ Move it into a child
  ```

- **Import from `react-dom`**, not `react`.
- It only tracks submissions of the **nearest** ancestor form; it won't see sibling or unrelated forms.
- Complements [`useActionState`](use-action-state.md): use `useActionState` at the form level for result/state, `useFormStatus` in deep children for pending UI.

## Related

- [Overview: New & Concurrent Hooks](index.md)
- [`useActionState`](use-action-state.md) — form-level state & result
- [`useOptimistic`](use-optimistic.md) — instant feedback during submit

## References

- [`useFormStatus` — React DOM reference](https://react.dev/reference/react-dom/hooks/useFormStatus)
