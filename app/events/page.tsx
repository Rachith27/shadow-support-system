"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import EventCard from '@/components/EventCard';
import { API_BASE } from '@/lib/api';

interface EventItem {
  id: string;
  topic_category: string;
  title: string;
  description: string;
  date: string;
  location: string;
  interested_count: number;
}

function EventsContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registered, setRegistered] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const issue = searchParams.get('issue');



  useEffect(() => {
    let url = `${API_BASE}/events`;
    if (issue) url += `?issue=${issue}`;
    fetch(url).then(res => res.json()).then(setEvents);
  }, [issue]);

  const register = async (id: string) => {
    const res = await fetch(`${API_BASE}/events/${id}/register`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'anonymous-u1' }) // Mock session ID for demo
    });
    if (res.ok) setRegistered({ ...registered, [id]: true });
  };

  return (
    <div className="flex flex-col min-h-screen relative pb-12">
      <div className="bg-white/80 backdrop-blur-xl p-5 md:p-6 shadow-sm border-b border-gray-100 flex items-center sticky top-0 z-20 gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-full transition"><ArrowLeft size={24}/></button>
        <div>
           <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{issue ? 'Programs Recommended For You' : 'Offline NGO Programs'}</h1>
           <p className="text-gray-500 font-medium text-sm md:text-base mt-1">{issue ? "Based on your discussion, these sessions will help." : "Safe, anonymous events organized by Youth NGO volunteers near you."}</p>
        </div>
      </div>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-8">
        {Object.keys(registered).length > 0 && 
           <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl flex items-center gap-4 text-base md:text-lg font-bold shadow-xl shadow-emerald-200 animate-in fade-in slide-in-from-top-4">
              <CheckCircle size={28} className="shrink-0"/> Registration securely logged. A volunteer team will welcome you at the venue—no pressure!
           </div>
        }

        {events.length === 0 ? (
          <div className="text-center p-20 bg-white/50 backdrop-blur rounded-[3rem] border border-gray-100 border-dashed mt-10">
             <div className="inline-flex items-center justify-center p-6 bg-gray-50 rounded-full mb-6"><Sparkles size={40} className="text-gray-300"/></div>
             <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No matching events currently scheduled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {events.map(ev => (
               <EventCard key={ev.id} event={ev} registered={registered[ev.id]} onRegister={register} />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500 uppercase tracking-widest font-bold text-sm">Loading Events...</p></div>}>
      <EventsContent />
    </Suspense>
  );
}
