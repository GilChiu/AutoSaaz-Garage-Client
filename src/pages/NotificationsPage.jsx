import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notifications.service';
import './NotificationsPage.css';

// Initialize Supabase client for real-time subscriptions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ limit: 100 });
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications-page-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'garage_notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'garage_notifications'
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Navigate based on notification type and data
    const data = notification.data || {};
    const relatedEntityId = notification.related_entity_id || data.booking_id || data.appointment_id || data.inspection_id || data.dispute_id;

    switch (notification.notification_type) {
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
      case 'booking_updated':
        if (relatedEntityId) {
          navigate(`/bookings/${relatedEntityId}`);
        } else {
          navigate('/bookings');
        }
        break;

      case 'appointment':
      case 'appointment_update':
        if (relatedEntityId) {
          navigate(`/appointments/${relatedEntityId}`);
        } else {
          navigate('/appointments');
        }
        break;

      case 'inspection':
      case 'inspection_request':
        if (relatedEntityId) {
          navigate(`/inspections/${relatedEntityId}`);
        } else {
          navigate('/inspections');
        }
        break;

      case 'dispute_opened':
      case 'dispute_resolved':
      case 'dispute_update':
        if (relatedEntityId) {
          navigate(`/resolution-center/disputes/${relatedEntityId}`);
        } else {
          navigate('/resolution-center');
        }
        break;

      case 'chat':
      case 'new_message':
        navigate('/chats');
        break;

      case 'payment_received':
      case 'payment_pending':
        if (relatedEntityId) {
          navigate(`/bookings/${relatedEntityId}`);
        } else {
          navigate('/bookings');
        }
        break;

      default:
        // For system alerts and other types, stay on notifications page
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
      case 'booking_updated':
        return '📅';
      case 'appointment':
      case 'appointment_update':
        return '🗓️';
      case 'chat':
      case 'new_message':
        return '💬';
      case 'inspection':
      case 'inspection_request':
        return '🔍';
      case 'payment':
      case 'payment_received':
      case 'payment_pending':
        return '💰';
      case 'dispute':
      case 'dispute_opened':
      case 'dispute_resolved':
      case 'dispute_update':
        return '⚠️';
      case 'promo':
      case 'promotion':
        return '🎁';
      case 'system':
      case 'system_alert':
      case 'system_update':
      case 'account_update':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <div className="header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-right">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn-page"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-page-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-page-content">
        {loading ? (
          <div className="notifications-loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notifications-error">
            <p>{error}</p>
            <button onClick={loadNotifications} className="retry-btn">
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">🔔</div>
            <p>No {filter !== 'all' ? filter : ''} notifications</p>
            <span>
              {filter === 'all' 
                ? "You'll see updates from bookings, appointments, and more here"
                : `You have no ${filter} notifications`
              }
            </span>
          </div>
        ) : (
          <div className="notifications-list-page">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item-page ${!notification.is_read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.is_read && <div className="unread-indicator"></div>}
                
                <div className="notification-icon-page">
                  <span className="icon-emoji">{getNotificationIcon(notification.notification_type)}</span>
                  {notification.priority && notification.priority !== 'normal' && (
                    <span 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    ></span>
                  )}
                </div>

                <div className="notification-content-page">
                  <div className="notification-header-page">
                    <h3 className="notification-title-page">{notification.title}</h3>
                    <span className="notification-time-page">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className="notification-message-page">{notification.message}</p>
                  <div className="notification-footer-page">
                    <span className="notification-type-badge-page">
                      {notification.notification_type.replace(/_/g, ' ')}
                    </span>
                    {notification.priority && notification.priority !== 'normal' && (
                      <span 
                        className="priority-badge"
                        style={{ color: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                    )}
                  </div>
                </div>

                <div className="notification-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
