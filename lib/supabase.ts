import { createClient } from '@supabase/supabase-js';

// Browser client — uses anon key, respects RLS
// Only allows inserts — cannot read other users' data
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Fallback for build time
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
);
