'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { getSocket } from '@/lib/socket';

export default function CognitiveReframe({ sessionId, lastUserMessage, onComplete }: { sessionId: string, lastUserMessage?: string, onComplete: (moodScore: number) => void }) {
  const [thought, setThought] = useState(lastUserMessage || '');
  const [reframed, setReframed] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleReframe = () => {
    if (!thought.trim()) return;
    setLoading(true);
    
    const socket = getSocket();
    socket.emit('request_reframe', { sessionId, thought: thought.trim() });
  };

  useEffect(() => {
    const socket = getSocket();
    socket.on('reframe_response', (data: { text: string }) => {
      setReframed(data.text);
      setLoading(false);
    });

    return () => {
      socket.off('reframe_response');
    };
  }, []);

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-glass animate-in text-center">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-2xl font-black text-emerald-900 mb-2 tracking-tight">Perspective Shift</h3>
        <p className="text-emerald-700 font-medium mb-8 leading-relaxed">
          Reframing helps find balance in our thoughts. <br/> How do you feel now?
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
    <div className="flex flex-col p-8 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-glass animate-in relative overflow-hidden transition-all duration-500">
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
           <Brain size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Perspective Reframe</h3>
        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">Challenge your thoughts</p>
      </div>

      {!reframed ? (
        <div className="space-y-6 animate-in">
           <div className="bg-white/70 p-6 rounded-3xl border border-indigo-100">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Input Thought</label>
              <textarea 
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Ex: I feel like I'm failing at everything right now..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-medium text-lg min-h-[120px] resize-none"
              />
           </div>
           
           <button 
             onClick={handleReframe}
             disabled={loading || !thought.trim()}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 font-black py-4 rounded-3xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
             AI Perspective Reframe
           </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in">
           <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] relative">
              <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
                 <Sparkles size={20} className="text-indigo-400" />
              </div>
              <p className="text-indigo-900 font-bold text-lg leading-relaxed italic">
                &quot;{reframed}&quot;
              </p>
           </div>
           
           <button 
             onClick={() => setCompleted(true)}
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
           >
             Continue <ArrowRight size={20} />
           </button>

           <button 
             onClick={() => { setReframed(''); setThought(''); }}
             className="w-full text-indigo-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition"
           >
             Try Another Thought
           </button>
        </div>
      )}

      <p className="text-[9px] font-bold text-slate-400 mt-8 uppercase tracking-widest text-center italic leading-relaxed opacity-60">
        AI provides a gentle, balanced alternative view. <br/> It is not a clinical assessment.
      </p>

    </div>
  );
}
