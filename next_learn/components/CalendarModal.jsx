'use client';

/* ============================================================
   月历弹窗：月份网格 + 节日/节气/印记圆点 + 落印除印
   （原 script.js 的 buildCal / shiftMonth 部分）
============================================================ */

import { useEffect, useMemo, useState } from 'react';
import {
  FEST_MAP,
  TERM_MAP,
  LUNAR_MONTH,
  fmtDate,
  ganzhiOf,
  pad,
  solarToLunar,
} from '@/lib/lunar';

export default function CalendarModal({
  dateVal, marks, calView, setCalView,
  onPick, onAddMark, onDelMark, onClose, onBackToToday,
}) {
  const [note, setNote] = useState('');
  const todayStr = fmtDate(new Date());

  // 切换所选日期时，回填该日的印记备注
  useEffect(() => {
    setNote(dateVal ? (marks[dateVal] || '') : '');
  }, [dateVal, marks]);

  function shiftMonth(delta) {
    let { y, m } = calView;
    m += delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < 1900) { y = 1900; m = 0; }
    if (y > 2100) { y = 2100; m = 11; }
    setCalView({ y, m });
  }

  // 42 格（含上下月补位）
  const cells = useMemo(() => {
    const { y, m } = calView;
    const first = new Date(y, m, 1);
    const startOffset = first.getDay(); // 0 = 周日
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const list = [];
    const prevDays = new Date(y, m, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const py = m === 0 ? y - 1 : y;
      const pm = m === 0 ? 11 : m - 1;
      list.push({ y: py, m: pm, d: prevDays - i, dim: true });
    }
    for (let day = 1; day <= daysInMonth; day++) list.push({ y, m, d: day, dim: false });
    let nextD = 1;
    const ny = m === 11 ? y + 1 : y;
    const nm = m === 11 ? 0 : m + 1;
    while (list.length < 42) list.push({ y: ny, m: nm, d: nextD++, dim: true });
    return list;
  }, [calView]);

  // 标题：公历 + 该月初一的农历
  const lun1 = useMemo(() => solarToLunar(calView.y, calView.m + 1, 1), [calView]);
  const lunarTitle = `${ganzhiOf(lun1.year)}年 ${(lun1.isLeap ? '闰' : '') + LUNAR_MONTH[lun1.month - 1]}月`;
  const solarTitle = `${calView.y}年${calView.m + 1}月`;

  function handleAdd() {
    if (!dateVal) return;
    onAddMark(dateVal, note.trim() || '记');
  }

  function handleDel() {
    if (!dateVal || !marks[dateVal]) return;
    onDelMark(dateVal);
  }

  return (
    <div className="modal" role="dialog" aria-label="月历">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box cal-box">
        <button className="modal-close" aria-label="关闭" onClick={onClose}>✕</button>

        <div className="cal-head">
          <button className="cal-nav" aria-label="上一月" onClick={() => shiftMonth(-1)}>◀</button>
          <div className="cal-title">
            <span className="cal-title-lunar">{lunarTitle}</span>
            <span className="cal-title-solar">{solarTitle}</span>
          </div>
          <button className="cal-nav" aria-label="下一月" onClick={() => shiftMonth(1)}>▶</button>
        </div>
        <button className="btn ghost small cal-today" onClick={onBackToToday}>回到本月</button>

        <div className="cal-week">
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div className="cal-grid">
          {cells.map((c) => {
            const key = `${c.y}-${pad(c.m + 1)}-${pad(c.d)}`;
            const fests = FEST_MAP.get(key);
            const hints = [];
            if (fests) hints.push(fests.map((f) => f.name).join('、'));
            if (TERM_MAP.has(key)) hints.push(TERM_MAP.get(key));
            if (marks[key]) hints.push('印记：' + marks[key]);
            return (
              <button key={key} type="button"
                className={'cal-cell'
                  + (c.dim ? ' dim' : '')
                  + (key === todayStr ? ' today' : '')
                  + (key === dateVal ? ' selected' : '')}
                title={hints.join(' · ')}
                onClick={() => {
                  if (c.dim) setCalView({ y: c.y, m: c.m }); // 点上下月补位则跳月
                  onPick(key);
                }}>
                {c.d}
                {marks[key] && <span className="dot-mark" />}
                {fests && <span className="dot-fest" />}
              </button>
            );
          })}
        </div>

        <div className="cal-mark">
          <div className="cal-mark-title">
            {dateVal
              ? `已选 ${dateVal}${marks[dateVal] ? ' · 已有印记' : ' · 尚未落印'}`
              : '点选一日，可为其落印标记'}
          </div>
          <div className="cal-mark-row">
            <input type="text" maxLength={24} placeholder="写一句备注（可留空）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }} />
            <button className="btn ghost small" onClick={handleAdd}>落 印</button>
            <button className="btn ghost small" onClick={handleDel}>除 印</button>
          </div>
          <div className="cal-legend">
            朱点为已落印 · 金点为节日 · 共 {Object.keys(marks).length} 印 · 印记存于本机
          </div>
        </div>
      </div>
    </div>
  );
}
