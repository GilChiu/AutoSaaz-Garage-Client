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
    
    console.log('[Supabase] Client initialized (using anon key for realtime)');
  }
  return supabaseClient;
};

// Export the singleton instance directly
export const supabase = getSupabaseClient();
