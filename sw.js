const CACHE = "intensity-shell-v4";
const ROOT = new URL("./", self.location.href);
const PHOTOS = [
  "band-face-pull.webp",
  "band-pallof-press.webp",
  "cable-curl.webp",
  "close-grip-smith-bench.webp",
  "db-bulgarian-split-squat.webp",
  "db-flat-press.webp",
  "db-hammer-curl.webp",
  "db-lateral-raise.webp",
  "db-thruster.webp",
  "ezbar-curl.webp",
  "ezbar-skullcrusher.webp",
  "goblet-squat.webp",
  "incline-walk.webp",
  "lat-pulldown.webp",
  "med-ball-slam.webp",
  "pushup.webp",
  "renegade-row.webp",
  "russian-twist.webp",
  "single-arm-db-row.webp",
  "smith-bent-over-row.webp",
  "smith-calf-raise.webp",
  "smith-flat-bench.webp",
  "smith-hip-thrust.webp",
  "smith-incline-bench.webp",
  "smith-rdl.webp",
  "smith-seated-ohp.webp",
  "smith-squat.webp",
  "tricep-pushdown.webp",
];
function rooted(path) {
  return new URL(path, ROOT).href;
}

const SHELL = [
  rooted("./"),
  rooted("index.html"),
  rooted("404.html"),
  rooted("manifest.webmanifest"),
  rooted("favicon.svg"),
  rooted("icon-192.png"),
  rooted("icon-512.png"),
  rooted("apple-touch-icon.png"),
  ...PHOTOS.map((name) => rooted(`exercises/${name}`)),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (
            (await caches.match(rooted("index.html"))) ||
            (await caches.match(rooted("./"))) ||
            new Response("Offline", { status: 503 })
          );
        }
        return new Response("Offline", { status: 503 });
      }),
  );
});
