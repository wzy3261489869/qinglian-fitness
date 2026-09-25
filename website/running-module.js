/* =====================================================================
 * 户外跑步模块
 * 架构：经典脚本 + window.RunModule 命名空间 + document 级事件委托
 * 能力：GPS 轨迹（Leaflet 地图，加载失败时 SVG 兜底）、时间戳计时、
 *   里程（haversine + 精度过滤）、配速、卡路里、断点恢复
 * 数据：跑步完成后写入全局 records（type:'run'），自动并入统计与热力图
 * 依赖（app.js）：store/$/$$/esc/toast/pad/todayStr/genId/saveRecords
 * ===================================================================== */
'use strict';
(function () {
  let sess = null;          // { elapsed, runStart, running, points, distance }
  let pageEl = null;
  let watchId = null, tickIv = null;
  let map = null, poly = null, startMarker = null, leafletOk = false;

  /* ---------------- 工具 ---------------- */
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  // haversine，单位米
  function distM(a, b) {
    const R = 6371000, toR = d => d * Math.PI / 180;
    const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 +
      Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function elapsedMs() {
    if (!sess) return 0;
    return sess.elapsed + (sess.running ? Date.now() - sess.runStart : 0);
  }
  function fmtDur(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return h > 0
      ? `${h}:${pad(m)}:${pad(sec)}`
      : `${pad(m)}:${pad(sec)}`;
  }
  function stats() {
    const km = sess ? sess.distance / 1000 : 0;
    const min = elapsedMs() / 60000;
    const pace = km > 0 ? min / km : 0;
    return {
      km,
      paceMin: Math.floor(pace), paceSec: Math.round((pace - Math.floor(pace)) * 60),
      kcal: Math.round((typeof profile !== 'undefined' ? profile.weight : 70) * km * 1.036)
    };
  }
  function persist() { if (sess) store.set('runSession', sess); }
  function clearPersist() { store.set('runSession', null); }

  /* ---------------- 地图：Leaflet（CDN 动态加载） ---------------- */
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.id = 'leaflet-css';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function initMap() {
    const host = $('#runMapHost', pageEl);
    if (!host || map) return;
    const first = sess.points[0];
    map = L.map(host, { zoomControl: false, attributionControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    map.setView([first.lat, first.lng], 16);
    poly = L.polyline(sess.points.map(p => [p.lat, p.lng]), { color: '#00b578', weight: 5 }).addTo(map);
    startMarker = L.circleMarker([first.lat, first.lng], { radius: 7, color: '#fff', weight: 2, fillColor: '#00b578', fillOpacity: 1 }).addTo(map);
    leafletOk = true;
  }
  function updateMap() {
    if (poly && sess.points.length) {
      poly.setLatLngs(sess.points.map(p => [p.lat, p.lng]));
      map.panTo([sess.points.at(-1).lat, sess.points.at(-1).lng]);
    }
  }
  // SVG 兜底：无 Leaflet 时自绘轨迹
  function renderSvgTrack() {
    const host = $('#runMapHost', pageEl);
    if (!host) return;
    const pts = sess.points;
    if (pts.length < 2) { host.innerHTML = '<div class="rm-await">GPS 定位中…</div>'; return; }
    const W = host.clientWidth || 320, H = host.clientHeight || 200, P = 24;
    const lats = pts.map(p => p.lat), lngs = pts.map(p => p.lng);
    let minLa = Math.min(...lats), maxLa = Math.max(...lats), minLn = Math.min(...lngs), maxLn = Math.max(...lngs);
    if (maxLa - minLa < 1e-5) { minLa -= 1e-4; maxLa += 1e-4; }
    if (maxLn - minLn < 1e-5) { minLn -= 1e-4; maxLn += 1e-4; }
    const xy = pts.map(p => [
      P + (p.lng - minLn) / (maxLn - minLn) * (W - 2 * P),
      H - P - (p.lat - minLa) / (maxLa - minLa) * (H - 2 * P)
    ]);
    const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const s = xy[0], e = xy.at(-1);
    host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <path d="${d}" fill="none" stroke="#00b578" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <circle cx="${s[0]}" cy="${s[1]}" r="5" fill="#00b578" stroke="#fff" stroke-width="2"/>
      <circle cx="${e[0]}" cy="${e[1]}" r="5" fill="#ff7a00" stroke="#fff" stroke-width="2"/>
    </svg>`;
  }

  /* ---------------- GPS 采集 ---------------- */
  function startWatch() {
    if (!navigator.geolocation) { toast('当前浏览器不支持 GPS 定位'); return; }
    watchId = navigator.geolocation.watchPosition(onPos, onGpsErr,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }
  function stopWatch() { if (watchId != null) navigator.geolocation.clearWatch(watchId); watchId = null; }
  function onPos(pos) {
    const { latitude: lat, longitude: lng, accuracy: acc, speed } = pos.coords;
    const pts = sess.points;
    const last = pts.at(-1);
    // 精度过滤：首点从宽；之后忽略 35m 以外的粗定位
    if (last && acc > 35) return;
    if (last) {
      const d = distM(last, { lat, lng });
      const dt = (Date.now() - last.t) / 1000;
      // 抖动过滤：移动 <3m 视为原地；瞬移 >12m/s（约43km/h 跑步上限）视为漂移
      if (d < 3) return;
      if (dt > 0 && d / dt > 12) return;
      if (speed != null && speed > 12) return;
      sess.distance += d;
    }
    pts.push({ lat, lng, t: Date.now(), acc: Math.round(acc) });
    persist();
    if (leafletOk) updateMap(); else renderSvgTrack();
    renderStatsDom();
  }
  function onGpsErr(e) {
    const msg = e.code === 1 ? '定位权限被拒绝，请在浏览器设置中允许定位'
      : e.code === 3 ? 'GPS 信号弱，请到开阔地带重试'
      : '定位失败：' + e.message;
    const el = $('#runGpsMsg', pageEl);
    if (el) { el.textContent = msg; el.hidden = false; }
  }

  /* ---------------- DOM ---------------- */
  function renderStatsDom() {
    if (!pageEl) return;
    const st = stats();
    const set = (id, v) => { const el = $(id, pageEl); if (el) el.textContent = v; };
    set('#runTime', fmtDur(elapsedMs()));
    set('#runKm', st.km.toFixed(2));
    set('#runPace', st.km > 0 ? `${pad(st.paceMin)}'${pad(st.paceSec)}"` : '--');
    set('#runKcal', String(st.kcal));
  }
  function tick() {
    renderStatsDom();
    if (!sess.running) return;
  }

  function openPage(resumed) {
    sess = resumed || { elapsed: 0, runStart: 0, running: false, points: [], distance: 0 };
    pageEl = document.createElement('div');
    pageEl.className = 'subpage run-page';
    pageEl.innerHTML = `
      <div class="sp-head">
        <button class="icon-btn back" id="runBack" aria-label="返回（保留进度）">‹</button>
        <b>户外跑步</b>
        <button class="icon-btn" id="runStop" aria-label="结束并保存">结束</button>
      </div>
      <div class="sp-body run-body">
        <div class="run-stats">
          <div class="rstat-i"><div class="rstat-v" id="runTime">00:00</div><div class="rstat-l">时长</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runKm">0.00</div><div class="rstat-l">公里</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runPace">--</div><div class="rstat-l">配速 /km</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runKcal">0</div><div class="rstat-l">千卡</div></div>
        </div>
        <p class="run-gps-msg" id="runGpsMsg" hidden></p>
        <div class="run-map-card">
          <div id="runMapHost" class="run-map"><div class="rm-await">点「开始」后记录 GPS 轨迹</div></div>
        </div>
      </div>
      <div class="run-foot">
        <button class="btn mega run-main-btn" id="runToggle">▶ 开始跑步</button>
      </div>`;
    document.body.appendChild(pageEl);
    requestAnimationFrame(() => pageEl.classList.add('show'));

    $('#runToggle', pageEl).addEventListener('click', onToggle);
    $('#runStop', pageEl).addEventListener('click', finishRun);
    $('#runBack', pageEl).addEventListener('click', () => {
      persist(); teardown();
      toast('跑步进度已保留，重新进入可恢复');
    });

    clearInterval(tickIv);
    tickIv = setInterval(tick, 500);
    renderStatsDom();
    if (sess.points.length) {
      loadLeaflet().then(initMap).catch(renderSvgTrack);
    }
    if (resumed && (resumed.elapsed || resumed.points.length)) toast('已恢复上次跑步 🏃');
  }

  function onToggle() {
    if (sess.running) {
      // 暂停
      sess.elapsed += Date.now() - sess.runStart;
      sess.running = false;
      stopWatch();
      $('#runToggle', pageEl).textContent = '▶ 继续';
    } else {
      sess.running = true;
      sess.runStart = Date.now();
      $('#runToggle', pageEl).textContent = '⏸ 暂停';
      const msg = $('#runGpsMsg', pageEl); if (msg) msg.hidden = true;
      startWatch();
      if (!map && sess.points.length === 0) {
        loadLeaflet().then(() => initMap()).catch(() => {});
      }
    }
    persist(); renderStatsDom();
  }

  async function finishRun() {
    const st = stats();
    if (sess.distance < 50 && !confirm('当前里程不足 0.05km，确定结束并保存吗？')) return;
    if (sess.running) { sess.elapsed += Date.now() - sess.runStart; sess.running = false; stopWatch(); }
    // 轨迹点抽稀存储（最多 200 点），控制记录体积
    const step = Math.max(1, Math.ceil(sess.points.length / 200));
    const trackPts = sess.points.filter((_, i) => i % step === 0).map(p => [p.lat, p.lng]);
    const minutes = Math.max(1, Math.round(elapsedMs() / 60000));
    const rec = {
      id: genId(), type: 'run', date: todayStr(),
      planTitle: '户外跑步',
      kcal: st.kcal, minutes,
      distanceKm: +st.km.toFixed(2),
      track: trackPts,
      doneCount: 1, total: 1
    };
    records.unshift(rec);
    saveRecords();
    clearPersist();
    // 已登录则后台静默云同步（不走 cloudUpload，避免其成功后 renderMine 跳页）
    try {
      if (typeof auth !== 'undefined' && auth.token && typeof api === 'function' && typeof syncCollect === 'function') {
        api('PUT', '/api/data', syncCollect()).catch(() => {});
      }
    } catch (e) {}
    teardown();
    toast(`跑步已保存 · ${rec.distanceKm} km · ${rec.kcal} 千卡`);
    if (typeof showTab === 'function') showTab('stats');
  }

  function teardown() {
    stopWatch();
    clearInterval(tickIv); tickIv = null;
    if (map) { try { map.remove(); } catch (e) {} map = null; poly = null; startMarker = null; leafletOk = false; }
    if (pageEl) {
      pageEl.classList.remove('show');
      const el = pageEl; pageEl = null;
      setTimeout(() => el.remove(), 200);
    }
  }

  /* ---------------- 入口 ---------------- */
  function start() {
    const saved = store.get('runSession', null);
    if (saved && (saved.points.length || saved.elapsed)) {
      if (confirm('发现未结束的跑步记录，是否恢复？')) { openPage(saved); return; }
    }
    openPage(null);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-run]');
    if (!btn) return;
    if (btn.dataset.run === 'start') start();
  });

  window.RunModule = { start };
})();
