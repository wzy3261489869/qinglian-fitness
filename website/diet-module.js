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
  const CATS = ['全部', '主食', '肉蛋奶', '豆制品', '蔬菜', '菌藻', '水果', '坚果零食', '饮品', '菜肴快餐'];
  /* 饮食页每日 TIPS：按日期轮换，一天一条不重复 */
  const DIET_TIPS = [
    '每餐一拳主食、一掌蛋白、两拳蔬菜，是最省心的搭配',
    '减脂期缺口 300-500 千卡更可持续，别一刀砍半',
    '先吃蔬菜再吃主食，血糖更平稳也更抗饿',
    '蛋白质分散到三餐吃，利用率比一顿吃完更高',
    '渴了再喝就晚了，全天匀速补水 1.5-2 升',
    '配料表按顺序看：前三位是糖油的零食要少买',
    '无糖不等于没热量，果汁和乳饮料都要看营养表',
    '每天一个鸡蛋加一杯奶，是最简单的蛋白兜底',
    '外卖多点清蒸炖煮，少点红烧糖醋和油炸',
    '坚果好吃但热量高，每天一小把（约 15 克）就够',
    '全谷物替代一半白米饭，饱腹感更持久',
    '汤里大部分是水和盐，营养远不如吃料实在',
    '酒精热量不低还影响恢复，训练日尽量别喝',
    '水果含糖不低，每天 200-350 克差不多够了',
    '加工肉偶尔吃可以，日常优先新鲜肉蛋豆',
    '饿到头晕才吃容易暴食，两餐间加点蛋白零食',
    '看懂「每 100 克」和「每份」的区别，别被包装骗了',
    '深色蔬菜占一半，维生素和纤维都更高',
    '睡前 2 小时尽量不进食，睡得好第二天不馋',
    '豆制品是植物蛋白好来源，价格也友好',
    '奶茶改中杯、少糖，一个月能省下几千千卡',
    '烹饪多用水煮蒸拌，少用煎炸，热量差一倍',
    '体重是趋势不是单点，每周同一时间称一次就好',
    '燕麦选原片，风味麦片的糖往往超乎想象',
    '吃饭别刷手机，专注进食更容易感到饱',
    '薯片饼干放在看不见的地方，馋的概率少一半',
    '运动后别只补水，来点碳水加蛋白恢复更好',
    '乳糖不耐可以选无糖酸奶或舒化奶',
    '代糖饮料可以过渡，但最终目标是少喝甜饮',
    '记录的意义不是自责，是看见改进的空间'
  ];
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
  // opts.anim=false 时不播数字动画（切日期/回到今天等就地刷新，避免闪动）
  async function renderDiet(date, opts) {
    appNoAnim();
    viewDate = date || viewDate;
    const anim = !(opts && opts.anim === false);
    const dca = v => anim ? ` data-count="${v}"` : '';
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
            ? `<span${dca(Math.round(nutri.kcal))} data-group="1">${grp(Math.round(nutri.kcal))}</span>`
            : '<span class="no-data">--</span>'}<small> 千卡</small></div>
          <div class="label" style="margin-top:4px">目标 ${plan.target} 千卡${workoutKcal ? ' · 运动+' + workoutKcal : ''}</div>
        </div>
        <div class="ring-wrap">
          ${ring(Math.min(pct, 100), '#ffffff', 'rgba(255,255,255,.28)')}
          <div class="rtext"><b><span${dca(pct)}>${pct}</span>%</b><i>${over ? '已超量 ⚠️' : '热量进度'}</i></div>
        </div>
      </div>
      <div class="card dm-budget-row">
        <span class="dm-cfg" data-dm="open-target">目标设置 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="3.2"/></svg></span>
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
            <div class="mh"><b>${m}</b>
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
        <p class="muted" style="text-align:center">已喝 <span class="wc-cnt">${cups}</span>/8 杯 · 少量多次更健康</p>
      </div>
      <div class="tips"><span class="tips-badge">TIPS</span><p>${esc(dailyPick(DIET_TIPS))}</p></div>
    `;
    if (anim) runCountUps($('#app'));
  }

  /* 水杯点击：只更新杯子和计数文字，不重绘整页（避免闪烁） */
  function updateWaterUI(n) {
    document.querySelectorAll('.water-cups [data-dm="cup"]').forEach((c, i) =>
      c.classList.toggle('on', i < n));
    const cnt = document.querySelector('.wc-cnt');
    if (cnt) cnt.textContent = n;
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
        <span class="sp-side scan-entry" data-dm="scan" role="button" aria-label="扫码识别包装食品">📷 扫码</span>
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

  /* ---------------- 弹层：记录体重（与年龄/身高一致的数字滚轮） ---------------- */
  function openWeight() {
    const cur = weightMap[todayStr()] || profile.weight;
    openWheelSheet(
      { title: '记录今日体重', unit: 'kg', min: 30, max: 200, step: 0.1, value: cur, dec: 1 },
      v => {
        v = +v.toFixed(1);
        weightMap[todayStr()] = v;
        saveWeightMap();
        profile.weight = v;
        saveProfile();
        toast('体重已记录 · ' + v + 'kg');
        renderMine();
      }
    );
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
        <span><i style="background:#165dff"></i>体重 kg</span>
        <span><i style="background:var(--primary)"></i>摄入 kcal</span>
        <span><i style="background:var(--warning)"></i>目标 ${plan.target}</span>
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
          stroke="var(--warning)" stroke-width="1.2" stroke-dasharray="4 3"/>
        <path d="${linePath(kPathPts)}" fill="none" stroke="var(--primary)" stroke-width="2"/>
        <path d="${linePath(wPathPts)}" fill="none" stroke="#165dff" stroke-width="2"/>
        ${dots(kPts, yK, 'var(--primary)', 'k')}
        ${dots(wPts, yW, '#165dff', 'w')}
        ${zones}
      </svg>
      </div>
      <button class="btn ghost full" data-dm="open-weight" style="height:40px;margin-top:8px">记录今日体重</button>`;
    ChartTip.bind(document.getElementById('trendHost'), i => ({
      date: days[i],
      rows: [
        { c: 'var(--primary)', t: '摄入', v: grp(kPts[i].v) + ' 千卡' }
      ].concat(wByI[i] != null ? [{ c: '#165dff', t: '体重', v: fmtWeight(wByI[i]) + ' kg' }] : [])
    }));
  }

  /* ---------------- 条码扫描（BarcodeDetector + Open Food Facts） ---------------- */
  let bcCache = store.get('bcCache', {});
  const saveBcCache = () => store.set('bcCache', bcCache);
  let scanStream = null, scanIv = null, scanOverlayEl = null, scanDetector = null;

  function lookupOFF(code) {
    if (bcCache[code]) return Promise.resolve(bcCache[code]);
    return fetch('https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code) +
      '.json?fields=product_name,brands,nutriments&lc=zh',
      { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then(j => {
        if (!j || j.status !== 1 || !j.product) return { missing: true, code };
        const p = j.product, n2 = p.nutriments || {};
        const get = (...ks) => {
          for (const k of ks) if (n2[k] != null && !isNaN(n2[k])) return n2[k];
          return null;
        };
        const k = get('energy-kcal_100g', 'energy_100g');
        if (k == null) return { missing: true, code, name: p.product_name };
        const item = {
          id: 'bc-' + code,
          n: p.product_name || ((p.brands || '') + ' 条码商品').trim(),
          c: '包装食品', k: Math.round(k * (p.product_name ? 1 : 1)),
          p: +(get('proteins_100g') || 0).toFixed(1),
          ca: +(get('carbohydrates_100g') || 0).toFixed(1),
          f: +(get('fat_100g') || 0).toFixed(1),
          q: [30, 60, 100], barcode: code
        };
        bcCache[code] = item; saveBcCache();
        return item;
      });
  }

  function applyBarcodeItem(item) {
    if (!foods) foods = [];
    if (!foods.some(f => f.id === item.id)) foods.push(item);
    keyword = item.n;
    const sub = document.querySelector('.dm-add-page.show');
    const search = sub && $('#faSearch', sub);
    if (search) { search.value = item.n; search.dispatchEvent(new Event('input')); }
    toast(`已识别：${item.n} · ${item.k} 千卡/100g`);
  }

  function closeScan() {
    if (scanIv) { clearInterval(scanIv); scanIv = null; }
    if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
    if (scanOverlayEl) {
      scanOverlayEl.classList.remove('show');
      const el = scanOverlayEl; scanOverlayEl = null;
      setTimeout(() => el.remove(), 200);
    }
  }

  function openScan() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      manualBarcode(); return;
    }
    // BarcodeDetector：安卓 Chrome 支持；不支持时直接走手动输入
    if (typeof BarcodeDetector === 'undefined') {
      toast('当前浏览器不支持扫码，可手动输入条码'); manualBarcode(); return;
    }
    let formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'];
    try {
      const supported = BarcodeDetector.getSupportedFormats();
      if (supported && supported.length) formats = supported;
    } catch (e) {}
    scanOverlayEl = document.createElement('div');
    scanOverlayEl.className = 'scan-overlay';
    scanOverlayEl.innerHTML = `
      <video class="scan-video" autoplay playsinline muted></video>
      <div class="scan-frame"></div>
      <p class="scan-tip">将商品条码对准取景框</p>
      <div class="scan-btns">
        <button type="button" class="btn ghost" data-dm="scan-manual">手动输入</button>
        <button type="button" class="btn" data-dm="scan-close">关闭</button>
      </div>`;
    document.body.appendChild(scanOverlayEl);
    requestAnimationFrame(() => scanOverlayEl.classList.add('show'));

    const video = $('.scan-video', scanOverlayEl);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        scanStream = stream;
        video.srcObject = stream;
        scanDetector = new BarcodeDetector({ formats });
        scanIv = setInterval(async () => {
          try {
            const codes = await scanDetector.detect(video);
            if (codes && codes[0]) {
              const code = codes[0].rawValue;
              closeScan(); await onBarcode(code);
            }
          } catch (e) {}
        }, 350);
      })
      .catch(e => {
        closeScan();
        toast(e.name === 'NotAllowedError' ? '相机权限被拒绝，可手动输入条码' : '无法打开相机');
        manualBarcode();
      });
  }

  async function onBarcode(code) {
    toast('正在查询营养数据…');
    try {
      const item = await lookupOFF(String(code).replace(/\D/g, '') || code);
      if (!item || item.missing) {
        toast('开放食品库中没有该商品，可在食物库搜索同类');
        return;
      }
      applyBarcodeItem(item);
    } catch (e) { toast('查询失败，请检查网络'); }
  }

  function manualBarcode() {
    const code = prompt('输入包装上的数字条码（如 6901234567890）');
    if (code && code.trim()) onBarcode(code.trim());
  }

  /* ---------------- 事件委托 ---------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dm]');
    if (!btn) return;
    const act = btn.dataset.dm;
    switch (act) {
      case 'date-prev': renderDiet(addDays(viewDate, -1), { anim: false }); break;
      case 'date-next': renderDiet(addDays(viewDate, 1), { anim: false }); break;
      case 'date-today': renderDiet(todayStr(), { anim: false }); break;
      case 'add': openAdd(btn.dataset.meal); break;
      case 'scan': openScan(); break;
      case 'scan-close': closeScan(); break;
      case 'scan-manual': closeScan(); manualBarcode(); break;
      case 'del':
        dietEntries = dietEntries.filter(x => x.id !== btn.dataset.id);
        saveDiet(); renderDiet(); toast('已删除');
        break;
      case 'cup': {
        const i = +btn.dataset.i;
        const cur = waterMap[viewDate] || 0;
        const next = cur === i + 1 ? i : i + 1;
        waterMap[viewDate] = next;
        saveWater();
        updateWaterUI(next);
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
  window.DietModule = { renderDiet, mountTrend, openWeight, loadFoods, prefetch: loadFoods };
})();
