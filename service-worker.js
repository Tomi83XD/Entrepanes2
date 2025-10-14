const CACHE_NAME = 'entrepanes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js', // O la ruta a tu bundle de React
  '/static/css/main.css', // O la ruta a tu CSS
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Agrega aquí todas las rutas de los recursos estáticos que quieres cachear
  // incluyendo las imágenes de tus productos si no se cargan dinámicamente desde una API
  'https://tumercaditovegano.com.ar/wp-content/uploads/2024/03/Sandwich-de-miga-jamon-y-queso-vegano-scaled.jpg',
  'https://dcdn-us.mitiendanube.com/stores/004/823/838/products/descarga-2-52c0934cc46a90250817182173158410-1024-1024.jpg',
  // ... y el resto de tus imágenes de productos
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no está en caché, intenta obtenerlo de la red
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Elimina cachés antiguos
          }
        })
      );
    })
  );
});