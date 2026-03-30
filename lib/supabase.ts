import { createClient } from '@supabase/supabase-js';

// Browser client — uses anon key, respects RLS
// Only allows inserts — cannot read other users' data
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Fallback for build time
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
);

// Server client — uses service role key, bypasses RLS
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);
