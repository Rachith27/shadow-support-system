'use client';

import { useState, useEffect } from 'react';
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
      
      // Register NEW session via API
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id })
      }).catch(error => console.error('Session init failed:', error));
    }

    const sessionState = createSessionState(id);
    setTimeout(() => setSession(sessionState), 0);
  }, []); // runs once on mount

  return { session, setSession };
}
