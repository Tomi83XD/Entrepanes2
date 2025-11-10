const CACHE_NAME = 'entrepanes-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // IGNORAR todas las peticiones de Firebase/Firestore/Google APIs
  if (url.includes('firebaseio.com') || 
      url.includes('googleapis.com') || 
      url.includes('firebase.com') ||
      url.includes('google.com') ||
      url.includes('firestore') ||
      url.includes('cloudfunctions.net') || // Si usas Cloud Functions
      event.request.method === 'POST' || // No cachear POST requests
      event.request.method === 'PUT' ||
      event.request.method === 'DELETE') {
    // Dejar pasar sin interceptar
    return;
  }
  
  // Para el resto de peticiones, usar cache first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Solo cachear respuestas válidas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});