'use client';

import { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

export default function BoxBreathing({ onComplete }: { onComplete: (moodScore: number) => void }) {
  const [phase, setPhase] = useState<'In' | 'Hold (Full)' | 'Out' | 'Hold (Empty)'>('In');
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [rounds, setRounds] = useState(0);
  const MAX_ROUNDS = 4;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next === 4) {
             // Cycle phases
             setPhase(p => {
                if (p === 'In') return 'Hold (Full)';
                if (p === 'Hold (Full)') return 'Out';
                if (p === 'Out') return 'Hold (Empty)';
                // Cycle complete
                setRounds(r => r + 1);
                return 'In';
             });
             return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (rounds === MAX_ROUNDS) {
      setTimeout(() => setIsActive(false), 0);
    }
  }, [rounds]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-glass animate-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/20 rounded-full blur-3xl -mr-10 -mt-10" />
      
      <div className="text-center mb-8">
        <div className="bg-sky-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-sky-600 shadow-inner">
           <Wind size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Box Breathing</h3>
        <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">4 Rounds • 4 Seconds Each</p>
      </div>

      {/* Animation Area */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        {/* Progress tracks (The Box) */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-[2rem]" />
        
        {/* The Breathing Circle */}
        <div className={`w-32 h-32 bg-sky-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-sky-200 transition-all duration-[4000ms] ease-linear
          ${isActive ? 'animate-breathing' : ''}`}
        >
          {isActive ? 4 - seconds : '0'}
        </div>

        {/* Phase Text */}
        <div className="absolute -bottom-8 w-full text-center">
           <p className="text-lg font-bold text-sky-700 tracking-tight uppercase">
             {isActive ? phase : 'Ready?'}
           </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full">
        {rounds < MAX_ROUNDS ? (
          <div className="flex gap-4">
             {!isActive ? (
               <button 
                onClick={() => setIsActive(true)}
                className="bg-sky-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-sky-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
               >
                 <Play size={20} fill="currentColor"/> Start Exercise
               </button>
             ) : (
               <button 
                onClick={() => setIsActive(false)}
                className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-700 transition-all flex items-center gap-3"
               >
                 <Pause size={20} fill="currentColor"/> Pause
               </button>
             )}
             <button 
              onClick={() => { setIsActive(false); setSeconds(0); setRounds(0); setPhase('In'); }}
              className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
             >
               <RotateCcw size={20} />
             </button>
          </div>
        ) : (
          <div className="w-full text-center animate-in">
             <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] mb-6">
                <p className="text-emerald-800 font-bold mb-4">You did it! How do you feel now?</p>
                <div className="flex justify-between gap-2">
                   {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => onComplete(s)}
                        className="flex-1 bg-white hover:bg-emerald-500 hover:text-white py-3 rounded-2xl border border-emerald-100 text-emerald-600 font-bold transition shadow-sm"
                      >
                         {s}
                      </button>
                   ))}
                </div>
                <p className="text-[10px] uppercase font-black text-emerald-400 mt-4 tracking-widest leading-none">(1 = Same, 5 = Much Better)</p>
             </div>
          </div>
        )}

        <div className="flex gap-1">
          {[...Array(MAX_ROUNDS)].map((_, i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i < rounds ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
