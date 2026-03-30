export type RiskTier = 'low' | 'medium' | 'high';

export type EmojiIndex = 0 | 1 | 2 | 3 | 4;

export interface SessionState {
  sessionId: string;
  createdAt: number;
  moodHistory: MoodEntry[];
  riskScore: number;
  riskTier: RiskTier;
}

export interface MoodEntry {
  emojiIndex: EmojiIndex;
  sliderValue: number | null;
  timestamp: number;
  sentimentScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  text: string;
  timestamp: number;
}

// Supabase row types
export interface SessionRow {
  id: string;
  session_id: string;
  created_at: string;
  risk_score: number;
  risk_tier: RiskTier;
  last_active: string;
  messages?: Array<{role: 'user' | 'assistant' | 'system', content: string, timestamp: number}>;
}

export interface EventRow {
  id: string;
  session_id: string;
  event_type: 'mood_checkin' | 'message' | 'vent' | 'exercise_complete';
  sentiment_score: number | null;
  mood_emoji: number | null;
  slider_value: number | null;
  created_at: string;
}

// Socket event payloads
export interface MoodCheckInPayload {
  sessionId: string;
  emojiIndex: EmojiIndex;
  sliderValue: number | null;
  timestamp: number;
}

export interface UserMessagePayload {
  sessionId: string;
  text: string;
  timestamp: number;
}

export interface VentPayload {
  sessionId: string;
  timestamp: number;
  // NOTE: text is intentionally NOT included — never sent to server
}

export interface RiskUpdatePayload {
  riskTier: RiskTier;
  riskScore: number;
}
