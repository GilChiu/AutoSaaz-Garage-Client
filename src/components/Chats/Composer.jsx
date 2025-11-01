import React, { useState } from 'react';

export default function Composer({ onSend, disabled }) {
  const [draft, setDraft] = useState('');
  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    await onSend({ content: text });
    setDraft('');
  };
  return (
    <div className="chat-composer">
      <input
        className="chat-input"
        placeholder="Write a message"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        disabled={disabled}
      />
      <button className="chat-send-btn" onClick={send} aria-label="Send message" disabled={disabled}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
