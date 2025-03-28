// 캐시 이름 정의
const CACHE_NAME = 'fire-news-cache-v1';
const OFFLINE_URL = '/offline.html';

// 초기 캐시에 저장할 리소스 목록
const RESOURCES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/icons/fire-alert-icon.png',
  '/icons/badge-icon.png',
  '/manifest.json',
  '/assets/index.css',
];

// 설치 이벤트 처리
self.addEventListener('install', (event) => {
  // 서비스 워커 설치 즉시 활성화
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('캐시 생성됨');
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

// 활성화 이벤트 처리
self.addEventListener('activate', (event) => {
  // 새 서비스 워커 활성화 후 이전 캐시 정리
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // 활성화된 서비스 워커가 모든 클라이언트 탭을 제어하도록 함
        return self.clients.claim();
      })
  );
});

// fetch 요청 처리
self.addEventListener('fetch', (event) => {
  // API 요청이나 외부 리소스 요청은 네트워크 우선 전략 사용
  if (
    event.request.url.includes('/api/') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // 정적 리소스는 캐시 우선 전략 사용
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시된 응답 반환
      if (response) {
        return response;
      }

      // 캐시에 없으면 네트워크 요청 후 캐시에 저장
      return fetch(event.request)
        .then((response) => {
          // 유효한 응답인지 확인
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // 응답을 클론하여 캐시에 저장 (응답 스트림은 한 번만 사용 가능)
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 네트워크 에러 시 오프라인 페이지 제공
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

// 푸시 알림 이벤트 처리
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/fire-alert-icon.png',
    badge: '/icons/badge-icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data.url || '/';

      // 이미 열린 창이 있는지 확인
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
