import { useEffect, useState, useCallback } from 'react';
import chats from '../services/chats';

export function useConversations({ limit = 20, offset = 0 } = {}) {
  const [data, setData] = useState({ conversations: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await chats.listConversations({ limit, offset });

      setData(res);
    } catch (e) {

      setError(e);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, loading, error, refresh };
}

export function useMessages(conversationId, { limit = 50, before, after } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await chats.getMessages(conversationId, { limit, before, after });

      setMessages(res?.messages || []);
    } catch (e) {

      setError(e);
    } finally {
      setLoading(false);
    }
  }, [conversationId, limit, before, after]);

  useEffect(() => { refresh(); }, [refresh]);

  return { messages, loading, error, refresh };
}

export async function send(conversationId, payload) {
  return chats.sendMessage(conversationId, payload);
}

export async function markRead(conversationId, upTo) {
  return chats.markRead(conversationId, upTo);
}
