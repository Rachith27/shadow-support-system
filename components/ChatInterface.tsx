'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import RiskBadge from './RiskBadge';
import VentMode from './VentMode';
import type { ChatMessage, RiskTier, RiskUpdatePayload, UserMessagePayload } from '@/types';

interface ChatInterfaceProps {
  sessionId: string;
  riskTier: RiskTier;
  onRiskUpdate: (update: RiskUpdatePayload) => void;
}

export default function ChatInterface({ sessionId, riskTier, onRiskUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ventMode, setVentMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Store latest onRiskUpdate to avoid stale closures without triggering re-effects
  const onRiskUpdateRef = useRef(onRiskUpdate);
  useEffect(() => {
    onRiskUpdateRef.current = onRiskUpdate;
  }, [onRiskUpdate]);

  // Socket listeners + welcome message (Run exactly ONCE on mount)
  useEffect(() => {
    const socket = getSocket();

    // Welcome message after 1 second
    const welcomeTimer = setTimeout(() => {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'system',
        text: "Hey 👋 This is a safe, anonymous space. You can share how you're feeling, and I'll listen. Nothing here is connected to your name or identity.",
        timestamp: Date.now(),
      }]);
    }, 1000);

    socket.on('typing_indicator', (data: { active: boolean }) => {
      setIsTyping(data.active);
    });

    socket.on('system_message', (data: { text: string }) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        text: data.text,
        timestamp: Date.now(),
      }]);
    });

    socket.on('risk_update', (data: RiskUpdatePayload) => {
      onRiskUpdateRef.current(data);
    });

    return () => {
      clearTimeout(welcomeTimer);
      socket.off('typing_indicator');
      socket.off('system_message');
      socket.off('risk_update');
    };
  }, []);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Emit to socket
    const payload: UserMessagePayload = {
      sessionId,
      text: trimmed,
      timestamp: Date.now(),
    };
    const socket = getSocket();
    socket.emit('user_message', payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-expand textarea
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-bg relative overflow-hidden">
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
            <h1 className="font-bold text-brand-navy tracking-tight">Safe Space</h1>
            <p className="text-[0.65rem] font-bold text-brand-teal uppercase tracking-widest">End-to-End Anonymous</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setVentMode(!ventMode)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 border-2
              ${ventMode 
                ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20' 
                : 'bg-white text-brand-navy border-slate-100 hover:border-brand-teal hover:text-brand-teal shadow-premium'}`}
          >
            {ventMode ? '💭 Close Vent' : '💭 Vent Mode'}
          </button>
          <RiskBadge riskTier={riskTier} />
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 chat-scroll relative z-10">
        {!ventMode && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-3xl shadow-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-brand-navy text-white rounded-tr-sm shadow-brand-navy/10'
                  : 'bg-white text-text-primary rounded-tl-sm border border-slate-100'
                }`}
            >
              <p className="text-[0.95rem]">{msg.text}</p>
            </div>
            <span className="mt-2 px-2 text-[0.65rem] font-bold text-text-muted/40 uppercase tracking-widest">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}

        {ventMode && (
          <div className="h-full flex items-center justify-center py-10">
            <VentMode
              sessionId={sessionId}
              isActive={ventMode}
              onToggle={() => setVentMode(false)}
            />
          </div>
        )}

        {isTyping && !ventMode && (
          <div className="flex items-start animate-in">
            <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-sm border border-slate-100 shadow-sm flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!ventMode && (
        <div className="p-4 md:p-8 relative z-20">
          <div className="max-w-4xl mx-auto glass-effect p-3 rounded-[2.5rem] shadow-premium flex items-end gap-3 border border-slate-200/50">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="How's your day really going? No judgment here..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-5 text-[0.95rem] resize-none max-h-40 min-h-[52px] leading-relaxed placeholder:text-text-muted/40"
            />
            {inputText.length > 200 && (
              <span className="absolute -top-10 right-8 text-[0.65rem] font-black text-text-muted/30 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {inputText.length} / 1000
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="group relative w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-lg shadow-brand-navy/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale cursor-pointer"
            >
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 text-[0.6rem] font-bold text-text-muted/30 uppercase tracking-[0.25em]">
            Press Enter to Send • Shift + Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
