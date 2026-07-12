# New & Concurrent Hooks (React 18 & 19)

> The hooks React added for **concurrent rendering** (18) and **Actions / async UI** (19), plus the effect-timing fix `useEffectEvent` (19.2). This page is the map; each hook has its own note.

## The mental model

Group the new hooks by the problem they solve — this is the fastest way to reason about them in an interview:

| Group | Hooks | Core idea |
|-------|-------|-----------|
| **Concurrent rendering** (keep the UI responsive) | [`useTransition`](use-transition.md), [`useDeferredValue`](use-deferred-value.md) | Mark some updates as *non-urgent* so React can interrupt them and keep typing/clicks snappy. |
| **Actions & async UI** (React 19) | [`useActionState`](use-action-state.md), [`useOptimistic`](use-optimistic.md), [`useFormStatus`](use-form-status.md) | Built around the new `<form action={fn}>` model: manage pending/result state, show instant optimistic feedback, and read form status without prop-drilling. |
| **Reading resources in render** | [`use`](use-api.md) | Read a promise (Suspense) or context — and it's allowed inside conditions/loops. |
| **Effect timing** | [`useEffectEvent`](use-effect-event.md) | Read the latest props/state inside an Effect *without* making them reactive dependencies. Kills the stale-closure / re-run trap. |

## What are "Actions"?

React 19 introduced **Actions**: async functions wired into the UI that React tracks for you. When you pass an async function to `startTransition` or to a `<form action={...}>`, React automatically manages the **pending state**, **errors**, and **optimistic updates** for that transition.

```jsx
// A function passed to a form's `action` prop is an Action.
// React wraps it in a transition automatically — no manual startTransition.
<form action={async (formData) => {
  await submitData(formData);
}}>
```

`useActionState`, `useOptimistic`, and `useFormStatus` are the ergonomic hooks layered on top of this model. Understanding Actions is the "why" behind all three.

## Version cheat-sheet

| Hook | Introduced | Notes |
|------|-----------|-------|
| `useTransition` | React 18.0 | React 19 adds **async transitions** (Actions). |
| `useDeferredValue` | React 18.0 | React 19 adds an optional `initialValue`. |
| `useActionState` | React 19.0 | Replaces/renames `react-dom`'s `useFormState`; adds `isPending`. |
| `useOptimistic` | React 19.0 | Instant UI feedback during a pending Action. |
| `useFormStatus` | React 19.0 | Imported from **`react-dom`**, not `react`. |
| `use` | React 19.0 | An API, not a hook — callable conditionally. |
| `useEffectEvent` | Experimental 19.0–19.1, **stable 19.2** | Imports from `react`. |

## Related

- [`useTransition`](use-transition.md) · [`useDeferredValue`](use-deferred-value.md)
- [`useActionState`](use-action-state.md) · [`useOptimistic`](use-optimistic.md) · [`useFormStatus`](use-form-status.md)
- [`use`](use-api.md) · [`useEffectEvent`](use-effect-event.md)

## References

- [React v19 release blog](https://react.dev/blog/2024/12/05/react-19)
- [Hooks — API reference index](https://react.dev/reference/react/hooks)
