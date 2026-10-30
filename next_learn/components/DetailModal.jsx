'use client';

/* ============================================================
   详情弹窗（卷轴样式）：按类型渲染
   农历 / 节气 / 节日 / 养生（标签页）/ 印记簿
   （原 script.js 的 open*Detail 部分）
============================================================ */

import { useEffect, useMemo, useState } from 'react';
import {
  TERM_DESC,
  WELLNESS,
  WEEK_FULL,
  dayGanzhiOf,
  fmtDate,
  formatLunar,
  ganzhiOf,
  shichenOf,
  zodiacOf,
} from '@/lib/lunar';

export default function DetailModal({
  detail, d, dateVal, marks, markCountdown,
  onClose, onJumpDate, onOpenCalendar,
}) {
  const [activeTab, setActiveTab] = useState('起居');

  // 每次打开详情时回到第一个标签
  useEffect(() => { setActiveTab('起居'); }, [detail]);

  const sortedMarks = useMemo(
    () => Object.entries(marks)
      .map(([date, note]) => ({ date, note }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [marks],
  );

  let title = '';
  let meta = '';
  let body = null;

  if (detail.type === 'lunar' && d) {
    const shichen = d.hour === null ? null : shichenOf(d.hour);
    const rows = [
      ['公历', dateVal],
      ['农历', `${ganzhiOf(d.lunar.year)}年 ${formatLunar(d.lunar)}${d.lunar.isLeap ? '（闰月）' : ''}`],
      ['年干支', `${ganzhiOf(d.lunar.year)}年 · 生肖${zodiacOf(d.lunar.year)}`],
      ['日干支', dayGanzhiOf(d.date.getTime()) + '日'],
      ['时辰', shichen ? `${shichen[0]}（${shichen[1]}）` : '未选择'],
    ];
    title = '农历 · 干支纪法';
    meta = `${dateVal} · ${WEEK_FULL[d.week]}`;
    body = (
      <>
        <table className="detail-table">
          <tbody>
            {rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}
          </tbody>
        </table>
        <p>农历又称阴历、夏历，是中华民族沿用数千年的历法。它以月相盈亏圆缺为一月，即「朔望月」；又通过设置闰月，使一年的平均长度接近太阳回归年，故实为「阴阳合历」。农历之中，初一为「朔」，十五为「望」，月相由朔至望再至朔，周而复始。</p>
        <p>干支纪法源远流长，以十天干（甲乙丙丁戊己庚辛壬癸）与十二地支（子丑寅卯辰巳午未申酉戌亥）依次相配，六十次而成一循环，是为「六十甲子」。古人以干支纪年、纪月、纪日、纪时，构成四柱八字。纪日之法自上古延续至今，从未中断，是世界上使用时间最长的连续纪日系统。</p>
        <p>生肖又称属相，以十二地支配十二种动物，十二年一轮回。民间认为生肖与人的性格命运相关，本命年又有穿红辟邪之俗。</p>
      </>
    );
  } else if (detail.type === 'term' && d && d.terms.cur) {
    const t = d.terms;
    const curStart = new Date(t.cur.ts);
    const nextStart = t.next ? new Date(t.next.ts) : null;
    const range = nextStart
      ? `${fmtDate(curStart)} ~ ${fmtDate(new Date(nextStart.getTime() - 86400000))}`
      : fmtDate(curStart);
    title = t.cur.name;
    meta = range;
    body = (
      <>
        <p>{TERM_DESC[t.cur.name]}</p>
        {t.next && (
          <p>下一节气「{t.next.name}」在 {fmtDate(nextStart)}，距今还有 {t.daysToNext} 天。</p>
        )}
        <p>二十四节气是上古农耕文明的产物，是古人顺应农时、观察天体运行而订立的补充历法：以太阳在黄道上的位置为准，每十五度为一节，一年二十四节。2016 年，「二十四节气」被正式列入联合国教科文组织人类非物质文化遗产代表作名录。</p>
      </>
    );
  } else if (detail.type === 'fest') {
    const fest = detail.fest;
    title = fest.name;
    meta = `${fest.date} · ${fest.kind}节日`;
    body = (
      <>
        <p>{fest.days === 0
          ? '今日恰逢此节，宜随俗而行，共襄其时。'
          : `距离此节还有 ${fest.days} 天，可早做准备。`}</p>
        <p>{fest.desc}</p>
      </>
    );
  } else if (detail.type === 'wellness' && d && d.terms.cur) {
    const t = d.terms;
    const w = WELLNESS[t.cur.name];
    if (w) {
      const curStart = new Date(t.cur.ts);
      const nextStart = t.next ? new Date(t.next.ts) : null;
      const range = nextStart
        ? `${fmtDate(curStart)} ~ ${fmtDate(new Date(nextStart.getTime() - 86400000))}`
        : fmtDate(curStart);
      const tabs = ['起居', '饮食', '运动', '情志'];
      title = `养生 · ${t.cur.name}`;
      meta = range;
      body = (
        <>
          <div className="yiji">
            <span className="yi">宜：{w.yi}</span>
            <span className="ji">忌：{w.ji}</span>
          </div>
          <div className="tabs">
            {tabs.map((tb) => (
              <button key={tb} type="button"
                className={'tab' + (activeTab === tb ? ' active' : '')}
                onClick={() => setActiveTab(tb)}>
                {tb}
              </button>
            ))}
          </div>
          <div className="tab-panel active"><p>{w.items[activeTab]}</p></div>
          <p className="yang-note">《黄帝内经》云：「夫四时阴阳者，万物之根本也，所以圣人春夏养阳，秋冬养阴，以从其根。」养生之道，贵在顺应天时，法于阴阳，和于术数。</p>
        </>
      );
    }
  } else if (detail.type === 'marks') {
    title = '重要日期 · 印记簿';
    meta = `共 ${sortedMarks.length} 枚印记 · 存于本机`;
    body = sortedMarks.length === 0 ? (
      <>
        <p>还没有任何印记。打开「月历」，点选一个日期、写下备注，即可落下朱印。</p>
        <button type="button" className="btn ghost small" onClick={onOpenCalendar}>前往月历</button>
      </>
    ) : (
      <>
        <div className="mark-list">
          {sortedMarks.map((m) => {
            const cd = markCountdown(m.date);
            return (
              <button key={m.date} type="button"
                className={'mark-row' + (cd === '正是今日' ? ' today' : '')}
                onClick={() => onJumpDate(m.date)}>
                <span className="mark-row-note">{m.note}</span>
                <span className="mark-row-date">{m.date}</span>
                <span className="mark-row-days">{cd}</span>
              </button>
            );
          })}
        </div>
        <p className="yang-note">点击任意印记，主界面即刻切换至该日黄历。临近七日之印，主界面会直接显示倒计天数。</p>
      </>
    );
  }

  return (
    <div className="modal" role="dialog" aria-label="详情">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box scroll-box">
        <div className="rod rod-top" />
        <div className="scroll-body">
          <h2 className="detail-title">{title}</h2>
          <div className="detail-meta">{meta}</div>
          <div className="detail-body">{body}</div>
          <div className="detail-seal">歲<br />記</div>
        </div>
        <div className="rod rod-bottom" />
        <button className="modal-close" aria-label="关闭" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
