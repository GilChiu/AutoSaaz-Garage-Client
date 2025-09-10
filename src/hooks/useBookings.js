import { useState, useEffect, useRef } from 'react';
import { getBookings } from '../services/bookings.service.js';

/**
 * Custom hook for fetching and managing bookings data
 * @returns {{ data: import('../types/booking.js').Booking[], loading: boolean, error: string|null, refetch: () => void }}
 */
export function useBookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const bookings = await getBookings(abortControllerRef.current.signal);
      setData(bookings);
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      setError(err.message);
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    fetchBookings();

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = () => {
    fetchBookings();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}
