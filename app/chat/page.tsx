'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MoodCheckIn from '@/components/MoodCheckIn';
import ChatInterface from '@/components/ChatInterface';
import type { RiskTier, RiskUpdatePayload } from '@/types';

function ChatContent() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const directVolunteer = searchParams.get('directVolunteer') === 'true';
  
  const [riskTier, setRiskTier] = useState<RiskTier>('low');
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(true);

  const handleRiskUpdate = (update: RiskUpdatePayload) => {
    setRiskTier(update.riskTier);
  };

  return (
    <div className="h-screen flex flex-col bg-brand-bg">
      {/* We only show Mood Check In for new sessions? Let's just show it always or pass something. Let's pass the URL session ID to ChatInterface. ChatInterface will handle whether to show MoodCheckIn maybe. Actually, MoodCheckIn needs sessionId. So we render it if we have one. But let's just let ChatInterface handle session ID. */}
      {showMoodCheckIn && urlSessionId && (
        <MoodCheckIn
          sessionId={urlSessionId}
          onComplete={() => setShowMoodCheckIn(false)}
        />
      )}
      <ChatInterface
        initialSessionId={urlSessionId}
        initialRequestVolunteer={directVolunteer}
        onRiskUpdate={handleRiskUpdate}
        onMoodCheckInComplete={() => setShowMoodCheckIn(false)}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
