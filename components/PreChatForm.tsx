"use client";

import { useState } from "react";
import { User, Phone, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

interface PreChatFormProps {
  onSubmit: (data: { name: string; age: string; phone?: string }) => void;
}

export default function PreChatForm({ onSubmit }: PreChatFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 transition-all">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-emerald-50 p-8 md:p-10 scale-in shadow-emerald-100/50">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Before we begin...</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            This helps us provide better support and understand youth challenges anonymously.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name/Nickname */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              Name or Nickname
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <User size={18} className="text-gray-400" />
              <input 
                required
                type="text" 
                placeholder="What should we call you?"
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
              How old are you?
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <Calendar size={18} className="text-gray-400" />
              <select 
                required
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium appearance-none"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              >
                <option value="" disabled>Select your age group</option>
                <option value="13-15">13–15</option>
                <option value="16-18">16–18</option>
                <option value="18-21">18–21</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Phone Number
              </label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Optional</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <Phone size={18} className="text-gray-400" />
              <input 
                type="tel" 
                placeholder="0000 000 000"
                className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
             <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-tight text-center">
                🔒 Strictly Anonymous: All data is aggregated for high-level insights. We do not digitally track your identity.
             </p>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            Start Conversation
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
