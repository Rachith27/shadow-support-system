"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Activity,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  location: string;
  phone: string;
  motivation: string;
  skills: string[];
}

interface InsightSession {
  id: string;
  session_id: string;
  age_group_segment: string;
  topic_category: string;
  ai_summary: string;
  created_at: string;
  chat_type?: string;
}

interface DashboardData {
  totalSessions: number;
  totalBehaviorReports: number;
  flaggedCasesCounts: number;
  riskLevels: { high: number; medium: number; low: number };
  topicInsights: Record<string, number>;
  ageInsights: Record<string, number>;
  recentInsights: InsightSession[];
  volunteers: Volunteer[];
  behaviorReports: Record<string, unknown>[];
  exerciseAdherence: number;
}

interface DashboardResponse {
  totalSessions?: number;
  totalBehaviorReports?: number;
  flaggedCasesCounts?: number;
  riskLevels?: { high: number; medium: number; low: number };
  topicInsights?: Record<string, number>;
  ageInsights?: Record<string, number>;
  recentInsights?: InsightSession[];
  volunteers?: { id: string; fullName?: string; full_name?: string; email: string; status: string; location?: string; phone?: string; motivation?: string; skills?: string[] }[];
  behaviorReports?: Record<string, unknown>[];
  exerciseAdherence?: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'insights' | 'volunteers' | 'reports'>('summary');
  const [mounted, setMounted] = useState(false);
  const nav = useRouter();



  const fetchData = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) {
          localStorage.removeItem('adminToken');
          setIsLoggedIn(false);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d: DashboardResponse) => {
        if (!d) return;
        setData({
          ...d,
          riskLevels: d.riskLevels || { high: 0, medium: 0, low: 0 },
          topicInsights: d.topicInsights || {},
          ageInsights: d.ageInsights || {},
          recentInsights: d.recentInsights || [],
          volunteers: (d.volunteers || []).map((v) => ({
              id: v.id,
              fullName: v.full_name || v.fullName || '',
              email: v.email,
              status: v.status,
              location: v.location || '',
              phone: v.phone || '',
              motivation: v.motivation || '',
              skills: v.skills || []
          })),
          behaviorReports: d.behaviorReports || [],
          exerciseAdherence: d.exerciseAdherence || 0
        } as DashboardData);
        setLoading(false);
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Login failed');
      } else {
        localStorage.setItem('adminToken', json.token);
        setIsLoggedIn(true);
        setError('');
        fetchData();
      }
    } catch {
      setError('Network securely denied.');
    }
  };

  const changeStatus = async (id: string, status: string) => {
    await fetch(`${API_BASE}/admin/volunteers/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (typeof window !== 'undefined' && localStorage.getItem('adminToken')) {
          setIsLoggedIn(true);
          fetchData();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-gray-900" />;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 justify-center items-center px-6 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full max-w-[28rem] relative z-10">
          <div className="text-center mb-8">
            <ShieldCheck size={60} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">System Admin.</h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-bold">Authorized Personnel Only</p>
          </div>
          <form onSubmit={handleLogin} className="bg-gray-800/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-2xl border border-gray-700">
            {error && <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-xl text-sm font-bold flex items-center mb-6"><AlertTriangle size={16} className="mr-2"/>{error}</div>}
            <label className="block mb-4">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Admin Email</span>
              <input required type="email" placeholder="admin@safespace.org" className="w-full bg-gray-900 text-white rounded-2xl p-4 border border-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 font-medium transition" onChange={(e) => setLoginEmail(e.target.value)} />
            </label>
            <label className="block mb-8">
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2 block">Master Password</span>
              <input required type="password" placeholder="••••••••" className="w-full bg-gray-900 text-white rounded-2xl p-4 border border-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 font-medium transition" onChange={(e) => setLoginPassword(e.target.value)} />
            </label>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-extrabold p-5 rounded-full text-lg shadow-xl shadow-emerald-500/20 transition hover:-translate-y-1 active:scale-[0.98]">
              Authenticate & Enter
            </button>
            <button type="button" onClick={() => nav.push('/')} className="w-full mt-4 text-gray-500 text-sm font-bold uppercase hover:text-white transition">Cancel</button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-emerald-400 font-extrabold tracking-widest uppercase text-sm animate-pulse">Decrypting Console...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-16">
      {/* Header */}
      <div className="bg-gray-900 pt-10 pb-20 px-6 md:px-12 text-white relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10">
           <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="bg-gray-800 p-4 rounded-2xl"><ShieldCheck size={32} className="text-emerald-400"/></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Command Center</h1>
                <p className="text-gray-400 font-medium text-sm md:text-base mt-1">Youth Mental Health Oversight</p>
              </div>
           </div>
            <div className="flex gap-4">
              <button disabled={loading} onClick={fetchData} className="bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 p-4 aspect-square rounded-[1rem] transition border border-gray-700 shadow-xl">
                 <RefreshCw size={22} className={loading ? 'animate-spin text-emerald-400' : ''} />
              </button>
              <button 
                onClick={() => { 
                  localStorage.removeItem('adminToken'); 
                  localStorage.removeItem('volunteerToken'); 
                  localStorage.removeItem('volunteerUser'); 
                  window.location.href = '/'; 
                }} 
                className="bg-emerald-500/10 text-emerald-400 font-extrabold px-6 py-4 rounded-[1rem] hover:bg-emerald-500/20 shadow-inner transition border border-emerald-500/20 flex items-center gap-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
           </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 -mt-10 relative z-20">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/50 backdrop-blur-md p-1.5 rounded-[1.8rem] border border-gray-100 shadow-xl w-fit">
          {[
            { id: 'summary', label: 'Summary', icon: Activity },
            { id: 'insights', label: 'Insights & Trends', icon: Activity },
            { id: 'reports', label: 'Observatory Logs', icon: ShieldCheck },
            { id: 'volunteers', label: 'Volunteers', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'summary' | 'insights' | 'volunteers' | 'reports')}
              className={`px-6 py-3 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2
                ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-white'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-8 animate-in fade-in slide-in-top-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                 <div className="bg-sky-50 text-sky-500 w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4"><Activity size={24}/></div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Total Sessions</p>
                 <p className="text-3xl font-black text-gray-800 mt-1">{data.totalSessions}</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                 <div className="bg-orange-50 text-orange-500 w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4"><Activity size={24}/></div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Reports Logged</p>
                 <p className="text-3xl font-black text-gray-800 mt-1">{data.totalBehaviorReports}</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                 <div className="bg-rose-50 text-rose-500 w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4"><AlertTriangle size={24}/></div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">High Distress</p>
                 <p className="text-3xl font-black text-rose-600 mt-1">{data.riskLevels.high}</p>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                 <div className="bg-emerald-50 text-emerald-500 w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4"><Users size={24}/></div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Support Team</p>
                 <p className="text-3xl font-black text-gray-800 mt-1">{data.volunteers.length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
               <h2 className="text-xl font-black text-gray-900 mb-6 px-2 italic">Emerging Problem Areas</h2>
               <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(data.topicInsights).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([topic, count]) => (
                    <div key={topic} className="bg-gray-50 border border-gray-100 p-6 rounded-3xl group hover:bg-emerald-600 transition-colors duration-300">
                       <p className="text-xs font-black text-emerald-600 uppercase tracking-widest group-hover:text-emerald-100 transition-colors mb-1">{count} Cases Identified</p>
                       <h3 className="text-xl font-black text-gray-800 group-hover:text-white transition-colors">{topic}</h3>
                    </div>
                  ))}
                  {Object.keys(data.topicInsights).length === 0 && <p className="col-span-3 py-12 text-center text-gray-400 font-bold uppercase tracking-widest border border-dashed rounded-3xl">Collecting data for analysis...</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8 animate-in fade-in slide-in-top-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Topic Distribution */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">Main Issues by Category</h3>
                <div className="space-y-4">
                   {Object.entries(data.topicInsights).map(([topic, count]) => (
                     <div key={topic}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tighter mb-2">
                           <span className="text-gray-600">{topic}</span>
                           <span className="text-emerald-600">{count}</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-emerald-500 transition-all duration-1000" 
                             style={{ width: `${(count / data.totalSessions) * 100}%` }}
                           />
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Age Group Trends */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">User Demographics (Age)</h3>
                <div className="space-y-4">
                   {Object.entries(data.ageInsights).map(([age, count]) => (
                     <div key={age}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tighter mb-2">
                           <span className="text-gray-600">{age} yrs</span>
                           <span className="text-cyan-600">{count}</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-cyan-500 transition-all duration-1000" 
                             style={{ width: `${(count / data.totalSessions) * 100}%` }}
                           />
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Recent Analysis Feed */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
               <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest px-2">Longitudinal Session Analysis</h3>
               <div className="space-y-4">
                  {data.recentInsights.map(s => (
                    <div key={s.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:shadow-md transition">
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                          <div className="flex items-center gap-3">
                             <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                {s.topic_category}
                             </div>
                             <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100 uppercase tracking-widest">
                                Age {s.age_group_segment}
                             </div>
                             <div className={`bg-white px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest ${s.chat_type === 'safe' ? 'text-indigo-600 border-indigo-100' : 'text-slate-400 border-slate-100'}`}>
                                {s.chat_type === 'safe' ? 'Safe Chat' : 'Anonymous'}
                             </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             {new Date(s.created_at).toLocaleDateString()} at {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <p className="text-gray-700 leading-relaxed font-medium italic">&quot;{s.ai_summary}&quot;</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10 animate-in fade-in slide-in-top-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8 italic">Comprehensive Observatory Logs</h2>
            <div className="space-y-6">
              {data.behaviorReports.map((r) => (
                <div key={r.id} className="bg-gray-50 border border-gray-100 p-8 rounded-[2rem] hover:shadow-lg transition duration-300">
                   <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                            {r.student_name?.[0] || '?'}
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-gray-900">{r.student_name || 'Anonymous Student'}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                               <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{r.student_age ? `${r.student_age} yrs` : 'Age Unknown'}</span>
                               <span>at {r.school_name || 'Unknown School'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex flex-col lg:items-end gap-2 text-right">
                         <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            {new Date(r.timestamp).toLocaleDateString()} at {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {r.student_phone && <span className="text-xs font-bold text-sky-600">Contact: {r.student_phone}</span>}
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                      <div className="space-y-4">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Observation Mood</p>
                            <span className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-gray-100 shadow-sm">{r.mood}</span>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Behavior Changes</p>
                            <div className="flex flex-wrap gap-2">
                               {(r.behavior_changes || []).map((c: string) => (
                                 <span key={c} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">{c}</span>
                               ))}
                            </div>
                         </div>
                      </div>
                      <div className="bg-white/50 p-6 rounded-3xl border border-gray-100">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 italic">Reporter Context & Notes</p>
                         <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {r.notes ? `"${r.notes}"` : "No extra context provided by the reporter."}
                         </p>
                      </div>
                   </div>
                </div>
              ))}
              {data.behaviorReports.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                   <p className="text-gray-400 font-bold uppercase tracking-widest">No observations recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10 animate-in fade-in slide-in-top-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-8">Support Team Moderation</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[800px] flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-black tracking-widest uppercase text-gray-400 border-b-2 border-gray-100 mb-2">
                  <div className="col-span-3">Profile Identity</div>
                  <div className="col-span-3">Contact Details</div>
                  <div className="col-span-3">Motivation & Skills</div>
                  <div className="col-span-3 text-right">Moderation</div>
                </div>
                {data.volunteers.map((v) => (
                  <div key={v.id} className="grid grid-cols-12 gap-4 items-center bg-white border border-gray-100 p-4 px-6 rounded-3xl hover:shadow-md transition">
                    <div className="col-span-3">
                      <p className="font-extrabold text-gray-900">{v.fullName}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${v.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>{v.status}</p>
                    </div>
                    <div className="col-span-3 text-sm font-medium text-gray-600">
                      <p className="text-sky-600 font-bold">{v.email}</p>
                      <p className="text-xs text-gray-400 mt-1">{v.location}</p>
                    </div>
                    <div className="col-span-3 text-sm">
                      <p className="text-gray-600 line-clamp-2 italic text-xs">&quot;{v.motivation}&quot;</p>
                    </div>
                    <div className="col-span-3 flex justify-end gap-2">
                      {v.status === 'pending' ? (
                        <>
                          <button onClick={() => changeStatus(v.id, 'approved')} className="bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl border border-emerald-200 hover:bg-emerald-500 hover:text-white transition">Approve</button>
                          <button onClick={() => changeStatus(v.id, 'rejected')} className="bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl border border-rose-200">Reject</button>
                        </>
                      ) : (
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">Closed</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
