import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/api';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';

export default function FloatingChatbot() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'How do I use the STAR framework?',
    'Review my resume bullet point',
    'Explain SQL Indexing',
    'Common React questions'
  ];

  // Fetch chat history on open
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadHistory();
    }
  }, [isOpen, isAuthenticated]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const res = await chatService.getHistory();
      if (res.data.success && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.warn('[Chatbot] Could not load history:', err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');

    // Optimistically append user message
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(userMsg);
      if (res.data.success && res.data.messages) {
        setMessages(res.data.messages);
      } else if (res.data.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: res.data.reply, timestamp: new Date() }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I apologize, but I encountered an issue processing your request. Please check your backend connection or try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation history with your AI Coach?')) {
      try {
        await chatService.clearHistory();
        setMessages([
          {
            sender: 'assistant',
            text: `Conversation cleared! How can I assist your interview prep today, ${user?.name || 'there'}?`,
            timestamp: new Date()
          }
        ]);
      } catch (err) {
        console.warn('[Chatbot] Clear history error:', err.message);
      }
    }
  };

  // Only show when authenticated or on app pages
  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 chat-widget">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white font-semibold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all"
          aria-label="Open AI Career Coach"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-dark-900" />
          </div>
          <span className="hidden sm:inline">Ask AI Coach</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col rounded-2xl border border-slate-700/80 bg-dark-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-dark-850 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>AI Career Coach</span>
                  <span className="px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
                    IQ Assistant
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Ready for questions & feedback</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] ${
                          isUser
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-800 border border-slate-700 text-brand-300'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-dark-800 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-brand-300 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-dark-800 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills */}
              <div className="px-3 py-1.5 border-t border-slate-800/80 bg-dark-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(prompt);
                    }}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-700 text-[10px] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-dark-850 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask for interview advice, STAR tips, or practice..."
                  className="flex-1 bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white transition-all shadow-md shadow-brand-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

