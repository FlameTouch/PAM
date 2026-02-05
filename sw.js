// Service Worker для PWA додатку Drink Master
// Обробляє кешування та офлайн функціональність

const CACHE_NAME = 'drink-master-v5';
const RUNTIME_CACHE = 'drink-master-runtime-v5';
const API_CACHE = 'drink-master-api-v5';

// Статичні ресурси для кешування при встановленні
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/database.js',
    '/api.js',
    '/state.js',
    '/views.js',
    '/filters.js',
    '/native-features.js',
    '/manifest.json',
    '/icons/icon-72x72.svg',
    '/icons/icon-96x96.svg',
    '/icons/icon-128x128.svg',
    '/icons/icon-144x144.svg',
    '/icons/icon-152x152.svg',
    '/icons/icon-192x192.svg',
    '/icons/icon-384x384.svg',
    '/icons/icon-512x512.svg'
];

// Подія встановлення Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Встановлення');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Кешування статичних файлів');
                return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
                    console.log('Service Worker: Деякі файли не були закешовані:', error);
                    return cache.add('/index.html').catch(() => {
                        console.log('Service Worker: Не вдалося закешувати index.html');
                    });
                });
            })
    );
    self.skipWaiting();
});

// Подія активації Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активація');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
                        console.log('Service Worker: Видалення старого кешу:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Стратегія Network First з fallback до Cache
// Спочатку намагається отримати дані з мережі, якщо не вдається - використовує кеш
async function networkFirst(request) {
    try {
        // Спробувати отримати відповідь з мережі
        const networkResponse = await fetch(request);
        
        // Якщо відповідь успішна, зберегти в кеш для майбутнього використання
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone).catch(err => {
                console.log('Service Worker: Помилка під час кешування:', err);
            });
        }
        
        return networkResponse;
    } catch (error) {
        // Мережа недоступна - шукати в кеші
        console.log('Service Worker: Мережа не працює, використовую кеш:', request.url);
        
        // Спочатку перевірити API кеш
        const cachedResponse = await caches.match(request, { cacheName: API_CACHE });
        if (cachedResponse) {
            console.log('Service Worker: Знайдено в кеші:', request.url);
            return cachedResponse;
        }

        // Перевірити runtime кеш
        const runtimeCached = await caches.match(request, { cacheName: RUNTIME_CACHE });
        if (runtimeCached) {
            return runtimeCached;
        }
        
        // Якщо це запит до API напоїв і немає в кеші, повернути порожню відповідь
        if (request.url.includes('thecocktaildb.com')) {
            console.log('Service Worker: Немає в кеші, повертаю порожню відповідь');
            return new Response(JSON.stringify({ drinks: [] }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        throw error;
    }
}

// Стратегія Cache First
// Спочатку перевіряє кеш, якщо немає - завантажує з мережі
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Якщо це запит HTML і мережа недоступна, повернути index.html
        if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
            const indexCache = await caches.match('/index.html');
            if (indexCache) {
                return indexCache;
            }
        }
        const url = new URL(request.url);
        if (url.pathname === '/' || url.pathname === '') {
            const indexCache = await caches.match('/index.html');
            if (indexCache) {
                return indexCache;
            }
        }
        throw error;
    }
}

// Стратегія Stale While Revalidate
// Повертає дані з кешу одразу, але оновлює кеш у фоновому режимі
async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);

    // Оновити кеш у фоновому режимі
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Ігнорувати помилки мережі
    });
    
    // Повернути кешовану відповідь одразу, якщо вона є
    return cachedResponse || fetchPromise;
}

// Подія fetch - обробка всіх мережевих запитів
// Це основна функція Service Worker, яка перехоплює всі HTTP запити
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Обробляти тільки GET запити та запити до нашого домену або API
    if (request.method !== 'GET') {
        return;
    }
    
    // Перевірити, чи це запит до нашого додатку або API
    if (url.origin !== self.location.origin && !url.hostname.includes('thecocktaildb.com') && !url.hostname.includes('allorigins.win')) {
        return;
    }
    
    // Обробка навігаційних запитів (запити HTML сторінок)
    if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            caches.match('/index.html').then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        const cache = caches.open(CACHE_NAME);
                        cache.then(c => c.put('/index.html', networkResponse.clone()));
                    }
                    return networkResponse;
                }).catch(() => {
                    return caches.match('/index.html').then((fallbackResponse) => {
                        if (fallbackResponse) {
                            return fallbackResponse;
                        }
                        return new Response('Офлайн - Перевірте підключення до інтернету', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
                });
            })
        );
        return;
    }
    
    // Обробка запитів до API напоїв
    if (url.hostname.includes('thecocktaildb.com') || url.hostname.includes('allorigins.win') || url.pathname.includes('/api/')) {
        event.respondWith(networkFirst(request));
    }
    // Обробка зображень
    else if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        event.respondWith(staleWhileRevalidate(request));
    }
    // Обробка статичних ресурсів (HTML, CSS, JS, JSON)
    else if (
        request.destination === 'document' ||
        request.destination === 'style' ||
        request.destination === 'script' ||
        url.pathname.match(/\.(html|css|js|json)$/i) ||
        url.pathname === '/' ||
        url.pathname === ''
    ) {
        event.respondWith(cacheFirst(request));
    }
    // Для всіх інших запитів використовувати Network First
    else {
        event.respondWith(networkFirst(request));
    }
});

// Обробка повідомлень від основного додатку
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});
