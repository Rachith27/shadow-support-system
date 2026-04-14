'use client';

import { useState } from 'react';
import { Eye, Volume2, Fingerprint, Waves, Apple, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 5, label: 'Things you see', icon: Eye, color: 'sky', prompt: 'Look around you. Name 5 things you can see.' },
  { id: 4, label: 'Things you feel', icon: Fingerprint, color: 'emerald', prompt: 'Pay attention to your body. Name 4 things you can feel.' },
  { id: 3, label: 'Things you hear', icon: Volume2, color: 'indigo', prompt: 'Listen carefully. Name 3 things you can hear right now.' },
  { id: 2, label: 'Things you smell', icon: Waves, color: 'amber', prompt: 'Take a breath. Name 2 things you can smell or like the smell of.' },
  { id: 1, label: 'Thing you taste', icon: Apple, color: 'rose', prompt: 'Focus. Name 1 thing you can taste or your favorite flavor.' },
];

export default function GroundingExercise({ onComplete }: { onComplete: (moodScore: number) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-glass animate-in text-center">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-2xl font-black text-emerald-900 mb-2 tracking-tight">Well Done</h3>
        <p className="text-emerald-700 font-medium mb-8 leading-relaxed">
          Grounding helps pull you back to the present. <br/> How are you feeling now?
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
        <p className="text-[10px] uppercase font-black text-emerald-400 mt-6 tracking-widest">(1 = Heavy, 5 = Light/Grounded)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-glass animate-in relative overflow-hidden transition-all duration-500">
      
      {/* Progress */}
      <div className="absolute top-0 left-0 w-full h-1.5 flex gap-0.5">
        {STEPS.map((_, i) => (
           <div key={i} className={`flex-1 h-full transition-all duration-700 ${i <= currentStep ? 'bg-indigo-500' : 'bg-slate-100'}`} />
        ))}
      </div>

      <div className="text-center mb-10 mt-6">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">5-4-3-2-1 Grounding</h3>
        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mt-1">Connect with your senses</p>
      </div>

      {/* Step Card */}
      <div className="w-full flex flex-col items-center mb-10 animate-in">
        <div className={`w-24 h-24 rounded-[2rem] bg-${step.color}-50 text-${step.color}-600 flex items-center justify-center mb-6 shadow-inner ring-4 ring-${step.color}-100/50`}>
           <Icon size={40} />
        </div>
        <div className="flex items-end gap-2 mb-2">
           <span className={`text-6xl font-black text-${step.color}-600 leading-none`}>{step.id}</span>
           <h4 className="text-xl font-black text-slate-800 tracking-tight pb-1">{step.label}</h4>
        </div>
        <p className="text-slate-600 font-medium text-center text-lg leading-relaxed max-w-sm px-4 italic opacity-80">
          &quot;{step.prompt}&quot;
        </p>
      </div>

      <button 
        onClick={nextStep}
        className={`w-full bg-${step.color}-600 hover:bg-${step.color}-700 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-${step.color}-200 transition-all active:scale-[0.98] text-lg`}
      >
        Continue to {currentStep < STEPS.length - 1 ? STEPS[currentStep + 1].id : 'Done'}
      </button>

      <p className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest text-center leading-relaxed">
        Say it out loud or in your head. <br/> Take your time.
      </p>

    </div>
  );
}
