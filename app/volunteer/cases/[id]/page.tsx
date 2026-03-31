"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle, 
  XSquare, 
  Info,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import VolunteerChat from '@/components/volunteer/VolunteerChat';

export default function InterventionGuide() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const API_BASE = 'http://localhost:4000/api';

  const fetchCaseDetail = async () => {
    const token = localStorage.getItem('volunteerToken');
    if (!token) return router.push('/volunteer/login');

    try {
      const res = await fetch(`${API_BASE}/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCaseData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    const token = localStorage.getItem('volunteerToken');
    try {
      await fetch(`${API_BASE}/cases/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (status === 'resolved') {
        router.push('/volunteer/cases');
      } else {
        fetchCaseDetail();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  if (!caseData) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold text-gray-800">Intervention File Not Found</h2>
      <button onClick={() => router.push('/volunteer/cases')} className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Back to Queue</button>
    </div>
  );

  const g = caseData.guidance || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm transition-all sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/volunteer/cases')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"><ArrowLeft size={20}/></button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Intervention Guide</h1>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
            ${caseData.risk_level === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {caseData.risk_level} Risk Level
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Status */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Context</h3>
             </div>
             <h2 className="text-xl font-bold text-gray-800 mb-4 leading-tight">{caseData.detected_concern}</h2>
             <p className="text-sm text-gray-500 leading-relaxed italic mb-6">"{caseData.ai_summary}"</p>
             
             <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                   <span className="text-gray-400">Current Status</span>
                   <span className="text-sky-600">{caseData.intervention_status}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                   <span className="text-gray-400">Target Group</span>
                   <span className="text-gray-900">{caseData.age_group}</span>
                </div>
             </div>
           </div>

             {/* Live Chat Session Context (If available) */}
             {caseData.sessionContext && (
                <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden ring-4 ring-emerald-500/20">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                   <div className="flex items-center gap-2 mb-6">
                      <Clock size={18} className="text-emerald-300" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-emerald-300">Live Session Profile</h3>
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Student Identity</p>
                         <p className="text-lg font-black">{caseData.sessionContext.user_name || 'Anonymous'}</p>
                         <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{caseData.sessionContext.age_group || 'Age Unknown'}</span>
                         </div>
                      </div>

                      {caseData.sessionContext.phone && (
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Contact Number</p>
                            <p className="text-sm font-bold text-emerald-100">{caseData.sessionContext.phone}</p>
                         </div>
                      )}

                      <div className="pt-4 border-t border-white/10">
                         <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2 flex items-center gap-2">
                               <ShieldCheck size={12}/> Human Protocol
                            </p>
                            <p className="text-[11px] font-bold leading-relaxed text-white italic">
                               "Coordinate support via the Safe Chat interface first. Attempt to resolve or de-escalate through text before placing a voice call."
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             )}

            {/* NGO Observatory Context (If available) */}
            {caseData.reportContext && (
               <div className="bg-indigo-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden ring-4 ring-indigo-500/20">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 mb-6">
                     <ShieldCheck size={18} className="text-indigo-300" />
                     <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300">Staff Observation File</h3>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Student Identity</p>
                        <p className="text-lg font-black">{caseData.reportContext.student_name || 'Anonymous'}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                           <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{caseData.reportContext.student_age ? `${caseData.reportContext.student_age} yrs` : 'Age Unknown'}</span>
                           <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">at {caseData.reportContext.school_name || 'Unknown School'}</span>
                        </div>
                     </div>

                     {caseData.reportContext.student_phone && (
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Contact Details</p>
                           <p className="text-sm font-bold text-indigo-100">{caseData.reportContext.student_phone}</p>
                        </div>
                     )}

                     <div className="pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Internal Staff Notes</p>
                        <p className="text-sm italic leading-relaxed text-indigo-100">
                           "{caseData.reportContext.notes || 'No specific notes provided.'}"
                        </p>
                     </div>
                  </div>
               </div>
            )}

           <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-300 mb-4">Action Control</h3>
              <div className="space-y-3">
                 {caseData.intervention_status === 'pending' && (
                    <button 
                      onClick={() => updateStatus('in_progress')}
                      disabled={updating}
                      className="w-full bg-white text-emerald-900 font-bold py-3.5 rounded-2xl transition hover:bg-emerald-50 shadow-md">
                      Accept & Start
                    </button>
                 )}
                 <button 
                   onClick={() => updateStatus('resolved')}
                   disabled={updating}
                   className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition hover:bg-emerald-400 shadow-md">
                   Mark as Resolved
                 </button>
              </div>
              <p className="text-[10px] text-emerald-300/60 text-center mt-6 uppercase font-bold tracking-widest leading-relaxed">
                 Resolving this case will remove it from the active queue.
              </p>
           </div>
        </div>

        {/* Right Column: AI Guidance & Live Chat */}
        <div className="md:col-span-2 space-y-8">
           
           {/* Section: Live Chat Hand-off */}
           {caseData.session_id && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner"><Zap size={18}/></div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Live Human Intervention</h2>
                 </div>
                 <VolunteerChat 
                    sessionId={caseData.session_id} 
                    volunteerName="SafeSpace Counselor" 
                 />
              </div>
           )}
           
           {/* Section: Approach */}
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-50" />
              <div className="flex items-center gap-3 mb-6 relative">
                 <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner"><ShieldCheck size={22}/></div>
                 <h2 className="text-2xl font-black text-gray-800 tracking-tight">AI Observation & Approach</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
                {g.approach || "Gently approach the individual in a safe, private space."}
              </p>

              <div className="space-y-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Suggested Dialogue</h3>
                 <div className="space-y-3">
                    {(g.whatToSay || []).map((t: string, i: number) => (
                       <div key={i} className="bg-gray-50 p-5 rounded-2xl flex items-start gap-3 border border-gray-100/50">
                          <MessageSquare size={18} className="text-sky-400 mt-1 flex-shrink-0" />
                          <p className="text-gray-700 font-bold italic">"{t}"</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Section: Dos & Don'ts */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black"><CheckCircle size={18}/></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Dos</h3>
                 </div>
                 <ul className="space-y-4">
                    {(g.dos || []).map((item: string, i: number) => (
                       <li key={i} className="text-sm font-medium text-gray-600 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black"><XSquare size={18}/></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Don'ts</h3>
                 </div>
                 <ul className="space-y-4">
                    {(g.donts || []).map((item: string, i: number) => (
                       <li key={i} className="text-sm font-medium text-gray-600 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>

           </div>

           {/* Escalation reminder */}
           <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
              <Clock size={20} className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                 <p className="text-sm font-bold text-amber-800 tracking-tight">Timely Support Matters</p>
                 <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                   If the situation seems critical or presents immediate danger, follow your local NGO's physical escalation protocol immediately.
                 </p>
              </div>
           </div>

        </div>

      </main>
    </div>
  );
}
