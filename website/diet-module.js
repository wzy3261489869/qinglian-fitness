/* =====================================================================
 * 饮食记录模块
 * 架构：经典脚本 + window.DietModule 命名空间 + document 级事件委托
 * 数据：复用全局 dietEntries / waterMap / weightMap / records / profile
 * 依赖（app.js）：store/$/$$/esc/toast/pad/todayStr/addDays/ring/
 *   calcPlan/sumNutrition/saveDiet/saveWater/saveProfile/genId
 * ===================================================================== */
'use strict';
(function () {
  const MEALS = ['早餐', '午餐', '晚餐', '加餐'];
  const MEAL_ICONS = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍎' };
  const CATS = ['全部', '主食', '肉蛋奶', '豆制品', '蔬菜', '菌藻', '水果', '坚果零食', '饮品', '菜肴快餐'];
  const ACTIVITIES = [
    { v: 1.2, label: '久坐', sub: '办公室 · 很少运动' },
    { v: 1.375, label: '轻度', sub: '每周 1-3 次' },
    { v: 1.55, label: '中度', sub: '每周 3-5 次' },
    { v: 1.725, label: '高活跃', sub: '每周 6-7 次' },
    { v: 1.9, label: '体力活', sub: '重体力/专业训练' }
  ];

  let foods = null, foodsErr = false;
  let viewDate = todayStr();
  let catFilter = '全部', keyword = '';
  let gramsMap = {};

  /* ---------------- 数据加载 ---------------- */
  async function loadFoods() {
    try {
      const res = await fetch('foods-lib.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('http ' + res.status);
      foods = await res.json();
      foodsErr = false;
    } catch (e) {
      foods = null; foodsErr = true;
    }
  }

  const getCfg = () => Object.assign({ activity: 1.4, custom: null }, store.get('dietCfg', {}));
  const dayEntries = (date) => dietEntries.filter(e => e.date === date);
  const gramsOf = id => gramsMap[id] != null ? gramsMap[id] : 100;

  /* ---------------- 页面：饮食记录 ---------------- */
  async function renderDiet(date) {
    viewDate = date || viewDate;
    const isToday = viewDate === todayStr();
    const list = dayEntries(viewDate);
    const nutri = sumNutrition(list);
    const plan = calcPlan(profile);
    const workoutKcal = records.filter(r => r.date === viewDate).reduce((s, r) => s + (r.kcal || 0), 0);
    const budget = plan.target + workoutKcal;
    const pct = Math.round(nutri.kcal / Math.max(budget, 1) * 100);
    const over = nutri.kcal > budget;
    const remaining = Math.round(budget - nutri.kcal);
    const cups = waterMap[viewDate] || 0;
    const byMeal = m => list.filter(e => e.meal === m);

    if (!foods && !foodsErr) await loadFoods();

    $('#app').innerHTML = `
      <div class="page-head">
        <h1>饮食记录</h1>
        <div class="dm-date">
          <span class="dmd-btn" data-dm="date-prev">‹</span>
          <b>${viewDate === todayStr() ? '今天 · ' + viewDate : viewDate}</b>
          <span class="dmd-btn" data-dm="date-next">›</span>
          ${isToday ? '' : '<span class="chip" data-dm="date-today" style="margin-left:8px">回到今天</span>'}
        </div>
      </div>
      ${recordsSegHTML()}
      <div class="hero ${over ? 'over' : ''}">
        <div>
          <div class="label">今日已摄入</div>
          <div class="big">${nutri.kcal
            ? `<span data-count="${Math.round(nutri.kcal)}" data-group="1">${grp(Math.round(nutri.kcal))}</span>`
            : '<span class="no-data">--</span>'}<small> 千卡</small></div>
          <div class="label" style="margin-top:4px">目标 ${plan.target} 千卡${workoutKcal ? ' · 运动+' + workoutKcal : ''}</div>
        </div>
        <div class="ring-wrap">
          ${ring(Math.min(pct, 100), '#ffffff', 'rgba(255,255,255,.28)')}
          <div class="rtext"><b><span data-count="${pct}">${pct}</span>%</b><i>${over ? '已超量 ⚠️' : '热量进度'}</i></div>
        </div>
      </div>
      <div class="card dm-budget-row">
        <span class="dm-cfg" data-dm="open-target">⚙️ 目标设置</span>
        <span style="flex:1;text-align:right;font-size:13px;color:var(--text-2)">${remaining >= 0 ? '还可摄入' : '已超量'}</span>
        <b style="color:${remaining >= 0 ? 'var(--primary-dark)' : 'var(--danger)'};margin-left:8px">${Math.abs(remaining)} 千卡</b>
      </div>
      <div class="card">
        <h3>三大营养素</h3>
        ${[['蛋白质', nutri.protein, plan.proteinTarget, ''], ['碳水化合物', nutri.carb, plan.carbTarget, 'c-blue'], ['脂肪', nutri.fat, plan.fatTarget, 'c-orange']].map(([n, v, t, cls]) => `
          <div class="nutri-row">
            <div class="nh"><span>${n}</span><span class="v">${Math.round(v)} <em>/ ${t} g</em></span></div>
            <div class="bar ${cls}"><i style="width:${Math.min(100, v / Math.max(t, 1) * 100)}%"></i></div>
          </div>`).join('')}
      </div>
      <div class="card">
        ${MEALS.map(m => {
          const ml = byMeal(m);
          const mn = sumNutrition(ml);
          const mk = Math.round(mn.kcal);
          // 宏量营养素供能占比
          const pk = mn.protein * 4, ck = mn.carb * 4, fk = mn.fat * 9;
          const tk = pk + ck + fk || 1;
          return `<div class="meal">
            <div class="mh"><span>${MEAL_ICONS[m]}</span><b>${m}</b>
              ${mk ? `<span class="mk">${mk} 千卡</span>` : ''}
              <span class="plus" data-dm="add" data-meal="${m}">＋</span>
            </div>
            ${mk ? `<div class="macro-stack" title="蛋白${Math.round(pk / tk * 100)}% · 碳水${Math.round(ck / tk * 100)}% · 脂肪${Math.round(fk / tk * 100)}%">
              <i class="ms-p" style="width:${pk / tk * 100}%"></i>
              <i class="ms-c" style="width:${ck / tk * 100}%"></i>
              <i class="ms-f" style="width:${fk / tk * 100}%"></i>
            </div>
            <div class="macro-legend"><span><i class="ms-p"></i>蛋白 ${Math.round(pk / tk * 100)}%</span>
              <span><i class="ms-c"></i>碳水 ${Math.round(ck / tk * 100)}%</span>
              <span><i class="ms-f"></i>脂肪 ${Math.round(fk / tk * 100)}%</span></div>` : ''}
            ${ml.length ? ml.map(e => `
              <div class="entry"><span class="dot"></span>
                <span class="en">${esc(e.foodName)} <em>${e.grams != null ? e.grams + 'g' : '×' + e.servings + '份'}</em></span>
                <span class="ek">${Math.round(e.kcal * (e.grams != null ? e.grams / 100 : e.servings))} 千卡</span>
                <span class="del" data-dm="del" data-id="${e.id}">删除</span>
              </div>`).join('') : `<p class="muted" style="padding:8px 0 0 4px">点击 ＋ 记录${m}</p>`}
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <h3>每日饮水（目标 8 杯）</h3>
        <div class="water-cups">${Array.from({ length: 8 }, (_, i) => `<span class="${i < cups ? 'on' : ''}" data-dm="cup" data-i="${i}">💧</span>`).join('')}</div>
        <p class="muted" style="text-align:center">已喝 <span data-count="${cups}">${cups}</span>/8 杯 · 少量多次更健康</p>
      </div>
      <div class="tips"><span>🥗</span><p>每餐一拳主食、一掌优质蛋白、两拳蔬菜；减脂期缺口 300-500 千卡更可持续。</p></div>
    `;
    runCountUps($('#app'));
  }

  /* ---------------- 子页：添加食物 ---------------- */
  function openAdd(meal) {
    gramsMap = {};
    const sub = document.createElement('div');
    sub.className = 'subpage dm-add-page';
    let added = 0;
    const drawList = () => {
      const kw = keyword.trim();
      const list = foods.filter(f => (catFilter === '全部' || f.c === catFilter) &&
        (!kw || f.n.includes(kw) || f.c.includes(kw)));
      $('#faList', sub).innerHTML = list.length ? list.map(f => {
        const g = gramsOf(f.id);
        const kcal = Math.round(f.k * g / 100);
        return `<div class="food-item">
          <div class="fi">
            <b>${esc(f.n)}</b>
            <span>${f.c} · ${f.k} 千卡/100g</span>
          </div>
          <div class="fi-grams">
            <div class="quick-g">${(f.q || [100, 200]).map(q => `<span class="qg ${g === q ? 'on' : ''}" data-dm="qg" data-id="${f.id}" data-g="${q}">${q}g</span>`).join('')}</div>
            <div class="g-stepper">
              <button type="button" data-dm="gstep" data-id="${f.id}" data-d="-10">−</button>
              <input type="number" min="5" step="5" value="${g}" data-dm-input="grams" data-id="${f.id}" aria-label="克数">
              <button type="button" data-dm="gstep" data-id="${f.id}" data-d="10">＋</button>
              <em>g</em>
            </div>
            <button class="add-btn" data-dm="add-food" data-id="${f.id}" data-meal="${meal}">+${kcal}</button>
          </div>
        </div>`;
      }).join('') : emptyHTML('search', '没有找到相关食物', '换个关键词或分类试试');
      const done = $('#faDone', sub);
      done.textContent = added ? `完成（已记录 ${added} 项）` : '完成';
    };
    sub.innerHTML = `
      <div class="sp-head">
        <span class="back" data-dm="add-back">‹</span><b>添加食物 · ${meal}</b>
      </div>
      <div class="sp-body">
        <div class="search">🔍<input id="faSearch" placeholder="搜索食物名称（如米饭、鸡胸、饺子）" value="${esc(keyword)}"></div>
        <div class="cat-scroll">${CATS.map(c => `<span class="chip ${catFilter === c ? 'active' : ''}" data-dm="cat" data-c="${c}">${c}</span>`).join('')}</div>
        <div id="faList"></div>
      </div>
      <div class="dm-add-foot">
        <button class="btn full" id="faDone">完成</button>
      </div>`;
    document.body.appendChild(sub);
    requestAnimationFrame(() => sub.classList.add('show'));
    if (foodsErr) {
      $('#faList', sub).innerHTML = emptyHTML('search', '食物库加载失败', '请检查网络后重试',
        '<button class="btn" data-dm="retry">重新加载</button>');
    } else if (foods) {
      drawList();
    } else {
      $('#faList', sub).innerHTML = foodSkeletonRows(7);
      loadFoods().then(() => { if (document.body.contains(sub)) drawList(); });
    }

    $('#faSearch', sub).addEventListener('input', e => { keyword = e.target.value; drawList(); });
    $('#faDone', sub).addEventListener('click', () => finishAdd(sub));
  }
  function finishAdd(sub) {
    sub.classList.remove('show');
    setTimeout(() => sub.remove(), 200);
    keyword = ''; catFilter = '全部';
    recordsView = 'diet';
    showTab('stats');
  }
  function addFoodTo(id, meal) {
    const f = foods.find(x => x.id === id);
    const g = Math.max(5, gramsOf(id) | 0);
    dietEntries.push({
      id: genId(), date: viewDate, meal, foodId: f.id, foodName: f.n,
      grams: g, kcal: f.k, protein: f.p, carb: f.ca, fat: f.f
    });
    saveDiet();
    toast(`已记录 ${f.n} ${g}g · ${Math.round(f.k * g / 100)} 千卡`);
  }

  /* ---------------- 弹窗：目标设置 ---------------- */
  function openTarget() {
    const cfg = getCfg();
    const plan = calcPlan(profile);
    const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    const bmr = Math.round(profile.gender === '男' ? base + 5 : base - 161);
    let mode = cfg.custom != null ? 'custom' : 'auto';

    const wrap = document.createElement('div');
    wrap.className = 'modal-mask';
    wrap.innerHTML = `<div class="modal dm-target-modal">
      <h3>每日热量目标</h3>
      <p class="muted">基础代谢 BMR = <b>${bmr}</b> 千卡/天（Mifflin-St Jeor 公式）</p>
      <div class="tm-label">活动系数</div>
      <div class="act-opts">${ACTIVITIES.map(a => `
        <span class="act-opt ${cfg.activity === a.v ? 'on' : ''}" data-act="${a.v}">
          <b>${a.label} <em>${a.v}</em></b><small>${a.sub}</small>
        </span>`).join('')}</div>
      <div class="tm-label">热量调整（随目标自动）</div>
      <p class="muted" id="tmAuto">自动目标 <b>${plan.target}</b> 千卡/天</p>
      <div class="tm-mode">
        <span class="seg-i ${mode === 'auto' ? 'on' : ''}" data-mode="auto">自动计算</span>
        <span class="seg-i ${mode === 'custom' ? 'on' : ''}" data-mode="custom">自定义</span>
      </div>
      <div class="custom-kcal" ${mode === 'custom' ? '' : 'hidden'}>
        <input type="number" id="customKcal" min="800" max="6000" value="${cfg.custom != null ? cfg.custom : plan.target}">
        <em>千卡/天</em>
      </div>
      <div class="modal-btns">
        <button class="btn ghost" id="tmCancel">取消</button>
        <button class="btn mega" id="tmSave">保存</button>
      </div>
    </div>`;
    document.body.appendChild(wrap);

    let activity = cfg.activity;
    const refreshAuto = () => {
      const tdee = Math.round(bmr * activity);
      const delta = profile.goal === '减脂' ? -400 : profile.goal === '增肌' ? 300 : profile.goal === '塑形' ? -200 : 0;
      const deltaTx = delta ? (delta > 0 ? '盈余 +' : '缺口 ') + Math.abs(delta) : '维持热量';
      $('#tmAuto').innerHTML = `TDEE ${tdee} · ${deltaTx} → 自动目标 <b>${tdee + delta}</b> 千卡/天`;
    };
    refreshAuto();
    wrap.querySelectorAll('.act-opt').forEach(el => el.addEventListener('click', () => {
      activity = +el.dataset.act;
      wrap.querySelectorAll('.act-opt').forEach(x => x.classList.toggle('on', x === el));
      refreshAuto();
    }));
    wrap.querySelectorAll('[data-mode]').forEach(el => el.addEventListener('click', () => {
      mode = el.dataset.mode;
      wrap.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === el));
      $('#customKcal').parentElement.hidden = mode !== 'custom';
    }));
    const close = () => wrap.remove();
    $('#tmCancel', wrap).addEventListener('click', close);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    $('#tmSave', wrap).addEventListener('click', () => {
      let custom = null;
      if (mode === 'custom') {
        custom = parseInt($('#customKcal', wrap).value, 10);
        if (!(custom >= 800 && custom <= 6000)) { toast('请输入 800-6000 之间的热量'); return; }
      }
      store.set('dietCfg', { activity, custom });
      close(); renderDiet(); toast('热量目标已更新');
    });
  }

  /* ---------------- 弹窗：记录体重 ---------------- */
  function openWeight() {
    const cur = weightMap[todayStr()] || profile.weight;
    const wrap = document.createElement('div');
    wrap.className = 'modal-mask';
    wrap.innerHTML = `<div class="modal">
      <h3>记录今日体重</h3>
      <p class="muted">${todayStr()} · 目标体重 ${profile.targetWeight} kg</p>
      <div class="weight-input"><input type="number" id="wInput" min="30" max="250" step="0.1" value="${cur}"><em>kg</em></div>
      <p class="muted" style="margin-top:8px">建议晨起排便后、空腹称重，数据更稳定。</p>
      <div class="modal-btns">
        <button class="btn ghost" id="wCancel">取消</button>
        <button class="btn mega" id="wSave">保存</button>
      </div>
    </div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    $('#wCancel', wrap).addEventListener('click', close);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    $('#wInput', wrap).focus();
    $('#wSave', wrap).addEventListener('click', () => {
      const v = parseFloat($('#wInput', wrap).value);
      if (!(v >= 30 && v <= 250)) { toast('请输入 30-250kg 之间的体重'); return; }
      weightMap[todayStr()] = +v.toFixed(1);
      saveWeightMap();
      profile.weight = +v.toFixed(1);
      saveProfile();
      close(); toast('体重已记录 · ' + v + 'kg');
      renderMine();
    });
  }

  /* ---------------- 我的页：体重 × 饮食双曲线 ---------------- */
  function mountTrend() {
    const box = document.getElementById('trendBox');
    if (!box) return;
    const N = 14;
    const days = Array.from({ length: N }, (_, i) => addDays(todayStr(), i - N + 1));
    const wPts = [], kPts = [];
    days.forEach((d, i) => {
      if (weightMap[d] != null) wPts.push({ i, v: +weightMap[d] });
      const k = Math.round(sumNutrition(dayEntries(d)).kcal);
      kPts.push({ i, v: k });
    });
    const plan = calcPlan(profile);
    if (!wPts.length) {
      box.innerHTML = `<div class="empty" style="padding:16px"><i>⚖️</i>
        还没有体重记录，先记一条吧
        <div style="margin-top:12px"><button class="btn mega" data-dm="open-weight">记录今日体重</button></div>
      </div>`;
      return;
    }
    // 画布参数（绘图区 ≥180px）
    const W = 340, H = 236, L = 38, R = 40, T = 16, B = 28;
    const pw = W - L - R, ph = H - T - B;
    const x = i => L + (N === 1 ? 0 : i * pw / (N - 1));
    const wByI = {};
    const wVals = wPts.map(p => p.v);
    wPts.forEach(p => { wByI[p.i] = p.v; });
    const wMin = Math.floor(Math.min(...wVals) - 1), wMax = Math.ceil(Math.max(...wVals) + 1);
    const wRange = Math.max(wMax - wMin, 2);
    const kMaxRaw = Math.max(...kPts.map(p => p.v), plan.target);
    const kMax = Math.ceil(kMaxRaw * 1.1 / 100) * 100 || 100;
    const yW = v => T + ph - (v - wMin) / wRange * ph;
    const yK = v => T + ph - v / kMax * ph;

    // 网格（1px 10% 透明度）+ 双轴标签（11px，5 条刻度）
    let grid = '';
    for (let g = 0; g <= 4; g++) {
      const yy = T + ph * g / 4;
      grid += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="var(--chart-grid)" stroke-width="1"/>`;
      grid += `<text x="${L - 6}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--text-3)">${(wMax - wRange * g / 4).toFixed(0)}</text>`;
      grid += `<text x="${W - R + 6}" y="${yy + 4}" font-size="11" fill="var(--text-3)">${grp(Math.round(kMax - kMax * g / 4))}</text>`;
    }
    // X 轴日期（11px，3 个避免拥挤）
    let xlab = '';
    [0, 6, N - 1].forEach(i => {
      xlab += `<text x="${x(i)}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--text-3)">${days[i].slice(5).replace('-', '/')}</text>`;
    });
    const linePath = pts => pts.map((p, j) => (j ? 'L' : 'M') + x(p.i) + ' ' + p.y(p.v)).join(' ');
    const wPathPts = wPts.map(p => ({ i: p.i, v: p.v, y: yW }));
    const kPathPts = kPts.map(p => ({ i: p.i, v: p.v, y: yK }));
    // 摄入面积填充（主色 30% → 透明）
    const area = `M${x(0)} ${T + ph} ` + kPts.map(p => `L${x(p.i)} ${yK(p.v)}`).join(' ') + ` L${x(N - 1)} ${T + ph} Z`;
    const dots = (pts, yf, color, key) => pts.map(p =>
      `<circle cx="${x(p.i)}" cy="${yf(p.v)}" r="${key === 'w' ? 3.4 : 2.6}" fill="${color}" stroke="var(--bg-card)" stroke-width="1.2"/>`).join('');
    // 每列隐形热区
    const slotW = pw / N;
    const zones = Array.from({ length: N }, (_, i) =>
      `<rect class="chart-hz" x="${L + slotW * i}" y="${T}" width="${slotW}" height="${ph}" data-i="${i}"/>`).join('');

    box.innerHTML = `
      <div class="trend-legend">
        <span><i style="background:#165dff"></i>体重（左轴 kg）</span>
        <span><i style="background:var(--primary)"></i>摄入（右轴 千卡）</span>
        <span><i style="background:var(--accent)"></i>目标 ${plan.target}</span>
      </div>
      <div class="chart-host trend-host" id="trendHost">
      <svg viewBox="0 0 ${W} ${H}" class="trend-svg" role="img" aria-label="体重与饮食热量对比曲线">
        <defs><linearGradient id="kfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--primary)" stop-opacity=".3"/>
          <stop offset="1" stop-color="var(--primary)" stop-opacity="0"/>
        </linearGradient></defs>
        ${grid}${xlab}
        <path d="${area}" fill="url(#kfill)"/>
        <line x1="${L}" y1="${yK(plan.target)}" x2="${W - R}" y2="${yK(plan.target)}"
          stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 3"/>
        <path d="${linePath(kPathPts)}" fill="none" stroke="var(--primary)" stroke-width="2"/>
        <path d="${linePath(wPathPts)}" fill="none" stroke="#165dff" stroke-width="2"/>
        ${dots(kPts, yK, 'var(--primary)', 'k')}
        ${dots(wPts, yW, '#165dff', 'w')}
        ${zones}
      </svg>
      </div>
      <button class="btn ghost full" data-dm="open-weight" style="height:40px;margin-top:8px">⚖️ 记录今日体重</button>`;
    ChartTip.bind(document.getElementById('trendHost'), i => ({
      date: days[i],
      rows: [
        { c: 'var(--primary)', t: '摄入', v: grp(kPts[i].v) + ' 千卡' }
      ].concat(wByI[i] != null ? [{ c: '#165dff', t: '体重', v: fmtWeight(wByI[i]) + ' kg' }] : [])
    }));
  }

  /* ---------------- 事件委托 ---------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dm]');
    if (!btn) return;
    const act = btn.dataset.dm;
    switch (act) {
      case 'date-prev': renderDiet(addDays(viewDate, -1)); break;
      case 'date-next': renderDiet(addDays(viewDate, 1)); break;
      case 'date-today': renderDiet(todayStr()); break;
      case 'add': openAdd(btn.dataset.meal); break;
      case 'del':
        dietEntries = dietEntries.filter(x => x.id !== btn.dataset.id);
        saveDiet(); renderDiet(); toast('已删除');
        break;
      case 'cup': {
        const i = +btn.dataset.i;
        const cur = waterMap[viewDate] || 0;
        waterMap[viewDate] = cur === i + 1 ? i : i + 1;
        saveWater(); renderDiet();
        break;
      }
      case 'open-target': openTarget(); break;
      case 'open-weight': openWeight(); break;
      case 'cat':
        catFilter = btn.dataset.c;
        document.querySelectorAll('.dm-add-page .chip').forEach(c =>
          c.classList.toggle('active', c.dataset.c === catFilter));
        const sub = document.querySelector('.dm-add-page.show');
        if (sub) {
          const listEl = $('#faList', sub);
          const kw = keyword.trim();
          const list = foods.filter(f => (catFilter === '全部' || f.c === catFilter) &&
            (!kw || f.n.includes(kw) || f.c.includes(kw)));
          listEl.innerHTML = list.length ? list.map(f => {
            const g = gramsOf(f.id);
            return `<div class="food-item"><div class="fi"><b>${esc(f.n)}</b><span>${f.c} · ${f.k} 千卡/100g</span></div>
              <div class="fi-grams"><div class="quick-g">${(f.q || [100,200]).map(q=>`<span class="qg ${g===q?'on':''}" data-dm="qg" data-id="${f.id}" data-g="${q}">${q}g</span>`).join('')}</div>
              <div class="g-stepper"><button type="button" data-dm="gstep" data-id="${f.id}" data-d="-10">−</button>
                <input type="number" min="5" step="5" value="${g}" data-dm-input="grams" data-id="${f.id}">
                <button type="button" data-dm="gstep" data-id="${f.id}" data-d="10">＋</button><em>g</em></div>
              <button class="add-btn" data-dm="add-food" data-id="${f.id}" data-meal="${document.querySelector('.dm-add-page b').textContent.replace('添加食物 · ','')}">+${Math.round(f.k*g/100)}</button></div></div>`;
          }).join('') : '<div class="empty"><i>🍽️</i>没有找到相关食物</div>';
        }
        break;
      case 'qg':
        gramsMap[btn.dataset.id] = +btn.dataset.g;
        refreshRow(btn);
        break;
      case 'gstep':
        gramsMap[btn.dataset.id] = Math.max(5, gramsOf(btn.dataset.id) + (+btn.dataset.d));
        refreshRow(btn);
        break;
      case 'add-food':
        addFoodTo(btn.dataset.id, btn.dataset.meal);
        btn.textContent = '✓';
        setTimeout(() => refreshRow(btn), 500);
        break;
      case 'add-back': {
        const s = document.querySelector('.dm-add-page.show');
        if (s) finishAdd(s);
        break;
      }
      case 'retry': {
        foodsErr = false;
        const old = document.querySelector('.dm-add-page.show');
        const meal = old ? old.querySelector('b').textContent.replace('添加食物 · ', '') : '加餐';
        if (old) old.remove();
        loadFoods().then(() => openAdd(meal));
        break;
      }
    }
  });
  // 克数输入（委托）
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.dmInput === 'grams') {
      const v = parseInt(el.value, 10);
      if (v >= 5) gramsMap[el.dataset.id] = v;
      refreshRow(el);
    }
  });
  function refreshRow(el) {
    const page = el.closest('.dm-add-page');
    if (!page || !foods) return;
    const row = el.closest('.food-item');
    if (!row) return;
    const id = row.querySelector('[data-id]').dataset.id;
    const f = foods.find(x => x.id === id);
    const g = gramsOf(id);
    const inp = row.querySelector('input');
    if (inp && document.activeElement !== inp) inp.value = g;
    row.querySelectorAll('.qg').forEach(q => q.classList.toggle('on', +q.dataset.g === g));
    const addBtn = row.querySelector('.add-btn');
    if (addBtn) addBtn.textContent = '+' + Math.round(f.k * g / 100);
  }

  /* ---------------- 对外 API ---------------- */
  window.DietModule = { renderDiet, mountTrend, openWeight, loadFoods };
})();
