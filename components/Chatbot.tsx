
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, ArrowDownCircle } from 'lucide-react';
import { chatWithAddi } from '../geminiService.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hæ! Ég heiti Addi. Hvernig get ég hjálpað þér með WageTrack í dag?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (directMessage?: string) => {
    const msg = directMessage || input;
    if (!msg.trim() || loading) return;

    const userMessage = msg.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMessage } as Message];
    setMessages(newMessages);
    setLoading(true);

    // Format for Gemini API (chat history)
    const history = newMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithAddi(history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const quickQuestions = [
    "Hvernig virkar appið?",
    "Hvað er persónuafsláttur?",
    "Segðu mér brandara!",
    "Hvernig skrái ég sölu?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[300] font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="gradient-bg p-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all group flex items-center justify-center relative overflow-hidden"
        >
          <MessageCircle className="text-white group-hover:rotate-12 transition-transform" size={28} />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass w-[350px] md:w-[400px] h-[550px] rounded-[32px] border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="gradient-bg p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Bot className="text-white" size={22} />
              </div>
              <div>
                <h4 className="text-white font-black uppercase italic tracking-tighter text-sm">Addi Aðstoðar</h4>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Í sambandi</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/40"
          >
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-slate-400'}`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/2 border-t border-white/5">
            {messages.length < 4 && (
              <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                {quickQuestions.map(q => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="shrink-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Spyrðu Adda..."
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-500 rounded-xl text-white hover:bg-indigo-400 active:scale-95 transition-all disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
