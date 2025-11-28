/**
 * GST (Gulf Standard Time) DateTime Utilities
 * GST is UTC+4 (no daylight saving time)
 * All dates and times in the application are displayed in GST timezone
 * 
 * Industry Standards:
 * - Uses Intl.DateTimeFormat for locale-aware formatting
 * - Consistent timezone handling across the application
 * - Handles invalid dates gracefully
 */

const GST_TIMEZONE = 'Asia/Dubai'; // GST +4 timezone

/**
 * Convert any date to GST timezone
 * @param {string|Date} date - Date string or Date object
 * @returns {Date} Date object adjusted to GST
 */
const toGST = (date) => {
  if (!date) return null;
  try {
    return new Date(date);
  } catch (error) {
    console.error('Error converting to GST:', error);
    return null;
  }
};

/**
 * Format date and time in GST
 * Example: "Oct 31, 2025, 02:30 PM GST"
 * @param {string|Date} date - Date to format
 * @param {boolean} showTimezone - Whether to append "GST" suffix
 * @returns {string} Formatted date and time
 */
export const formatDateTimeGST = (date, showTimezone = true) => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Date';
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(gstDate);
    
    return showTimezone ? `${formatted} GST` : formatted;
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date only in GST (no time)
 * Example: "October 31, 2025"
 * @param {string|Date} date - Date to format
 * @param {string} format - 'long' or 'short' format
 * @returns {string} Formatted date
 */
export const formatDateGST = (date, format = 'long') => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric'
    }).format(gstDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only in GST (no date)
 * Example: "02:30 PM GST"
 * @param {string|Date} date - Date to format
 * @param {boolean} showTimezone - Whether to append "GST" suffix
 * @returns {string} Formatted time
 */
export const formatTimeGST = (date, showTimezone = true) => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Time';
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(gstDate);
    
    return showTimezone ? `${formatted} GST` : formatted;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Format compact date and time for lists
 * Example: "Oct 31, 2:30 PM"
 * @param {string|Date} date - Date to format
 * @returns {string} Compact formatted date and time
 */
export const formatCompactDateTimeGST = (date) => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(gstDate);
  } catch (error) {
    console.error('Error formatting compact date/time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format for message timestamps (used in chat)
 * Example: "2:30 PM"
 * @param {string|Date} date - Date to format
 * @returns {string} Time only
 */
export const formatMessageTimeGST = (date) => {
  return formatTimeGST(date, false);
};

/**
 * Get relative time with GST awareness
 * Example: "2 hours ago", "Just now", "Yesterday"
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTimeGST = (date) => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffMs = now - gstDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return formatDateGST(date, 'short');
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format for notification timestamps
 * Shows relative time for recent, full date for older
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted notification time
 */
export const formatNotificationTimeGST = (date) => {
  if (!date) return 'N/A';
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffHours = Math.floor((now - gstDate) / 3600000);
    
    // Show relative time for last 24 hours
    if (diffHours < 24) {
      return getRelativeTimeGST(date);
    }
    
    // Show compact date/time for older
    return formatCompactDateTimeGST(date);
  } catch (error) {
    console.error('Error formatting notification time:', error);
    return 'Invalid Date';
  }
};

/**
 * Get current time in GST
 * @returns {Date} Current date/time in GST
 */
export const nowGST = () => {
  return new Date();
};

/**
 * Check if a date is today (in GST timezone)
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export const isTodayGST = (date) => {
  if (!date) return false;
  
  try {
    const gstDate = toGST(date);
    if (!gstDate || isNaN(gstDate.getTime())) return false;
    
    const now = new Date();
    
    const dateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(gstDate);
    
    const todayStr = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    return dateStr === todayStr;
  } catch (error) {
    return false;
  }
};
