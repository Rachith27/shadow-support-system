'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { EmojiIndex, MoodEntry, MoodCheckInPayload } from '@/types';

const EMOJIS = ['😊', '🙂', '😐', '😟', '😢'] as const;
const LABELS = ['Great', 'Okay', 'Neutral', 'Low', 'Struggling'] as const;
const EMOJI_SCORES: Record<EmojiIndex, number> = {
  0: 1.0,
  1: 0.75,
  2: 0.5,
  3: 0.25,
  4: 0.0,
};

interface MoodCheckInProps {
  sessionId: string;
  onComplete: (entry: MoodEntry) => void;
}

export default function MoodCheckIn({ sessionId, onComplete }: MoodCheckInProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiIndex | null>(null);
  const [sliderValue, setSliderValue] = useState<number | null>(5);
  const [showSlider, setShowSlider] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedEmoji === null) return;

    const sentimentScore = EMOJI_SCORES[selectedEmoji];
    const payload: MoodCheckInPayload = {
      sessionId,
      emojiIndex: selectedEmoji,
      sliderValue: showSlider ? sliderValue : null,
      timestamp: Date.now(),
    };

    const socket = getSocket();
    socket.emit('mood_checkin', payload);

    const entry: MoodEntry = {
      emojiIndex: selectedEmoji,
      sliderValue: showSlider ? sliderValue : null,
      timestamp: Date.now(),
      sentimentScore,
    };

    setSubmitted(true);
    setTimeout(() => onComplete(entry), 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 glass-effect flex items-center justify-center z-50 animate-in">
        <div className="bg-white/90 rounded-[2.5rem] p-12 shadow-premium flex flex-col items-center gap-6 animate-float-slow">
          <div className="text-6xl">💙</div>
          <p className="text-2xl font-bold text-brand-teal tracking-tight">Thanks for checking in 💙</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 glass-effect flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] p-10 md:p-12 max-w-lg w-full shadow-premium text-center animate-in relative overflow-hidden">
        {/* Subtle accent background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-teal/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-navy mb-10 tracking-tight">
          How are you feeling <span className="text-brand-teal">right now?</span>
        </h2>

        {/* Emoji Row */}
        <div className="flex justify-center gap-3 md:gap-4 flex-wrap mb-10">
          {EMOJIS.map((emoji, index) => (
            <button
              key={index}
              id={`mood-emoji-${index}`}
              onClick={() => setSelectedEmoji(index as EmojiIndex)}
              type="button"
              className={`flex flex-col items-center gap-2.5 p-4 rounded-3xl border-2 transition-all duration-300 min-w-20 cursor-pointer
                ${selectedEmoji === index
                  ? 'border-brand-teal bg-brand-teal/5 scale-110 shadow-lg shadow-brand-teal/10'
                  : 'border-slate-50 bg-slate-50/50 hover:bg-slate-100/80 hover:-translate-y-1'
                }`}
            >
              <span className="text-4xl leading-none">{emoji}</span>
              <span className={`text-[0.7rem] font-bold uppercase tracking-widest ${selectedEmoji === index ? 'text-brand-teal' : 'text-text-muted'}`}>
                {LABELS[index]}
              </span>
            </button>
          ))}
        </div>

        {/* Slider Section */}
        {showSlider && (
          <div className="mb-8 px-4 py-6 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div className="flex justify-between text-[0.7rem] font-bold text-text-muted uppercase tracking-widest mb-4">
              <span>Struggling</span>
              <span className="text-brand-teal">Feeling Great</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={sliderValue ?? 5}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full cursor-pointer"
              id="mood-slider"
            />
            <div className="text-3xl font-black text-brand-teal mt-4 transition-all scale-110">
              {sliderValue}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-6">
          <button
            id="mood-checkin-submit"
            onClick={handleSubmit}
            disabled={selectedEmoji === null}
            type="button"
            className="w-full group relative inline-flex items-center justify-center py-5 rounded-2xl font-bold text-white bg-brand-navy shadow-xl shadow-brand-navy/10 hover:shadow-2xl hover:shadow-brand-navy/20 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full shimmer-bg opacity-10 group-hover:opacity-20 transition-opacity" />
            <span className="relative">Confirm Check In</span>
          </button>

          <button
            onClick={() => setShowSlider(!showSlider)}
            type="button"
            className="text-xs font-bold text-text-muted/60 uppercase tracking-widest hover:text-brand-teal transition-colors focus:outline-none"
          >
            {showSlider ? '— Hide Intensity —' : '— Adjust Intensity —'}
          </button>
        </div>

        <p className="mt-8 text-[0.65rem] font-medium text-text-muted/40 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <span className="w-1 h-1 rounded-full bg-brand-teal/40" />
          Anonymous & Encrypted
          <span className="w-1 h-1 rounded-full bg-brand-teal/40" />
        </p>

        {/* Immediate Help Shortcut */}
        <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">In immediate distress?</p>
          <button 
            onClick={() => {
               getSocket().emit('request_volunteer', { sessionId });
               // Complete the check-in immediately to show the chat
               onComplete({
                  emojiIndex: 4, // Default to struggling for risk-flagging
                  sliderValue: 0,
                  timestamp: Date.now(),
                  sentimentScore: 0
               });
            }}
            className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors group cursor-pointer"
          >
            Connect with Counselor Directly
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
