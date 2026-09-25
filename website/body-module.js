/* ============================================================
 * 肌肉会飞 · 身体维度模块（BodyModule）
 * 体脂率 / 腰围 / 臀围 / 臂围 / 大腿围记录 + 趋势曲线
 * 数据键：ql_bodyMap（{ 'YYYY-MM-DD': { bf, waist, hip, arm, thigh } }）
 * 云同步：app.js syncCollect/syncApply 统一纳入
 * ============================================================ */
(function () {
  'use strict';

  const METRICS = [
    { key: 'bf',    label: '体脂率', unit: '%',  icon: '🔥', step: 0.1, color: '#ff6b35' },
    { key: 'waist', label: '腰围',   unit: 'cm', icon: '📏', step: 0.5, color: '#165dff' },
    { key: 'hip',   label: '臀围',   unit: 'cm', icon: '🫶', step: 0.5, color: '#7c3aed' },
    { key: 'arm',   label: '臂围',   unit: 'cm', icon: '💪', step: 0.5, color: '#0ea5e9' },
    { key: 'thigh', label: '大腿围', unit: 'cm', icon: '🦵', step: 0.5, color: '#10b981' }
  ];
  const MKEYS = METRICS.map(m => m.key);
  const MByKey = {};
  METRICS.forEach(m => { MByKey[m.key] = m; });

  let curMetric = 'waist';
  let curRange = 60;

  const getMap = () => store.get('bodyMap', {}) || {};
  const setMap = m => store.set('bodyMap', m);

  /* 已登录则静默上传（不打扰当前页面） */
  function silentUpload() {
    try {
      if (auth && auth.token && typeof api === 'function' && typeof syncCollect === 'function') {
        api('PUT', '/api/data', syncCollect()).catch(() => {});
      }
    } catch (e) {}
  }

  /* ---------------- 最新数据卡片 ---------------- */
  function latestVals() {
    const map = getMap();
    const dates = Object.keys(map).sort();
    const out = {};
    MKEYS.forEach(k => {
      let cur = null, prev = null;
      for (let i = dates.length - 1; i >= 0; i--) {
        const v = map[dates[i]][k];
        if (v == null) continue;
        if (cur == null) cur = { d: dates[i], v };
        else if (prev == null) { prev = { d: dates[i], v }; break; }
      }
      out[k] = { cur, prev };
    });
    return out;
  }

  function latestHTML() {
    const lv = latestVals();
    return `<div class="bd-latest">${METRICS.map(m => {
      const o = lv[m.key];
      if (!o.cur) {
        return `<div class="bd-lcell"><span class="bd-li">${m.icon}</span><span class="bd-ll">${m.label}</span><span class="bd-lv muted">—</span></div>`;
      }
      let delta = '';
      if (o.prev) {
        const d = +(o.cur.v - o.prev.v).toFixed(1);
        if (d !== 0) {
          const down = d < 0;
          delta = `<span class="bd-d ${down ? 'good' : 'up'}">${down ? '▼' : '▲'} ${Math.abs(d)} ${m.unit === '%' ? '%' : 'cm'}</span>`;
        } else {
          delta = `<span class="bd-d flat">持平</span>`;
        }
      }
      return `<div class="bd-lcell">
        <span class="bd-li">${m.icon}</span>
        <span class="bd-ll">${m.label}</span>
        <span class="bd-lv">${o.cur.v}<em>${m.unit}</em></span>
        ${delta}
      </div>`;
    }).join('')}</div>`;
  }

  /* ---------------- 趋势图（复用 ChartTip） ---------------- */
  function chartHTML() {
    const m = MByKey[curMetric];
    const map = getMap();
    const today = todayStr();
    const days = Array.from({ length: curRange }, (_, i) => addDays(today, i - curRange + 1));
    const pts = [];
    const byI = {};
    days.forEach((d, i) => {
      if (map[d] && map[d][m.key] != null) {
        pts.push({ i, v: +map[d][m.key] });
        byI[i] = +map[d][m.key];
      }
    });
    const chartId = 'bdChartBox';
    if (!pts.length) {
      return `<div class="empty" style="padding:20px"><i>${m.icon}</i>近 ${curRange} 天还没有「${m.label}」记录<br>先在上方保存一条吧</div>`;
    }
    const W = 340, H = 224, L = 40, R = 16, T = 16, B = 28;
    const pw = W - L - R, ph = H - T - B;
    const x = i => L + (curRange === 1 ? 0 : i * pw / (curRange - 1));
    const vals = pts.map(p => p.v);
    let rawMin = Math.min(...vals), rawMax = Math.max(...vals);
    if (rawMin === rawMax) { rawMin -= m.step * 2; rawMax += m.step * 2; }
    const pad = Math.max((rawMax - rawMin) * 0.18, m.step);
    const min = rawMin - pad, max = rawMax + pad;
    const range = max - min;
    const y = v => T + ph - (v - min) / range * ph;

    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const yy = T + ph * g / 4;
      const vv = max - range * g / 4;
      grid += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="var(--chart-grid)" stroke-width="1"/>`;
      grid += `<text x="${L - 6}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--text-3)">${m.key === 'bf' ? vv.toFixed(1) : Math.round(vv)}</text>`;
    }
    const labelIdx = curRange <= 14 ? [0, Math.floor(curRange / 2), curRange - 1] : [0, Math.floor(curRange / 2), curRange - 1];
    let xlab = '';
    labelIdx.forEach(i => {
      xlab += `<text x="${x(i)}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--text-3)">${days[i].slice(5).replace('-', '/')}</text>`;
    });
    const line = pts.map((p, j) => (j ? 'L' : 'M') + x(p.i) + ' ' + y(p.v)).join(' ');
    const area = `M${x(pts[0].i)} ${T + ph} ` + pts.map(p => `L${x(p.i)} ${y(p.v)}`).join(' ') + ` L${x(pts[pts.length - 1].i)} ${T + ph} Z`;
    const dots = pts.map(p => `<circle cx="${x(p.i)}" cy="${y(p.v)}" r="3.2" fill="${m.color}" stroke="var(--bg-card)" stroke-width="1.4"/>`).join('');
    const slotW = pw / curRange;
    const zones = Array.from({ length: curRange }, (_, i) =>
      `<rect class="chart-hz" x="${L + slotW * i}" y="${T}" width="${slotW}" height="${ph}" data-i="${i}"/>`).join('');

    // 首尾变化小结
    const chg = +(pts[pts.length - 1].v - pts[0].v).toFixed(1);
    const chgTxt = chg === 0 ? '持平' : (chg < 0 ? '减少 ' : '增加 ') + Math.abs(chg) + ' ' + m.unit;

    return `
      <p class="muted bd-chg" style="margin:0 0 8px">${pts[0].d.slice(5).replace('-', '/')} → ${pts[pts.length - 1].d.slice(5).replace('-', '/')}：<b style="color:${chg < 0 ? 'var(--success)' : chg > 0 ? m.color : 'var(--text-2)'}">${chgTxt}</b>（共 ${pts.length} 条记录）</p>
      <div class="chart-host" id="${chartId}">
        <svg viewBox="0 0 ${W} ${H}" class="trend-svg" role="img" aria-label="${m.label}变化曲线">
          <defs><linearGradient id="bdfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${m.color}" stop-opacity=".28"/>
            <stop offset="1" stop-color="${m.color}" stop-opacity="0"/>
          </linearGradient></defs>
          ${grid}${xlab}
          <path d="${area}" fill="url(#bdfill)"/>
          <path d="${line}" fill="none" stroke="${m.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
          ${dots}${zones}
        </svg>
      </div>`;
  }

  /* ---------------- 主页面 ---------------- */
  function open(metricKey) {
    if (metricKey && MByKey[metricKey]) curMetric = metricKey;
    const today = todayStr();
    $('#app').innerHTML = `
      <div class="body-page">
        <div class="sp-head">
          <span class="back" id="bdBack" role="button" aria-label="返回">‹</span><b>身体维度</b>
        </div>
        <div class="sp-body">
          <div class="card">
            <h3>记录围度</h3>
            <p class="muted" style="margin:0 0 12px">选择日期，填写当天测量值（可只填变化的项目；软尺水平绕一圈、不压皮肤）</p>
            <input type="date" id="bdDate" class="field-input" value="${today}" max="${today}">
            <div class="bd-fields">
              ${METRICS.map(m => `
                <label class="bd-field">
                  <span>${m.icon} ${m.label}<em>${m.unit}</em></span>
                  <input type="number" inputmode="decimal" step="${m.step}" id="bdf-${m.key}" placeholder="未测">
                </label>`).join('')}
            </div>
            <button type="button" class="btn mega full" id="bdSave">保存记录</button>
            <button type="button" class="btn ghost full" id="bdClear" style="margin-top:8px;height:40px">清空该日期全部记录</button>
          </div>
          <div class="card">
            <h3>最新数据</h3>
            <div id="bdLatest"></div>
          </div>
          <div class="card">
            <h3>变化趋势</h3>
            <div class="goal-opts" style="margin-bottom:12px">
              ${METRICS.map(m => `<span class="chip ${curMetric === m.key ? 'active' : ''}" data-bm="metric" data-k="${m.key}">${m.icon} ${m.label}</span>`).join('')}
            </div>
            <div class="seg" style="margin-bottom:8px">
              <span class="seg-i ${curRange === 30 ? 'on' : ''}" data-bm="range" data-r="30">近30天</span>
              <span class="seg-i ${curRange === 60 ? 'on' : ''}" data-bm="range" data-r="60">近60天</span>
            </div>
            <div id="bdChartWrap"></div>
          </div>
        </div>
      </div>`;

    const dateEl = $('#bdDate');
    const fillFields = () => {
      const entry = getMap()[dateEl.value] || {};
      METRICS.forEach(m => {
        const el = $('#bdf-' + m.key);
        el.value = entry[m.key] != null ? entry[m.key] : '';
      });
    };
    const refreshChart = () => {
      $('#bdLatest').innerHTML = latestHTML();
      $('#bdChartWrap').innerHTML = chartHTML();
      const host = $('#bdChartBox');
      if (host && typeof ChartTip !== 'undefined') {
        const days = Array.from({ length: curRange }, (_, i) => addDays(today, i - curRange + 1));
        const map = getMap();
        const m = MByKey[curMetric];
        ChartTip.bind(host, i => ({
          date: days[i],
          rows: map[days[i]] && map[days[i]][m.key] != null
            ? [{ c: m.color, t: m.label, v: map[days[i]][m.key] + ' ' + m.unit }] : []
        }));
      }
    };

    $('#bdBack').addEventListener('click', () => renderMine());
    dateEl.addEventListener('change', fillFields);
    $('#bdSave').addEventListener('click', () => {
      const date = dateEl.value;
      if (!date) { toast('请选择日期'); return; }
      const map = getMap();
      const entry = Object.assign({}, map[date] || {});
      let filled = 0;
      METRICS.forEach(m => {
        const raw = $('#bdf-' + m.key).value.trim();
        if (raw === '') { delete entry[m.key]; return; }
        const v = Number(raw);
        if (!isFinite(v) || v <= 0) return;
        entry[m.key] = +v.toFixed(m.key === 'bf' ? 1 : 1);
        filled++;
      });
      if (Object.keys(entry).length === 0) {
        if (map[date]) { delete map[date]; setMap(map); }
        toast('当天记录为空，未保存'); refreshChart(); return;
      }
      map[date] = entry; setMap(map);
      toast(`已保存 ${date} 的 ${filled} 项数据 ✅`);
      silentUpload();
      refreshChart();
    });
    $('#bdClear').addEventListener('click', () => {
      const date = dateEl.value;
      const map = getMap();
      if (!map[date]) { toast('该日期没有记录'); return; }
      delete map[date]; setMap(map);
      fillFields(); refreshChart(); toast('已清空 ' + date + ' 的记录');
    });
    document.addEventListener('click', function h(e) {
      const c = e.target.closest('[data-bm]');
      if (!c) return;
      if (!document.body.contains($('#app .body-page'))) {
        document.removeEventListener('click', h); return;
      }
      if (c.dataset.bm === 'metric') {
        curMetric = c.dataset.k; refreshChart();
        $$('#app [data-bm="metric"]').forEach(el => el.classList.toggle('active', el.dataset.k === curMetric));
      } else if (c.dataset.bm === 'range') {
        curRange = +c.dataset.r; refreshChart();
        $$('#app [data-bm="range"]').forEach(el => el.classList.toggle('on', +el.dataset.r === curRange));
      }
    });

    fillFields();
    refreshChart();
    window.scrollTo(0, 0);
  }

  /* 云同步恢复时回调（app.js syncApply 调用） */
  function applyData(map) { /* 数据直存 store，打开页面时自动读取，无需额外处理 */ }

  window.BodyModule = { open, applyData, METRICS };
})();
