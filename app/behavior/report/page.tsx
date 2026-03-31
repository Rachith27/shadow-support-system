"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function BehaviorReport() {
  const [data, setData] = useState<{
    reporterType: string;
    ageGroup: string;
    mood: string;
    behaviorChanges: string[];
    socialFlags: string[];
    notes: string;
    studentName: string;
    schoolName: string;
    studentPhone: string;
    studentAge: string;
  }>({ 
    reporterType: 'teacher', 
    ageGroup: '11-14', 
    mood: 'Sad', 
    behaviorChanges: [], 
    socialFlags: [], 
    notes: '',
    studentName: '',
    schoolName: '',
    studentPhone: '',
    studentAge: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const API_BASE = 'http://localhost:4000/api';

  const toggle = (field: 'behaviorChanges' | 'socialFlags', val: string) => {
    setData(prev => ({
      ...prev, 
      [field]: prev[field].includes(val) 
        ? prev[field].filter(x => x !== val) 
        : [...prev[field], val]
    }));
  };

  const submit = async () => {
    try {
      await fetch(`${API_BASE}/behavior/report`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit report:", err);
    }
  };

  if (submitted) return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center bg-white/40 backdrop-blur-xl">
      <div className="bg-white/80 p-12 md:p-20 rounded-[3rem] shadow-2xl border border-white max-w-2xl">
        <div className="flex justify-center mb-8"><CheckCircle size={100} className="text-emerald-500 bg-emerald-50 rounded-full p-4 shadow-inner" /></div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gray-800 tracking-tight">Observation Logged securely.</h2>
        <p className="text-gray-500 text-lg md:text-xl mb-12 leading-relaxed font-medium max-w-lg mx-auto">Thank you for supporting our youth. An intervention has been queued for a trained volunteer to review safely and anonymously.</p>
        <button onClick={() => router.push('/')} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-full py-5 text-xl rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition active:scale-[0.98]">Return to Home</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen py-4 px-4 md:py-12 relative items-center justify-center">
      
      {/* Centered Glass Form Container for Desktops */}
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col h-[90vh] md:h-auto md:min-h-[80vh] relative z-20">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center bg-white/50 z-10 text-gray-800">
          <button className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition" onClick={() => router.push('/')}><ArrowLeft size={22}/></button>
          <span className="font-extrabold tracking-tight text-xl md:text-2xl">Adult Observation Report</span>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 bg-gradient-to-b from-transparent to-gray-50/30 pb-safe-bottom">
          <div className="bg-amber-50 shadow-sm text-amber-800 p-5 md:p-6 rounded-3xl text-sm font-semibold leading-relaxed border border-amber-200/50">
             <span className="font-bold uppercase tracking-widest text-[11px] block text-amber-600 mb-2">Note to Adults</span>
             This system uses AI to map behaviors to intervention tactics. We do not digitally diagnose. Please use factual observations.
          </div>

          {/* New Identification Section */}
          <div className="space-y-6">
            <label className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">0</div> 
              Student Identification
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Student Full Name" 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl text-base font-medium focus:outline-none focus:border-indigo-400 transition-all"
                value={data.studentName}
                onChange={e => setData({...data, studentName: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="School Name" 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl text-base font-medium focus:outline-none focus:border-indigo-400 transition-all"
                value={data.schoolName}
                onChange={e => setData({...data, schoolName: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Student Age" 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl text-base font-medium focus:outline-none focus:border-indigo-400 transition-all"
                value={data.studentAge}
                onChange={e => setData({...data, studentAge: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="Student/Guardian Phone (Optional)" 
                className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl text-base font-medium focus:outline-none focus:border-indigo-400 transition-all md:col-span-2"
                value={data.studentPhone}
                onChange={e => setData({...data, studentPhone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">1</div> Their Primary Mood</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['Happy', 'Sad', 'Angry', 'Fearful', 'Flat'].map(m => (
                <button key={m} onClick={() => setData({...data, mood: m})} 
                  className={`p-4 rounded-2xl text-sm font-bold border-2 transition hover:-translate-y-0.5 shadow-sm ${data.mood === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100' : 'border-gray-100 text-gray-500 bg-white hover:border-gray-200'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">2</div> Sudden Behavior Changes</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['silent', 'crying often', 'sudden anger', 'avoiding school'].map(c => (
                <button key={c} onClick={() => toggle('behaviorChanges', c)} 
                  className={`p-4 rounded-2xl text-sm font-bold border-2 transition capitalize shadow-sm ${data.behaviorChanges.includes(c) ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sky-100' : 'border-gray-100 text-gray-500 bg-white hover:border-gray-200'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">3</div> Context & Notes</label>
            <textarea rows={4} className="w-full bg-white/60 backdrop-blur border-2 border-gray-100 p-5 rounded-3xl text-base font-medium focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 shadow-inner transition-all" 
            placeholder="Describe any specific triggering event that happened today..." onChange={e => setData({...data, notes: e.target.value})} />
          </div>

          <button onClick={submit} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 text-xl rounded-[2rem] font-black shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-1 transition active:scale-[0.98]">
             Analyze & Log securely
          </button>
        </div>
      </div>
    </div>
  );
}
