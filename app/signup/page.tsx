"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, User, Calendar } from "lucide-react";
import Link from "next/link";
import { API_BASE } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    full_name: "",
    age_group: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name || !formData.age_group) {
        setError("All fields are required.");
        return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_name", data.user.full_name);
      localStorage.setItem("user_age", data.user.age_group);

      router.push("/safe-chat");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg relative overflow-hidden py-12">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      
      <div className="relative z-10 max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-8 md:p-10 scale-in shadow-brand-navy/5">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-brand-bg text-brand-teal flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <User size={28} />
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create Profile</h1>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            Start your ongoing, secure support journey.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl mb-6 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block mb-2 px-1">
              Nickname or Name
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-brand-teal focus-within:bg-white transition-all shadow-inner">
              <User size={18} className="text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="What should we call you?"
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block mb-2 px-1">
              Age Group
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-brand-teal focus-within:bg-white transition-all shadow-inner">
              <Calendar size={18} className="text-gray-400" />
              <select 
                required
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium appearance-none"
                value={formData.age_group}
                onChange={(e) => setFormData({...formData, age_group: e.target.value})}
              >
                <option value="" disabled>Select your age group</option>
                <option value="13-15">13–15</option>
                <option value="16-18">16–18</option>
                <option value="18-21">18–21</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block mb-2 px-1">
              Email Address
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-brand-teal focus-within:bg-white transition-all shadow-inner">
              <Mail size={18} className="text-gray-400" />
              <input 
                required
                type="email" 
                placeholder="you@example.com"
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block mb-2 px-1">
              Password
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-brand-teal focus-within:bg-white transition-all shadow-inner">
              <Lock size={18} className="text-gray-400" />
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-brand-navy hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-navy/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-teal hover:text-teal-700 underline underline-offset-4 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
