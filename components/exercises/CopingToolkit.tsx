'use client';

import { useState } from 'react';
import { X, Wind, Sparkles, Heart, Brain, Zap } from 'lucide-react';
import BoxBreathing from './BoxBreathing';
import GroundingExercise from './GroundingExercise';
import GratitudeJournal from './GratitudeJournal';
import CognitiveReframe from './CognitiveReframe';
import { getSocket } from '@/lib/socket';

type ExerciseType = 'breathing' | 'grounding' | 'gratitude' | 'reframe' | null;

interface CopingToolkitProps {
  sessionId: string;
  riskTier: 'low' | 'medium' | 'high';
  isOpen: boolean;
  onClose: () => void;
  lastUserMessage?: string;
}

export default function CopingToolkit({ sessionId, riskTier, isOpen, onClose, lastUserMessage }: CopingToolkitProps) {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>(null);

  if (!isOpen) return null;

  const handleComplete = (moodScore: number) => {
    const socket = getSocket();
    socket.emit('exercise_complete', {
      sessionId,
      exerciseType: activeExercise,
      moodScore,
      timestamp: Date.now()
    });
    
    // Smooth transition back
    setTimeout(() => {
       setActiveExercise(null);
       onClose();
    }, 500);
  };

  const exercises = [
    { id: 'breathing', label: 'Box Breathing', icon: Wind, color: 'sky', description: 'Immediate calm for high stress.', tier: ['high', 'medium', 'low'] },
    { id: 'grounding', label: '5-4-3-2-1 Grounding', icon: Zap, color: 'indigo', description: 'Center yourself in the present.', tier: ['high', 'medium'] },
    { id: 'reframe', label: 'Perspective Shift', icon: Brain, color: 'rose', description: 'AI-guided cognitive reframe.', tier: ['medium'] },
    { id: 'gratitude', label: 'Gratitude Micro-Journal', icon: Heart, color: 'emerald', description: 'Build resilience and focus.', tier: ['low', 'medium'] },
  ];

  // Recommendations based on tier
  const recommended = exercises.find(e => e.tier.includes(riskTier));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl border border-white/50 relative overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Background Gradients */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-brand-navy/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="px-10 pt-10 flex items-center justify-between relative z-10">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <Sparkles className="text-brand-teal" size={18} />
                 <h2 className="text-2xl font-black text-brand-navy tracking-tight">Coping Toolkit</h2>
              </div>
              <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest leading-none">Contextual Mental Health Tools</p>
           </div>
           <button 
            onClick={onClose}
            className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all hover:rotate-90"
           >
             <X size={24} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 relative z-10 overflow-y-auto">
           {!activeExercise ? (
             <div className="space-y-8 animate-in">
                {/* Recommendation Highlight */}
                {recommended && (
                   <div className={`p-6 rounded-[2.5rem] bg-${recommended.color}-50 border border-${recommended.color}-100 shadow-sm relative group cursor-pointer hover:scale-[1.02] transition-all`}
                        onClick={() => setActiveExercise(recommended.id as any)}>
                      <div className="bg-white p-2.5 rounded-xl text-emerald-500 text-[10px] font-black uppercase tracking-widest absolute -top-3 left-6 shadow-sm border border-emerald-100 flex items-center gap-1">
                         <Zap size={10} fill="currentColor"/> Recommended for now
                      </div>
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-${recommended.color}-600 shadow-sm`}>
                            <recommended.icon size={28} />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{recommended.label}</h4>
                            <p className="text-slate-500 text-sm font-medium">{recommended.description}</p>
                         </div>
                      </div>
                   </div>
                )}

                {/* Grid of all tools */}
                <div className="grid grid-cols-1 gap-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 leading-none">Explore All Tools</p>
                   {exercises.map((ex) => (
                      <button 
                        key={ex.id}
                        onClick={() => setActiveExercise(ex.id as any)}
                        className="group flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-brand-teal hover:shadow-xl hover:shadow-brand-teal/5 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                           <div className={`w-11 h-11 bg-slate-50 text-slate-400 group-hover:bg-brand-teal/10 group-hover:text-brand-teal rounded-xl flex items-center justify-center transition-all`}>
                              <ex.icon size={20} />
                           </div>
                           <div>
                              <h5 className="font-bold text-slate-700 tracking-tight text-sm group-hover:text-brand-navy">{ex.label}</h5>
                              <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{ex.description}</p>
                           </div>
                        </div>
                        <X size={16} className="text-slate-200 group-hover:text-brand-teal rotate-45 transition-all" />
                      </button>
                   ))}
                </div>
             </div>
           ) : (
             <div className="h-full">
                {activeExercise === 'breathing' && <BoxBreathing onComplete={handleComplete} />}
                {activeExercise === 'grounding' && <GroundingExercise onComplete={handleComplete} />}
                {activeExercise === 'gratitude' && <GratitudeJournal onComplete={handleComplete} />}
                {activeExercise === 'reframe' && (
                  <CognitiveReframe 
                    sessionId={sessionId} 
                    lastUserMessage={lastUserMessage} 
                    onComplete={handleComplete} 
                  />
                )}
                
                <button 
                  onClick={() => setActiveExercise(null)}
                  className="mt-6 w-full text-slate-400 font-black text-[10px] uppercase tracking-[0.25em] hover:text-slate-600 transition"
                >
                  ← Back to Toolkit
                </button>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-10 pb-10">
           {!activeExercise && (
             <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                Exercises are completed in under 3 minutes. <br/> Your safety is our priority.
             </p>
           )}
        </div>
      </div>
    </div>
  );
}
