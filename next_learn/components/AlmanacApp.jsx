'use client';

/* ============================================================
   岁时记 · 传统黄历（Next.js 版）
   主组件：时钟 / 黄历查询 / 月历印记 / 卷轴详情 / 名号系统
   （原 script.js 第 3 部分，DOM 操作改为 React 状态与渲染）
============================================================ */

import { useEffect, useMemo, useState } from 'react';
import {
  FEST_MAP,
  WELLNESS,
  WEEK_FULL,
  WEEK_SHORT,
  dayGanzhiOf,
  fmtDate,
  fmtShort,
  formatLunar,
  ganzhiOf,
  pad,
  shichenOf,
  solarToLunar,
  termsAround,
  upcomingFestivals,
  zodiacOf,
} from '@/lib/lunar';
import { PAINTINGS, paintingIndexFor } from '@/lib/paintings';
import CalendarModal from './CalendarModal';
import DetailModal from './DetailModal';
import UserModal from './UserModal';

/* ---- 常量 ---- */
const MIN_DATE = new Date(1900, 0, 31);
const MAX_DATE = new Date(2100, 11, 31);
const USERS_KEY = 'suishiji.users';
const CUR_USER_KEY = 'suishiji.currentUser';
const LEGACY_MARKS_KEY = 'suishiji.marks';
const MAX_EVENTS = 300;

/* ---- localStorage 读写（名号系统） ---- */
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}

function userDataKey(name) {
  return 'suishiji.user.' + name;
}

function loadUserData(name) {
  try {
    const raw = localStorage.getItem(userDataKey(name));
    if (raw) {
      const d = JSON.parse(raw);
      d.marks = d.marks || {};
      d.events = d.events || [];
      return d;
    }
  } catch {}
  return {
    name, created: Date.now(), marks: {}, events: [],
    lastDate: null, lastTime: null, weekMode: false, bgOverride: null,
  };
}

function eventStamp(now) {
  return `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/* 距今天数（今天 = 0，未来为正，过去为负） */
function daysFromToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000);
}

/* 倒计时文案 */
function markCountdown(dateStr) {
  const diff = daysFromToday(dateStr);
  if (diff === 0) return '正是今日';
  if (diff === 1) return '明天';
  if (diff > 1) return diff + ' 天后';
  if (diff === -1) return '昨天';
  return '已过 ' + (-diff) + ' 天';
}

/* 复制文本（不兼容的浏览器降级到 execCommand） */
async function writeClipboard(text) {
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

/* 卡片键盘支持（Enter / 空格），卡内按钮自行处理 */
function cardKey(fn) {
  return (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

export default function AlmanacApp() {
  /* ---- 状态 ---- */
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(null);            // 实时时钟
  const [dateVal, setDateVal] = useState('');      // 选择的日期
  const [timeVal, setTimeVal] = useState('');      // 选择的时辰
  const [weekModeShort, setWeekModeShort] = useState(false);
  const [bgOverride, setBgOverride] = useState(null);  // 手动换画（随名号保存）
  const [users, setUsers] = useState([]);          // 全部名号
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);  // 当前名号数据
  const [userLocked, setUserLocked] = useState(false); // 首访时入册弹窗不可关闭
  const [calOpen, setCalOpen] = useState(false);   // 月历弹窗
  const [detail, setDetail] = useState(null);      // 详情弹窗内容
  const [userOpen, setUserOpen] = useState(false); // 名号弹窗
  const [userErr, setUserErr] = useState('');
  const [userInput, setUserInput] = useState('');
  const [flashKey, setFlashKey] = useState(0);     // 「查黄历」研墨闪烁
  const [copied, setCopied] = useState(null);      // 复制反馈
  const [restOpen, setRestOpen] = useState(false); // 重要日期卡「其余印记」展开
  const [calView, setCalView] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const todayStr = now ? fmtDate(now) : '';
  const marks = userData ? userData.marks : {};

  /* ---- 初始化：默认日期、名号恢复、时钟 ---- */
  useEffect(() => {
    const d = new Date();
    setDateVal(fmtDate(d));
    setTimeVal(pad(d.getHours()) + ':' + pad(d.getMinutes()));

    const storedUsers = loadUsers();
    setUsers(storedUsers);

    let savedCur = null;
    try { savedCur = localStorage.getItem(CUR_USER_KEY); } catch {}

    if (savedCur && storedUsers.includes(savedCur)) {
      enterUser(savedCur); // 老友归来：恢复其界面与印记
    } else {
      setUserLocked(true); // 首访：锁定入册弹窗
      setUserOpen(true);
    }

    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);

    setMounted(true);
    return () => clearInterval(id);
  }, []);

  /* 名号数据变化时写入 localStorage */
  useEffect(() => {
    if (userData) {
      try { localStorage.setItem(userDataKey(userData.name), JSON.stringify(userData)); } catch {}
    }
  }, [userData]);

  /* 记住用户的选择（下次打开仍是此界面） */
  useEffect(() => {
    if (!userData) return;
    setUserData((prev) => prev && { ...prev, lastDate: dateVal, lastTime: timeVal });
  }, [dateVal, timeVal]);

  /* ---- 名号（用户） ---- */
  function enterUser(name) {
    const d = loadUserData(name);
    setCurrentUser(name);
    setUserData(d);
    try { localStorage.setItem(CUR_USER_KEY, name); } catch {}
    setWeekModeShort(!!d.weekMode);
    setBgOverride(d.bgOverride == null ? null : d.bgOverride);
    if (d.lastDate && /^\d{4}-\d{2}-\d{2}$/.test(d.lastDate)) setDateVal(d.lastDate);
    if (d.lastTime && /^\d{2}:\d{2}$/.test(d.lastTime)) setTimeVal(d.lastTime);
  }

  /* 记录一名用户的所行之事（事件日志） */
  function logEvent(act) {
    const t = eventStamp(new Date());
    setUserData((prev) => {
      if (!prev) return prev;
      const events = [...prev.events, { t, act }].slice(-MAX_EVENTS);
      return { ...prev, events };
    });
  }

  /* 注册新名号：不可为空、不可重复 */
  function registerUser() {
    const name = userInput.trim();
    if (!name) { setUserErr('名号不可为空'); return; }
    if (name.length > 12) { setUserErr('名号过长（最多 12 字）'); return; }
    if (users.includes(name)) { setUserErr('此名号已有人用了，换一个吧'); return; }

    // 首名入册时，承接旧版本留下的无主印记
    let legacy = null;
    try { legacy = localStorage.getItem(LEGACY_MARKS_KEY); } catch {}
    const d = loadUserData(name);
    if (legacy && users.length === 0) {
      try { d.marks = { ...d.marks, ...JSON.parse(legacy) }; } catch {}
      try { localStorage.removeItem(LEGACY_MARKS_KEY); } catch {}
    }
    d.lastDate = dateVal;
    d.lastTime = timeVal;

    const nextUsers = [...users, name];
    setUsers(nextUsers);
    try { localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers)); } catch {}
    setCurrentUser(name);
    setUserData(d);
    try { localStorage.setItem(CUR_USER_KEY, name); } catch {}
    setWeekModeShort(!!d.weekMode);
    setBgOverride(d.bgOverride == null ? null : d.bgOverride);
    setUserErr('');
    setUserInput('');
    setUserLocked(false);
    setUserOpen(false);
    logEvent('入册');
  }

  function switchUser(name) {
    if (name === currentUser) return;
    enterUser(name);
    // 弹窗保持打开，列表自动刷新
  }

  /* ---- 查询与派生数据（原 render() 改为 useMemo 派生） ---- */
  const query = useMemo(() => {
    if (!mounted) return { pending: true };
    if (!dateVal) return { error: '请选择一个日期' };
    const [y, m, d] = dateVal.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date < MIN_DATE || date > MAX_DATE) {
      return { error: '超出换算范围（1900-01-31 ~ 2100-12-31）' };
    }
    const lunar = solarToLunar(y, m, d);
    const week = date.getDay();
    const terms = termsAround(date);
    const ups = upcomingFestivals(date);
    const hour = /^\d{2}:\d{2}$/.test(timeVal) ? Number(timeVal.slice(0, 2)) : null;
    const todays = FEST_MAP.get(dateVal) || [];
    return { data: { date, lunar, week, terms, ups, hour, todays } };
  }, [mounted, dateVal, timeVal]);

  const d = query.data;

  const today0 = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, [todayStr]);

  const sortedMarks = useMemo(
    () => Object.entries(marks)
      .map(([date, note]) => ({ date, note }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [marks],
  );

  const markGroups = useMemo(() => {
    const near = sortedMarks.filter((m) => {
      const df = daysFromToday(m.date);
      return df >= 0 && df <= 7;
    });
    const far = sortedMarks.filter((m) => daysFromToday(m.date) > 7);
    const past = sortedMarks.filter((m) => daysFromToday(m.date) < 0);
    return { near, far, past };
  }, [sortedMarks, todayStr]);

  /* 复制用汇总文本 */
  const copyPayload = useMemo(() => {
    if (!d) return '';
    const lines = [
      `【${dateVal} ${(weekModeShort ? WEEK_SHORT : WEEK_FULL)[d.week]}】`,
      `农历 ${ganzhiOf(d.lunar.year)}年 ${formatLunar(d.lunar)}`,
      `年干支 ${ganzhiOf(d.lunar.year)} · 日干支 ${dayGanzhiOf(d.date.getTime())} · 生肖 ${zodiacOf(d.lunar.year)}` +
        (d.hour === null ? '' : ` · ${shichenOf(d.hour)[0]}`),
      d.terms.cur
        ? `节气 ${d.terms.cur.name}${d.terms.next ? `（距「${d.terms.next.name}」${d.terms.daysToNext} 天）` : ''}`
        : '',
      d.ups.length
        ? `最近节日 ${d.ups[0].name}${d.ups[0].days ? `（还有 ${d.ups[0].days} 天）` : '（正是今日）'}`
        : '',
      marks[dateVal] ? `印记：${marks[dateVal]}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  }, [d, dateVal, weekModeShort, marks]);

  /* ---- 水墨背景 ---- */
  const painting = useMemo(() => {
    const idx = bgOverride === null ? paintingIndexFor(new Date()) : bgOverride;
    return { name: PAINTINGS[idx].name, svg: PAINTINGS[idx].build() };
  }, [bgOverride, todayStr]);

  function switchPainting() {
    const cur = bgOverride === null ? paintingIndexFor(new Date()) : bgOverride;
    const next = (cur + 1) % PAINTINGS.length;
    setBgOverride(next);
    setUserData((prev) => prev && { ...prev, bgOverride: next });
    logEvent('更换背景画 · ' + PAINTINGS[next].name);
  }

  function toggleWeekMode() {
    const next = !weekModeShort;
    setWeekModeShort(next);
    setUserData((prev) => prev && { ...prev, weekMode: next });
  }

  /* ---- 详情弹窗 ---- */
  function openLunarDetail() { if (d) setDetail({ type: 'lunar' }); }
  function openTermDetail() { if (d && d.terms.cur) setDetail({ type: 'term' }); }
  function openFestDetail(fest) { setDetail({ type: 'fest', fest }); }
  function openYangDetail() { if (d && d.terms.cur) setDetail({ type: 'wellness' }); }
  function openMarksDetail() { setDetail({ type: 'marks' }); }

  function jumpToDate(date) {
    setDateVal(date);
    setDetail(null);
    logEvent('自印记簿择日 ' + date);
  }

  /* ---- 月历 ---- */
  function openCalendar() {
    if (dateVal) {
      const [y, m] = dateVal.split('-').map(Number);
      setCalView({ y, m: m - 1 });
    }
    setCalOpen(true);
  }

  function pickFromCal(key) {
    setDateVal(key);
    logEvent('月历择日 ' + key);
  }

  function addMark(date, note) {
    setUserData((prev) => prev && { ...prev, marks: { ...prev.marks, [date]: note } });
    logEvent(`落印 ${date}：${note}`);
  }

  function delMark(date) {
    setUserData((prev) => {
      if (!prev || !prev.marks[date]) return prev;
      const next = { ...prev.marks };
      delete next[date];
      return { ...prev, marks: next };
    });
    logEvent('除印 ' + date);
  }

  /* ---- 按钮动作 ---- */
  function goToday() {
    const t = new Date();
    setDateVal(fmtDate(t));
    setTimeVal(pad(t.getHours()) + ':' + pad(t.getMinutes()));
    logEvent('回到今日');
  }

  function handleQuery() {
    setFlashKey((k) => k + 1); // 重放「研墨」闪烁动画
    logEvent('查询 ' + dateVal);
  }

  async function handleCopy() {
    if (!copyPayload) return;
    const ok = await writeClipboard(copyPayload);
    setCopied(ok);
    setTimeout(() => setCopied(null), 1500);
  }

  /* ---- ESC 关闭弹窗 ---- */
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return;
      setCalOpen(false);
      setDetail(null);
      if (!userLocked) setUserOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [userLocked]);

  /* ---- 渲染 ---- */
  const weekText = d ? (weekModeShort ? WEEK_SHORT : WEEK_FULL)[d.week] : '----';
  const lunarText = d ? `农历 ${ganzhiOf(d.lunar.year)}年 ${formatLunar(d.lunar)}` : '请选择日期';

  const onTermDay = d && d.terms.cur && dateVal === fmtDate(new Date(d.terms.cur.ts))
    ? ' · 今日入节'
    : '';
  const termSubText = d && d.terms.cur
    ? (d.terms.next
        ? `距「${d.terms.next.name}」还有 ${d.terms.daysToNext} 天${onTermDay}`
        : onTermDay)
    : '--';
  const festSubText = d && d.ups.length
    ? (d.ups[0].days === 0
        ? '正是今日 · 点击查看详情'
        : `还有 ${d.ups[0].days} 天 · ${fmtShort(d.ups[0].date)}`)
    : '--';
  const festMoreText = d && d.ups.length > 1
    ? '其后 · ' + d.ups.slice(1).map((f) => `${f.name}（${f.days} 天后）`).join(' · ')
    : '';
  const yang = d && d.terms.cur ? (WELLNESS[d.terms.cur.name] || null) : null;

  const diff = d ? Math.round((d.date.getTime() - today0.getTime()) / 86400000) : 0;
  const restCount = markGroups.far.length + markGroups.past.length;

  return (
    <>
      {/* 水墨背景（程序绘制，隔日自动更换） */}
      {mounted && (
        <div id="inkBg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: painting.svg }} />
      )}

      <main className="panel">
        <header className="topbar">
          <span className="brand">
            <span className="brand-cn">岁时记</span>
            <span className="brand-en">TRADITIONAL ALMANAC</span>
          </span>
          <span className="topbar-right">
            <button type="button" className="user-btn" title="名号 · 点击切换或入册"
              onClick={() => { setUserLocked(false); setUserOpen(true); }}>
              名号 · {currentUser || '无名氏'}
            </button>
            <button type="button" className="seal" title="点击换一幅背景画" onClick={switchPainting}>
              歲<br />月
            </button>
          </span>
        </header>

        <h1 className="title">岁 时 记</h1>
        <p className="subtitle">四时流转 · 万物有序</p>

        {/* 实时时钟 */}
        <div className="clock">
          <div className="clock-time">
            {now
              ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
              : '--:--:--'}
          </div>
          <div className="clock-date">
            {now ? `${fmtDate(now)} · ${WEEK_FULL[now.getDay()]}` : '----'}
          </div>
        </div>

        {/* 输入区 */}
        <section className="input-zone">
          <label className="field">
            <span className="field-label">择 日</span>
            <input type="date" min="1900-01-31" max="2100-12-31" value={dateVal}
              onChange={(e) => { setDateVal(e.target.value); logEvent('择日 ' + e.target.value); }} />
          </label>
          <label className="field">
            <span className="field-label">时 辰</span>
            <input type="time" value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)} />
          </label>
          <div className="btn-row">
            <button type="button" className="btn primary" onClick={handleQuery}>查 黄 历</button>
            <button type="button" className="btn ghost" onClick={goToday}>今日</button>
            <button type="button" className="btn ghost" onClick={openCalendar}>月 历</button>
          </div>
        </section>

        {/* 结果区 */}
        <section key={flashKey}
          className={'result' + (query.error ? ' error' : '') + (flashKey ? ' query-flash' : '')}>
          <div className="result-lunar" role="button" tabIndex={0}
            title="点击查看农历与干支详情"
            onClick={openLunarDetail} onKeyDown={cardKey(openLunarDetail)}>
            {query.error ? query.error : lunarText}
          </div>
          <div className="result-weekday" role="button" tabIndex={0}
            title="点击切换 星期X / 周X"
            onClick={toggleWeekMode} onKeyDown={cardKey(toggleWeekMode)}>
            {query.error ? '出错了' : weekText}
          </div>

          {!query.error && (
            <>
              <div className="result-meta">
                <span className="chip">年干支 {d ? ganzhiOf(d.lunar.year) : '--'}</span>
                <span className="chip">日干支 {d ? dayGanzhiOf(d.date.getTime()) : '--'}</span>
                <span className="chip">生肖 {d ? zodiacOf(d.lunar.year) : '--'}</span>
                {d && d.hour === null
                  ? <span className="chip">时辰 未选择</span>
                  : <span className="chip" title={d ? shichenOf(d.hour)[1] : undefined}>
                      时辰 {d ? shichenOf(d.hour)[0] : '--'}
                    </span>}
                <span className="chip">
                  距今 {d ? (diff === 0 ? '今天' : (diff > 0 ? diff + ' 天后' : -diff + ' 天前')) : '--'}
                </span>
              </div>

              {/* 该日的个人印记（月历里落印） */}
              {marks[dateVal] && <div className="mark-note">{marks[dateVal]}</div>}

              {/* 节气卡（可点击看详情） */}
              <div className="card" role="button" tabIndex={0} title="点击查看节气详情"
                onClick={openTermDetail} onKeyDown={cardKey(openTermDetail)}>
                <span className="card-head"><span className="card-icon">节</span>节 气</span>
                <span className="card-main">{d && d.terms.cur ? d.terms.cur.name : '--'}</span>
                <span className="card-sub">{termSubText}</span>
                <span className="card-more">详 ›</span>
              </div>

              {/* 最近节日卡（可点击看详情） */}
              <div className="card" role="button" tabIndex={0} title="点击查看节日详情"
                onClick={() => { if (d && d.ups.length) openFestDetail(d.ups[0]); }}
                onKeyDown={cardKey(() => { if (d && d.ups.length) openFestDetail(d.ups[0]); })}>
                <span className="card-head"><span className="card-icon">庆</span>最近节日</span>
                <span className="card-main">{d && d.ups.length ? d.ups[0].name : '--'}</span>
                <span className="card-sub">{festSubText}</span>
                <span className="card-more">详 ›</span>
              </div>

              {/* 养生卡（可点击看详情） */}
              <div className="card" role="button" tabIndex={0} title="点击查看顺应天时的养生之道"
                onClick={openYangDetail} onKeyDown={cardKey(openYangDetail)}>
                <span className="card-head"><span className="card-icon jade">养</span>养生之道</span>
                <span className="card-main">{yang ? `${d.terms.cur.name} · 顺时养生` : '--'}</span>
                <span className="card-sub">{yang ? `宜：${yang.yi}｜忌：${yang.ji}` : '--'}</span>
                <span className="card-more">详 ›</span>
              </div>

              {/* 重要日期卡（月历印记） */}
              <div className="card" role="button" tabIndex={0} title="点击查看全部印记"
                onClick={openMarksDetail} onKeyDown={cardKey(openMarksDetail)}>
                <span className="card-head"><span className="card-icon">印</span>重要日期</span>
                <div className="mark-body">
                  {sortedMarks.length === 0 ? (
                    <div className="mark-empty">尚未落印 · 打开月历为重要日子落印</div>
                  ) : (
                    <>
                      <div className="mark-lines">
                        {markGroups.near.length
                          ? markGroups.near.map((m) => (
                              <div key={m.date} className="mark-line near" title={m.date}>
                                <span>· {m.note}</span>
                                <span className="mark-line-days">{markCountdown(m.date)}</span>
                              </div>
                            ))
                          : <div className="mark-line faint">· 七日内暂无印记</div>}
                      </div>
                      {restCount > 0 && (
                        <button type="button" className="mark-toggle"
                          onClick={(e) => { e.stopPropagation(); setRestOpen((o) => !o); }}>
                          {restOpen ? '收起 ▴' : `其余印记（${restCount}）▾`}
                        </button>
                      )}
                      {restOpen && restCount > 0 && (
                        <div className="mark-lines">
                          {markGroups.far.map((m) => (
                            <div key={m.date} className="mark-line" title={m.date}>
                              <span>· {m.note}</span>
                              <span className="mark-line-days">{markCountdown(m.date)}</span>
                            </div>
                          ))}
                          {markGroups.past.map((m) => (
                            <div key={m.date} className="mark-line past" title={m.date}>
                              <span>· {m.note} · {fmtShort(m.date)}</span>
                              <span className="mark-line-days">已过</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <span className="card-more">详 ›</span>
              </div>

              {/* 当日节日 / 之后节日 */}
              <div className="fest-today">
                {d && d.todays.length > 0 && <span className="fest-today-label">当日佳节</span>}
                {d && d.todays.map((f, i) => (
                  <button key={i} type="button" className="fest-tag"
                    onClick={() => openFestDetail({ ...f, date: dateVal, days: 0 })}>
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="fest-more">{festMoreText}</div>

              <button type="button" className="btn ghost small" onClick={handleCopy}>
                {copied === null ? '复制黄历' : (copied ? '✓ 已复制' : '复制失败')}
              </button>
            </>
          )}
        </section>

        <footer className="foot">
          <span>支持 1900-01-31 ~ 2100-12-31</span>
          <span className="hint">
            {mounted ? `今日丹青 · ${painting.name}｜点击印章换画 · 隔日自动更换` : ''}
          </span>
        </footer>
      </main>

      {/* 月历弹窗（含日期标记） */}
      {calOpen && (
        <CalendarModal
          dateVal={dateVal}
          marks={marks}
          calView={calView}
          setCalView={setCalView}
          onPick={pickFromCal}
          onAddMark={addMark}
          onDelMark={delMark}
          onClose={() => setCalOpen(false)}
          onBackToToday={() => {
            const t = new Date();
            setCalView({ y: t.getFullYear(), m: t.getMonth() });
          }}
        />
      )}

      {/* 详情弹窗（卷轴样式） */}
      {detail && (
        <DetailModal
          detail={detail}
          d={d}
          dateVal={dateVal}
          marks={marks}
          markCountdown={markCountdown}
          onClose={() => setDetail(null)}
          onJumpDate={jumpToDate}
          onOpenCalendar={() => { setDetail(null); openCalendar(); }}
        />
      )}

      {/* 名号弹窗（注册 / 切换用户 / 所行之事） */}
      {userOpen && (
        <UserModal
          users={users}
          currentUser={currentUser}
          userData={userData}
          userLocked={userLocked}
          userInput={userInput}
          onInput={setUserInput}
          userErr={userErr}
          onRegister={registerUser}
          onSwitch={switchUser}
          onClose={() => setUserOpen(false)}
        />
      )}
    </>
  );
}
