'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { VentPayload } from '@/types';

interface VentModeProps {
  sessionId: string;
  isActive: boolean;
  onToggle: () => void;
}

export default function VentMode({ sessionId, isActive, onToggle }: VentModeProps) {
  const [text, setText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const charLimit = 1000;

  const handleSubmit = () => {
    if (text.trim().length === 0) return;

    // PRIVACY: Only send sessionId + timestamp — text NEVER leaves the browser
    const payload: VentPayload = {
      sessionId,
      timestamp: Date.now(),
    };

    const socket = getSocket();
    socket.emit('vent_message', payload);

    setText('');
    setShowConfirmation(true);

    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-in">
      {/* Calm Header */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-vent-bg flex items-center justify-center text-vent-text shadow-sm">
            🌊
          </div>
          <h2 className="text-sm font-black text-vent-text uppercase tracking-[0.2em]">Vent Mode</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-vent-text animate-pulse" />
          <span className="text-[0.65rem] font-bold text-vent-text/60 uppercase tracking-widest">Safe & Private</span>
        </div>
      </div>

      <div className="glass-effect rounded-[2.5rem] p-8 border-2 border-purple-100 shadow-premium relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100/50">
          <p className="text-xs font-bold text-vent-text/80 leading-relaxed">
            This space is just for you. No one will ever read these words, they aren&apos;t even saved. Write it down, and when you hit release, it will be gone forever.
          </p>
        </div>

        {!showConfirmation ? (
          <>
            <textarea
              id="vent-textarea"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= charLimit) setText(e.target.value);
              }}
              placeholder="What's weighing on your mind? Let it all out..."
              rows={8}
              className="w-full min-h-48 bg-transparent border-none focus:ring-0 text-[0.95rem] leading-relaxed text-slate-700 resize-none placeholder:text-slate-300 transition-opacity"
            />

            <div className="mt-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className={`text-[0.6rem] font-black uppercase tracking-widest ${text.length > 900 ? 'text-red-400' : 'text-slate-300'}`}>
                  {text.length} / {charLimit}
                </span>
                <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-vent-text transition-all duration-300" 
                    style={{ width: `${(text.length / charLimit) * 100}%` }}
                  />
                </div>
              </div>

              <button
                id="vent-submit"
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-vent-text shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full shimmer-bg opacity-10 group-hover:opacity-20 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Release it 🌊
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="min-h-64 flex flex-col items-center justify-center animate-in">
            <div className="text-6xl mb-6 animate-float-slow">🌊</div>
            <p className="text-xl font-black text-vent-text uppercase tracking-widest text-center px-8">
              Released. <br />
              <span className="text-slate-400 text-sm font-bold tracking-normal normal-case">It is gone now. Let it go.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
