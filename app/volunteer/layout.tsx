'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Zap, BellRing } from 'lucide-react';
import { getSocket } from '@/lib/socket';

function GlobalNotificationToast({ 
  onClose, 
  data 
}: { 
  onClose: () => void; 
  data: { studentName: string; riskLevel: string; sessionId: string } 
}) {
  const router = useRouter();
  return (
    <div className="fixed top-6 right-6 z-[100] w-80 animate-in slide-in-from-right duration-500">
      <div className="bg-white rounded-3xl p-5 shadow-2xl border border-indigo-100 ring-4 ring-indigo-500/10 flex flex-col gap-4 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-amber-500" />
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-bounce">
                <BellRing size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest leading-none mb-1">New Alert</p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">Priority Help Request</h3>
             </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-300 transition">
             <X size={16} />
          </button>
        </div>

        <div>
           <p className="text-xs text-gray-500 leading-relaxed font-medium">
             <span className="font-black text-gray-800">{data.studentName}</span> needs support. Risk flagged as <span className="text-rose-500 font-bold uppercase">{data.riskLevel}</span>.
           </p>
        </div>

        <button 
           onClick={() => {
              onClose();
              router.push('/volunteer/cases');
           }}
           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
           Open Queue
           <Zap size={14} />
        </button>
      </div>
    </div>
  );
}

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('new_intervention_needed', (data: any) => {
       console.log('🚨 Global alert received:', data);
       // Don't show if already viewing cases? 
       // Actually showing it everywhere is safer.
       setNotification(data);
    });

    return () => {
       socket.off('new_intervention_needed');
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg relative">
      {notification && (
        <GlobalNotificationToast 
          data={notification} 
          onClose={() => setNotification(null)} 
        />
      )}
      {children}
    </div>
  );
}
