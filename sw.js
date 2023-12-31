// this is sw.js
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('video-recording-pwa').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/main.js',
                '/firebase.js',
                '/manifest.json',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
