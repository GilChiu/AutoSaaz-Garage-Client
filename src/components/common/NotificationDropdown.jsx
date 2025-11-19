import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '../../services/notifications.service';
import './NotificationDropdown.css';

// Initialize Supabase client for real-time subscriptions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Define callback functions before using them in useEffect
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ limit: 20 });
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const handleNotificationClick = useCallback(async (notification) => {
    // Close dropdown
    setIsOpen(false);

    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
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
        // For system alerts, stay or go to notifications page
        navigate('/notifications');
        break;
    }
  }, [navigate, handleMarkAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Load unread count on mount and periodically
  useEffect(() => {
    loadUnreadCount();
    
    // Poll for new notifications every 30 seconds (reduced from 60)
    const interval = setInterval(() => {
      loadUnreadCount();
      // Also reload notifications if dropdown is open
      if (isOpen) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadUnreadCount, loadNotifications, isOpen]);

  // Real-time subscription to garage_notifications table
  useEffect(() => {
    console.log('=== SETTING UP REAL-TIME NOTIFICATION SUBSCRIPTION ===');
    
    const channel = supabase
      .channel('garage-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'garage_notifications'
        },
        (payload) => {
          console.log('=== NEW NOTIFICATION RECEIVED (REAL-TIME) ===', payload);
          
          // Add new notification to the list
          setNotifications(prev => [payload.new, ...prev]);
          
          // Increment unread count
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if supported and permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title || 'New Notification', {
              body: payload.new.message,
              icon: '/logo192.png',
              badge: '/logo192.png',
              tag: payload.new.id
            });
          }
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
          console.log('=== NOTIFICATION UPDATED (REAL-TIME) ===', payload);
          
          // Update notification in the list
          setNotifications(prev => 
            prev.map(n => n.id === payload.new.id ? payload.new : n)
          );
          
          // Recalculate unread count if read status changed
          if (payload.old.is_read !== payload.new.is_read) {
            loadUnreadCount();
          }
        }
      )
      .subscribe((status) => {
        console.log('=== REAL-TIME SUBSCRIPTION STATUS ===', status);
      });

    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }

    return () => {
      console.log('=== CLEANING UP REAL-TIME SUBSCRIPTION ===');
      supabase.removeChannel(channel);
    };
  }, [loadUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
      case 'new_booking':
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
        return '💰';
      case 'dispute':
      case 'dispute_update':
        return '⚠️';
      case 'promo':
      case 'promotion':
        return '🎁';
      case 'system':
      case 'system_update':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      'booking': 'New Booking',
      'new_booking': 'New Booking',
      'appointment': 'Appointment',
      'appointment_update': 'Appointment',
      'chat': 'Message',
      'new_message': 'Message',
      'inspection': 'Inspection',
      'inspection_request': 'Inspection',
      'payment': 'Payment',
      'payment_received': 'Payment',
      'dispute': 'Dispute',
      'dispute_update': 'Dispute',
      'promo': 'Promotion',
      'promotion': 'Promotion',
      'system': 'System',
      'system_update': 'System'
    };
    return labels[type] || 'Notification';
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button 
        className="notification-btn" 
        aria-label="Notifications"
        onClick={handleToggleDropdown}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18.7497 22.5V23.4375C18.7497 24.4321 18.3546 25.3859 17.6513 26.0891C16.9481 26.7924 15.9942 27.1875 14.9997 27.1875C14.0051 27.1875 13.0513 26.7924 12.348 26.0891C11.6448 25.3859 11.2497 24.4321 11.2497 23.4375V22.5M25.0591 20.5916C23.5544 18.75 22.4921 17.8125 22.4921 12.7354C22.4921 8.08594 20.1178 6.42949 18.1637 5.625C17.9042 5.51836 17.6598 5.27344 17.5807 5.00684C17.238 3.84023 16.277 2.8125 14.9997 2.8125C13.7223 2.8125 12.7608 3.84082 12.4216 5.00801C12.3425 5.27754 12.0981 5.51836 11.8385 5.625C9.8821 6.43066 7.51023 8.08125 7.51023 12.7354C7.5073 17.8125 6.44499 18.75 4.9403 20.5916C4.31687 21.3545 4.86296 22.5 5.95339 22.5H24.0518C25.1364 22.5 25.679 21.351 25.0591 20.5916Z" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {notifications.length > 0 && unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button 
                className="close-btn"
                onClick={handleToggleDropdown}
                aria-label="Close notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <p>Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="notification-error">
                <p>{error}</p>
                <button onClick={loadNotifications} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="empty-icon">🔔</div>
                <p>No notifications yet</p>
                <span>You'll see updates from the admin here</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <div className="notification-title">{notification.title}</div>
                      <svg className="external-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span className="notification-time">{formatTimeAgo(notification.created_at)}</span>
                      <span className="notification-type-badge">
                        • {getNotificationTypeLabel(notification.notification_type)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn" 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
