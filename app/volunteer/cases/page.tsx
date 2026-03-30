"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, ClipboardList, Filter } from 'lucide-react';
import CaseCard from '@/components/CaseCard';

export default function VolunteerCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');
  const router = useRouter();

  const API_BASE = 'http://localhost:4000/api';

  const fetchCases = async () => {
    setLoading(true);
    const token = localStorage.getItem('volunteerToken');
    if (!token) {
      router.push('/volunteer/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch cases');
      const data = await res.json();
      setCases(data);
    } catch (err) {
      setError('Failed to load active cases.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = filter === 'all' 
    ? cases 
    : cases.filter(c => c.risk_level === filter);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/volunteer/dashboard')}
              className="p-2.5 hover:bg-gray-50 rounded-full transition text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Intervention Queue</h1>
          </div>
          
          <button 
            onClick={fetchCases}
            disabled={loading}
            className="p-2.5 hover:bg-gray-50 rounded-full transition text-emerald-600 disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {/* Intro */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ClipboardList size={22}/>
            </div>
            <h2 className="text-2xl font-black text-gray-800">Active Cases</h2>
          </div>
          <p className="text-gray-500 font-medium">Review and provide support for students flagged by proxy observations.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <Filter size={18} className="text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'high', 'medium'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition
                  ${filter === f 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:border-emerald-200 hover:text-emerald-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading queue...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 p-10 rounded-[2.5rem] border border-rose-100 text-center">
            <p className="text-rose-600 font-bold">{error}</p>
            <button onClick={fetchCases} className="mt-4 text-emerald-600 font-black uppercase text-xs tracking-widest">Try Again</button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-gray-50 p-20 rounded-[3rem] border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest">No active cases found.</p>
            <p className="text-sm text-gray-400 mt-2">All students are currently in a safe state.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map(c => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
