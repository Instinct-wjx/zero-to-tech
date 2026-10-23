/* ============================================================
   农历 · 星期 计算终端
   ------------------------------------------------------------
   第 1 部分：农历换算（纯函数，不依赖页面，可在 Node 中单独测试）
   第 2 部分：页面交互（实时时钟 / 查询 / 粒子背景 / 复制）
============================================================ */

/* ==================== 1. 农历换算 ==================== */

/* 农历数据表：1900-2100 年，每年一个十六进制数。
   低 4 位    = 闰月月份（0 表示无闰月）
   第 5~16 位 = 1~12 月的大小月（1 = 大月 30 天，0 = 小月 29 天）
   第 17 位   = 闰月大小（1 = 大 30 天，0 = 小 29 天） */
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520, // 2100
];

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const WEEK_FULL = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEK_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAY = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];
/* 十二时辰：每时辰 2 小时，从 23:00 的子时开始 */
const SHICHEN = [
  ['子时', '23:00-00:59'], ['丑时', '01:00-02:59'], ['寅时', '03:00-04:59'],
  ['卯时', '05:00-06:59'], ['辰时', '07:00-08:59'], ['巳时', '09:00-10:59'],
  ['午时', '11:00-12:59'], ['未时', '13:00-14:59'], ['申时', '15:00-16:59'],
  ['酉时', '17:00-18:59'], ['戌时', '19:00-20:59'], ['亥时', '21:00-22:59'],
];

/* 某年的闰月月份（0 = 没有闰月） */
function leapMonthOf(year) {
  return LUNAR_INFO[year - 1900] & 0xf;
}

/* 闰月有多少天 */
function leapDaysOf(year) {
  if (!leapMonthOf(year)) return 0;
  return LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29;
}

/* 某农历年某月（1~12）有多少天 */
function monthDaysOf(year, month) {
  return LUNAR_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29;
}

/* 某农历年一共有多少天 */
function lunarYearDays(year) {
  let days = 348; // 12 个月 × 29 天
  for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
    if (LUNAR_INFO[year - 1900] & bit) days += 1; // 大月补 1 天
  }
  return days + leapDaysOf(year);
}

/* 公历 → 农历（核心换算函数） */
function solarToLunar(y, m, d) {
  // 与 1900-01-31（庚子年正月初一）相差的天数
  let offset = Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000
  );

  // 第一步：按整年扣
  let year = 1900;
  let daysInYear = 0;
  while (offset > 0 && year < 2101) {
    daysInYear = lunarYearDays(year);
    offset -= daysInYear;
    year++;
  }
  if (offset < 0) {
    offset += daysInYear; // 扣过头了，退回来
    year--;
  }

  // 第二步：按月扣（闰月插在它下一月的正常月之前处理）
  const lYear = year;
  const leapMonth = leapMonthOf(lYear);
  let isLeap = false;
  let month = 1;
  let daysInMonth = 0;

  while (offset > 0 && month <= 12) {
    if (leapMonth > 0 && month === leapMonth + 1 && !isLeap) {
      month--;                    // 先扣闰月
      isLeap = true;
      daysInMonth = leapDaysOf(lYear);
    } else {
      daysInMonth = monthDaysOf(lYear, month);
    }
    if (isLeap && month === leapMonth + 1) isLeap = false; // 闰月扣完，恢复正常
    offset -= daysInMonth;
    month++;
  }

  // 边界：刚好扣到闰月下一天，即闰月初一
  if (offset === 0 && leapMonth > 0 && month === leapMonth + 1) {
    if (isLeap) isLeap = false;
    else { isLeap = true; month--; }
  }

  // 多扣了一个月，回退
  if (offset < 0) {
    offset += daysInMonth;
    month--;
  }

  return { year: lYear, month, day: offset + 1, isLeap };
}

/* 干支纪年，如 2024 → 甲辰 */
function ganzhiOf(year) {
  return GAN[(year - 4) % 10] + ZHI[(year - 4) % 12];
}

/* 生肖，如 2024 → 龙 */
function zodiacOf(year) {
  return ZODIAC[(year - 4) % 12];
}

/* 时辰（0~23 点 → 十二时辰） */
function shichenOf(hour) {
  return SHICHEN[Math.floor(((hour + 1) % 24) / 2)];
}

/* 格式化农历日期，如：正月初一 / 闰六月十五 */
function formatLunar(lunar) {
  const monthName = (lunar.isLeap ? '闰' : '') + LUNAR_MONTH[lunar.month - 1] + '月';
  return monthName + LUNAR_DAY[lunar.day - 1];
}

/* 允许在 Node 里单独测试换算逻辑（浏览器中自动跳过） */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solarToLunar, ganzhiOf, zodiacOf, shichenOf, formatLunar };
}

/* ==================== 2. 页面交互 ==================== */

/* 浏览器环境下才执行（Node 里没有 document） */
if (typeof document !== 'undefined') {

  /* ---- 获取元素 ---- */
  const dateInput   = document.getElementById('dateInput');
  const timeInput   = document.getElementById('timeInput');
  const queryBtn    = document.getElementById('queryBtn');
  const todayBtn    = document.getElementById('todayBtn');
  const copyBtn     = document.getElementById('copyBtn');
  const result      = document.getElementById('result');
  const weekdayEl   = document.getElementById('weekday');
  const lunarEl     = document.getElementById('lunar');
  const ganzhiEl    = document.getElementById('ganzhi');
  const zodiacEl    = document.getElementById('zodiac');
  const shichenEl   = document.getElementById('shichen');
  const offsetEl    = document.getElementById('offset');
  const clockTimeEl = document.getElementById('clockTime');
  const clockDateEl = document.getElementById('clockDate');
  const titleEl     = document.querySelector('.title');

  /* ---- 状态 ---- */
  let weekModeShort = false;   // false = 星期一，true = 周一
  let lastResultText = '';     // 复制用的汇总文本

  const MIN_DATE = new Date(1900, 0, 31).getTime();
  const MAX_DATE = new Date(2100, 11, 31).getTime();

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /* ---- 实时时钟 ---- */
  function tick() {
    const now = new Date();
    clockTimeEl.innerHTML =
      pad(now.getHours()) + '<span class="blink">:</span>' +
      pad(now.getMinutes()) + '<span class="blink">:</span>' +
      pad(now.getSeconds());
    clockDateEl.textContent =
      now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) +
      ' · ' + WEEK_FULL[now.getDay()];
  }
  tick();
  setInterval(tick, 1000);

  /* ---- 查询与渲染 ---- */
  function render() {
    const dateVal = dateInput.value; // "2024-02-10"
    const timeVal = timeInput.value; // "12:00"

    if (!dateVal) {
      showError('请选择一个日期');
      return;
    }

    const [y, m, d] = dateVal.split('-').map(Number);
    const ts = new Date(y, m - 1, d).getTime();

    if (ts < MIN_DATE || ts > MAX_DATE) {
      showError('超出换算范围（1900-01-31 ~ 2100-12-31）');
      return;
    }

    result.classList.remove('error');

    const lunar = solarToLunar(y, m, d);
    const week = new Date(y, m - 1, d).getDay();

    // 星期（点击文字可切换 星期X / 周X 格式）
    weekdayEl.textContent = weekModeShort ? WEEK_SHORT[week] : WEEK_FULL[week];
    weekdayEl.classList.toggle('weekend', week === 0 || week === 6);

    // 农历日期
    lunarEl.textContent = '农历 ' + ganzhiOf(lunar.year) + '年 ' + formatLunar(lunar);

    // 信息标签
    ganzhiEl.textContent = '干支 ' + ganzhiOf(lunar.year);
    zodiacEl.textContent = '生肖 ' + zodiacOf(lunar.year);

    const hour = timeVal && /^\d{2}:\d{2}$/.test(timeVal)
      ? Number(timeVal.slice(0, 2))
      : null;
    if (hour === null) {
      shichenEl.textContent = '时辰 未选择';
      shichenEl.removeAttribute('title');
    } else {
      const [name, range] = shichenOf(hour);
      shichenEl.textContent = '时辰 ' + name;
      shichenEl.title = range;
    }

    // 距离今天
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((ts - today.getTime()) / 86400000);
    offsetEl.textContent = '距今 ' +
      (diff === 0 ? '今天' : (diff > 0 ? diff + ' 天后' : -diff + ' 天前'));

    // 汇总文本（复制用）
    lastResultText = [
      '【' + dateVal + (timeVal ? ' ' + timeVal : '') + '】',
      weekdayEl.textContent,
      lunarEl.textContent,
      '生肖：' + zodiacOf(lunar.year) +
        (hour === null ? '' : '｜时辰：' + shichenOf(hour)[0]),
      offsetEl.textContent,
    ].join('\n');
  }

  function showError(msg) {
    result.classList.add('error');
    weekdayEl.classList.remove('weekend');
    weekdayEl.textContent = '出错了';
    lunarEl.textContent = msg;
    lastResultText = '';
  }

  /* ---- 事件 ---- */

  // 改日期/时间后立即刷新结果
  dateInput.addEventListener('change', render);
  timeInput.addEventListener('change', render);

  queryBtn.addEventListener('click', () => {
    render();
    // 重放“扫描”动画：先移除类，强制重排后再加回去
    result.classList.remove('scanning');
    void result.offsetWidth;
    result.classList.add('scanning');
  });

  todayBtn.addEventListener('click', () => {
    const now = new Date();
    dateInput.value =
      now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    timeInput.value = pad(now.getHours()) + ':' + pad(now.getMinutes());
    render();
  });

  function toggleWeekMode() {
    weekModeShort = !weekModeShort;
    render();
  }
  weekdayEl.addEventListener('click', toggleWeekMode);
  weekdayEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleWeekMode();
    }
  });

  copyBtn.addEventListener('click', async () => {
    if (!lastResultText) return;
    const ok = await copyText(lastResultText);
    copyBtn.textContent = ok ? '✓ 已复制' : '复制失败';
    setTimeout(() => (copyBtn.textContent = '复制结果'), 1500);
  });

  /* 复制文本，兼容直接双击打开的 file:// 页面 */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('无剪贴板 API');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  /* 标题故障字效：鼠标悬停时触发 */
  titleEl.addEventListener('mouseenter', () => titleEl.classList.add('glitching'));
  titleEl.addEventListener('animationend', () => titleEl.classList.remove('glitching'));

  /* ---- 粒子网络背景 ---- */
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const mouse = { x: null, y: null };
  const LINK_DIST = 110;   // 粒子之间的连线距离
  const MOUSE_DIST = 150;  // 鼠标影响范围
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];

  function resizeCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const count = Math.min(100, Math.floor((innerWidth * innerHeight) / 15000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.6 + 0.4,
    }));
  }

  function updateParticles() {
    for (const p of particles) {
      // 鼠标附近的粒子被轻轻推开
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0.1) {
          p.x += (dx / dist) * 1.2;
          p.y += (dy / dist) * 1.2;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
  }

  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      // 距离近的粒子之间画半透明连线
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.5;
          ctx.strokeStyle = 'rgba(0, 229, 255, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // 粒子本身
      ctx.fillStyle = '#7ce8ff';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 鼠标附近的粒子与鼠标之间画粉色亮线
    if (mouse.x !== null) {
      for (const p of particles) {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dist < MOUSE_DIST) {
          ctx.strokeStyle = 'rgba(255, 46, 136, 0.35)';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    updateParticles();
    drawScene();
    if (!reduceMotion) requestAnimationFrame(frame); // 用户偏好静动态时只画一帧
  }

  addEventListener('resize', resizeCanvas);
  addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  /* ---- 初始化：默认查询今天 ---- */
  const nowInit = new Date();
  dateInput.value =
    nowInit.getFullYear() + '-' + pad(nowInit.getMonth() + 1) + '-' + pad(nowInit.getDate());
  timeInput.value = pad(nowInit.getHours()) + ':' + pad(nowInit.getMinutes());
  render();

  resizeCanvas();
  frame();
}
