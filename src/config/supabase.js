// Supabase Functions configuration for the Garage client
// Provide overrides via .env:
// - REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
// - REACT_APP_FUNCTIONS_URL=https://<project-ref>.functions.supabase.co
// - REACT_APP_SUPABASE_ANON_KEY=<anon-key>

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://woerqhgdmwhggmwhyieh.supabase.co';

export const FUNCTIONS_URL =
  process.env.REACT_APP_FUNCTIONS_URL || 'https://woerqhgdmwhggmwhyieh.functions.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZXJxaGdkbXdoZ2dtd2h5aWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzExNzIsImV4cCI6MjA4MDkwNzE3Mn0.uqHlBulaku6iewisnQjoF_80R7gqlL9jXj3_Te3-wEE';

// Create a single shared Supabase client instance
let supabaseClient = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          // Add custom header for backend token
          'X-Custom-Auth': localStorage.getItem('accessToken') || localStorage.getItem('token') || ''
        }
      }
    });
  }
  return supabaseClient;
};

// Export the singleton instance directly
export const supabase = getSupabaseClient();
