'use client';

import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { Send, User, MessageSquare, ShieldCheck } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { API_BASE } from '@/lib/api';

interface VolunteerChatProps {
  sessionId: string;
  volunteerName: string;
}

export default function VolunteerChat({ sessionId, volunteerName }: VolunteerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();

    // 1. Join the room
    socket.emit('join_session', { sessionId, volunteerName });
    setIsJoined(true);

    // 2. Listen for messages
    socket.on('user_message_broadcast', (data: { text: string; timestamp: number }) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'user',
        text: data.text,
        timestamp: data.timestamp
      }]);
    });

    socket.on('volunteer_message_broadcast', (data: { text: string; volunteerName: string; timestamp: number }) => {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'volunteer',
        text: data.text,
        timestamp: data.timestamp,
        volunteerName: data.volunteerName,
        isVolunteer: true
      }]);
    });

    socket.on('system_message', (data: { text: string }) => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'system',
          text: `[AI] ${data.text}`,
          timestamp: Date.now()
        }]);
    });

    // Fetch initial history from DB via API (optional, but good for context)
    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/session/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                const formatted = (data.messages || []).map((m: any, i: number) => ({
                    id: `hist-${i}`,
                    role: m.role || 'user',
                    text: m.content || m.text,
                    timestamp: m.timestamp,
                    isVolunteer: m.role === 'volunteer',
                    volunteerName: m.volunteerName
                }));
                setMessages(formatted);
            }
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        }
    };
    fetchHistory();

    return () => {
      socket.off('user_message_broadcast');
      socket.off('volunteer_message_broadcast');
      socket.off('system_message');
    };
  }, [sessionId, volunteerName]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const socket = getSocket();
    socket.emit('volunteer_message', {
      sessionId,
      text: inputText.trim(),
      volunteerName
    });

    setInputText('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Live Chat</p>
            <p className="text-xs font-bold text-emerald-900">Counseling in Progress</p>
          </div>
        </div>
        {isJoined && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full text-[9px] font-black uppercase text-emerald-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={32} className="text-gray-200 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}>
            {msg.role === 'system' ? (
              <div className="w-full flex justify-center my-2">
                <p className="text-[10px] font-black text-gray-400 px-3 py-1 bg-white rounded-full border border-gray-100/50 uppercase tracking-widest">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-white text-gray-800 rounded-tl-sm border border-gray-100' 
                  : 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-900/10'}`}>
                {msg.isVolunteer && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">You</p>
                )}
                {msg.role === 'user' && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-sky-600">Student</p>
                )}
                <p className="leading-relaxed font-medium">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-[1.5rem] border border-gray-100">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your supportive response..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-gray-400 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:scale-105 transition-all shadow-md shadow-emerald-200 disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
