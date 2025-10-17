import React from 'react';
import './LoadingCard.css';

/**
 * Professional loading skeleton card component
 * Animated shimmer effect for better UX
 */
const LoadingCard = ({ variant = 'default', count = 1 }) => {
  const cards = Array.from({ length: count }, (_, i) => i);

  if (variant === 'booking') {
    return (
      <>
        {cards.map((key) => (
          <div key={key} className="loading-card loading-card-booking">
            <div className="loading-card-header">
              <div className="loading-shimmer loading-booking-number"></div>
              <div className="loading-shimmer loading-status-badge"></div>
            </div>
            <div className="loading-card-body">
              <div className="loading-shimmer loading-customer-name"></div>
              <div className="loading-shimmer loading-vehicle"></div>
              <div className="loading-shimmer loading-service"></div>
              <div className="loading-card-footer">
                <div className="loading-shimmer loading-date"></div>
                <div className="loading-shimmer loading-amount"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'appointment') {
    return (
      <>
        {cards.map((key) => (
          <div key={key} className="loading-card loading-card-appointment">
            <div className="loading-card-top">
              <div className="loading-shimmer loading-date-block"></div>
              <div className="loading-shimmer loading-time-block"></div>
            </div>
            <div className="loading-card-middle">
              <div className="loading-shimmer loading-customer-name"></div>
              <div className="loading-shimmer loading-vehicle"></div>
              <div className="loading-shimmer loading-service"></div>
            </div>
            <div className="loading-card-bottom">
              <div className="loading-shimmer loading-btn"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'stat') {
    return (
      <>
        {cards.map((key) => (
          <div key={key} className="loading-card loading-card-stat">
            <div className="loading-shimmer loading-stat-label"></div>
            <div className="loading-shimmer loading-stat-value"></div>
            <div className="loading-shimmer loading-stat-change"></div>
          </div>
        ))}
      </>
    );
  }

  // Default card
  return (
    <>
      {cards.map((key) => (
        <div key={key} className="loading-card loading-card-default">
          <div className="loading-shimmer loading-title"></div>
          <div className="loading-shimmer loading-subtitle"></div>
          <div className="loading-shimmer loading-text"></div>
        </div>
      ))}
    </>
  );
};

/**
 * Simple inline loading spinner
 */
export const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`loading-spinner loading-spinner-${size} loading-spinner-${color}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <LoadingSpinner size="large" />
        <p className="loading-overlay-message">{message}</p>
      </div>
    </div>
  );
};

/**
 * Table row skeleton
 */
export const LoadingTableRow = ({ columns = 4, rows = 3 }) => {
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  const colArray = Array.from({ length: columns }, (_, i) => i);

  return (
    <>
      {rowArray.map((rowKey) => (
        <tr key={rowKey} className="loading-table-row">
          {colArray.map((colKey) => (
            <td key={colKey}>
              <div className="loading-shimmer loading-table-cell"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default LoadingCard;
