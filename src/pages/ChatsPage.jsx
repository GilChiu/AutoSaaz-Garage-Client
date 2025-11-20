import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './ChatsPage.css';
import ConversationList from '../components/Chats/ConversationList';
import MessageList from '../components/Chats/MessageList';
import Composer from '../components/Chats/Composer';
import { useConversations, useMessages, send as sendApi, markRead as markReadApi } from '../hooks/useChats';
import { useAuth } from '../context/AuthContext';

function mapConversations(apiData, myUserId) {
    const items = (apiData?.conversations || []).map((row) => {
        const conv = row.conversation || row;
        const last = row.lastMessage || null;
        const unread = row.unreadCount || 0;
    let title = 'Conversation';
    if (row.participants && myUserId) {
      const other = row.participants.find((p) => p.user_id !== myUserId);
      if (other?.name) title = other.name;
    }
        return {
            id: conv.id,
      title,
            lastMessageSnippet: last?.content || (last?.attachment_url ? 'Attachment' : ''),
            lastMessageAt: last?.created_at || conv.last_message_at,
            unreadCount: unread,
            avatar: undefined,
        };
    });
    return items;
}

const ChatsPage = () => {
  // fixed tab UI for now (active conversations)
  const [filter, setFilter] = useState('');
  const { user } = useAuth();
  const { conversations: convsData, loading: convLoading, refresh: refreshConvs } = useConversations({ limit: 50 });
  const list = useMemo(() => mapConversations({ conversations: convsData }, user?.id), [convsData, user?.id]);
    const filtered = useMemo(() => list.filter(c => !filter || (c.title?.toLowerCase().includes(filter.toLowerCase()) || c.lastMessageSnippet?.toLowerCase().includes(filter.toLowerCase()))), [list, filter]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
      if (!activeId && filtered.length > 0) setActiveId(filtered[0].id);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtered, activeId, list.length]);

  const { messages, loading: msgLoading, refresh: refreshMsgs } = useMessages(activeId, { limit: 100 });

    async function onSend(payload) {
      if (!activeId) return;

      await sendApi(activeId, payload);
      await Promise.all([refreshMsgs(), refreshConvs()]);
      await markReadApi(activeId);

    }

    return (
        <div className="dashboard-layout dashboard-tight">
            <Sidebar />
            <div className="dashboard-layout-main">
                <div className="dashboard-layout-content chat-page-root">
                    <div className="chat-shell">
                        {/* Conversation list (reuses existing CSS classes) */}
                        <ConversationList
                          items={filtered}
                          activeId={activeId}
                          onSelect={setActiveId}
                          loading={convLoading}
                          filter={filter}
                          setFilter={setFilter}
                        />

                        {/* Message area */}
                        <section className="chat-conversation" aria-label="Conversation">
                          <header className="chat-convo-header">
                            <div className="chat-convo-user">
                              {(() => {
                                const active = list.find(c => c.id === activeId);
                                const title = active?.title || 'Conversation';
                                return (
                                  <>
                                    {/* Keep avatar placeholder as-is (no real images wired yet) */}
                                    <img src={'https://ui-avatars.com/api/?background=EBEEF5&color=3C4257&name=' + encodeURIComponent('CO')} alt="" className="chat-avatar large" />
                                    <span className="chat-convo-name">{title}</span>
                                  </>
                                );
                              })()}
                            </div>
                          </header>
                          <MessageList messages={messages} />
                          <Composer onSend={onSend} disabled={!activeId || msgLoading} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
