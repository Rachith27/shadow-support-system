'use client';

import { useState } from 'react';
import { useSession } from '@/lib/session';
import MoodCheckIn from '@/components/MoodCheckIn';
import ChatInterface from '@/components/ChatInterface';
import type { RiskTier, RiskUpdatePayload } from '@/types';

export default function ChatPage() {
  const { session, setSession } = useSession();
  const [riskTier, setRiskTier] = useState<RiskTier>('low');
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(true);

  const handleRiskUpdate = (update: RiskUpdatePayload) => {
    setRiskTier(update.riskTier);
    setSession(prev =>
      prev ? { ...prev, riskScore: update.riskScore, riskTier: update.riskTier } : prev
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-bg">
        <div className="w-10 h-10 border-3 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Creating your safe space...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-brand-bg">
      {showMoodCheckIn && (
        <MoodCheckIn
          sessionId={session.sessionId}
          onComplete={() => setShowMoodCheckIn(false)}
        />
      )}
      <ChatInterface
        sessionId={session.sessionId}
        riskTier={riskTier}
        onRiskUpdate={handleRiskUpdate}
      />
    </div>
  );
}
