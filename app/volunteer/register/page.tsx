"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function VolunteerRegister() {
  const [formData, setFormData] = useState({ 
      fullName: '', 
      email: '', 
      phone: '', 
      location: '', 
      skills: '', 
      availability: '', 
      motivation: '', 
      password: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();



  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/volunteer/register`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData, 
            skills: formData.skills.split(',').map(s => s.trim()) 
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (submitted) return (
     <div className="flex flex-col min-h-screen bg-transparent items-center justify-center p-6 text-center">
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl max-w-2xl border border-white">
          <UserPlus size={80} className="text-emerald-500 bg-emerald-50 p-5 rounded-full shadow-inner mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Application Submitted</h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium">Your registration is 'Pending'. NGO moderation team must approve your profile before you gain access to the dashboard.</p>
          <button onClick={() => router.push('/')} className="w-full bg-emerald-600 text-white rounded-full py-5 text-xl font-bold shadow-xl hover:-translate-y-1 transition active:scale-[0.98]">Return to Home</button>
        </div>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen py-4 px-4 md:py-12 relative items-center justify-center">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col relative z-20">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center bg-white/90 z-10 text-gray-800">
          <button onClick={() => router.push('/')} className="mr-4 p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition"><ArrowLeft size={22}/></button>
          <span className="font-extrabold tracking-tight text-xl md:text-2xl">Volunteer Registration</span>
        </div>
        
        <form onSubmit={submit} className="p-6 md:p-10 space-y-6 overflow-y-auto pb-safe-bottom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Full Name<input required className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, fullName: e.target.value})} /></label>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Email Address<input required type="email" className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, email: e.target.value})} /></label>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Phone Number<input required type="tel" className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, phone: e.target.value})} /></label>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Location / Area<input required className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, location: e.target.value})} /></label>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Skills (Comma separated)<input required placeholder="listening, mentoring..." className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, skills: e.target.value})} /></label>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Availability<input required placeholder="Weekends, Afternoons..." className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, availability: e.target.value})} /></label>
          </div>
          
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Secure Password<input required type="password" placeholder="Create a password" className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" onChange={e => setFormData({...formData, password: e.target.value})} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Motivation<textarea required rows={4} className="w-full bg-white/60 backdrop-blur border-2 border-transparent p-4 rounded-2xl mt-2 text-base font-medium focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-50 shadow-inner transition" placeholder="Why do you want to help youthful minds?" onChange={e => setFormData({...formData, motivation: e.target.value})} /></label>

          <button type="submit" className="w-full md:w-auto md:px-16 mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full py-5 text-xl font-bold shadow-xl hover:-translate-y-1 transition active:scale-[0.98]">Submit Application</button>
        </form>
      </div>
    </div>
  );
}
