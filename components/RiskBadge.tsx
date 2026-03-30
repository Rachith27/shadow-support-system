'use client';

import type { RiskTier } from '@/types';

const RISK_CONFIG: Record<RiskTier, { color: string; label: string; ringColor: string }> = {
  low:    { color: 'bg-risk-low',    label: 'Feeling Okay', ringColor: 'shadow-risk-low/30' },
  medium: { color: 'bg-risk-medium', label: 'Checking In',  ringColor: 'shadow-risk-medium/30' },
  high:   { color: 'bg-risk-high',   label: "We're Here",   ringColor: 'shadow-risk-high/30' },
};

interface RiskBadgeProps {
  riskTier: RiskTier;
}

export default function RiskBadge({ riskTier }: RiskBadgeProps) {
  const config = RISK_CONFIG[riskTier];

  return (
    <div
      id="risk-badge"
      title="This reflects how you seem to be feeling based on your check-ins"
      className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-500 cursor-default transition-all duration-300"
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${config.color} shadow-[0_0_0_3px] ${config.ringColor} ${riskTier !== 'low' ? 'animate-pulse' : ''}`}
      />
      <span className="whitespace-nowrap">{config.label}</span>
    </div>
  );
}
