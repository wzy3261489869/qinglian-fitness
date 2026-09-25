/* =====================================================================
 * 打卡激励模块：热力图 · 分享海报 · 训练提醒 · 温和鼓励
 * 架构：经典脚本 + window.RewardsModule 命名空间 + document 级事件委托
 * 依赖（app.js）：store/$/$$/esc/toast/pad/todayStr/addDays/ring/
 *   records/saveRecords/settings/saveSettings/streakDays/showTab
 * ===================================================================== */
'use strict';
(function () {
  const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
  const SITE = 'qinglian-fitness-wzy.netlify.app';
  const QUOTES = [
    '每一次开练，都是在给未来的自己存底气。',
    '汗水不会说谎，时间都看得见。',
    '不求最快，但求不停；今天又比昨天强一点。',
    '真正的自律，是允许自己偶尔慢下来。',
    '把目标拆小，把行动放大，今天就很棒。',
    '身体的每一分改变，都始于"再练一组"。'
  ];
  const WARM_WORDS = [
    '停了几天真的没关系，肌肉会记得你流过的汗。准备好了再出发，我一直都在 🌱',
    '休息也是训练的一部分呀。不用着急，今天从 10 分钟开始，就算赢 🌤',
    '偶尔偷懒的人，才更像真实的你。欢迎回来，我们慢慢热个身 🍃',
    '健身不是一场冲刺，是长长的散步。喘口气，再继续也不迟 ☕',
    '没人能每天满分，包括高手。今天动一动，就重新接上节奏啦 🤗',
    '断卡不代表失败，只说明你在认真生活。想练的时候，我都在 🌿'
  ];

  /* =====================================================================
   * 1. 日历热力图（GitHub 贡献图样式，近 53 周）
   * ===================================================================== */
  // 训练分钟 → 等级 0-4
  function levelOf(min) {
    if (!min) return 0;
    if (min <= 15) return 1;
    if (min <= 30) return 2;
    if (min <= 60) return 3;
    return 4;
  }
  function buildWeeks() {
    const end = new Date();
    const endIdx = (end.getDay() + 6) % 7;          // 周一=0
    // 53 周列，最后一列到今天
    const start = new Date(end);
    start.setDate(start.getDate() - endIdx - 7 * 52);
    const weeks = [];
    const cur = new Date(start);
    const minMap = {};
    records.forEach(r => { minMap[r.date] = (minMap[r.date] || 0) + (r.minutes || 0); });
    for (let w = 0; w < 53; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const ds = cur.getFullYear() + '-' + pad(cur.getMonth() + 1) + '-' + pad(cur.getDate());
        const min = minMap[ds] || 0;
        const future = cur > end;
        col.push({ date: ds, min, lv: future ? -2 : levelOf(min), future });
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(col);
    }
    return weeks;
  }

  function heatmapHTML() {
    const weeks = buildWeeks();
    const today = todayStr();
    // 月份标签：每月第一格所在周
    let monthTx = '';
    let lastM = -1;
    weeks.forEach((wk, i) => {
      const first = wk.find(c => c.lv !== -2) || wk[0];
      const m = parseInt(first.date.slice(5, 7), 10);
      if (m !== lastM) {
        monthTx += `<span class="hm-month" style="left:${(i * 13 + 28)}px">${m}月</span>`;
        lastM = m;
      }
    });
    // 年度统计
    const yearStart = addDays(today, -364);
    const yearRecs = records.filter(r => r.date >= yearStart);
    const activeDays = new Set(yearRecs.map(r => r.date)).size;
    const totalMin = yearRecs.reduce((s, r) => s + r.minutes, 0);
    const cells = weeks.map(col => col.map(c => {
      if (c.future) return '<i class="hm-c future"></i>';
      const cls = 'hm-c lv' + c.lv + (c.date === today ? ' today' : '');
      const tip = c.lv ? `${c.date} · ${c.min} 分钟` : c.date + ' · 休息';
      return `<i class="${cls}" data-rw="cell" data-tip="${tip}"></i>`;
    }).join('')).join('');
    return `
      <div class="hm-summary">
        <span><b>${activeDays ? grp(activeDays) : '--'}</b> 近一年活跃天</span>
        <span><b>${totalMin ? grp(totalMin) : '--'}</b> 累计分钟</span>
      </div>
      <div class="hm-scroll" id="hmScroll">
        <div class="hm-inner">
          <div class="hm-months">${monthTx}</div>
          <div class="hm-grid-wrap">
            <div class="hm-wd"><span>一</span><span>三</span><span>五</span></div>
            <div class="hm-grid">${cells}</div>
          </div>
        </div>
      </div>
      <div class="hm-legend"><span>少</span>
        ${[0, 1, 2, 3, 4].map(l => `<i class="hm-c lv${l}"></i>`).join('')}
        <span>多</span>
      </div>
      <div class="hm-tip" id="hmTip" hidden></div>`;
  }

  /* =====================================================================
   * 2. 分享海报（Canvas 绘制 → 下载）
   * ===================================================================== */
  function summaryOfDate(date) {
    const rs = records.filter(r => r.date === date);
    const titles = [...new Set(rs.map(r => r.planTitle))];
    return {
      date,
      minutes: rs.reduce((s, r) => s + r.minutes, 0),
      kcal: rs.reduce((s, r) => s + r.kcal, 0),
      done: rs.reduce((s, r) => s + (r.doneCount || 0), 0),
      total: rs.reduce((s, r) => s + (r.total || 0), 0),
      titles
    };
  }
  // 圆角矩形（兼容旧浏览器）
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function drawPoster(date) {
    const s = summaryOfDate(date);
    const W = 750, H = 1334;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // 背景：绿色渐变 + 底部装饰圆
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#00c98a'); g.addColorStop(1, '#008f62');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#ffffff';
    [[640, 120, 150], [90, 1180, 110], [660, 1080, 70]].forEach(([x, y, r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 顶部品牌行
    ctx.fillStyle = '#fff';
    ctx.font = '800 34px ' + FONT;
    ctx.textBaseline = 'middle';
    ctx.fillText('肌肉会飞', 60, 74);
    ctx.font = '400 22px ' + FONT;
    ctx.globalAlpha = .85;
    const tag = '我的训练日报';
    ctx.fillText(tag, W - 60 - ctx.measureText(tag).width, 74);
    ctx.globalAlpha = 1;

    // 主卡片
    const cx0 = 50, cy0 = 140, cw = W - 100, ch = 1060;
    ctx.save();
    ctx.shadowColor = 'rgba(0,60,40,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#ffffff';
    rr(ctx, cx0, cy0, cw, ch, 28); ctx.fill();
    ctx.restore();

    // 日期
    ctx.fillStyle = '#6b7785';
    ctx.font = '400 24px ' + FONT;
    ctx.textBaseline = 'top';
    ctx.fillText(date.replace(/-/g, ' / '), cx0 + 44, cy0 + 44);

    // 大数字：分钟（先在大字号下量宽，再换小字号画标签，避免标签叠在数字上）
    ctx.fillStyle = '#00b578';
    ctx.font = '800 130px ' + FONT;
    ctx.textBaseline = 'alphabetic';
    const minStr = String(s.minutes);
    ctx.fillText(minStr, cx0 + 40, cy0 + 280);
    const minW = ctx.measureText(minStr).width;
    ctx.font = '600 30px ' + FONT;
    ctx.fillStyle = '#008f62';
    ctx.fillText('分钟 · 今日训练时长', cx0 + 40 + minW + 16, cy0 + 280);

    // 三宫格数据
    const boxes = [
      ['消耗', s.kcal, '千卡'],
      ['动作', s.done + (s.total ? '/' + s.total : ''), '个'],
      ['连续', streakDays(), '天']
    ];
    const bw = (cw - 88 - 28) / 3;
    boxes.forEach(([lab, v, u], i) => {
      const bx = cx0 + 44 + i * (bw + 14);
      ctx.fillStyle = '#f2f7f5';
      rr(ctx, bx, cy0 + 360, bw, 170, 18); ctx.fill();
      ctx.fillStyle = '#8a96a3'; ctx.font = '400 20px ' + FONT;
      ctx.textBaseline = 'top';
      ctx.fillText(lab, bx + 20, cy0 + 384);
      // 数值先量宽再画单位（同字号下测量，避免单位叠在数值上）
      const vStr = String(v);
      ctx.fillStyle = '#1f2d3d'; ctx.font = '800 40px ' + FONT;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(vStr, bx + 18, cy0 + 494);
      const vw = ctx.measureText(vStr).width;
      ctx.font = '400 18px ' + FONT; ctx.fillStyle = '#8a96a3';
      ctx.fillText(u, bx + 18 + vw + 6, cy0 + 488);
    });

    // 完成课程
    ctx.fillStyle = '#1f2d3d'; ctx.font = '700 24px ' + FONT;
    ctx.textBaseline = 'top';
    ctx.fillText('完成课程', cx0 + 44, cy0 + 600);
    ctx.font = '400 23px ' + FONT; ctx.fillStyle = '#4e5d6c';
    let ty = cy0 + 644;
    s.titles.slice(0, 3).forEach(t => {
      ctx.fillText('• ' + (t.length > 14 ? t.slice(0, 14) + '…' : t), cx0 + 44, ty);
      ty += 40;
    });
    if (!s.titles.length) {
      ctx.fillText('• 自由训练', cx0 + 44, ty);
    }

    // 分隔线 + 鼓励语
    ctx.strokeStyle = '#eef1f4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx0 + 44, cy0 + 830); ctx.lineTo(cx0 + cw - 44, cy0 + 830); ctx.stroke();
    ctx.fillStyle = '#00b578'; ctx.font = '700 26px ' + FONT;
    ctx.textBaseline = 'top';
    const q = QUOTES[new Date(date + 'T00:00:00').getDate() % QUOTES.length];
    // 手动换行（最多两行）
    wrapText(ctx, '“' + q + '”', cx0 + 44, cy0 + 870, cw - 88, 38);

    // 底部来源
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '400 21px ' + FONT;
    ctx.textBaseline = 'middle';
    ctx.fillText(SITE, 60, 1258);
    // 简易"二维码"装饰
    drawFakeQR(ctx, W - 150, 1212, 84);

    return cv.toDataURL('image/png');
  }
  function wrapText(ctx, text, x, y, maxW, lh) {
    let line = '', yy = y;
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW) {
        ctx.fillText(line, x, yy); line = ch; yy += lh;
      } else line += ch;
    }
    ctx.fillText(line, x, yy);
  }
  function drawFakeQR(ctx, x, y, n) {
    ctx.fillStyle = '#fff';
    rr(ctx, x - 8, y - 8, n + 16, n + 16, 10); ctx.fill();
    ctx.fillStyle = '#1f2d3d';
    const cell = n / 11;
    // 伪随机但确定性
    let seed = 7;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
      if (rnd() > .52) ctx.fillRect(x + c * cell, y + r * cell, cell * .92, cell * .92);
    }
    // 三个定位角
    [[0, 0], [8, 0], [0, 8]].forEach(([c, r]) => {
      ctx.fillStyle = '#1f2d3d'; ctx.fillRect(x + c * cell, y + r * cell, cell * 3, cell * 3);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + (c + 1) * cell, y + (r + 1) * cell, cell, cell);
    });
  }

  function openShare(date) {
    date = date || todayStr();
    if (!records.some(r => r.date === date)) { toast('当天还没有训练记录哦'); return; }
    const mask = document.createElement('div');
    mask.className = 'modal-mask rw-share-mask';
    mask.innerHTML = `<div class="modal rw-share-modal">
      <h3>训练海报</h3>
      <p class="muted">生成你的专属训练数据卡片，保存图片即可分享</p>
      <div class="poster-preview" id="posterBox"><div class="poster-loading">🎨 正在绘制海报…</div></div>
      <div class="modal-btns">
        <button class="btn ghost" id="posterCancel">关闭</button>
        <button class="btn mega" id="posterDownload">⬇ 下载图片</button>
      </div>
    </div>`;
    document.body.appendChild(mask);
    let url = '';
    // 让弹窗先渲染再绘制
    setTimeout(() => {
      try {
        url = drawPoster(date);
        $('#posterBox').innerHTML = `<img src="${url}" alt="训练海报">`;
      } catch (e) {
        $('#posterBox').innerHTML = '<div class="empty">海报生成失败，请重试</div>';
      }
    }, 60);
    const close = () => mask.remove();
    $('#posterCancel').addEventListener('click', close);
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    $('#posterDownload').addEventListener('click', () => {
      if (!url) { toast('海报还在生成中'); return; }
      const a = document.createElement('a');
      a.href = url; a.download = '肌肉会飞训练海报-' + date + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      toast('海报已保存到下载，记得分享哦 🎉');
    });
  }

  /* =====================================================================
   * 3. 训练提醒（浏览器通知，打开页面期间生效）
   * ===================================================================== */
  function ensureRemindCfg() {
    if (!settings.remind) settings.remind = { on: false, time: '19:00' };
    return settings.remind;
  }
  function reminderHTML() {
    const r = ensureRemindCfg();
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    const warn = perm === 'denied' ? '<p class="muted rw-warn">通知权限被浏览器拒绝，请在地址栏左侧站点设置中允许通知</p>'
      : perm === 'unsupported' ? '<p class="muted rw-warn">当前浏览器不支持通知</p>' : '';
    // iPhone 仅在“添加到主屏幕”的 PWA 模式下支持网页通知
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const iosWarn = (isIOS && !isStandalone)
      ? '<p class="muted rw-warn">iPhone 请先把肌肉会飞「添加到主屏幕」，从桌面图标打开后开启提醒最可靠</p>' : '';
    return `
      <div class="rw-remind">
        <div class="rw-switch-row">
          <span><b>训练提醒</b><small>到点提醒"该训练啦"</small></span>
          <span class="rw-switch ${r.on ? 'on' : ''}" data-rw="remind-on" role="switch"
            aria-checked="${r.on}" tabindex="0"></span>
        </div>
        <div class="rw-time-row ${r.on ? '' : 'off'}">
          <span>每日提醒时间</span>
          <input type="time" id="remindTime" value="${r.time}" data-rw="remind-time">
        </div>
        ${warn}${iosWarn}
        <p class="muted rw-note">App 保持打开时到点提醒；错过时间只要当天打开手机就会立即补发，锁屏也能收到系统通知。</p>
      </div>`;
  }
  let firedDate = '', remindIv = null, preciseT = null;
  function startReminder() {
    clearInterval(remindIv);
    remindIv = setInterval(checkRemind, 20000);
    checkRemind();
  }
  // 今日提醒时刻的时间戳
  function remindTargetTs(r) {
    const d = new Date();
    d.setHours(+r.time.slice(0, 2), +r.time.slice(3, 5), 0, 0);
    return d.getTime();
  }
  function checkRemind() {
    const r = ensureRemindCfg();
    if (!r.on) { clearTimeout(preciseT); preciseT = null; return; }
    const now = Date.now();
    const ds = todayStr();
    if (firedDate && firedDate !== ds) firedDate = '';
    const target = remindTargetTs(r);
    // 已过点但今天还没提醒（App 被挂后台/锁屏错过整分钟）：立即补发，不再依赖整分钟字符串匹配
    if (now >= target && firedDate !== ds) {
      firedDate = ds;
      clearTimeout(preciseT); preciseT = null;
      fireRemind();
      return;
    }
    // 距提醒 60 秒内：精确 setTimeout 准点触发，比 20s 轮询更可靠
    const left = target - now;
    if (left > 0 && left <= 60000) {
      clearTimeout(preciseT);
      preciseT = setTimeout(checkRemind, left + 300);
    }
  }
  async function fireRemind() {
    const title = '该训练啦 💪';
    const body = '今天也要动一动，10 分钟开个好头，我陪你练！';
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, {
          body, icon: 'icon-512.png', badge: 'icon-512.png',
          tag: 'qinglian-remind', requireInteraction: false
        });
        return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'icon-512.png' });
      }
    } catch (e) {}
  }
  async function enableRemind() {
    if (!('Notification' in window)) { toast('当前浏览器不支持通知'); return false; }
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { toast('需要允许通知权限'); return false; }
    } else if (Notification.permission === 'denied') {
      toast('通知被拒绝，请在浏览器站点设置中开启'); return false;
    }
    return true;
  }

  /* =====================================================================
   * 4. 断卡温和鼓励
   * ===================================================================== */
  function breakInfo() {
    const days = new Set(records.map(r => r.date));
    const t = todayStr();
    // 今天/昨天有记录 → 未中断
    if (days.has(t) || days.has(addDays(t, -1))) return null;
    // 找最近一次记录日期，计算截至该日的连续天数
    let latest = null;
    records.forEach(r => { if (!latest || r.date > latest) latest = r.date; });
    if (!latest) return null;
    let n = 0, cur = latest;
    while (days.has(cur)) { n++; cur = addDays(cur, -1); }
    if (n < 3) return null;
    // 中断天数
    const gap = Math.round((new Date(t + 'T00:00:00') - new Date(latest + 'T00:00:00')) / 864e5);
    const idx = (new Date().getDate() + gap) % WARM_WORDS.length;
    return { n, gap, text: WARM_WORDS[idx] };
  }
  function encouragementHTML() {
    const b = breakInfo();
    if (!b) return '';
    return `<div class="rw-encourage" data-rw="enc-go">
      <div class="rwe-ic">🌤</div>
      <div class="rwe-tx">
        <b>欢迎回来</b>
        <p>${esc(b.text)}</p>
        <small>之前连续练了 ${b.n} 天，已经很了不起</small>
      </div>
      <span class="rwe-cta">去开练 ›</span>
    </div>`;
  }

  /* =====================================================================
   * 事件委托
   * ===================================================================== */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-rw]');
    if (!btn) return;
    const act = btn.dataset.rw;
    switch (act) {
      case 'cell': {
        const tip = $('#hmTip');
        if (!tip) break;
        tip.textContent = btn.dataset.tip;
        tip.hidden = false;
        const box = btn.closest('.hm-scroll');
        const br = btn.getBoundingClientRect(), bb = box.getBoundingClientRect();
        tip.style.left = Math.min(Math.max(br.left - bb.left + br.width / 2 - 60, 4), bb.width - 128) + 'px';
        tip.style.top = (br.top - bb.top - 34) + 'px';
        clearTimeout(tip._t);
        tip._t = setTimeout(() => { tip.hidden = true; }, 2600);
        break;
      }
      case 'remind-on': toggleRemind(btn); break;
      case 'share-today': openShare(todayStr()); break;
      case 'share-date': openShare(btn.dataset.date); break;
      case 'enc-go': showTab('plan'); break;
    }
  });
  // 提醒时间输入
  document.addEventListener('change', (e) => {
    if (e.target.dataset && e.target.dataset.rw === 'remind-time') {
      const r = ensureRemindCfg();
      r.time = e.target.value || '19:00';
      saveSettings();
      toast('提醒时间已设为 ' + r.time);
      checkRemind();
    }
  });
  // 从后台/锁屏切回、页面重新显示或窗口获得焦点时立即检查，补发错过的提醒
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkRemind(); });
  window.addEventListener('pageshow', checkRemind);
  window.addEventListener('focus', checkRemind);
  // 开关键盘可达
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.classList && e.target.classList.contains('rw-switch')) {
      e.preventDefault(); toggleRemind(e.target);
    }
  });
  async function toggleRemind(el) {
    const r = ensureRemindCfg();
    if (!r.on) {
      const ok = await enableRemind();
      if (!ok) return;
      r.on = true; firedDate = todayStr() === firedDate ? firedDate : '';
      toast('提醒已开启 · 每日 ' + r.time);
    } else {
      r.on = false;
      toast('提醒已关闭，想练随时打开肌肉会飞');
    }
    saveSettings();
    // 局部刷新开关样式，不重绘整页（避免输入框失焦问题）
    document.querySelectorAll('.rw-switch').forEach(s => {
      s.classList.toggle('on', r.on); s.setAttribute('aria-checked', r.on);
    });
    document.querySelectorAll('.rw-time-row').forEach(x => x.classList.toggle('off', !r.on));
  }

  /* ---------------- 对外 API ---------------- */
  window.RewardsModule = {
    heatmapHTML, reminderHTML, encouragementHTML, openShare
  };

  // 页面打开即启动提醒检查（无论在哪个 Tab）
  startReminder();
})();
