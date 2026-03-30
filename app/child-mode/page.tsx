"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const EMOJIS = [
    { label: 'Happy', e: '😊', color: 'bg-amber-100/50 hover:bg-amber-100 text-amber-600' }, 
    { label: 'Sad', e: '😢', color: 'bg-blue-100/50 hover:bg-blue-100 text-blue-600' }, 
    { label: 'Angry', e: '😡', color: 'bg-rose-100/50 hover:bg-rose-100 text-rose-600' }, 
    { label: 'Scared', e: '😨', color: 'bg-violet-100/50 hover:bg-violet-100 text-violet-600' }
];

const PLACES = [
    { label: 'School', e: '🏫', color: 'bg-sky-50 hover:bg-sky-100 text-sky-700' }, 
    { label: 'Home', e: '🏠', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' }, 
    { label: 'Friends', e: '👫', color: 'bg-teal-50 hover:bg-teal-100 text-teal-700' }, 
    { label: 'Online', e: '📱', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' }
];

interface ChildData {
    mood?: string;
    place?: string;
}

export default function ChildMode() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ChildData>({});
  const router = useRouter();

  const handleTalk = async (talk: boolean) => {
    try {
        await fetch('http://localhost:4000/api/behavior/report', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reporterType: 'volunteer', 
                ageGroup: 'Under 10', 
                mood: data.mood, 
                behaviorChanges: talk ? ['silent'] : ['avoiding school'], 
                notes: `Location context: ${data.place}` 
            })
        });
    } catch (err) {
        console.error("Failed to submit child report:", err);
    }
    setStep(4);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 md:p-12 relative overflow-hidden bg-gray-50">
      <button onClick={() => router.push('/')} className="absolute top-6 left-6 p-4 bg-white/60 backdrop-blur-md rounded-full shadow-md hover:scale-110 transition z-10"><ArrowLeft size={28}/></button>
      
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-300/30 via-pink-300/30 to-sky-300/30 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }}/>

      <div className="flex flex-col justify-center w-full max-w-4xl mx-auto z-10 transition-all">
        {step === 1 && (
          <>
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-gray-800 tracking-tight drop-shadow-sm">How do you feel?</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {EMOJIS.map(o => (
              <button key={o.label} onClick={() => { setData({...data, mood: o.label}); setStep(2); }} className={`group flex flex-col items-center justify-center p-8 md:p-12 rounded-[3rem] shadow-lg border border-white/50 backdrop-blur-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ${o.color}`}>
                 <span className="text-7xl md:text-[6rem] group-hover:animate-bounce">{o.e}</span>
                 <span className="block text-lg md:text-2xl font-extrabold mt-6 uppercase tracking-widest text-center opacity-80">{o.label}</span>
              </button>
            ))}
          </div>
          </>
        )}
        
        {step === 2 && (
          <>
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-gray-800 tracking-tight drop-shadow-sm">Where did this happen?</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {PLACES.map(o => (
              <button key={o.label} onClick={() => { setData({...data, place: o.label}); setStep(3); }} className={`group flex flex-col items-center justify-center p-8 md:p-12 rounded-[3rem] shadow-lg border border-white/50 backdrop-blur-xl transform hover:scale-105 active:scale-95 transition-all duration-300 ${o.color}`}>
                 <span className="text-7xl md:text-[6rem] group-hover:-rotate-12 transition-transform">{o.e}</span>
                 <span className="block text-lg md:text-2xl font-extrabold mt-6 uppercase tracking-widest text-center opacity-80">{o.label}</span>
              </button>
            ))}
          </div>
          </>
        )}
        
        {step === 3 && (
          <>
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-gray-800 tracking-tight drop-shadow-sm">Do you want to talk?</h2>
          <div className="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto w-full">
             <button onClick={() => handleTalk(true)} className="flex-1 bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white text-5xl md:text-6xl font-black py-12 md:py-20 rounded-[3rem] shadow-xl border-b-[12px] md:border-b-[16px] border-emerald-800 transform active:translate-y-4 active:border-b-0 transition-all flex flex-col items-center gap-4">👍 <span className="text-2xl md:text-4xl uppercase tracking-widest">YES</span></button>
             <button onClick={() => handleTalk(false)} className="flex-1 bg-white/80 hover:bg-white backdrop-blur-lg text-gray-400 hover:text-gray-500 text-5xl md:text-6xl font-black py-12 md:py-20 rounded-[3rem] shadow-lg border-4 md:border-8 border-gray-100 border-b-[12px] md:border-b-[16px] transform active:translate-y-4 active:border-b-4 transition-all flex flex-col items-center gap-4">👎 <span className="text-2xl md:text-4xl uppercase tracking-widest">NO</span></button>
          </div>
          </>
        )}
        
        {step === 4 && (
          <div className="text-center animate-pulse bg-white/70 backdrop-blur-2xl p-12 md:p-24 rounded-[4rem] shadow-2xl max-w-2xl mx-auto border border-white">
             <CheckCircle size={100} className="text-emerald-500 mx-auto mb-8 drop-shadow-md" />
             <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">You are safe here.</h2>
             <p className="mt-6 text-xl md:text-2xl text-gray-600 font-bold leading-relaxed">A friendly volunteer will sit with you soon.</p>
             <button onClick={() => router.push('/')} className="mt-12 bg-white px-12 py-6 rounded-full font-bold text-gray-500 hover:text-emerald-700 hover:shadow-lg border-2 border-gray-200 w-full text-xl transition-all">Finish & Return</button>
          </div>
        )}
      </div>
    </div>
  );
}
