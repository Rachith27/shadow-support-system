import Link from 'next/link';
import { AlertTriangle, Clock } from 'lucide-react';

interface CaseCardProps {
  caseData: {
    id: string;
    risk_level: 'low' | 'medium' | 'high';
    age_group: string;
    detected_concern: string;
    ai_summary?: string;
    created_at: string;
    intervention_status: string;
  };
  showLink?: boolean;
}

export default function CaseCard({ caseData, showLink = true }: CaseCardProps) {
  const isHigh = caseData.risk_level === 'high';
  const isLiveRequest = caseData.detected_concern?.toLowerCase().includes('user requested volunteer');

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm border flex flex-col transition hover:shadow-lg hover:-translate-y-1 
        ${isLiveRequest 
          ? 'border-l-4 border-l-indigo-600 border-indigo-100 bg-indigo-50/30' 
          : isHigh
            ? 'border-l-4 border-l-rose-500 border-rose-100'
            : 'border-l-4 border-l-amber-500 border-gray-100'
        }`}
    >
      {/* Top Info */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase bg-gray-50 text-gray-600 px-2 py-1 rounded">
            Age {caseData.age_group || 'Unknown'}
          </span>
          {isLiveRequest && (
            <span className="text-[9px] sm:text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-1 rounded animate-pulse tracking-widest leading-none">
              Live Request
            </span>
          )}
        </div>

        <span
          className={`text-[10px] sm:text-xs font-bold uppercase flex items-center 
            ${isLiveRequest ? 'text-indigo-600' : isHigh ? 'text-rose-500' : 'text-amber-500'}`}
        >
          {isHigh && !isLiveRequest && <AlertTriangle size={14} className="mr-1" />}
          {isLiveRequest ? 'Immediate' : caseData.risk_level} Risk
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-800 text-base sm:text-lg lg:text-xl mb-2 leading-tight">
        {caseData.detected_concern}
      </h3>

      {/* Summary */}
      <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">
        {caseData.ai_summary?.replace('Possible Concern: ', '')}
      </p>

      {/* Bottom Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-gray-400 font-semibold mb-4 border-t pt-3">
        <span className="flex items-center">
          <Clock size={14} className="mr-1" />
          {new Date(caseData.created_at).toLocaleDateString()}
        </span>

        <span className="uppercase text-sky-600 bg-sky-50 px-2 py-1 rounded">
          {caseData.intervention_status}
        </span>
      </div>

      {/* CTA Button */}
      {showLink && (
        <Link
          href={`/volunteer/cases/${caseData.id}`}
          className="block w-full text-center bg-gray-50 hover:bg-emerald-50 text-emerald-700 font-bold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base transition"
        >
          Open Intervention Guide
        </Link>
      )}
    </div>
  );
}
