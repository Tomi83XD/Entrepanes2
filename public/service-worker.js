const CACHE_NAME = 'entrepanes-v2'; // Incrementa la versión
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
  
  // IMPORTANTE: Dejar pasar TODAS las peticiones de Firebase sin interceptar
  if (url.includes('firebaseio.com') || 
      url.includes('googleapis.com') || 
      url.includes('firebase.com') ||
      url.includes('firebasestorage.googleapis.com') || // Para imágenes
      url.includes('google.com') ||
      url.includes('firestore') ||
      url.includes('cloudfunctions.net') ||
      url.includes('identitytoolkit.googleapis.com') || // Para autenticación
      url.includes('securetoken.googleapis.com') || // Para tokens
      event.request.method === 'POST' || 
      event.request.method === 'PUT' ||
      event.request.method === 'DELETE' ||
      event.request.method === 'PATCH') {
    
    // CRÍTICO: Devolver fetch directamente sin cachear
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para el resto de peticiones (assets estáticos), usar cache first
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
        }).catch((error) => {
          console.error('Fetch failed:', error);
          throw error;
        });
      })
  );
});

// Opcional: Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});