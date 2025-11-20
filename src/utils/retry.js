/**
 * Retry utility with exponential backoff for handling transient errors
 * 
 * Features:
 * - Exponential backoff with jitter
 * - Smart error detection (retry 5xx, fail fast on 4xx)
 * - Configurable retry attempts and delays
 * - Handles Cloudflare errors, network failures, timeouts
 * 
 * Industry Standards:
 * - Follows AWS/Google Cloud retry best practices
 * - Exponential backoff prevents server overload
 * - Jitter prevents thundering herd problem
 * - Maximum delay cap for reasonable UX
 */

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors (connection refused, timeout, etc.)
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'ENOTFOUND' ||
      error.code === 'ENETUNREACH') {
    return true;
  }
  
  // Axios network error
  if (error.message && error.message.includes('Network Error')) {
    return true;
  }
  
  // Check response status for HTTP errors
  if (error.response) {
    const status = error.response.status;
    
    // 5xx server errors are retryable
    if (status >= 500 && status < 600) {
      return true;
    }
    
    // Specific retryable 4xx errors
    if (status === 408 || // Request Timeout
        status === 429) { // Too Many Requests
      return true;
    }
  }
  
  // Cloudflare errors (HTML error pages)
  if (error.message && (
      error.message.includes('Cloudflare') ||
      error.message.includes('<!DOCTYPE html>') ||
      error.message.includes('Internal server error')
  )) {
    return true;
  }
  
  // TypeError from network issues
  if (error instanceof TypeError && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
  )) {
    return true;
  }
  
  return false;
};

/**
 * Calculate exponential backoff delay with jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export const calculateBackoff = (attempt, baseDelay = 1000, maxDelay = 5000) => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (±25% random variation) to prevent thundering herd
  const jitter = cappedDelay * (0.75 + Math.random() * 0.5);
  
  return Math.floor(jitter);
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry an async function with exponential backoff
 * @param {Function} asyncFn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 5000)
 * @param {Function} options.shouldRetry - Custom function to determine if error is retryable
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<any>} Result of the async function
 * @throws {Error} If all retry attempts fail
 */
export const retry = async (
  asyncFn,
  options = {},
  operationName = 'Operation'
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000,
    shouldRetry = isRetryableError,
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt the operation
      const result = await asyncFn();
      
      // Success - log if this was a retry
      if (attempt > 0) {
        // Retry succeeded
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const isLastAttempt = attempt === maxRetries;
      const shouldRetryError = shouldRetry(error);
      
      if (!shouldRetryError || isLastAttempt) {
        // Don't retry or no more attempts left
        throw error;
      }
      
      // Calculate delay for next retry
      const delay = calculateBackoff(attempt, baseDelay, maxDelay);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // Should never reach here, but just in case
  throw lastError;
};

/**
 * Wrapper for API calls with retry logic
 * Pre-configured with sensible defaults for API requests
 * @param {Function} asyncFn - Async function to retry
 * @param {string} operationName - Name of the operation for logging
 * @param {Object} customOptions - Optional custom retry options
 * @returns {Promise<any>} Result of the async function
 */
export const retryApiCall = (asyncFn, operationName = 'API Call', customOptions = {}) => {
  return retry(asyncFn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    shouldRetry: isRetryableError,
    ...customOptions,
  }, operationName);
};

const retryUtils = {
  retry,
  retryApiCall,
  isRetryableError,
  calculateBackoff,
};

export default retryUtils;
