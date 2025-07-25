const CACHE_NAME = 'dementia-diary-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/login.html',
  '/register.html',
  '/traveler_diary.html',
  '/diary_detail.html',
  '/add_diary.html',
  '/travelers.html',
  '/add_traveler.html',
  '/member_profile.html',
  '/edit_traveler.html',
  '/relationship_management.html',
  '/patient_record.html',
  '/assessment.html',
  '/knowledge.html',
  '/faq.html',
  '/about.html',
  '/policy.html',
  '/terms.html',
  '/404.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});
