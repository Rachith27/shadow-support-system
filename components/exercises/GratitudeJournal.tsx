'use client';

import { useState } from 'react';
import { Heart, Sun, Star, BookOpen, CheckCircle2 } from 'lucide-react';

const QUESTIONS = [
  { prompt: "One small thing that made you smile today?", icon: Sun, color: "amber" },
  { prompt: "Someone you're glad is in your life?", icon: Heart, color: "rose" },
  { prompt: "Something you're proud of yourself for?", icon: Star, color: "emerald" },
];

export default function GratitudeJournal({ onComplete }: { onComplete: (moodScore: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [entries, setEntries] = useState(['', '', '']);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const Q = QUESTIONS[currentStep];
  const Icon = Q.icon;

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-glass animate-in text-center">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-2xl font-black text-emerald-900 mb-2 tracking-tight">Gratitude Saved</h3>
        <p className="text-emerald-700 font-medium mb-8 leading-relaxed">
          Reflecting on the good builds resilience. <br/> How do you feel now?
        </p>
        <div className="flex justify-between gap-2 w-full max-w-xs">
          {[1, 2, 3, 4, 5].map((s) => (
             <button 
               key={s} 
               onClick={() => onComplete(s)}
               className="flex-1 bg-white hover:bg-emerald-600 hover:text-white py-4 rounded-2xl border border-emerald-100 text-emerald-600 font-black transition shadow-sm text-lg"
             >
                {s}
             </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-glass animate-in relative overflow-hidden transition-all duration-500 min-h-[400px]">
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
           <BookOpen size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Gratitude Journal</h3>
        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">Shift focus to the good</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center animate-in">
        <div className={`w-16 h-16 rounded-2xl bg-${Q.color}-50 text-${Q.color}-500 flex items-center justify-center mb-6 ring-4 ring-${Q.color}-50/50`}>
           <Icon size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-700 text-center mb-6 leading-tight max-w-xs">
          {Q.prompt}
        </h4>
        <textarea 
          autoFocus
          value={entries[currentStep]}
          onChange={(e) => {
             const newEntries = [...entries];
             newEntries[currentStep] = e.target.value;
             setEntries(newEntries);
          }}
          className="w-full bg-white/70 border border-slate-100 rounded-3xl p-5 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none min-h-[100px] resize-none shadow-inner"
          placeholder="Type your reflection here..."
        />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <button 
          onClick={nextStep}
          disabled={!entries[currentStep].trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30 disabled:hover:bg-emerald-600 font-black py-4 rounded-3xl shadow-xl shadow-emerald-200 transition-all active:scale-[0.98]"
        >
          {currentStep < QUESTIONS.length - 1 ? 'Next Prompt' : 'Finish Journal'}
        </button>
        <div className="flex justify-center gap-1">
          {QUESTIONS.map((_, i) => (
             <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i === currentStep ? 'bg-emerald-500' : 'bg-slate-100'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
