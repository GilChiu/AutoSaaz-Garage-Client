/**
 * Debounce utilities for optimizing user input handling
 * 
 * Features:
 * - Reduces API calls during user typing
 * - React hooks for easy integration
 * - Configurable delay
 * 
 * Industry Standards:
 * - 300-500ms delay is optimal for search inputs
 * - Prevents unnecessary API calls
 * - Improves performance and reduces server load
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Standard debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 500) => {
  let timeoutId;
  
  return function debounced(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * React hook for debouncing values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} Debounced value
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   // This only runs 500ms after user stops typing
 *   fetchData(debouncedSearch);
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cleanup timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * React hook for debouncing callback functions
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {Function} Debounced callback
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((searchTerm) => {
 *   fetchData(searchTerm);
 * }, 500);
 * 
 * // In input handler:
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};

const debounceUtils = {
  debounce,
  useDebounce,
  useDebouncedCallback,
};

export default debounceUtils;
