/* 轻练 Service Worker：网络优先，离线回退缓存 + 休息结束通知兜底 */
const CACHE = 'qinglian-v17';
const ASSETS = ['./', './index.html', './tokens.css', './style.css', './app.js', './diet-module.js', './training-plans.js', './rewards-module.js', './manifest.webmanifest', './icon.svg', './exercises-lib.json', './foods-lib.json'];
const restTimers = [];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// 网络优先：有网时从服务器取最新版本，断网时回退缓存
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || new Response('离线', { status: 503 })))
  );
});

// 页面请求：到点弹通知（锁屏/页面挂起时的兜底提醒）
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'rest-end' && d.at) {
    restTimers.forEach(clearTimeout);
    restTimers.length = 0;
    const ms = Math.max(0, d.at - Date.now());
    const t = setTimeout(() => {
      self.registration.showNotification('轻练 · 休息结束 💪', {
        body: '休息好了，开始下一组吧！',
        icon: './icon.svg',
        badge: './icon.svg',
        tag: 'ql-rest',
        requireInteraction: false,
        vibrate: [300, 100, 300]
      });
    }, ms);
    restTimers.push(t);
  }
});

// 点击通知回到训练页
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('./');
    })
  );
});
