import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatBotProps {
  topic: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: `Hi! I can help you learn more about "${topic}". Ask me anything!`, timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(userMsg.text);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none`}>
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col mb-4 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 h-96' : 'opacity-0 scale-95 translate-y-10 h-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <h3 className="font-bold text-sm">AI Tutor</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>

      {/* FAB Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
            isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
