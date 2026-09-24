/* =====================================================================
 * 训练计划模块（周课表版）
 * 架构：经典脚本 + window.PlanModule 命名空间 + document 级事件委托
 * 数据：复用全局 store(localStorage)；训练记录写入全局 records
 * 依赖（app.js 提供）：store/$/$$/esc/toast/pad/todayStr/addDays/ring/
 *   beep/haptic/unlockAudio/acquireWake/releaseWake/askNotify/settings/
 *   records/saveRecords/genId/thumbFor
 * ===================================================================== */
'use strict';
(function () {
  /* ---------------- 周课表数据 ----------------
   * week: 周一→周日，长度 7；null=完全休息；{f:主题,e:[[动作,组数,次数,休息秒],...]}
   * 次数支持：'12' / '30秒' / '1分钟' / '力竭' / '15次' / '12（每侧）'
   */
  const PLANS = [
    {
      id: 'tp-mu1', title: '新手增肌 · 全身唤醒', goal: '增肌', level: '新手',
      desc: '每周三练全身力量，动作标准优先，帮助新手建立力量底座。',
      week: [
        { f: '全身力量 A', e: [['杠铃深蹲', 3, '12', 90], ['哑铃卧推', 3, '12', 90], ['坐姿划船', 3, '12', 90], ['哑铃推举', 3, '10', 75], ['平板支撑', 3, '30秒', 60]] },
        { f: '主动恢复', e: [['快走', 1, '20分钟', 0], ['腿部后侧拉伸', 2, '30秒', 30], ['猫式伸展', 2, '10次', 30]] },
        { f: '全身力量 B', e: [['弓步蹲', 3, '12', 90], ['俯卧撑', 3, '10', 90], ['引体向上', 3, '6', 90], ['臀桥', 3, '15', 60], ['卷腹', 3, '15', 60]] },
        null,
        { f: '全身力量 A', e: [['杠铃深蹲', 3, '12', 90], ['哑铃卧推', 3, '12', 90], ['坐姿划船', 3, '12', 90], ['哑铃推举', 3, '10', 75], ['平板支撑', 3, '30秒', 60]] },
        { f: '轻有氧 + 柔韧', e: [['跳绳', 3, '1分钟', 60], ['肩部环绕', 2, '10次', 30], ['婴儿式', 2, '30秒', 30], ['下犬式', 2, '30秒', 30]] },
        null
      ]
    },
    {
      id: 'tp-mu2', title: '进阶增肌 · 上下肢分化', goal: '增肌', level: '进阶',
      desc: '上下肢四练分化，容量与强度递进，适合有 3 个月训练基础者。',
      week: [
        { f: '上肢推', e: [['杠铃卧推', 4, '10', 120], ['哑铃推举', 4, '10', 90], ['双杠臂屈伸', 3, '12', 90], ['侧平举', 3, '15', 60], ['绳索下压', 3, '15', 60]] },
        { f: '下肢力量', e: [['杠铃深蹲', 4, '8', 150], ['罗马尼亚硬拉', 4, '10', 120], ['箭步蹲', 3, '12', 90], ['提踵', 4, '15', 60], ['平板支撑', 3, '45秒', 60]] },
        { f: '主动恢复', e: [['快走', 1, '25分钟', 0], ['腿部后侧拉伸', 3, '30秒', 30], ['猫式伸展', 2, '10次', 30]] },
        { f: '上肢拉', e: [['引体向上', 4, '8', 120], ['杠铃划船', 4, '10', 120], ['反向飞鸟', 3, '15', 60], ['哑铃弯举', 3, '12', 60], ['面拉', 3, '15', 60]] },
        { f: '下肢塑形', e: [['前蹲', 3, '10', 120], ['壶铃摆动', 3, '15', 90], ['单腿臀桥', 3, '12', 60], ['哥萨克深蹲', 3, '10', 60], ['死虫式', 3, '12', 60]] },
        { f: '轻有氧', e: [['慢跑', 1, '20分钟', 0], ['肩部环绕', 2, '10次', 30], ['下犬式', 2, '30秒', 30]] },
        null
      ]
    },
    {
      id: 'tp-mu3', title: '高手增肌 · 推拉腿', goal: '增肌', level: '高手',
      desc: '推拉腿五练高频分化，大重量复合动作为主，追求最大力量与肌肥大。',
      week: [
        { f: '推 · 胸肩三头', e: [['杠铃卧推', 5, '5', 180], ['上斜哑铃卧推', 4, '8', 120], ['站姿推举', 4, '8', 120], ['双杠臂屈伸', 3, '力竭', 90], ['绳索下压', 3, '12', 60]] },
        { f: '拉 · 背二头', e: [['硬拉', 4, '5', 180], ['引体向上', 4, '力竭', 120], ['杠铃划船', 4, '8', 120], ['高位下拉', 3, '12', 90], ['哑铃弯举', 3, '12', 60]] },
        { f: '腿 · 深蹲日', e: [['杠铃深蹲', 5, '5', 180], ['前蹲', 3, '8', 150], ['罗马尼亚硬拉', 3, '10', 120], ['箭步蹲', 3, '12', 90], ['提踵', 4, '15', 60]] },
        { f: '主动恢复', e: [['快走', 1, '30分钟', 0], ['泡沫轴放松', 2, '1分钟', 30], ['婴儿式', 2, '30秒', 30]] },
        { f: '推（容量日）', e: [['哑铃卧推', 4, '10', 120], ['哑铃推举', 3, '12', 90], ['侧平举', 4, '15', 60], ['窄距俯卧撑', 3, '力竭', 60], ['臂屈伸', 3, '12', 60]] },
        { f: '拉 + 核心', e: [['坐姿划船', 4, '10', 120], ['反向飞鸟', 4, '15', 60], ['哑铃弯举', 4, '10', 60], ['悬垂举腿', 3, '12', 60], ['平板支撑', 3, '45秒', 60]] },
        null
      ]
    },
    {
      id: 'tp-fa1', title: '新手减脂 · 低冲击燃脂', goal: '减脂', level: '新手',
      desc: '低冲击有氧 + 轻力量，保护膝踝，大体重与久坐人群友好。',
      week: [
        { f: '有氧入门', e: [['快走', 1, '30分钟', 0], ['靠墙静蹲', 3, '30秒', 45], ['开合跳', 3, '30秒', 45]] },
        { f: '拉伸恢复', e: [['腿部后侧拉伸', 2, '30秒', 30], ['肩部环绕', 2, '10次', 30], ['猫式伸展', 2, '10次', 30]] },
        { f: '轻间歇', e: [['跳绳', 5, '1分钟', 60], ['深蹲', 3, '15', 60], ['登山跑', 3, '30秒', 45], ['平板支撑', 3, '30秒', 45]] },
        { f: '主动恢复', e: [['散步', 1, '20分钟', 0], ['下犬式', 2, '30秒', 30]] },
        { f: '循环燃脂', e: [['高抬腿', 4, '30秒', 45], ['弓步蹲', 3, '12', 60], ['波比跳', 3, '8', 60], ['卷腹', 3, '15', 45]] },
        { f: '户外有氧', e: [['快走', 1, '40分钟', 0], ['腿部后侧拉伸', 2, '30秒', 30], ['婴儿式', 2, '30秒', 30]] },
        null
      ]
    },
    {
      id: 'tp-fa2', title: '进阶燃脂 · HIIT 强化', goal: '减脂', level: '进阶',
      desc: '高强度间歇 + 力量循环组合，每周四练，追求最大化燃脂效率。',
      week: [
        { f: 'HIIT A', e: [['波比跳', 4, '12', 45], ['深蹲跳', 4, '15', 45], ['登山跑', 4, '40秒', 30], ['开合跳', 4, '40秒', 30], ['平板支撑', 3, '45秒', 30]] },
        { f: '稳态有氧', e: [['慢跑', 1, '35分钟', 0], ['腿部后侧拉伸', 2, '30秒', 30], ['猫式伸展', 2, '10次', 30]] },
        { f: '力量循环', e: [['杠铃深蹲', 4, '10', 75], ['俯卧撑', 4, '12', 60], ['壶铃摆动', 4, '15', 60], ['臀桥', 4, '15', 45]] },
        null,
        { f: 'HIIT B', e: [['高抬腿', 4, '40秒', 30], ['弓步跳', 3, '16', 45], ['跳绳', 4, '1分钟', 45], ['俄罗斯转体', 3, '20', 30]] },
        { f: '全身循环', e: [['深蹲', 3, '15', 45], ['俯卧撑', 3, '12', 45], ['反向卷腹', 3, '15', 45], ['动态平板支撑', 3, '40秒', 45]] },
        null
      ]
    },
    {
      id: 'tp-sh1', title: '塑形 · 臀腿核心', goal: '塑形', level: '新手',
      desc: '臀腿 + 核心 + 上肢线条均衡雕刻，动作温和，女性居家友好。',
      week: [
        { f: '臀腿激活', e: [['臀桥', 4, '15', 60], ['蚌式开合', 3, '15', 45], ['螃蟹步', 3, '20步', 45], ['深蹲', 3, '15', 60], ['侧抬腿', 3, '15', 45]] },
        { f: '核心 + 拉伸', e: [['死虫式', 3, '12', 45], ['卷腹', 3, '15', 45], ['平板支撑', 3, '40秒', 45], ['婴儿式', 2, '30秒', 30]] },
        null,
        { f: '臀腿强化', e: [['单腿臀桥', 3, '12', 60], ['弓步蹲', 3, '12', 60], ['哥萨克深蹲', 3, '10', 60], ['提踵', 4, '20', 45]] },
        { f: '上肢线条', e: [['俯卧撑', 3, '10', 60], ['臂屈伸', 3, '12', 60], ['超人式', 3, '15', 45], ['门框天使', 3, '12', 45]] },
        { f: '轻有氧 + 柔韧', e: [['跳绳', 3, '1分钟', 60], ['下犬式', 2, '30秒', 30], ['腿部后侧拉伸', 2, '30秒', 30]] },
        null
      ]
    },
    {
      id: 'tp-sh2', title: '进阶塑形 · 全身雕刻', goal: '塑形', level: '高手',
      desc: '力量爆发 + 高强度间歇，雕刻深层线条，适合训练老手。',
      week: [
        { f: '臀腿爆发', e: [['杠铃深蹲', 4, '10', 90], ['箱跳', 4, '8', 90], ['箭步蹲', 3, '12', 75], ['罗马尼亚硬拉', 3, '12', 75]] },
        { f: '上肢塑形', e: [['击掌俯卧撑', 4, '8', 90], ['引体向上', 4, '8', 90], ['哑铃推举', 3, '12', 75], ['钻石俯卧撑', 3, '力竭', 60]] },
        { f: '核心雕刻', e: [['悬垂举腿', 3, '12', 60], ['俄罗斯转体', 3, '20', 45], ['侧平板', 3, '30秒', 45], ['空中自行车', 3, '20', 45]] },
        { f: '主动恢复', e: [['散步', 1, '30分钟', 0], ['婴儿式', 2, '30秒', 30], ['猫式伸展', 2, '10次', 30]] },
        { f: '臀腿再练', e: [['壶铃摆动', 4, '15', 75], ['单腿深蹲', 3, '8', 75], ['单腿臀桥', 4, '12', 60], ['提踵', 4, '20', 45]] },
        { f: 'HIIT 收尾', e: [['波比跳', 4, '10', 45], ['高抬腿', 4, '40秒', 30], ['跳绳', 4, '1分钟', 45], ['平板支撑', 3, '45秒', 30]] },
        null
      ]
    },
    {
      id: 'tp-re1', title: '康复训练 · 关节活动度', goal: '康复', level: '新手',
      desc: '颈肩、脊柱、髋膝分区康复，温和恢复活动度，久坐与术后恢复期适用。',
      week: [
        { f: '颈肩放松', e: [['颈部拉伸', 3, '30秒', 30], ['肩部环绕', 3, '10次', 30], ['门框天使', 3, '12', 30], ['毛巾颈后抗阻', 3, '10', 45]] },
        { f: '脊柱灵活', e: [['猫式伸展', 3, '10次', 30], ['眼镜蛇式', 3, '30秒', 30], ['婴儿式', 3, '30秒', 30], ['死虫式', 3, '10', 45]] },
        { f: '散步恢复', e: [['散步', 1, '25分钟', 0], ['肩部环绕', 2, '10次', 30]] },
        { f: '髋膝康复', e: [['臀桥', 3, '12', 45], ['座椅深蹲', 3, '12', 45], ['蚌式开合', 3, '12', 30], ['靠墙静蹲', 3, '30秒', 45]] },
        { f: '柔韧 + 盆底', e: [['下犬式', 3, '30秒', 30], ['腿部后侧拉伸', 3, '30秒', 30], ['凯格尔', 3, '10次', 30]] },
        { f: '户外散步', e: [['散步', 1, '30分钟', 0], ['猫式伸展', 2, '10次', 30]] },
        null
      ]
    }
  ];

  const GOALS = ['全部', '增肌', '减脂', '塑形', '康复'];
  const LEVELS = ['全部', '新手', '进阶', '高手'];
  const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const KCAL_RATE = { '新手': 6, '进阶': 8, '高手': 10 };

  /* ---------------- 工具与估算 ---------------- */
  const todayIdx = () => (new Date().getDay() + 6) % 7;            // 周一=0
  const mondayOf = d => addDays(d, -todayIdx());
  const getActiveId = () => store.get('tp_active', '');
  const findPlan = id => PLANS.find(p => p.id === id);

  // 单次组做功秒数
  function workSec(reps) {
    const s = String(reps);
    const n = parseFloat(s.replace(/[^0-9.]/g, '')) || 10;
    if (s.includes('分钟')) return n * 60;
    if (s.includes('秒')) return n;
    if (s.includes('力竭')) return 25;
    return n * 3; // 次/步
  }
  // 一天课程：预计分钟 + 千卡
  function dayEstimate(plan, day) {
    if (!day) return { min: 0, kcal: 0 };
    let sec = 0;
    day.e.forEach(([n, sets, reps, rest]) => {
      sec += sets * workSec(reps) + (sets - 1) * (rest || 0) + 20; // 20s 换动作
    });
    const min = Math.max(1, Math.round(sec / 60));
    return { min, kcal: Math.round(min * KCAL_RATE[plan.level]) };
  }
  function planSummary(plan) {
    const days = plan.week.filter(Boolean);
    const mins = days.map(d => dayEstimate(plan, d).min);
    const trainDays = days.length;
    const avgMin = Math.round(mins.reduce((a, b) => a + b, 0) / trainDays);
    return { trainDays, avgMin };
  }
  // 本周已完成天数（按本周内实际打卡日期计，兼容提前/补练其他天课程）
  function weekDoneCount(plan, monday) {
    const dates = new Set();
    for (let i = 0; i < 7; i++) {
      const date = addDays(monday, i);
      if (records.some(r => r.planId === plan.id && r.date === date)) dates.add(date);
    }
    return dates.size;
  }

  /* ---------------- 组件：今日训练卡片 ---------------- */
  function todayCard() {
    const id = getActiveId();
    const plan = findPlan(id);
    const di = todayIdx();
    if (!plan) {
      return `<div class="tp-today tp-today-empty" data-tp="tp-open" data-id="${PLANS[0].id}">
        <div class="tt-left">
          <div class="tt-badge">📋</div>
          <div><b>选择你的训练计划</b><small>按目标与难度挑选，开启本周课表</small></div>
        </div>
        <span class="tt-cta">去选择 ›</span>
      </div>`;
    }
    const day = plan.week[di];
    const trainedToday = records.some(r => r.planId === plan.id && r.date === todayStr());
    if (!day) {
      return `<div class="tp-today tp-today-rest">
        <div class="tt-left">
          <div class="tt-badge">${trainedToday ? '🎯' : '🛌'}</div>
          <div><b>${trainedToday ? '今日已打卡' : '今天是休息日'}</b><small>${esc(plan.title)} · 散步拉伸帮助恢复</small></div>
        </div>
        <span class="tt-cta" data-tp="tp-open" data-id="${plan.id}">看课表</span>
      </div>`;
    }
    const est = dayEstimate(plan, day);
    return `<div class="tp-today">
      <div class="tt-top">
        <span class="tt-day">${WEEKDAYS[di]} · ${day.f}</span>
        <span class="tt-plan">${esc(plan.title)}</span>
      </div>
      <div class="tt-meta">
        <span><b>${day.e.length}</b> 个动作</span>
        <span><b>${est.min}</b> 预计分钟</span>
        <span><b>${est.kcal}</b> 消耗千卡</span>
      </div>
      <button class="tt-start" data-tp="tp-start" data-id="${plan.id}">▶ 开始今日训练</button>
    </div>`;
  }

  /* ---------------- 视图：计划列表（计划 Tab） ---------------- */
  let filter = { goal: '全部', level: '全部' };

  function planCardHTML(plan) {
    const monday = mondayOf(todayStr());
    const done = weekDoneCount(plan, monday);
    const sum = planSummary(plan);
    const pct = Math.round(done / sum.trainDays * 100);
    const active = getActiveId() === plan.id;
    return `<div class="tp-card ${active ? 'active' : ''}" data-tp="tp-open" data-id="${plan.id}">
      <div class="tc-main">
        <div class="tc-tags">
          <span class="tp-pill g">${plan.goal}</span>
          <span class="tp-pill l">${plan.level}</span>
          ${active ? '<span class="tp-pill a">进行中</span>' : ''}
        </div>
        <b class="tc-title">${esc(plan.title)}</b>
        <small class="tc-sub">每周 ${sum.trainDays} 练 · 日均 ${sum.avgMin} 分钟 · 本周 ${done}/${sum.trainDays} 天</small>
      </div>
      <div class="tc-ring">
        ${ring(pct, 'var(--primary)', 'var(--divider)')}
        <span class="tc-ring-tx">${pct}%</span>
      </div>
    </div>`;
  }

  function renderList() {
    const list = PLANS.filter(p =>
      (filter.goal === '全部' || p.goal === filter.goal) &&
      (filter.level === '全部' || p.level === filter.level));
    $('#app').innerHTML = `
      <div class="page-head"><h1>训练计划</h1><p>按目标与难度挑选 · 一周课表 · 组次与休息建议</p></div>
      ${todayCard()}
      <div class="tp-filters">
        <div class="chips">${GOALS.map(g => `<span class="chip ${filter.goal === g ? 'active' : ''}" data-tp="tp-filter" data-k="goal" data-v="${g}">${g}</span>`).join('')}</div>
        <div class="chips">${LEVELS.map(l => `<span class="chip ${filter.level === l ? 'active' : ''}" data-tp="tp-filter" data-k="level" data-v="${l}">${l}</span>`).join('')}</div>
      </div>
      ${list.length ? `<div class="tp-list">${list.map(planCardHTML).join('')}</div>`
        : emptyHTML('search', '该组合下暂无计划', '换个筛选试试')}
    `;
  }

  /* ---------------- 视图：计划详情（周课表） ---------------- */
  let detailSelDay = todayIdx();
  const footLabel = plan => {
    if (detailSelDay !== todayIdx()) return '预览第 ' + (detailSelDay + 1) + ' 天课程';
    return plan.week[detailSelDay] ? '▶ 开始今日训练' : '今天休息日 · 散步拉伸';
  };

  function renderDetail(id) {
    const plan = findPlan(id);
    if (!plan) return;
    const monday = mondayOf(todayStr());
    const done = weekDoneCount(plan, monday);
    const sum = planSummary(plan);
    const pct = Math.round(done / sum.trainDays * 100);
    const active = getActiveId() === plan.id;
    const sub = document.createElement('div');
    sub.className = 'subpage tp-detail-page';
    sub.dataset.ctx = 'detail';
    sub.innerHTML = `
      <div class="sp-head">
        <button class="icon-btn" data-tp="tp-back" aria-label="返回">‹</button>
        <b>${esc(plan.title)}</b>
        <button class="tp-set-btn ${active ? 'on' : ''}" data-tp="tp-set" data-id="${plan.id}">${active ? '✓ 我的计划' : '设为我的计划'}</button>
      </div>
      <div class="sp-body">
        <div class="tp-d-head">
          <div class="tc-ring lg">${ring(pct, 'var(--primary)', 'var(--divider)')}<span class="tc-ring-tx">${pct}%</span></div>
          <div class="tp-d-info">
            <div class="tc-tags"><span class="tp-pill g">${plan.goal}</span><span class="tp-pill l">${plan.level}</span></div>
            <p class="muted" style="margin-top:8px;line-height:1.6">${esc(plan.desc)}</p>
            <p class="muted">每周 ${sum.trainDays} 练 · 日均 ${sum.avgMin} 分钟 · 本周已完成 ${done} 天</p>
          </div>
        </div>
        <div class="tp-week">
          ${plan.week.map((day, i) => {
            const date = addDays(monday, i);
            const isToday = i === todayIdx();
            const isDone = day && records.some(r => r.planId === plan.id && r.date === date);
            const est = day ? dayEstimate(plan, day) : null;
            return `<div class="tp-day ${isToday ? 'today' : ''} ${day ? '' : 'rest'} ${i === detailSelDay ? 'sel' : ''}" data-tp="tp-day" data-d="${i}">
              <div class="td-head">
                <span class="td-wd">${WEEKDAYS[i]}</span>
                <span class="td-date">${date.slice(5).replace('-', '/')}${isToday ? ' · 今天' : ''}</span>
                ${isDone ? '<span class="td-done">✓ 已打卡</span>' : ''}
              </div>
              <div class="td-focus">${day ? `${day.f} <em>· ${est.min}分钟 · ${est.kcal}千卡</em>` : '<em>完全休息 · 散步拉伸即可</em>'}</div>
              ${day ? `<ul class="td-items">${day.e.map(([n, sets, reps, rest]) => `
                <li><span class="tdi-n">${esc(n)}</span><span class="tdi-v">${sets} × ${esc(reps)}</span><span class="tdi-r">${rest ? '休' + rest + '秒' : '—'}</span></li>`).join('')}</ul>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="tp-detail-foot">
        <button class="btn mega" data-tp="tp-detail-start" data-id="${plan.id}">
          ${footLabel(plan)}
        </button>
      </div>`;
    document.body.appendChild(sub);
    requestAnimationFrame(() => sub.classList.add('show'));
  }

  /* ---------------- 视图：训练执行 ---------------- */
  let sess = null, sessEl = null, sessIv = null;
  const fmtS = s => { s = Math.max(0, s | 0); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  const elapsed = () => sess ? sess.elapsed + (sess.running ? Date.now() - sess.runStart : 0) : 0;
  const persistSess = () => sess && store.set('tp_session', sess);
  const nextUndone = () => {
    for (let i = 0; i < sess.items.length; i++) if (!sess.done.includes(i)) return i;
    return null;
  };

  function openSession(planId, dayIdxArg, saved) {
    const plan = findPlan(planId);
    const dayI = dayIdxArg === undefined ? todayIdx() : dayIdxArg;
    const day = plan && plan.week[dayI];
    if (!day) { toast('今天是休息日'); return; }
    const est = dayEstimate(plan, day);
    sess = saved || {
      planId, day: dayI, date: todayStr(), done: [],
      running: false, runStart: 0, elapsed: 0,
      restEnd: 0, restLen: 0, beeped: {}
    };
    sess.items = day.e;
    const sub = document.createElement('div');
    sub.className = 'subpage tp-sess-page';
    sub.dataset.ctx = 'session';
    sub.innerHTML = `
      <div class="sp-head">
        <button class="icon-btn" data-tp="tp-sess-back" aria-label="返回（保留进度）">‹</button>
        <b>${esc(plan.title)}</b>
        <button class="icon-btn tp-quit" data-tp="tp-quit" aria-label="放弃训练">放弃</button>
      </div>
      <div class="sp-body tp-sess-body">
        <div class="tps-day">
          <span class="tp-pill g">${WEEKDAYS[dayI]} · ${day.f}</span>
          <span class="muted">预计 ${est.min} 分钟 · ${est.kcal} 千卡</span>
        </div>
        <div class="card tps-timer-card">
          <div class="tc-label">训练计时</div>
          <div class="tps-time" id="tpsTime">00:00</div>
          <button class="btn ghost" id="tpsToggle" data-tp="tp-timer">▶ 开始计时</button>
        </div>
        <div class="tps-rest" id="tpsRest" hidden>
          <div class="tr-label">😮‍💨 组间休息</div>
          <div class="tr-ring">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--divider)" stroke-width="8"/>
              <circle id="trArc" cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="8"
                stroke-linecap="round" transform="rotate(-90 60 60)"/>
            </svg>
            <div class="tr-num" id="trNum">00</div>
          </div>
          <button class="btn ghost full" data-tp="tp-skiprest">跳过休息，继续练</button>
        </div>
        <div class="card">
          <h3>动作清单 <span class="muted" id="tpsCount">0/${day.e.length}</span></h3>
          <div class="progress-mini"><i id="tpsBar" style="width:0%"></i></div>
          <div class="tps-list">
            ${day.e.map((it, i) => {
              const [n, sets, reps, rest] = it;
              const thumb = typeof thumbFor === 'function' ? thumbFor(n) : '';
              return `<button type="button" class="tps-row ${sess.done.includes(i) ? 'done' : ''}" data-tp="tp-row" data-i="${i}">
                ${thumb ? `<span class="ex-thumb"><img loading="lazy" src="${thumb}" alt=""></span>` : '<span class="tps-noimg"></span>'}
                <span class="tps-info">
                  <span class="tps-n">${esc(n)}</span>
                  <span class="tps-v">${sets} × ${esc(reps)} · 休 ${rest || 0} 秒</span>
                </span>
                <span class="tps-state">✓</span>
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="wk-foot tps-foot">
        <div class="wk-next" id="tpsNext"></div>
        <button class="btn mega" data-tp="tp-mega">✓ 完成第 1 个动作</button>
      </div>
      <div class="tp-celebrate" id="tpsCelebrate" hidden>
        <div class="tpc-pop">🎉</div>
        <h2>今日训练完成！</h2>
        <p class="muted" id="tpcStat"></p>
        <div class="tpc-confetti" id="tpcConfetti"></div>
        <div class="tpc-btns">
          <button class="btn mega" data-tp="tp-save">💾 保存并打卡</button>
          <button class="btn ghost" data-tp="tp-continue">再练一会儿</button>
        </div>
      </div>`;
    document.body.appendChild(sub);
    requestAnimationFrame(() => sub.classList.add('show'));
    sessEl = sub;
    clearInterval(sessIv);
    sessIv = setInterval(renderTick, 250);
    renderTick(); updateSess(); persistSess();
    if (saved && (saved.elapsed > 0 || saved.done.length)) toast('已恢复上次训练 💪');
  }

  function renderTick() {
    if (!sess || !sessEl) return;
    $('#tpsTime').textContent = fmtS(elapsed() / 1000);
    const restEl = $('#tpsRest');
    if (sess.restEnd) {
      const left = Math.ceil((sess.restEnd - Date.now()) / 1000);
      if (left > 0) {
        restEl.hidden = false;
        $('#trNum').textContent = pad(left);
        const r = 52, c = 2 * Math.PI * r, ratio = Math.max(0, left / Math.max(sess.restLen, 1));
        $('#trArc').setAttribute('stroke-dasharray', c);
        $('#trArc').setAttribute('stroke-dashoffset', c * (1 - ratio));
        if (left <= 3 && !sess.beeped[left]) { sess.beeped[left] = true; beep(880, .12); haptic(150); }
      } else {
        restEl.hidden = true; sess.restEnd = 0;
        beep(1175, .55, 'sine', .4); haptic([300, 100, 300]);
      }
    } else restEl.hidden = true;
    persistSess();
  }

  function completeOne(i) {
    if (!sess.done.includes(i)) sess.done.push(i);
    const row = sessEl.querySelector(`.tps-row[data-i="${i}"]`);
    if (row) row.classList.add('done');
    beep(660, .12); haptic(60);
    const rest = sess.items[i][3] || 0;
    // 最后一个动作不再启动休息
    if (rest && nextUndone() !== null) {
      sess.restLen = rest;
      sess.restEnd = Date.now() + rest * 1000;
      sess.beeped = {};
    } else sess.restEnd = 0;
    updateSess(); persistSess();
    if (nextUndone() === null) setTimeout(showCelebrate, 500);
  }

  function updateSess() {
    if (!sessEl) return;
    const n = sess.items.length;
    $('#tpsCount').textContent = sess.done.length + '/' + n;
    $('#tpsBar').style.width = (sess.done.length / n * 100) + '%';
    const next = nextUndone();
    const mega = sessEl.querySelector('.tps-foot .mega');
    const nextEl = $('#tpsNext');
    if (next === null) {
      mega.textContent = '🎉 查看完成报告';
      nextEl.textContent = '全部 ' + n + ' 个动作已完成';
    } else {
      mega.textContent = '✓ 完成第 ' + (next + 1) + ' 个动作';
      nextEl.textContent = '下一个 · ' + sess.items[next][0];
    }
    sessEl.querySelectorAll('.tps-row').forEach(r => {
      r.classList.toggle('done', sess.done.includes(+r.dataset.i));
    });
  }

  /* ---- 完成动画 ---- */
  function showCelebrate() {
    const el = $('#tpsCelebrate');
    if (!el || !sess) return;
    const plan = findPlan(sess.planId);
    const day = plan.week[sess.day];
    const est = dayEstimate(plan, day);
    const ratio = sess.done.length / sess.items.length;
    const min = Math.max(1, Math.round(Math.max(elapsed() / 60000, est.min * ratio)));
    const kcal = Math.round(est.kcal * ratio);
    $('#tpcStat').textContent = min + ' 分钟 · ' + kcal + ' 千卡 · ' + sess.done.length + '/' + sess.items.length + ' 个动作';
    el._min = min; el._kcal = kcal;
    // 生成彩带
    const box = $('#tpcConfetti');
    box.innerHTML = '';
    const colors = ['#00b578', '#ff7d00', '#36c99a', '#165dff', '#ff9a2e'];
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = (Math.random() * .5) + 's';
      s.style.animationDuration = (1.4 + Math.random() * 1.2) + 's';
      box.appendChild(s);
    }
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('on'));
  }

  function saveRecord() {
    const el = $('#tpsCelebrate');
    const plan = findPlan(sess.planId);
    records.unshift({
      id: genId(), planId: sess.planId, planTitle: plan.title,
      date: sess.date, minutes: el._min, kcal: el._kcal,
      doneCount: sess.done.length, total: sess.items.length
    });
    saveRecords();
    closeSession();
    store.set('tp_session', null);
    toast('打卡成功 · ' + el._min + ' 分钟 · ' + el._kcal + ' 千卡 🔥');
    showTab('stats');
  }

  function closeSession() {
    clearInterval(sessIv); sessIv = null;
    releaseWake();
    if (sessEl) {
      const el = sessEl;
      el.classList.remove('show');
      setTimeout(() => el.remove(), 220);
      sessEl = null;
    }
    sess = null;
  }

  /* ---------------- 事件委托（document 级，只绑一次） ---------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tp]');
    if (!btn) return;
    const act = btn.dataset.tp;
    switch (act) {
      case 'tp-filter':
        filter[btn.dataset.k] = btn.dataset.v;
        if ($('#app') && $('#app').querySelector('.tp-filters')) renderList();
        break;
      case 'tp-open': renderDetail(btn.dataset.id); break;
      case 'tp-set': {
        const id = btn.dataset.id;
        store.set('tp_active', getActiveId() === id ? '' : id);
        toast(getActiveId() === id ? '已设为我的计划' : '已取消计划');
        const oldPage = document.querySelector('.tp-detail-page.show');
        if (oldPage) closeSubpageEl(oldPage);
        if (getActiveId() === id) renderDetail(id);
        if ($('#app').querySelector('.tp-list')) renderList();
        break;
      }
      case 'tp-day':
        detailSelDay = +btn.dataset.d;
        const page = document.querySelector('.tp-detail-page.show');
        if (page) {
          page.querySelectorAll('.tp-day').forEach(d => d.classList.toggle('sel', +d.dataset.d === detailSelDay));
          const foot = page.querySelector('.tp-detail-foot .mega');
          foot.textContent = footLabel(findPlan(foot.dataset.id));
        }
        break;
      case 'tp-detail-start': {
        const plan = findPlan(btn.dataset.id);
        const day = plan.week[detailSelDay];
        if (!day) { toast('该天为休息日'); break; }
        closeSubpageEl(document.querySelector('.tp-detail-page.show'));
        openSession(btn.dataset.id, detailSelDay);
        break;
      }
      case 'tp-start':
        openSession(btn.dataset.id, todayIdx());
        break;
      case 'tp-back':
        closeSubpageEl(document.querySelector('.tp-detail-page.show'));
        break;
      case 'tp-sess-back':
        persistSess(); closeSession(); toast('进度已保留，稍后可恢复');
        break;
      case 'tp-quit':
        if (confirm('确定放弃本次训练？当前进度将被清除')) {
          closeSession(); store.set('tp_session', null); toast('训练已放弃');
        }
        break;
      case 'tp-timer': {
        unlockAudio(); askNotify();
        const b = $('#tpsToggle');
        if (sess.running) {
          sess.elapsed += Date.now() - sess.runStart;
          sess.running = false; b.textContent = '▶ 继续计时'; releaseWake();
        } else {
          sess.running = true; sess.runStart = Date.now();
          b.textContent = '⏸ 暂停'; acquireWake();
        }
        persistSess(); renderTick();
        break;
      }
      case 'tp-row': {
        const i = +btn.dataset.i;
        if (sess.done.includes(i)) {
          sess.done = sess.done.filter(x => x !== i);
        } else {
          unlockAudio(); askNotify();
          completeOne(i);
        }
        updateSess(); persistSess();
        break;
      }
      case 'tp-skiprest':
        sess.restEnd = 0; persistSess(); renderTick();
        break;
      case 'tp-mega': {
        const next = nextUndone();
        if (next === null) { showCelebrate(); break; }
        unlockAudio(); askNotify();
        if (!sess.running) {
          sess.running = true; sess.runStart = Date.now();
          $('#tpsToggle').textContent = '⏸ 暂停'; acquireWake();
        }
        completeOne(next);
        break;
      }
      case 'tp-continue': {
        const el = $('#tpsCelebrate');
        el.classList.remove('on'); el.hidden = true;
        break;
      }
      case 'tp-save': saveRecord(); break;
    }
  });

  function closeSubpageEl(el) {
    if (!el) return;
    el.classList.remove('show');
    setTimeout(() => el.remove(), 220);
  }

  /* ---------------- 恢复未完成会话 ---------------- */
  function resumeIfAny() {
    const s = store.get('tp_session', null);
    if (!s) return;
    if (s.date === todayStr() && (s.elapsed > 0 || (s.done && s.done.length) || s.running)) {
      openSession(s.planId, s.day, s);
    } else store.set('tp_session', null);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resumeIfAny);
  } else resumeIfAny();

  /* ---------------- 对外 API ---------------- */
  window.PlanModule = {
    renderList, todayCard, resumeIfAny, planCardHTML,
    plans: PLANS, findPlan, dayEstimate, todayIdx
  };
})();
