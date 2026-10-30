'use client';

/* ============================================================
   名号弹窗：注册 / 切换用户 / 所行之事（事件记录）
   （原 script.js 的 renderUserModal / registerUser 部分）
============================================================ */

import { useEffect, useRef } from 'react';

export default function UserModal({
  users, currentUser, userData, userLocked,
  userInput, onInput, userErr, onRegister, onSwitch, onClose,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const events = userData ? userData.events : [];

  return (
    <div className="modal" role="dialog" aria-label="名号">
      <div className="modal-backdrop" onClick={userLocked ? undefined : onClose} />
      <div className="modal-box scroll-box user-box">
        <div className="rod rod-top" />
        <div className="scroll-body">
          <h2 className="detail-title">名号 · 入册</h2>
          <div className="detail-meta">以名号为凭，各记各事</div>

          <div className="user-now">
            {currentUser ? `当前名号 · ${currentUser}` : '尚未入册，请取名号'}
          </div>

          <div className="user-reg">
            <input ref={inputRef} type="text" maxLength={12}
              placeholder="取一个新名号（仅名字，无需密码）"
              value={userInput}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onRegister(); }} />
            <button className="btn primary small" onClick={onRegister}>入 册</button>
          </div>
          <div className="user-err">{userErr}</div>

          <div className="user-section">
            <div className="user-section-title">已有名号（{users.length}）</div>
            <div className="user-list">
              {users.length === 0 ? (
                <div className="event-item">尚无他人名号，入册后名号将长留此页</div>
              ) : (
                users.map((u) => (
                  <button key={u} type="button"
                    className={'user-row' + (u === currentUser ? ' current' : '')}
                    onClick={() => onSwitch(u)}>
                    <span className="user-name">{u}</span>
                    <span className="user-tag">{u === currentUser ? '当前' : '进入 ›'}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="user-section">
            <div className="user-section-title">所行之事（共 {events.length} 条）</div>
            <div className="event-list">
              {events.length === 0 ? (
                <div className="event-item">暂无记录</div>
              ) : (
                [...events].reverse().slice(0, 30).map((ev, i) => (
                  <div key={i} className="event-item">
                    <span className="event-time">{ev.t}</span>
                    <span>{ev.act}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="detail-seal">名<br />册</div>
        </div>
        <div className="rod rod-bottom" />
        {!userLocked && (
          <button className="modal-close" aria-label="关闭" onClick={onClose}>✕</button>
        )}
      </div>
    </div>
  );
}
