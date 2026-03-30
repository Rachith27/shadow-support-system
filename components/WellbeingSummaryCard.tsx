import { CheckCircle, Info } from 'lucide-react';

interface WellbeingSummary {
  emotion?: string;
  supportNeed?: string;
  situation?: string;
  trigger?: string;
  riskLevel?: string;
}

interface WellbeingSummaryCardProps {
  summary: WellbeingSummary | null;
}

export default function WellbeingSummaryCard({ summary }: WellbeingSummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-7 shadow-sm border border-sky-100 flex flex-col shadow-sky-50">
      {/* Header */}
      <div className="flex items-start sm:items-center text-sky-600 mb-4 gap-3">
        <CheckCircle size={26} className="shrink-0 mt-0.5 sm:mt-0" />
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
          Your Wellbeing Summary
        </h2>
      </div>

      {/* Note */}
      <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 italic border-l-2 border-sky-100 pl-3 leading-relaxed">
        This is an AI-generated reflection of our chat to help you understand your
        feelings. It is not a medical diagnosis.
      </p>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-sky-50 rounded-2xl p-4">
          <span className="text-[10px] sm:text-xs font-bold text-sky-600 uppercase tracking-widest block mb-1">
            Felt Emotion
          </span>
          <span className="font-semibold text-gray-800 capitalize leading-tight text-sm sm:text-base">
            {summary.emotion || 'Unknown'}
          </span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            Support Need
          </span>
          <span className="font-semibold text-gray-800 capitalize leading-tight text-sm sm:text-base">
            {summary.supportNeed
              ? summary.supportNeed.replace(/_/g, ' ')
              : 'General support'}
          </span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 sm:col-span-2">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
            Core Situation
          </span>
          <span className="font-semibold text-gray-800 leading-snug text-sm sm:text-base">
            {summary.situation || 'Not enough information available'}
          </span>
        </div>
      </div>

      {/* Support Note */}
      <div className="mt-5 sm:mt-6 flex items-start text-xs sm:text-sm text-sky-700 bg-sky-50/70 p-3 sm:p-4 rounded-xl">
        <Info size={16} className="shrink-0 mr-2 mt-0.5" />
        <span className="leading-relaxed">
          If you feel overwhelmed, please reach out to someone you trust, a trained
          volunteer, or a local mental health helpline in your area.
        </span>
      </div>
    </div>
  );
}
