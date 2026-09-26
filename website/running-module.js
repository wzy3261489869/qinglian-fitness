/* =====================================================================
 * 户外运动模块（跑步 / 骑行）
 * 架构：经典脚本 + window.RunModule 命名空间 + document 级事件委托
 * 能力：GPS 轨迹（Leaflet + 类苹果风浅色底图，加载失败 SVG 兜底）、
 *   时间戳计时、里程（haversine + 精度/抖动/漂移过滤）、
 *   跑步配速、骑行均速、卡路里、断点恢复
 * 数据：完成后写入全局 records（type:'run' | 'ride'），自动并入统计与热力图
 * 依赖（app.js）：store/$/$$/esc/toast/pad/todayStr/genId/saveRecords/
 *   records/showConfirm/showTab
 * ===================================================================== */
'use strict';
(function () {
  const BRAND = '#00b578';      // 轨迹主色：软件品牌绿
  const FINISH = '#ff7a1a';     // 终点色
  const MODES = {
    run:  { title: '户外跑步', startText: '开始跑步', kcalK: 1.036, vMax: 12, pace: true },
    walk: { title: '户外健走', startText: '开始健走', kcalK: 0.45,  vMax: 5,  pace: true },
    ride: { title: '户外骑行', startText: '开始骑行', kcalK: 0.40,  vMax: 25, pace: false },
    hike: { title: '户外徒步', startText: '开始徒步', kcalK: 0.60,  vMax: 7,  pace: true }
  };

  let sess = null;          // { mode, elapsed, runStart, running, points, distance }
  let pageEl = null;
  let watchId = null, tickIv = null;
  let map = null, tileLayer = null, haloPoly = null, poly = null;
  let startMarker = null, curMarker = null;
  let leafletOk = false, leafletLoading = false;

  /* ---------------- 工具 ---------------- */
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
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }
  function stats() {
    const km = sess ? sess.distance / 1000 : 0;
    const hours = elapsedMs() / 3600000;
    const pace = km > 0 ? hours * 60 / km : 0; // 分/km
    const w = typeof profile !== 'undefined' && profile.weight ? profile.weight : 70;
    const kcalK = MODES[sess ? sess.mode : 'run'].kcalK;
    return {
      km,
      paceMin: Math.floor(pace), paceSec: Math.round((pace - Math.floor(pace)) * 60),
      avgKmh: hours > 0 ? km / hours : 0,
      kcal: Math.round(w * km * kcalK)
    };
  }
  function persist() { if (sess) store.set('outdoorSession', sess); }
  function clearPersist() {
    store.set('outdoorSession', null);
    store.set('runSession', null); // 旧版本键兼容
  }
  const isDark = () => document.documentElement.dataset.theme === 'dark';

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
  function tileUrl() {
    // Esri 浅灰画布：无需 API Key、低饱和细路网，观感接近苹果地图
    // 深色模式不换瓦片源，由 CSS invert 滤镜生成深色底图（见 .darkmap）
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  }
  function applyMapTheme() {
    const host = pageEl ? $('#runMapHost', pageEl) : null;
    if (host) host.classList.toggle('darkmap', isDark());
  }
  let following = true; // 地图是否跟随当前位置；false 时显示全览/自由浏览

  function fitAllTrack() {
    if (!map || !sess.points.length) return;
    if (sess.points.length < 2) { map.setView([sess.points[0].lat, sess.points[0].lng], 16); return; }
    map.fitBounds(L.latLngBounds(sess.points.map(p => [p.lat, p.lng])),
      { padding: [52, 52], maxZoom: 16 });
  }
  function initMap() {
    const host = $('#runMapHost', pageEl);
    if (!host || map || !sess.points.length) return;
    const first = sess.points[0];
    map = L.map(host, { zoomControl: false, attributionControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    tileLayer = L.tileLayer(tileUrl(), { maxZoom: 17 }).addTo(map);
    map.setView([first.lat, first.lng], 16);
    const ll = sess.points.map(p => [p.lat, p.lng]);
    // 轨迹：白色描边 + 品牌绿主线，苹果风运动轨迹样式
    haloPoly = L.polyline(ll, {
      color: '#fff', weight: 10, opacity: .9,
      lineJoin: 'round', lineCap: 'round'
    }).addTo(map);
    poly = L.polyline(ll, {
      color: BRAND, weight: 5.5, lineJoin: 'round', lineCap: 'round'
    }).addTo(map);
    startMarker = L.circleMarker(ll[0], {
      radius: 7, color: '#fff', weight: 2.5, fillColor: BRAND, fillOpacity: 1
    }).addTo(map);
    curMarker = L.circleMarker(ll.at(-1), {
      radius: 6, color: '#fff', weight: 2.5, fillColor: BRAND, fillOpacity: 1
    }).addTo(map);
    // 用户手动拖动地图 → 退出跟随
    map.on('dragstart', () => {
      if (following) { following = false; syncCtlBtn(); }
    });
    leafletOk = true;
    applyMapTheme();
    // 子页滑入动画结束后再校正容器尺寸（避免瓦片只铺一半），然后按当前模式取景
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!map) return;
      map.invalidateSize();
      if (following) {
        if (sess.points.length > 1) map.panTo(ll.at(-1));
      } else fitAllTrack();
    }));
  }
  function updateMap() {
    if (!poly || !sess.points.length) return;
    const ll = sess.points.map(p => [p.lat, p.lng]);
    haloPoly.setLatLngs(ll);
    poly.setLatLngs(ll);
    curMarker.setLatLng(ll.at(-1));
    if (following) map.panTo(ll.at(-1), { animate: true });
  }
  /* 悬浮按钮两态：跟随中显示「全览」→ fitBounds 全轨迹；浏览中显示「定位」→ 回到跟随 */
  function syncCtlBtn() {
    const btn = $('#runFitBtn', pageEl);
    if (!btn) return;
    btn.classList.toggle('locate', !following);
    btn.title = following ? '查看完整轨迹' : '回到当前位置';
    btn.setAttribute('aria-label', btn.title);
    btn.querySelector('.ctl-tx').textContent = following ? '全览' : '定位';
  }
  // 主题切换后同步深色滤镜（tick 中轻量调用）
  function refreshTiles() { applyMapTheme(); }
  // SVG 兜底：无 Leaflet 时自绘轨迹（同样双层描边）
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
      <path d="${d}" fill="none" stroke="${isDark() ? '#000' : '#fff'}" stroke-width="8"
        stroke-linecap="round" stroke-linejoin="round" opacity="${isDark() ? .55 : .9}"/>
      <path d="${d}" fill="none" stroke="${BRAND}" stroke-width="4.5"
        stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>
      <circle cx="${s[0]}" cy="${s[1]}" r="5" fill="${BRAND}" stroke="#fff" stroke-width="2"/>
      <circle cx="${e[0]}" cy="${e[1]}" r="5" fill="${FINISH}" stroke="#fff" stroke-width="2"/>
    </svg>`;
  }
  function ensureMap() {
    if (leafletOk) { updateMap(); return; }
    if (leafletLoading) { renderSvgTrack(); return; }
    leafletLoading = true;
    loadLeaflet()
      .then(() => { leafletLoading = false; initMap(); })
      .catch(() => { leafletLoading = false; renderSvgTrack(); });
    renderSvgTrack();
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
    const vMax = MODES[sess.mode].vMax;
    // 精度过滤：首点从宽；之后忽略 35m 以外的粗定位
    if (last && acc > 35) return;
    if (last) {
      const d = distM(last, { lat, lng });
      const dt = (Date.now() - last.t) / 1000;
      // 抖动过滤：移动 <3m 视为原地；超速视为漂移（跑步 43km/h / 骑行 90km/h）
      if (d < 3) return;
      if (dt > 0 && d / dt > vMax) return;
      if (speed != null && speed > vMax) return;
      sess.distance += d;
    }
    pts.push({ lat, lng, t: Date.now(), acc: Math.round(acc) });
    persist();
    ensureMap();
    renderStatsDom();
  }
  function onGpsErr(e) {
    const msg = e.code === 1 ? '定位权限被拒绝，请在浏览器设置中允许定位'
      : e.code === 3 ? 'GPS 信号弱，请到开阔地带重试'
      : '定位失败：' + e.message;
    const el = $('#runGpsMsg', pageEl);
    if (el) { el.textContent = msg; el.hidden = false; }
  }

  /* ---------------- 进行页 DOM ---------------- */
  function renderStatsDom() {
    if (!pageEl) return;
    const st = stats();
    const set = (id, v) => { const el = $(id, pageEl); if (el) el.textContent = v; };
    set('#runTime', fmtDur(elapsedMs()));
    set('#runKm', st.km.toFixed(2));
    if (sess.mode === 'ride') {
      set('#runPace', st.km > 0 ? st.avgKmh.toFixed(1) : '--');
    } else {
      set('#runPace', st.km > 0 ? `${pad(st.paceMin)}'${pad(st.paceSec)}"` : '--');
    }
    set('#runKcal', String(st.kcal));
  }
  function tick() {
    renderStatsDom();
    if (leafletOk) refreshTiles();
  }
  function toggleLabel() {
    if (sess.running) return '暂停';
    if (sess.elapsed || sess.points.length) return '继续';
    return MODES[sess.mode].startText;
  }

  function openPage(resumed, mode) {
    sess = resumed || { mode, elapsed: 0, runStart: 0, running: false, points: [], distance: 0 };
    if (!sess.mode) sess.mode = 'run';          // 旧版本数据兼容
    if (sess.running) sess.running = false;    // 异常退出恢复：一律先暂停
    const m = MODES[sess.mode];

    pageEl = document.createElement('div');
    pageEl.className = 'subpage run-page';
    pageEl.innerHTML = `
      <div class="sp-head">
        <button class="icon-btn back" id="runBack" aria-label="返回（保留进度）">‹</button>
        <b>${m.title}</b>
        <button class="icon-btn" id="runStop" aria-label="结束并保存">结束</button>
      </div>
      <div class="sp-body run-body">
        <div class="run-stats">
          <div class="rstat-i"><div class="rstat-v" id="runTime">00:00</div><div class="rstat-l">时长</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runKm">0.00</div><div class="rstat-l">公里</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runPace">--</div><div class="rstat-l">${sess.mode === 'ride' ? '均速 km/h' : '配速 /km'}</div></div>
          <div class="rstat-i"><div class="rstat-v" id="runKcal">0</div><div class="rstat-l">千卡</div></div>
        </div>
        <p class="run-gps-msg" id="runGpsMsg" hidden></p>
        <div class="run-map-card">
          <div id="runMapHost" class="run-map"><div class="rm-await">点「${m.startText}」后记录 GPS 轨迹</div></div>
          <button type="button" class="run-map-ctl" id="runFitBtn" title="查看完整轨迹" aria-label="查看完整轨迹">
            <svg class="ctl-ic ic-fit" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/><path d="M20 9V5.5A1.5 1.5 0 0 0 18.5 4H15"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20H9"/><path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/></svg>
            <svg class="ctl-ic ic-locate" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3"/></svg>
            <span class="ctl-tx">全览</span>
          </button>
        </div>
      </div>
      <div class="run-foot">
        <button class="btn mega run-main-btn" id="runToggle">${toggleLabel()}</button>
      </div>`;
    document.body.appendChild(pageEl);
    requestAnimationFrame(() => pageEl.classList.add('show'));

    $('#runToggle', pageEl).addEventListener('click', onToggle);
    $('#runStop', pageEl).addEventListener('click', finishSess);
    $('#runBack', pageEl).addEventListener('click', () => {
      persist(); teardown();
      toast('运动进度已保留，重新进入可恢复');
    });
    $('#runFitBtn', pageEl).addEventListener('click', () => {
      if (following) {
        following = false; fitAllTrack();
      } else {
        following = true;
        if (sess.points.length) map.panTo([sess.points.at(-1).lat, sess.points.at(-1).lng]);
      }
      syncCtlBtn();
    });

    // 恢复旧记录：默认全览完整轨迹；新开始：跟随当前位置
    following = !resumed;
    clearInterval(tickIv);
    tickIv = setInterval(tick, 500);
    renderStatsDom();
    syncCtlBtn();
    if (sess.points.length) ensureMap();
    if (resumed && (resumed.elapsed || resumed.points.length)) toast('已恢复上次' + (sess.mode === 'ride' ? '骑行' : '跑步'));
  }

  function onToggle() {
    if (sess.running) {
      sess.elapsed += Date.now() - sess.runStart;
      sess.running = false;
      stopWatch();
    } else {
      sess.running = true;
      sess.runStart = Date.now();
      const msg = $('#runGpsMsg', pageEl); if (msg) msg.hidden = true;
      startWatch();
    }
    $('#runToggle', pageEl).textContent = toggleLabel();
    persist(); renderStatsDom();
  }

  async function finishSess() {
    const st = stats();
    if (sess.distance < 50) {
      const ok = await showConfirm({
        title: '结束本次运动？',
        desc: '当前里程不足 0.05 km，确定结束并保存吗？',
        okText: '结束并保存'
      });
      if (!ok) return;
    }
    if (sess.running) { sess.elapsed += Date.now() - sess.runStart; sess.running = false; stopWatch(); }
    // 轨迹点抽稀存储（最多 200 点），控制记录体积
    const step = Math.max(1, Math.ceil(sess.points.length / 200));
    const trackPts = sess.points.filter((_, i) => i % step === 0).map(p => [p.lat, p.lng]);
    const minutes = Math.max(1, Math.round(elapsedMs() / 60000));
    const rec = {
      id: genId(), type: sess.mode, date: todayStr(),
      planTitle: MODES[sess.mode].title,
      kcal: st.kcal, minutes,
      distanceKm: +st.km.toFixed(2),
      track: trackPts,
      doneCount: 1, total: 1
    };
    records.unshift(rec);
    saveRecords();
    clearPersist();
    // 已登录则后台静默云同步（避免跳页）
    try {
      if (typeof auth !== 'undefined' && auth.token && typeof api === 'function' && typeof syncCollect === 'function') {
        api('PUT', '/api/data', syncCollect()).catch(() => {});
      }
    } catch (e) {}
    const label = sess.mode === 'ride' ? '骑行' : '跑步';
    teardown();
    toast(`${label}已保存 · ${rec.distanceKm} km · ${rec.kcal} 千卡`);
    if (typeof showTab === 'function') showTab('stats');
  }

  function teardown() {
    stopWatch();
    clearInterval(tickIv); tickIv = null;
    if (map) {
      try { map.remove(); } catch (e) {}
      map = null; tileLayer = null; haloPoly = null; poly = null;
      startMarker = null; curMarker = null;
      leafletOk = false; leafletLoading = false;
    }
    if (pageEl) {
      pageEl.classList.remove('show');
      const el = pageEl; pageEl = null;
      setTimeout(() => el.remove(), 200);
    }
  }

  /* ---------------- 户外 tab 主页 ---------------- */
  /* 图标统一规范：24×24，stroke 1.8，round，重心居中，放大至 28px */
  const ICON_RUN = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.6" cy="4.9" r="1.7"/><path d="M12.5 7.7 10.3 12.3"/><path d="M12.7 8.5 15.9 9.5 14.6 11.7"/><path d="M11.9 8.3 8.7 9.5 7.7 11.9"/><path d="M10.3 12.3 13.5 13.1 14.8 16.9"/><path d="M10.3 12.3 7.1 15.1 5.3 19.7"/></svg>`;
  const ICON_WALK = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.9" r="1.7"/><path d="M12 7.7 11.3 13.2"/><path d="M12.2 8.9 14.1 12"/><path d="M11.6 8.9 9.5 11.6"/><path d="M11.3 13.2 14 16.4 15 20.2"/><path d="M11.3 13.2 8.9 16.6 7 20.2"/></svg>`;
  const ICON_BIKE = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.2" cy="17.2" r="3.2"/><circle cx="17.8" cy="17.2" r="3.2"/><path d="M6.2 17.2 9.8 10.6 14.8 9.8"/><path d="M14.8 9.8 17.8 17.2"/><path d="M9.8 10.6 11.7 14.6 6.2 17.2"/><path d="M13.9 8.9h1.8"/></svg>`;
  const ICON_HIKE = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="16.8" cy="5.6" r="1.5"/><path d="m3.4 19 5.7-9.2 3.7 5.3 2.2-3.5L20.6 19z"/></svg>`;

  const TAG_TXT = { run: '跑步', walk: '健走', ride: '骑行', hike: '徒步' };
  function historyHTML() {
    const list = records.filter(r => TAG_TXT[r.type]).slice(0, 8);
    if (!list.length) return '<div class="empty" style="padding:24px 16px">还没有户外运动记录<br>选择一项运动，开始第一次吧</div>';
    return list.map(r => `
      <div class="od-hi">
        <span class="od-tag ${r.type}">${TAG_TXT[r.type]}</span>
        <b class="od-hi-km">${r.distanceKm != null ? r.distanceKm.toFixed(2) : '--'} <i>km</i></b>
        <span class="od-hi-r"><b>${r.minutes} <i>分钟</i></b><small>${r.date.slice(5)}</small></span>
      </div>`).join('');
  }

  function renderTab() {
    $('#app').innerHTML = `
      <div class="od-page">
        <div class="page-head">
          <h1>户外运动</h1>
          <p>GPS 实时轨迹 · 里程、配速与卡路里自动记录</p>
        </div>
        <div class="od-grid">
          <button class="od-tile" data-od="start" data-mode="run">
            <span class="od-ic run">${ICON_RUN}</span>
            <b>跑步</b><small>实时配速</small>
          </button>
          <button class="od-tile" data-od="start" data-mode="walk">
            <span class="od-ic walk">${ICON_WALK}</span>
            <b>健走</b><small>轻松燃脂</small>
          </button>
          <button class="od-tile" data-od="start" data-mode="ride">
            <span class="od-ic ride">${ICON_BIKE}</span>
            <b>骑行</b><small>均速里程</small>
          </button>
          <button class="od-tile" data-od="start" data-mode="hike">
            <span class="od-ic hike">${ICON_HIKE}</span>
            <b>徒步</b><small>山野探索</small>
          </button>
        </div>
        <div class="card">
          <h3>最近户外运动</h3>
          ${historyHTML()}
        </div>
      </div>`;
  }

  /* ---------------- 入口 / 恢复 ---------------- */
  async function start(mode) {
    if (!MODES[mode]) return;
    const saved = store.get('outdoorSession', null) || store.get('runSession', null);
    if (saved && (saved.points.length || saved.elapsed)) {
      const savedMode = saved.mode || 'run';
      const ok = await showConfirm({
        title: '恢复未结束的运动？',
        desc: `检测到一条未完成的「${MODES[savedMode].title}」记录，是否继续？选择不恢复将清除该记录。`,
        okText: '恢复记录'
      });
      if (ok) { openPage(saved); return; }
      clearPersist();
    }
    openPage(null, mode);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-od]');
    if (!btn) return;
    if (btn.dataset.od === 'start') start(btn.dataset.mode);
  });

  window.RunModule = { start, renderTab };
})();
