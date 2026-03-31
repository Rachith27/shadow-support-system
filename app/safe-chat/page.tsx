"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquare, LogOut, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  session_id: string;
  title: string;
  created_at: string;
}

export default function SafeChatHub() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const userId = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name");

    if (!token || !userId) {
      router.push("/login");
      return;
    }

    if (name) setUserName(name);

    fetch(`http://localhost:4000/api/session/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.sessions) setSessions(data.sessions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_age");
    router.push("/");
  };

  const startNewSession = async () => {
    // Generate new sessionId and redirect
    const newSessionId = crypto.randomUUID();
    const userId = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name");
    const age = localStorage.getItem("user_age");

    try {
      const res = await fetch("http://localhost:4000/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSessionId,
          userId,
          userName: name,
          ageGroup: age,
          chatType: "safe"
        })
      });
      if (res.ok) {
        router.push(`/chat?sessionId=${newSessionId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `radial-gradient(var(--color-brand-teal) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      {/* Header */}
      <header className="h-20 glass-effect border-b border-slate-200/50 px-6 flex items-center justify-between relative z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-premium flex items-center justify-center text-xl">
            💙
          </div>
          <div>
            <h1 className="font-bold text-brand-navy tracking-tight">Welcome, {userName}</h1>
            <p className="text-[0.65rem] font-bold text-brand-teal uppercase tracking-widest">Safe Space Hub</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition shadow-sm border border-rose-100"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 relative z-10 animate-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-brand-navy tracking-tight">Your Support History</h2>
            <p className="text-sm font-medium text-text-muted mt-2">Resume past conversations or start a new one.</p>
          </div>

          <button
            onClick={startNewSession}
            className="group flex items-center gap-2 px-6 py-4 bg-brand-teal text-white rounded-2xl font-black shadow-lg shadow-brand-teal/20 hover:scale-105 active:scale-95 transition-all text-sm w-full md:w-auto justify-center"
          >
            <Plus size={18} />
            Start New Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length === 0 ? (
            <div className="col-span-1 md:col-span-2 text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 shadow-sm">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-brand-navy">No past sessions</h3>
              <p className="text-text-muted font-medium mt-2">Start a new conversation to begin your journey.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-premium hover:border-brand-teal transition-all flex flex-col gap-4 group cursor-pointer"
                onClick={() => router.push(`/chat?sessionId=${session.session_id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy">{session.title || "Support Session"}</h3>
                      <p className="text-xs font-medium text-text-muted mt-0.5">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
