'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import RiskBadge from './RiskBadge';
import VentMode from './VentMode';
import PreChatForm from './PreChatForm';
import { LogOut, CheckCircle, RefreshCcw, Sparkles } from 'lucide-react';
import type { ChatMessage, RiskTier, RiskUpdatePayload, UserMessagePayload } from '@/types';
import CopingToolkit from './exercises/CopingToolkit';

interface ChatInterfaceProps {
  onRiskUpdate: (update: RiskUpdatePayload) => void;
}

export default function ChatInterface({ onRiskUpdate }: ChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [riskTier, setRiskTier] = useState<RiskTier>('low');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showIntake, setShowIntake] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ventMode, setVentMode] = useState(false);
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const API_BASE = 'http://localhost:4000/api';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (sessionId) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom, sessionId]);

  // Socket listeners
  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();

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
      setRiskTier(data.riskTier);
      onRiskUpdate(data);

      if (data.riskTier === 'high' || data.riskTier === 'medium') {
        setShowSuggestion(true);
      }

      // Show supportive system message if risk is high
      if (data.riskTier === 'high') {
        const notificationMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          text: "I've carefully reviewed how you're feeling. To make sure you're getting the best possible care, I've notified one of our human counselors to join this space and support you. They'll be with you shortly. 💙",
          timestamp: Date.now(),
        };
        setMessages(prev => {
          // Avoid duplicate notification if the last message was already this one
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.text === notificationMsg.text) return prev;
          return [...prev, notificationMsg];
        });
      }
    });

    socket.on('volunteer_joined', (data: { volunteerName: string }) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        text: `🤝 ${data.volunteerName} has joined the chat to support you.`,
        timestamp: Date.now(),
      }]);
    });

    socket.on('volunteer_message_broadcast', (data: { text: string; volunteerName: string }) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant', // Render as assistant but maybe add a flag
        text: data.text,
        timestamp: Date.now(),
        // @ts-ignore
        isVolunteer: true,
        volunteerName: data.volunteerName
      }]);
    });

    return () => {
      socket.off('typing_indicator');
      socket.off('system_message');
      socket.off('risk_update');
      socket.off('volunteer_joined');
      socket.off('volunteer_message_broadcast');
    };
  }, [sessionId, onRiskUpdate]);

  const handleIntakeSubmit = async (data: { name: string; age: string; phone?: string }) => {
    try {
      const newSessionId = crypto.randomUUID();
      const res = await fetch(`${API_BASE}/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: newSessionId,
          userName: data.name,
          ageGroup: data.age,
          phone: data.phone
        }),
      });

      if (res.ok) {
        setSessionId(newSessionId);
        setShowIntake(false);
        setMessages([{
          id: crypto.randomUUID(),
          role: 'system',
          text: `Hi ${data.name}! 👋 I'm here to listen. This is a safe, anonymous space. How are you feeling today?`,
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleEndChat = async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API_BASE}/session/${sessionId}/end`, { method: 'POST' });
      setIsEnded(true);
      setShowEndConfirm(false);
    } catch (err) {
      console.error('Failed to end chat:', err);
    }
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !sessionId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const payload: UserMessagePayload = {
      sessionId,
      text: trimmed,
      timestamp: Date.now(),
    };
    getSocket().emit('user_message', payload);
  };

  if (showIntake) {
    return <PreChatForm onSubmit={handleIntakeSubmit} />;
  }

  if (isEnded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-brand-bg p-8 text-center animate-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-premium">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-black text-brand-navy mb-4">Conversation Completed.</h2>
        <p className="text-text-muted font-medium mb-10 max-w-sm leading-relaxed">
          Thank you for sharing with us. Your conversation has been saved securely and anonymously to help us better understand and support youth.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-brand-navy text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-brand-navy/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <RefreshCcw size={20} />
          Start New Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-bg relative overflow-hidden">
      
      <CopingToolkit 
        sessionId={sessionId!}
        riskTier={riskTier}
        isOpen={toolkitOpen}
        onClose={() => setToolkitOpen(false)}
        lastUserMessage={messages.filter(m => m.role === 'user').pop()?.text}
      />

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
            <p className="text-[0.65rem] font-bold text-brand-teal uppercase tracking-widest">Active Session</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setToolkitOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border-2
               bg-brand-teal text-white border-brand-teal shadow-lg shadow-brand-teal/20 hover:scale-105 active:scale-95`}
          >
            <Sparkles size={16} /> <span className="hidden sm:inline">Coping Tools</span><span className="sm:hidden">Tools</span>
          </button>
          
          <button
            onClick={() => setVentMode(!ventMode)}
            className={`hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 border-2
              ${ventMode 
                ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20' 
                : 'bg-white text-brand-navy border-slate-100 hover:border-brand-teal hover:text-brand-teal shadow-premium'}`}
          >
            {ventMode ? '💭 Close Vent' : '💭 Vent Mode'}
          </button>
          <RiskBadge riskTier={riskTier} />
          
          <button 
            onClick={() => setShowEndConfirm(true)}
            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition shadow-sm border border-rose-100"
            title="End Conversation"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brand-navy/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 max-w-md w-full scale-in">
            <h3 className="text-2xl font-black text-brand-navy mb-3">End this session?</h3>
            <p className="text-text-muted font-medium mb-8 leading-relaxed">
              We'll save your progress anonymously. You won't be able to continue this specific conversation later.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-text-muted hover:bg-gray-50 transition"
              >
                No, Keep Talking
              </button>
              <button 
                onClick={handleEndChat}
                className="flex-1 bg-rose-500 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-rose-200 transition hover:bg-rose-600"
              >
                Yes, End Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 chat-scroll relative z-10">
        {!ventMode && messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in`}
          >
            {msg.role === 'system' ? (
              <div className="w-full flex justify-center my-2">
                 <div className="bg-slate-100/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/30">
                    <p className="text-[0.7rem] font-black text-slate-500 uppercase tracking-[0.2em]">{msg.text}</p>
                 </div>
              </div>
            ) : (
              <>
                <div
                  className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-3xl shadow-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-brand-navy text-white rounded-tr-sm shadow-brand-navy/10'
                      : msg.isVolunteer 
                        ? 'bg-emerald-600 text-white rounded-tl-sm shadow-emerald-900/10'
                        : 'bg-white text-text-primary rounded-tl-sm border border-slate-100'
                    }`}
                >
                  {msg.isVolunteer && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">
                      {msg.volunteerName || 'Counselor'}
                    </p>
                  )}
                  <p className="text-[0.95rem]">{msg.text}</p>
                </div>
              </>
            )}
          </div>
        ))}

        {ventMode && (
          <div className="h-full flex items-center justify-center py-10">
            <VentMode
              sessionId={sessionId!}
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
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="How's your day really going? No judgment here..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-5 text-[0.95rem] resize-none max-h-40 min-h-[52px] leading-relaxed placeholder:text-text-muted/40"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="group relative w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-lg shadow-brand-navy/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 flex-shrink-0"
            >
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
