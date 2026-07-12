# Core NATS

> The in-memory messaging layer: **subjects + wildcards** for addressing, and three patterns — **publish-subscribe**, **request-reply**, and **queue groups**. Fast, decoupled, and **at-most-once** (no persistence).

## Subjects & wildcards

A **subject** is a dot-delimited string that names a message stream, e.g. `orders.us.created`. Subscribers match subjects, optionally with wildcards:

| Wildcard | Matches | Example |
|----------|---------|---------|
| `*` | exactly **one** token | `time.*.east` → `time.us.east`, `time.eu.east` |
| `>` | **one or more** trailing tokens (must be last) | `time.us.>` → `time.us.east`, `time.us.east.atlanta` |

Subjects are cheap and dynamic — you don't pre-create them. Design them hierarchically (`domain.entity.event`) so wildcards give you flexible fan-out.

## Publish-Subscribe

Every subscriber to a matching subject receives its own copy.

```bash
# terminal 1 — subscribe
nats sub "orders.>"
# terminal 2 — publish
nats pub orders.us.created '{"id":1}'
```

```typescript
import { connect } from "@nats-io/transport-node";

const nc = await connect({ servers: "localhost:4222" });

// subscriber — async-iterate over matching messages
const sub = nc.subscribe("orders.>");
(async () => {
  for await (const m of sub) {
    console.log(`${m.subject}: ${m.string()}`);
  }
})();

// publisher
nc.publish("orders.us.created", JSON.stringify({ id: 1 }));

await nc.drain(); // flush in-flight messages, then close
```

## Request-Reply

The requester publishes on a subject **with a temporary reply subject** (an "inbox"); a responder replies to that inbox. React-style RPC over pub/sub.

```bash
# responder (service)
nats reply "greet.*" "hello, {{Request}}"
# requester
nats req greet.joe ""
```

```typescript
// responder
const sub = nc.subscribe("greet.*");
(async () => {
  for await (const m of sub) {
    m.respond(`hello, ${m.subject.split(".")[1]}`);
  }
})();

// requester — resolves with the first reply, or throws on timeout / no responders
const reply = await nc.request("greet.joe", "", { timeout: 1000 });
console.log(reply.string()); // "hello, joe"
```

If **no subscriber** is listening, `request` fails fast with a *no responders* error rather than hanging until timeout.

## Queue groups (load balancing)

Subscribers that share a **queue name** form a group. For each message, the server delivers to **exactly one, randomly chosen** member — the primitive for scaling a stateless service. Combine with request-reply to build a load-balanced RPC service.

```bash
# start 3 workers in the same group — each message goes to just one
nats sub --queue workers "jobs.>"   # run this 3×
```

```typescript
// every instance uses the same { queue } — scale by launching more processes
const sub = nc.subscribe("jobs.>", { queue: "workers" });
for await (const m of sub) {
  await handle(m);
}
```

Scaling up = start another process; scaling down = stop one (use `drain()` to finish in-flight work first).

<details markdown="1">
<summary>Deeper dive — at-most-once semantics, ordering, drain vs close, legacy client</summary>

**At-most-once delivery.** Core NATS never stores messages and has no acks. A message is delivered to whoever is connected *right now*; if a subscriber is down or slow past its limits, it simply misses the message. Messages from a *single* publisher arrive **in order**; there's no ordering guarantee *across* publishers. For durability/redelivery you must move to [JetStream](jetstream.md).

**Slow consumers.** Each subscription has buffer limits; a subscriber that can't keep up is marked a "slow consumer" and may drop messages — protecting the server and other clients.

**`drain()` vs `close()`.** `close()` tears down immediately; `drain()` unsubscribes, processes everything already in flight, then closes — the graceful path for shutdown and queue-group scale-down.

**Client versions.** The examples use **nats.js v3** modular packages (`@nats-io/transport-node`, and `@nats-io/jetstream` for JetStream). In the **legacy `nats` v2** package you instead did:

```typescript
import { connect, StringCodec } from "nats";
const nc = await connect({ servers: "localhost:4222" });
const sc = StringCodec();
nc.publish("subj", sc.encode("hi"));   // v2 required explicit codecs
```

v3 accepts strings/`Uint8Array` directly and exposes `m.string()` / `m.json()` helpers.

</details>

## Gotchas

- **No persistence in core NATS.** A common trap: expecting a subscriber that connects *later* to receive earlier messages. It won't — that's JetStream's job.
- **`>` must be the last token**; `*` matches exactly one token (not zero, not many).
- **Request-reply is 1 response by default.** `nc.request()` resolves on the *first* reply; use a subscription + scatter-gather if you need many.
- **Queue-group delivery is random**, not round-robin — don't rely on even distribution ordering.
- A `request` with no responders **errors immediately** — handle that distinctly from a timeout.

## Related

- [NATS overview](index.md)
- [JetStream](jetstream.md) — add persistence, acks, and replay on top of these subjects

## References

- [Subject-Based Messaging](https://docs.nats.io/nats-concepts/subjects)
- [Publish-Subscribe](https://docs.nats.io/nats-concepts/core-nats/pubsub)
- [Request-Reply](https://docs.nats.io/nats-concepts/core-nats/reqreply)
- [Queue Groups](https://docs.nats.io/nats-concepts/core-nats/queue)
- [nats.js — core README](https://github.com/nats-io/nats.js/blob/main/core/README.md)
