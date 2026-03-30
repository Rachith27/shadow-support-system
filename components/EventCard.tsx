import { Calendar, MapPin, Users, Heart } from 'lucide-react';

interface EventData {
  id: string;
  topic_category: string;
  title: string;
  description: string;
  date: string;
  location: string;
  interested_count: number;
}

interface EventCardProps {
  event: EventData;
  registered: boolean;
  onRegister: (id: string) => void;
}

export default function EventCard({ event, registered, onRegister }: EventCardProps) {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-emerald-100 flex flex-col transition hover:shadow-lg hover:-translate-y-1">

      {/* Category Tag */}
      <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2 py-1 rounded-sm w-max mb-3">
        {event.topic_category}
      </span>

      {/* Title */}
      <h3 className="font-bold text-gray-800 text-base sm:text-lg lg:text-xl leading-tight mb-2">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-500 mb-4 leading-relaxed line-clamp-3">
        {event.description}
      </p>

      {/* Event Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-4 text-xs sm:text-sm">

        <div className="flex items-center text-emerald-700">
          <Calendar size={14} className="mr-2 shrink-0" />
          {new Date(event.date).toLocaleDateString()}
        </div>

        <div className="flex items-center text-emerald-700">
          <MapPin size={14} className="mr-2 shrink-0" />
          {event.location}
        </div>

        <div className="flex items-center text-emerald-700 col-span-1 sm:col-span-2">
          <Users size={14} className="mr-2 shrink-0" />
          {event.interested_count} Interested
        </div>

      </div>

      {/* CTA Button */}
      <button
        onClick={() => onRegister(event.id)}
        disabled={registered}
        className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-sm transition flex items-center justify-center gap-2 ${registered
            ? 'bg-gray-100 text-gray-400'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
      >
        {registered ? (
          <>
            <Heart size={16} fill="currentColor" />
            Interest Recorded
          </>
        ) : (
          'I am interested'
        )}
      </button>
    </div>
  );
}
