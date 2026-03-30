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

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm border flex flex-col transition hover:shadow-lg hover:-translate-y-1 ${isHigh
          ? 'border-l-4 border-l-rose-500 border-rose-100'
          : 'border-l-4 border-l-amber-500 border-gray-100'
        }`}
    >
      {/* Top Info */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase bg-gray-50 text-gray-600 px-2 py-1 rounded">
          Age {caseData.age_group || 'Unknown'}
        </span>

        <span
          className={`text-[10px] sm:text-xs font-bold uppercase flex items-center ${isHigh ? 'text-rose-500' : 'text-amber-500'
            }`}
        >
          {isHigh && <AlertTriangle size={14} className="mr-1" />}
          {caseData.risk_level} Risk
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
