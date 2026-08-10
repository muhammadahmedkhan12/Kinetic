import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({ isOpen, onClose, userName }) => {
  const { flashToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: `Hi ${userName}! I'm PULSE, your AI Fitness Coach. Ask me for workout tips, diet advice, or request class bookings!` }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsSending(true);

    try {
      const res = await apiClient.post('/ai-coach/chat', { message: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'AI Assistant unavailable.', 'error');
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I ran into an error processing your request. Please try again!' }]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    "Suggest a leg workout for today",
    "Book Morning Iron Surge class",
    "Log my weight as 74.5 kg",
    "What is a good post-workout diet?"
  ];

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 whitespace-pre-wrap break-words">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
              return (
                <strong key={pIdx} className="font-bold text-primary font-headline">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          const trimmed = line.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="text-primary font-bold text-xs leading-tight">•</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="font-bold text-primary text-xs shrink-0 font-headline">{numMatch[1]}.</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return <p key={idx} className="m-0">{formattedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal relative w-full max-w-lg rounded-t-3xl p-6 shadow-2xl border-t border-primary/40 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-slate-900 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">PULSE AI Assistant</h3>
              <p className="text-[10px] text-emerald-400 font-bold">Gemini Agent Online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 shrink-0 scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput(qp)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 text-slate-300 text-xs font-semibold whitespace-nowrap"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 mb-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[88%] ${
                m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                  m.sender === 'user'
                    ? 'bg-primary text-slate-900 font-semibold rounded-tr-none'
                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-none'
                }`}
              >
                {renderFormattedText(m.text)}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="self-start p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs text-primary animate-pulse">
              PULSE AI Coach is typing...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-white/10 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PULSE AI Coach..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="p-3 rounded-2xl bg-primary text-slate-900 font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
