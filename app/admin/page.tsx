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

interface DashboardData {
  totalSessions: number;
  totalBehaviorReports: number;
  flaggedCasesCounts: number;
  pendingVolunteersCount: number;
  riskLevels: { high: number; medium: number; low: number };
  volunteers: Volunteer[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nav = useRouter();

  const API_BASE = 'http://localhost:4000/api'; // Express backend URL

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

  const fetchData = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) {
          // Token is invalid/expired — clear it and show login
          localStorage.removeItem('adminToken');
          setIsLoggedIn(false);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setData({
          ...d,
          riskLevels: d.riskLevels || { high: 0, medium: 0, low: 0 },
          volunteers: (d.volunteers || []).map((v: any) => ({
              id: v.id,
              fullName: v.full_name || v.fullName,
              email: v.email,
              status: v.status,
              location: v.location,
              phone: v.phone,
              motivation: v.motivation,
              skills: v.skills || []
          }))
        } as DashboardData);
        setLoading(false);
      });
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
    setMounted(true);
    // Basic check for token on mount, if it exists try to fetch data
    if (typeof window !== 'undefined' && localStorage.getItem('adminToken')) {
        setIsLoggedIn(true);
        fetchData();
    }
  }, []);

  // Prevent hydration mismatch - show nothing until mounted
  if (!mounted) return <div className="min-h-screen bg-gray-900" />;

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 justify-center items-center px-6 relative overflow-hidden">
        
        {/* Deep Tech Admin Decor */}
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16">
      {/* Premium Desktop Header */}
      <div className="bg-gray-900 pt-10 pb-20 px-6 md:px-12 text-white relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10">
           
           <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="bg-gray-800 p-4 rounded-2xl"><ShieldCheck size={32} className="text-emerald-400"/></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight tracking-tight">Command Center</h1>
                <p className="text-gray-400 font-medium text-sm md:text-base mt-1">Platform Telemetry & Team Moderation</p>
              </div>
           </div>

           <div className="flex gap-4">
              <button disabled={loading} onClick={fetchData} className="bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 p-4 aspect-square rounded-[1rem] transition flex items-center justify-center border border-gray-700 shadow-xl">
                 <RefreshCw size={22} className={loading ? 'animate-spin text-emerald-400' : ''} />
              </button>
              <button onClick={() => { localStorage.removeItem('adminToken'); setIsLoggedIn(false); nav.push('/'); }} className="bg-emerald-500/10 text-emerald-400 font-extrabold px-6 py-4 rounded-[1rem] hover:bg-emerald-500/20 flex items-center shadow-inner transition border border-emerald-500/20">
                <LogOut size={20} className="mr-3" /> Terminate Session
              </button>
           </div>
           
         </div>
      </div>

      {/* Grid shifts up to overlap header elegantly */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 -mt-10 relative z-20 space-y-8">
        
        {/* Metric Row -> 4 columns on large screens! */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-gray-100 flex items-center transform hover:-translate-y-1 transition duration-300">
             <div className="bg-sky-50 text-sky-500 p-4 rounded-[1rem] mr-4"><Activity size={24}/></div>
             <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase line-clamp-1">Total Chat Sessions</p>
                <p className="text-2xl md:text-3xl font-black text-gray-800">{data.totalSessions}</p>
             </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-gray-100 flex items-center transform hover:-translate-y-1 transition duration-300">
             <div className="bg-orange-50 text-orange-500 p-4 rounded-[1rem] mr-4"><Activity size={24}/></div>
             <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase line-clamp-1">Behavior Reports</p>
                <p className="text-2xl md:text-3xl font-black text-gray-800">{data.totalBehaviorReports}</p>
             </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-gray-100 flex items-center transform hover:-translate-y-1 transition duration-300">
             <div className="bg-rose-50 text-rose-500 p-4 rounded-[1rem] mr-4"><AlertTriangle size={24}/></div>
             <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase line-clamp-1">High-Risk Cases</p>
                <p className="text-2xl md:text-3xl font-black text-rose-600">{data.riskLevels?.high ?? 0}</p>
             </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-gray-100 flex items-center transform hover:-translate-y-1 transition duration-300">
             <div className="bg-emerald-50 text-emerald-500 p-4 rounded-[1rem] mr-4"><Users size={24}/></div>
             <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase line-clamp-1">Pending Volunteers</p>
                <p className="text-2xl md:text-3xl font-black text-gray-800">{data.pendingVolunteersCount}</p>
             </div>
          </div>
        </div>

        {/* Volunteer List spans full width but nicely formatted */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mb-8">Volunteer Moderation Queue</h2>
          
          {data.volunteers.length === 0 ? (
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest py-10 text-center bg-gray-50 rounded-3xl border border-dashed">No sign-ups recorded yet.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <div className="min-w-[800px] flex flex-col gap-3">
                
                {/* Custom Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-black tracking-widest uppercase text-gray-400 border-b-2 border-gray-100 mb-2">
                  <div className="col-span-3">Profile Identity</div>
                  <div className="col-span-3">Contact & Area</div>
                  <div className="col-span-3">Motivation/Skills</div>
                  <div className="col-span-3 text-right">Moderation Action</div>
                </div>

                {data.volunteers.map((v) => (
                  <div key={v.id} className="grid grid-cols-12 gap-4 items-center bg-white border border-gray-100 p-4 px-6 rounded-3xl hover:shadow-md transition">
                    
                    <div className="col-span-3">
                      <p className="font-extrabold text-gray-900">{v.fullName}</p>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Status: <span className={v.status === 'approved' ? 'text-emerald-500' : v.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}>{v.status}</span></p>
                    </div>
                    
                    <div className="col-span-3 text-sm font-medium text-gray-600 space-y-1">
                      <p className="text-sky-600 font-bold">{v.email}</p>
                      <p>{v.location}</p>
                      <p className="text-xs text-gray-400">{v.phone}</p>
                    </div>

                    <div className="col-span-3 text-sm">
                      <p className="text-gray-600 line-clamp-2 italic mb-2">"{v.motivation}"</p>
                      <div className="flex flex-wrap gap-1">
                        {(v.skills || []).map(s=><span key={s} className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">{s}</span>)}
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-end gap-2">
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => changeStatus(v.id, 'approved')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs uppercase px-4 py-3 rounded-xl border border-emerald-200 transition">Approve</button>
                          <button onClick={() => changeStatus(v.id, 'rejected')} className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase px-4 py-3 rounded-xl border border-rose-200 transition">Reject</button>
                        </>
                      )}
                      {v.status !== 'pending' && (
                         <div className="text-xs font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">Closed File</div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
