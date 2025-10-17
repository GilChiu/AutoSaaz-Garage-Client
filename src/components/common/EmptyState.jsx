import React from 'react';
import './EmptyState.css';

/**
 * Professional empty state component
 * Displays when there's no data available
 */
const EmptyState = ({ 
  variant = 'default',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  illustration = true
}) => {
  // Default content based on variant
  const variants = {
    bookings: {
      icon: '📋',
      title: 'No Bookings Yet',
      message: 'You haven\'t received any bookings. When customers book services, they\'ll appear here.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF5F0" />
          <path d="M70 90 L90 110 L130 70" stroke="#FF6B35" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" />
          <rect x="60" y="60" width="80" height="90" rx="8" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.5" />
        </svg>
      )
    },
    appointments: {
      icon: '📅',
      title: 'No Appointments Scheduled',
      message: 'You don\'t have any upcoming appointments. New appointments will be displayed here.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF5F0" />
          <rect x="60" y="70" width="80" height="70" rx="4" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.5" />
          <line x1="60" y1="85" x2="140" y2="85" stroke="#FF6B35" strokeWidth="3" opacity="0.3" />
          <circle cx="80" cy="105" r="4" fill="#FF6B35" opacity="0.4" />
          <circle cx="100" cy="105" r="4" fill="#FF6B35" opacity="0.4" />
          <circle cx="120" cy="105" r="4" fill="#FF6B35" opacity="0.4" />
        </svg>
      )
    },
    inspections: {
      icon: '🔍',
      title: 'No Inspections Found',
      message: 'There are no vehicle inspections to display at this time.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF5F0" />
          <circle cx="90" cy="90" r="35" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.5" />
          <line x1="115" y1="115" x2="135" y2="135" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
    },
    messages: {
      icon: '💬',
      title: 'No Messages',
      message: 'Your inbox is empty. Messages from customers will appear here.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF5F0" />
          <rect x="60" y="80" width="80" height="50" rx="8" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.5" />
          <path d="M60 80 L100 105 L140 80" fill="none" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        </svg>
      )
    },
    search: {
      icon: '🔍',
      title: 'No Results Found',
      message: 'We couldn\'t find any matches for your search. Try different keywords.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF5F0" />
          <circle cx="90" cy="90" r="30" fill="none" stroke="#FF6B35" strokeWidth="3" opacity="0.5" />
          <line x1="112" y1="112" x2="130" y2="130" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          <line x1="80" y1="90" x2="100" y2="90" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      )
    },
    error: {
      icon: '⚠️',
      title: 'Something Went Wrong',
      message: 'We encountered an error loading this content. Please try again.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#FFF0F0" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#EF4444" strokeWidth="3" opacity="0.5" />
          <line x1="100" y1="80" x2="100" y2="100" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <circle cx="100" cy="115" r="3" fill="#EF4444" opacity="0.7" />
        </svg>
      )
    },
    default: {
      icon: '📭',
      title: 'No Data Available',
      message: 'There is no data to display at this time.',
      illustration: (
        <svg className="empty-illustration" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#F5F5F5" />
          <rect x="70" y="90" width="60" height="40" rx="4" fill="none" stroke="#999" strokeWidth="2" opacity="0.5" />
        </svg>
      )
    }
  };

  const content = variants[variant] || variants.default;

  return (
    <div className={`empty-state empty-state-${variant}`}>
      <div className="empty-state-content">
        {illustration && (
          <div className="empty-state-illustration">
            {content.illustration}
          </div>
        )}
        
        <div className="empty-state-icon">
          {icon || content.icon}
        </div>

        <h3 className="empty-state-title">
          {title || content.title}
        </h3>

        <p className="empty-state-message">
          {message || content.message}
        </p>

        {actionLabel && onAction && (
          <button 
            className="empty-state-action-btn" 
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Compact empty state for inline use
 */
export const EmptyStateInline = ({ icon = '📭', message = 'No data available' }) => {
  return (
    <div className="empty-state-inline">
      <span className="empty-state-inline-icon">{icon}</span>
      <span className="empty-state-inline-message">{message}</span>
    </div>
  );
};

/**
 * Empty state for tables
 */
export const EmptyStateTable = ({ 
  icon = '📋', 
  message = 'No records found',
  columns = 1 
}) => {
  return (
    <tr className="empty-state-table-row">
      <td colSpan={columns}>
        <div className="empty-state-table">
          <span className="empty-state-table-icon">{icon}</span>
          <p className="empty-state-table-message">{message}</p>
        </div>
      </td>
    </tr>
  );
};

export default EmptyState;
