import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function MessageList({ messages }) {
  const { user } = useAuth();
  const endRef = useRef(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="chat-messages" role="log" aria-live="polite">
        <div className="empty-state" style={{ padding: '24px', color: '#6b7280' }}>No messages yet</div>
      </div>
    );
  }

  return (
    <div className="chat-messages" role="log" aria-live="polite">
      {messages.map((m) => {
        const isMe = user && (m.sender_id === user.id);
        return (
        <div key={m.id} className={"chat-msg-row " + (isMe ? 'out' : 'in')}>
          <div className="chat-msg-bubble">{m.content || (m.attachment_url ? 'Attachment' : '')}</div>
        </div>
      );})}
      <div ref={endRef} />
    </div>
  );
}
