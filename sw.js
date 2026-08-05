// Service Worker for Agent Ai Layanan PWA (Offline & WebAPK Support)
const CACHE_NAME = 'agent-ai-layanan-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './assets/css/style.css',
  './assets/css/responsive.css',
  './assets/js/db.js',
  './assets/js/typing-simulator.js',
  './assets/js/ai-agent.js',
  './assets/js/ui-controller.js',
  './assets/js/pwa-installer.js',
  './assets/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
