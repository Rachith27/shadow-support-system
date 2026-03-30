-- schema.sql: Tables Migration from MongoDB to Supabase

-- 1. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    skills TEXT[],
    availability TEXT,
    motivation TEXT,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    assigned_cases UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Behavior Reports Table
CREATE TABLE IF NOT EXISTS behavior_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_type TEXT,
    age_group TEXT,
    mood TEXT,
    behavior_changes TEXT[],
    social_flags TEXT[],
    academic_flags TEXT[],
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    topic_category TEXT,
    target_issue TEXT,
    date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    registration_required BOOLEAN DEFAULT FALSE,
    interested_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Flagged Cases Table
CREATE TABLE IF NOT EXISTS flagged_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES behavior_reports(id) ON DELETE SET NULL,
    age_group TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    detected_concern TEXT,
    intervention_status TEXT DEFAULT 'pending' CHECK (intervention_status IN ('pending', 'in_progress', 'resolved')),
    ai_summary TEXT,
    guidance JSONB, -- Stores { approach, whatToSay: [], dos: [], donts: [] }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Chat Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    age_group TEXT,
    messages JSONB DEFAULT '[]'::JSONB, -- Stores array of { role, content, timestamp }
    analysis JSONB, -- Stores { emotion, situation, trigger, supportNeed, riskLevel }
    target_issue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    session_id TEXT,
    contact_provided BOOLEAN DEFAULT FALSE,
    contact_info TEXT,
    status TEXT DEFAULT 'interested' CHECK (status IN ('interested', 'registered')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Admin Credentials Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Enable Row Level Security (RLS) - Basic starting policies
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for reports and sessions (anonymous access for students)
CREATE POLICY "Enable public insert for behavior_reports" ON behavior_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public insert for sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public all for sessions by id" ON sessions FOR ALL USING (true); -- Note: In prod, restrict by session_id
