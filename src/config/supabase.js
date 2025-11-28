// Supabase Functions configuration for the Garage client
// Provide overrides via .env:
// - REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
// - REACT_APP_FUNCTIONS_URL=https://<project-ref>.functions.supabase.co
// - REACT_APP_SUPABASE_ANON_KEY=<anon-key>

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://lblcjyeiwgyanadssqac.supabase.co';

export const FUNCTIONS_URL =
  process.env.REACT_APP_FUNCTIONS_URL || 'https://lblcjyeiwgyanadssqac.functions.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibGNqeWVpd2d5YW5hZHNzcWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTEzOTksImV4cCI6MjA3NzIyNzM5OX0.Dxe6u7ukJB_4djQurriZm5dIlffCu-yPl_oRNpUNypo';

// Create a single shared Supabase client instance
let supabaseClient = null;
let lastToken = null;

export const getSupabaseClient = () => {
  const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // We manage sessions manually
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  
  // Update auth token if it changed
  if (currentToken && currentToken !== lastToken) {
    lastToken = currentToken;
    // Set auth header for API calls
    supabaseClient.rest.headers = {
      ...supabaseClient.rest.headers,
      'Authorization': `Bearer ${currentToken}`
    };
    // Set auth header for storage calls
    supabaseClient.storage.headers = {
      ...supabaseClient.storage.headers,
      'Authorization': `Bearer ${currentToken}`
    };
    console.log('[Supabase] Updated auth token');
  }
  
  return supabaseClient;
};

// Export a function that always gets fresh client with current auth
export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getSupabaseClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
