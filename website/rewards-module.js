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
        <button class="btn" id="posterDownload" style="gap:6px"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4"/><path d="M4.5 19.5h15"/></svg>下载图片</button>
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
      store.set('achPoster', true);
      checkAchievements();
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
   * 5. 成就系统：彩色简约徽章 · 获得庆祝弹窗（训练中不打扰）· 成就墙
   * ===================================================================== */
  const GLYPHS = {
    flag:   '<path d="M6 21V4"/><path d="M6 5c4-2 8 2 12 0v8c-4 2-8-2-12 0"/>',
    medal:  '<circle cx="12" cy="14.5" r="4.5"/><path d="M9 10.5 6.5 4h4l1.5 3.5L13.5 4h4L15 10.5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H4.8a3.2 3.2 0 0 0 3.4 3.2M16 5.5h3.2a3.2 3.2 0 0 1-3.4 3.2"/><path d="M12 13v3.5"/><path d="M8.5 20h7"/>',
    crown:  '<path d="M4.5 17 6 8.5l3.8 3.2L12 6.5l2.2 5.2L18 8.5 19.5 17z"/><path d="M6.5 20.5h11"/>',
    flame:  '<path d="M12 3c1.5 3.5 5 5 5 9.5a5 5 0 0 1-10 0C7 8.5 10.5 6.5 12 3z"/><path d="M12 20.5a2.8 2.8 0 0 1-2.8-2.8c0-1.8 1.4-2.7 2.8-4.2 1.4 1.5 2.8 2.4 2.8 4.2A2.8 2.8 0 0 1 12 20.5z"/>',
    bolt:   '<path d="M13 3 5 13.5h5L10.5 21 19 10h-5z"/>',
    clock:  '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
    apple:  '<path d="M12 8.2c-1.6-1.9-4.2-2.1-6-.3C3.9 9.8 5 14.7 7.5 18.2c1 1.4 2 2 3 1.5.7-.4 2.3-.4 3 0 1 .5 2-.1 3-1.5 2.5-3.5 3.6-8.4 1.5-10.3-1.8-1.8-4.4-1.6-6 .3z"/><path d="M12 8c0-2 .8-3.5 2.5-4.5"/>',
    run:    '<circle cx="15" cy="4.6" r="1.8"/><path d="M5.5 20l3.6-4.6L7.6 12l4.2-3.2 3 1.6L17.5 8"/><path d="M11.8 8.8l2.4 3.2 3.6 1M7.6 12l-2 3.2"/>',
    bike:   '<circle cx="6.2" cy="17.2" r="3.2"/><circle cx="17.8" cy="17.2" r="3.2"/><path d="M6.2 17.2 9.8 10.6 14.8 9.8"/><path d="M14.8 9.8 17.8 17.2"/><path d="M9.8 10.6 11.7 14.6 6.2 17.2"/><path d="M13.9 8.9h1.8"/>',
    walk:   '<circle cx="12" cy="5.6" r="1.8"/><path d="M12 8.4 11.4 13.8"/><path d="M12.2 9.6 14 12.6"/><path d="M11.6 9.6 9.6 12.2"/><path d="M11.4 13.8 14 17 15 20.8"/><path d="M11.4 13.8 9 17.2 7.2 20.8"/>',
    mountain:'<circle cx="16.8" cy="5.6" r="1.5"/><path d="m3.4 19 5.7-9.2 3.7 5.3 2.2-3.5L20.6 19z"/>',
    image:  '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.5 10 12l3.5 3.5 2.5-2.5 4 4"/>',
    ruler:  '<rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 9v2.5M11 9v2.5M15 9v2.5"/>'
  };
  const ACH_DEFS = [
    { id: 'first',  name: '首次训练',   desc: '完成第 1 次训练',      color: '#00b578', glyph: GLYPHS.flag,   test: d => d.trains >= 1 },
    { id: 't10',    name: '十次之约',   desc: '累计完成 10 次训练',   color: '#165dff', glyph: GLYPHS.medal,  test: d => d.trains >= 10 },
    { id: 't30',    name: '三十进阶',   desc: '累计完成 30 次训练',   color: '#7c3aed', glyph: GLYPHS.medal,  test: d => d.trains >= 30 },
    { id: 't50',    name: '半百征程',   desc: '累计完成 50 次训练',   color: '#ff7a1a', glyph: GLYPHS.trophy, test: d => d.trains >= 50 },
    { id: 't100',   name: '百次传奇',   desc: '累计完成 100 次训练',  color: '#e64545', glyph: GLYPHS.crown,  test: d => d.trains >= 100 },
    { id: 's3',     name: '连续 3 天',  desc: '连续打卡 3 天',        color: '#0ea5e9', glyph: GLYPHS.flame,  test: d => d.streak >= 3 },
    { id: 's7',     name: '连续 7 天',  desc: '连续打卡 7 天',        color: '#00b578', glyph: GLYPHS.flame,  test: d => d.streak >= 7 },
    { id: 's14',    name: '双周不断',   desc: '连续打卡 14 天',       color: '#165dff', glyph: GLYPHS.flame,  test: d => d.streak >= 14 },
    { id: 's30',    name: '月度铁人',   desc: '连续打卡 30 天',       color: '#e64545', glyph: GLYPHS.flame,  test: d => d.streak >= 30 },
    { id: 'k1000',  name: '燃烧 1000',  desc: '累计消耗 1,000 千卡',  color: '#ff7a1a', glyph: GLYPHS.bolt,   test: d => d.kcal >= 1000 },
    { id: 'k5000',  name: '燃烧 5000',  desc: '累计消耗 5,000 千卡',  color: '#e64545', glyph: GLYPHS.bolt,   test: d => d.kcal >= 5000 },
    { id: 'k10000', name: '万卡俱乐部', desc: '累计消耗 10,000 千卡', color: '#c026d3', glyph: GLYPHS.bolt,   test: d => d.kcal >= 10000 },
    { id: 'm1000',  name: '千分钟',     desc: '累计训练 1,000 分钟',  color: '#0ea5e9', glyph: GLYPHS.clock,  test: d => d.min >= 1000 },
    { id: 'm5000',  name: '五千分钟',   desc: '累计训练 5,000 分钟',  color: '#165dff', glyph: GLYPHS.clock,  test: d => d.min >= 5000 },
    { id: 'diet1',  name: '好好吃饭',   desc: '第 1 次记录饮食',      color: '#65a30d', glyph: GLYPHS.apple,  test: d => d.diet >= 1 },
    { id: 'diet7',  name: '饮食管家',   desc: '记录饮食满 7 天',      color: '#00b578', glyph: GLYPHS.apple,  test: d => d.dietDays >= 7 },
    { id: 'run1',   name: '首次开跑',   desc: '完成第 1 次户外跑步',  color: '#0ea5e9', glyph: GLYPHS.run,    test: d => d.runs >= 1 },
    { id: 'run5',   name: '跑者养成',   desc: '完成 5 次户外跑步',    color: '#165dff', glyph: GLYPHS.run,    test: d => d.runs >= 5 },
    { id: 'ride1',  name: '首次骑行',   desc: '完成第 1 次户外骑行',  color: '#14b8a6', glyph: GLYPHS.bike,   test: d => d.rides >= 1 },
    { id: 'ride5',  name: '骑行达人',   desc: '完成 5 次户外骑行',    color: '#f59e0b', glyph: GLYPHS.bike,   test: d => d.rides >= 5 },
    { id: 'walk5',  name: '健步达人',   desc: '完成 5 次户外健走',    color: '#06b6d4', glyph: GLYPHS.walk,   test: d => d.walks >= 5 },
    { id: 'hike1',  name: '山野行者',   desc: '完成第 1 次户外徒步',  color: '#d97706', glyph: GLYPHS.mountain, test: d => d.hikes >= 1 },
    { id: 'trail1', name: '越野初体验', desc: '完成第 1 次户外越野跑', color: '#65a30d', glyph: GLYPHS.run,     test: d => d.trails >= 1 },
    { id: 'mtn1',   name: '登顶时刻',   desc: '完成第 1 次户外登山',  color: '#7c3aed', glyph: GLYPHS.mountain, test: d => d.mountains >= 1 },
    { id: 'skate1', name: '刷街玩家',   desc: '完成第 1 次户外轮滑',  color: '#ec4899', glyph: GLYPHS.bolt,    test: d => d.skates >= 1 },
    { id: 'ski1',   name: '雪道新星',   desc: '完成第 1 次户外滑雪',  color: '#0ea5e9', glyph: GLYPHS.mountain, test: d => d.skis >= 1 },
    { id: 'kayak1', name: '激流勇进',   desc: '完成第 1 次户外皮划艇', color: '#0d9488', glyph: GLYPHS.bolt,   test: d => d.kayaks >= 1 },
    { id: 'golf1',  name: '优雅挥杆',   desc: '完成第 1 次户外高尔夫', color: '#4f46e5', glyph: GLYPHS.image,  test: d => d.golfs >= 1 },
    { id: 'fb1',    name: '绿茵首秀',   desc: '完成第 1 次户外足球',  color: '#dc2626', glyph: GLYPHS.bolt,   test: d => d.footballs >= 1 },
    { id: 'tennis1',name: '网球新星',   desc: '完成第 1 次户外网球',  color: '#c026d3', glyph: GLYPHS.bolt,   test: d => d.tennises >= 1 },
    { id: 'poster', name: '高光时刻',   desc: '生成并下载训练海报',   color: '#ec4899', glyph: GLYPHS.image,  test: d => d.poster },
    { id: 'body1',  name: '了解自己',   desc: '第 1 次记录体脂 / 围度', color: '#7c3aed', glyph: GLYPHS.ruler, test: d => d.body >= 1 }
  ];
  const achUnlocked = () => store.get('achUnlocked', {}) || {};
  function achData() {
    return {
      trains: records.length,
      kcal: records.reduce((s, r) => s + r.kcal, 0),
      min: records.reduce((s, r) => s + r.minutes, 0),
      streak: streakDays(),
      diet: dietEntries.length,
      dietDays: new Set(dietEntries.map(x => x.date)).size,
      runs: records.filter(r => r.type === 'run').length,
      rides: records.filter(r => r.type === 'ride').length,
      walks: records.filter(r => r.type === 'walk').length,
      hikes: records.filter(r => r.type === 'hike').length,
      trails: records.filter(r => r.type === 'trail').length,
      mountains: records.filter(r => r.type === 'mountain').length,
      skates: records.filter(r => r.type === 'skate').length,
      skis: records.filter(r => r.type === 'ski').length,
      kayaks: records.filter(r => r.type === 'kayak').length,
      golfs: records.filter(r => r.type === 'golf').length,
      footballs: records.filter(r => r.type === 'football').length,
      tennises: records.filter(r => r.type === 'tennis').length,
      poster: !!store.get('achPoster', false),
      body: Object.keys(store.get('bodyMap', {}) || {}).length
    };
  }
  // 徽章 SVG：彩色圆底 + 白色线性图标；off=true 为未获得（灰化）
  function achBadge(a, size, off) {
    return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">` +
      `<circle cx="24" cy="24" r="23" fill="${a.color}"${off ? ' opacity=".22"' : ''}/>` +
      `<g fill="none" stroke="${off ? 'var(--text-3)' : '#fff'}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(12 12)">${a.glyph}</g>` +
      `</svg>`;
  }
  /* 训练 / 跑步进行中不打扰：成就弹窗排队，每 3 秒重试直到训练页关闭 */
  const isExercising = () => !!document.querySelector('.subpage.show.workout-page, .subpage.show.tp-sess-page, .subpage.show.run-page');
  let achQueue = [], achShowing = false, achRetryT = null;
  function checkAchievements() {
    const d = achData(), got = achUnlocked();
    const fresh = ACH_DEFS.filter(a => !got[a.id] && a.test(d));
    if (!fresh.length) return;
    fresh.forEach(a => { got[a.id] = todayStr(); });
    store.set('achUnlocked', got);
    // 一次解锁多个（如云端恢复）：只庆祝最高级别的最后一个，其余静默点亮
    achQueue.push(fresh[fresh.length - 1]);
    pumpAchQueue();
  }
  function pumpAchQueue() {
    if (achShowing || !achQueue.length) return;
    if (isExercising()) {
      clearTimeout(achRetryT);
      achRetryT = setTimeout(pumpAchQueue, 3000);
      return;
    }
    const a = achQueue.shift();
    achShowing = true;
    showCelebrate(a, () => { achShowing = false; pumpAchQueue(); });
  }
  function showCelebrate(a, onClose) {
    const mask = document.createElement('div');
    mask.className = 'modal-mask modal-center ach-mask';
    const colors = ['#00b578', '#ff7a1a', '#165dff', '#ec4899', '#f7b500', '#7c3aed'];
    const confetti = Array.from({ length: 14 }, (_, i) =>
      `<i class="cf-p" style="--i:${i};--c:${colors[i % 6]}"></i>`).join('');
    mask.innerHTML = `<div class="modal ach-modal" role="alertdialog" aria-modal="true">
      <div class="ach-confetti" aria-hidden="true">${confetti}</div>
      <div class="ach-badge-big">${achBadge(a, 88)}</div>
      <h3>获得新成就</h3>
      <b class="ach-name">${esc(a.name)}</b>
      <p class="muted">${esc(a.desc)}</p>
      <div class="modal-btns"><button type="button" class="btn full" id="achOk">太棒了</button></div>
    </div>`;
    document.body.appendChild(mask);
    const close = () => { mask.remove(); onClose(); };
    $('#achOk', mask).addEventListener('click', close);
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
  }
  /* 「我的」页成就入口卡：只显示进度摘要 + 最近点亮的徽章，全部成就进成就墙 */
  function achEntryHTML() {
    const got = achUnlocked();
    const gotList = ACH_DEFS.filter(a => got[a.id]);
    const recent = gotList.slice(-3);
    return `<div class="card ach-entry" id="achEntry" role="button" aria-label="查看成就墙">
      <h3>我的成就</h3>
      <div class="ach-entry-main">
        <div class="ach-mini">${recent.length
          ? recent.map(a => achBadge(a, 34)).join('')
          : '<span class="muted" style="font-size:13px">还没有点亮成就</span>'}</div>
        <div class="ach-entry-tx"><b>${gotList.length}<em> / ${ACH_DEFS.length}</em></b><small>已点亮成就</small></div>
        <span class="go-btn"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 4.6 16.6 12l-7.4 7.4"/></svg></span>
      </div>
    </div>`;
  }
  /* 成就墙子页 */
  function openAchievements() {
    const got = achUnlocked();
    const n = ACH_DEFS.filter(a => got[a.id]).length;
    const pct = Math.round(n / ACH_DEFS.length * 100);
    $('#app').innerHTML = `
      <div class="body-page ach-page">
        <div class="sp-head"><span class="back" id="achBack" role="button" aria-label="返回">‹</span><b>成就墙</b></div>
        <div class="sp-body">
          <div class="card ach-overview">
            <div class="ach-ov-num"><b>${n}</b><span> / ${ACH_DEFS.length} 已点亮</span></div>
            <div class="ach-ov-bar"><i style="width:${pct}%"></i></div>
            <p class="muted">保持训练节奏，点亮更多成就徽章</p>
          </div>
          <div class="ach-wall">
            ${ACH_DEFS.map(a => {
              const on = !!got[a.id];
              return `<div class="ach-cell ${on ? 'on' : ''}">
                ${achBadge(a, 52, !on)}
                <b>${esc(a.name)}</b>
                <small>${on ? got[a.id].slice(5).replace('-', '/') + ' 获得' : esc(a.desc)}</small>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    $('#achBack').addEventListener('click', () => showTab('mine'));
    window.scrollTo(0, 0);
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
    heatmapHTML, reminderHTML, encouragementHTML, openShare,
    checkAchievements, achEntryHTML, openAchievements
  };

  // 页面打开即启动提醒检查（无论在哪个 Tab）
  startReminder();
})();
