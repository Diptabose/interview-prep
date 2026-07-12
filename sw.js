/*
 * Hand-written service worker for the Interview Prep PWA.
 * No external libraries (no Workbox) — everything here is written by hand.
 *
 * Strategy: NETWORK-FIRST for every request.
 *   - Online: always fetch from the network first, exactly like having no
 *     service worker at all — so pushed updates appear immediately and the
 *     online experience is never served stale content. A copy is saved to the
 *     cache in the background (non-blocking).
 *   - Offline (network throws): fall back to the last cached copy. For a page
 *     that was never visited, show a small inline "offline" notice instead of
 *     a broken browser error.
 */

const CACHE = "interview-prep-v1";
// Resolves to the site root, e.g. "/interview-prep/".
const BASE = new URL(self.registration.scope).pathname;

self.addEventListener("install", () => {
  // Take over as soon as installed; don't wait for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches left by older service-worker versions.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only deal with GET over http(s); leave everything else to the browser.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  // Let the browser handle range requests (media seeking).
  if (req.headers.has("range")) return;

  event.respondWith(
    (async () => {
      try {
        // ---- NETWORK FIRST (the online path) ----
        const res = await fetch(req);
        // Save a copy for offline use: normal same-origin responses (res.ok)
        // and opaque cross-origin ones (fonts, the mermaid script). This runs
        // in the background and never blocks the response returned to the page.
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      } catch (err) {
        // ---- OFFLINE FALLBACK (network failed) ----
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === "navigate") {
          // Try the cached home page, then a minimal inline offline notice.
          const home = await caches.match(BASE);
          if (home) return home;
          return new Response(
            '<!doctype html><html lang="en"><meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width,initial-scale=1">' +
              "<title>Offline</title>" +
              "<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
              "max-width:32rem;margin:20vh auto;padding:0 1.5rem;text-align:center;color:#4a4a4a}" +
              "h1{color:#3949ab;margin-bottom:.5rem}</style>" +
              "<h1>You’re offline</h1>" +
              "<p>This page hasn’t been opened yet, so it isn’t available offline. " +
              "Reconnect to the internet, or open a page you’ve visited before.</p></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        }
        throw err;
      }
    })()
  );
});
