const CACHE_NAME = "gp101-v6";
const CONTENT_CACHE = "gp101-content-v6";

// مسارات /api/ اللي مسموح نخزنها (باقي الـ /api/ زي /api/me يفضل network-only)
function isCacheableApi(pathname) {
  if (pathname === "/api/content") return true;
  if (pathname === "/api/books") return true;
  if (/^\/api\/books\/[^/]+\/view$/.test(pathname)) return true;
  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/dashboard", "/login"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== CONTENT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Cache all content pages
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_ALL_CONTENT") {
    const slugs = event.data.slugs || [];
    event.waitUntil(
      caches.open(CONTENT_CACHE).then(async (cache) => {
        // نخزن بيانات التخصصات (المستخدمة في الداشبورد) صراحةً هنا
        // عشان نضمن إنها اتخزنت فعلاً، مش بس نعتمد على الاعتراض العادي
        try {
          const contentRes = await fetch("/api/content");
          if (contentRes.ok) await cache.put("/api/content", contentRes);
        } catch {}

        for (const slug of slugs) {
          try {
            const res = await fetch(`/content/${slug}`);
            if (res.ok) await cache.put(`/content/${slug}`, res);
          } catch {}
        }
        // Notify client that caching is done
        const clients = await self.clients.matchAll();
        clients.forEach((c) => c.postMessage({ type: "CACHE_DONE" }));
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/") && !isCacheableApi(url.pathname)) return;

  // Navigation (page loads / refreshes): stale-while-revalidate.
  // Serve instantly from cache if we have it — no waiting on the network —
  // then quietly refresh the cache in the background for next time.
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkUpdate = fetch(event.request)
          .then((response) => {
            if (response && response.ok) {
              caches
                .open(CONTENT_CACHE)
                .then((c) => c.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkUpdate);
          return cached;
        }

        return networkUpdate.then((res) => res || caches.match("/login"));
      })
    );
    return;
  }

  // Cache first for static assets (filenames are content-hashed by Next.js,
  // so a cached copy is always the correct copy)
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            caches
              .open(CACHE_NAME)
              .then((c) => c.put(event.request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // Everything else (page data, images, etc.): stale-while-revalidate too
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkUpdate = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            caches
              .open(CONTENT_CACHE)
              .then((c) => c.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkUpdate);
        return cached;
      }
      return networkUpdate;
    })
  );
});
