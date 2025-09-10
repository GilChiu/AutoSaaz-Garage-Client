import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './ChatsPage.css';

// Mock data (would come from API in real implementation)
const MOCK_CONTACTS = [
    { id: 'c1', name: 'Sarah Scott', lastMessage: 'Okay, thank you!', time: '14:30', avatar: 'https://i.pravatar.cc/40?img=12', unread: 0 },
    { id: 'c2', name: 'Adam Bridges', lastMessage: 'I notice a positive change...', time: '14:15', avatar: 'https://i.pravatar.cc/40?img=5', unread: 1 },
    { id: 'c3', name: 'Judith Stewart', lastMessage: 'How to regain the desire to act', time: '14:10', avatar: 'https://i.pravatar.cc/40?img=8', unread: 2 },
    { id: 'c4', name: 'Sarah Scott', lastMessage: 'Okay, thank you!', time: '14:30', avatar: 'https://i.pravatar.cc/40?img=15', unread: 0 },
    { id: 'c5', name: 'Sarah Scott', lastMessage: 'Okay, thank you!', time: '14:30', avatar: 'https://i.pravatar.cc/40?img=22', unread: 0 },
    { id: 'c6', name: 'Sarah Scott', lastMessage: 'Okay, thank you!', time: '14:30', avatar: 'https://i.pravatar.cc/40?img=29', unread: 0 },
];

const MOCK_MESSAGES = {
    c2: [
        { id: 'm1', from: 'contact', text: 'Hi, yes. I’ve been hearing a strange noise from the engine, and there’s also a slight oil leakage under the car.', ts: Date.now() - 1000 * 60 * 60 },
        { id: 'm2', from: 'me', text: 'Got it. Thanks for the update. We\'ve received your service request for a General Inspection + Oil Leakage Diagnosis. Can you also confirm your car model and last service date?', ts: Date.now() - 1000 * 60 * 55 },
        { id: 'm3', from: 'contact', text: 'Sure, it’s a Toyota Corolla 2018. Last service was around 6 months ago.', ts: Date.now() - 1000 * 60 * 50 },
        { id: 'm4', from: 'me', text: 'Thanks. Based on your description, we\'ll schedule a Visual Inspection followed by an Engine Oil System check. Estimated inspection time: 30–45 minutes. Would you prefer on-site pickup or drop-off?', ts: Date.now() - 1000 * 60 * 45 },
        { id: 'm5', from: 'contact', text: 'I’ll drop off the car myself. Can I come around 11:30 AM today?', ts: Date.now() - 1000 * 60 * 35 },
        { id: 'm6', from: 'me', text: 'Yes, that works perfectly. We\'ve reserved your inspection slot for 11:30 AM today. Once the inspection is complete, we\'ll send you a detailed quotation for the repair.', ts: Date.now() - 1000 * 60 * 30 }
    ]
};

const ChatsPage = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'active'
    const [contacts] = useState(MOCK_CONTACTS);
    const [activeContactId, setActiveContactId] = useState('c2');
    const [draft, setDraft] = useState('');
    const list = useMemo(() => contacts, [contacts]);
        const messages = useMemo(() => MOCK_MESSAGES[activeContactId] || [], [activeContactId]);
    const endRef = useRef(null);

    useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeContactId]);

    const send = () => {
        if (!draft.trim()) return;
        MOCK_MESSAGES[activeContactId] = [
            ...messages,
            { id: 'm' + (messages.length + 1), from: 'me', text: draft.trim(), ts: Date.now() }
        ];
        setDraft('');
    };

    return (
        <div className="dashboard-layout dashboard-tight">
            <Sidebar />
            <div className="dashboard-layout-main">
                <div className="dashboard-layout-content chat-page-root">
                    <div className="chat-shell">
                        {/* Conversation list */}
                        <aside className="chat-list-panel" aria-label="Customer Chat List">
                            <div className="chat-panel-header">Customer Chat</div>
                            <div className="chat-search-row">
                                <input className="chat-search-input" placeholder="Search Chats Or Chat history" />
                            </div>
                            <div className="chat-filters" role="tablist">
                                <button
                                    className={"chat-filter-btn " + (activeTab === 'new' ? 'active' : '')}
                                    role="tab"
                                    aria-selected={activeTab === 'new'}
                                    onClick={() => setActiveTab('new')}
                                >New Messages</button>
                                <button
                                    className={"chat-filter-btn " + (activeTab === 'active' ? 'active' : '')}
                                    role="tab"
                                    aria-selected={activeTab === 'active'}
                                    onClick={() => setActiveTab('active')}
                                >Active Conversations</button>
                            </div>
                              <ul className="chat-contact-list">
                                {list.map(c => (
                                    <li key={c.id}>
                                        <button
                                            className={"chat-contact-item " + (c.id === activeContactId ? 'selected' : '')}
                                            onClick={() => setActiveContactId(c.id)}
                                            aria-current={c.id === activeContactId}
                                        >
                                            <img src={c.avatar} alt="" className="chat-avatar" />
                                            <div className="chat-contact-meta">
                                                <div className="chat-contact-top">
                                                    <span className="chat-contact-name">{c.name}</span>
                                                    <span className="chat-contact-time">{c.time}</span>
                                                </div>
                                                <div className="chat-contact-bottom">
                                                    <span className="chat-last-message">{c.lastMessage}</span>
                                                    {c.unread > 0 && <span className="chat-unread-badge" aria-label={`${c.unread} unread messages`}>{c.unread}</span>}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* Message area */}
                        <section className="chat-conversation" aria-label="Conversation">
                            <header className="chat-convo-header">
                                <div className="chat-convo-user">
                                    <img src={list.find(c => c.id === activeContactId)?.avatar} alt="" className="chat-avatar large" />
                                    <span className="chat-convo-name">{list.find(c => c.id === activeContactId)?.name}</span>
                                </div>
                            </header>
                            <div className="chat-messages" role="log" aria-live="polite">
                                {messages.map(m => (
                                    <div key={m.id} className={"chat-msg-row " + (m.from === 'me' ? 'out' : 'in') }>
                                        <div className="chat-msg-bubble">{m.text}</div>
                                    </div>
                                ))}
                                <div ref={endRef} />
                            </div>
                            <div className="chat-composer">
                                <input
                                    className="chat-input"
                                    placeholder="Write a message"
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') send(); }}
                                />
                                <button className="chat-send-btn" onClick={send} aria-label="Send message">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatsPage;
