import React from 'react';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return d.toLocaleDateString();
}

function ConversationListItem({ item, selected, onClick }) {
  const { id, title, lastMessageSnippet, lastMessageAt, unreadCount } = item;
  return (
    <li>
      <button
        className={"chat-contact-item " + (selected ? 'selected' : '')}
        onClick={() => onClick(id)}
        aria-current={selected}
      >
        <img src={item.avatar || 'https://ui-avatars.com/api/?background=EBEEF5&color=3C4257&name=' + encodeURIComponent(title || 'User')}
             alt="" className="chat-avatar" />
        <div className="chat-contact-meta">
          <div className="chat-contact-top">
            <span className="chat-contact-name">{title || 'Customer'}</span>
            <span className="chat-contact-time">{formatTime(lastMessageAt)}</span>
          </div>
          <div className="chat-contact-bottom">
            <span className="chat-last-message">{lastMessageSnippet || 'No messages yet'}</span>
            {unreadCount > 0 && (
              <span className="chat-unread-badge" aria-label={`${unreadCount} unread messages`}>{unreadCount}</span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export default function ConversationList({ items, activeId, onSelect, loading, filter, setFilter }) {
  return (
    <aside className="chat-list-panel" aria-label="Customer Chat List">
      <div className="chat-panel-header">Customer Chat</div>
      <div className="chat-search-row">
        <input
          className="chat-search-input"
          placeholder="Search Chats Or Chat history"
          value={filter}
          onChange={(e) => setFilter?.(e.target.value)}
        />
      </div>
      <div className="chat-filters" role="tablist">
        <button className="chat-filter-btn active" role="tab" aria-selected>
          Active Conversations
        </button>
      </div>
      {loading ? (
        <div className="empty-state" style={{ padding: '24px', color: '#6b7280' }}>Loading conversations…</div>
      ) : items.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px', color: '#6b7280' }}>
          No conversations yet
        </div>
      ) : (
        <ul className="chat-contact-list">
          {items.map((c) => (
            <ConversationListItem
              key={c.id}
              item={c}
              selected={c.id === activeId}
              onClick={onSelect}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
