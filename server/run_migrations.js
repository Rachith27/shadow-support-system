const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const sql = `
  CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      age_group TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS chat_type TEXT DEFAULT 'anonymous',
  ADD COLUMN IF NOT EXISTS title TEXT;
  `;

  // We have to use rpc to execute raw sql, or we can just try creating it via rest API if rpc is not there.
  // Actually Supabase JS auth client doesn't export a direct query function. 
  console.log("Please run SQL in Supabase dashboard manually, or create an RPC if not available.");
}

run();
