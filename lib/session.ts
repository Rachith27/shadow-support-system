'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from './supabase';
import type { SessionState } from '@/types';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function createSessionState(sessionId: string): SessionState {
  return {
    sessionId,
    createdAt: Date.now(),
    moodHistory: [],
    riskScore: 0.0,
    riskTier: 'low',
  };
}

// useSession hook — call once at the top of the chat page
export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('chatSessionId');
    let id = storedId;

    if (!id) {
      id = generateSessionId();
      localStorage.setItem('chatSessionId', id);
      
      // Register NEW session in Supabase
      supabaseBrowser
        .from('sessions')
        .insert({ session_id: id })
        .then(({ error }) => {
          if (error) console.error('Session init failed:', error.message);
        });
    }

    const sessionState = createSessionState(id);
    setSession(sessionState);
  }, []); // runs once on mount

  return { session, setSession };
}
