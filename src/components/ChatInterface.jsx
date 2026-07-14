import React, { useEffect, useRef, useState } from 'react';
import { Bot, RefreshCw, Send, Sparkles, User, Film, Paperclip, Mic, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { streamEndpoint } from '../lib/api';
import PosterFetcher from './PosterFetcher';
import { extractMovieTitles } from '../lib/movieText';

const greeting = {
  role: 'assistant',
  content: 'Hello! I am your **MovieMind AI** cinematic assistant. Ask me anything about films, directors, complicated plotlines, actor cast details, or custom ratings.',
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [extractedMovies, setExtractedMovies] = useState([]);

  useEffect(() => {
    const allTitles = [];
    messages.forEach((msg) => {
      if (msg.role === 'assistant') {
        const titles = extractMovieTitles(msg.content);
        titles.forEach((title) => {
          if (!allTitles.includes(title)) {
            allTitles.push(title);
          }
        });
      }
    });
    setExtractedMovies(allTitles);
  }, [messages]);

  const quickPrompts = [
    { text: 'Suggest sci-fi movies under 2 hours', icon: Sparkles },
    { text: 'Explain the timeline of Interstellar', icon: Film },
    { text: 'Compare The Dark Knight vs The Batman', icon: Film },
    { text: 'Write a spoiler-free review of Inception', icon: Film },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const updateLastAssistant = (content) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: 'assistant', content };
      return updated;
    });
  };

  const handleSend = async (textToSend) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    if (!textToSend) setInput('');

    const outgoing = [...messages, { role: 'user', content: promptText }];
    setMessages([...outgoing, { role: 'assistant', content: '' }]);
    setIsLoading(true);

    try {
      await streamEndpoint(
        '/chat',
        { prompt: promptText, history: messages.slice(1) },
        updateLastAssistant,
        { fallbackError: 'Sorry, I encountered an error. Please try again.' }
      );
    } catch (error) {
      console.error('Error during chat streaming:', error);
      updateLastAssistant(`**Error:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 flex-1 relative max-w-5xl mx-auto w-full">
      
      {/* Main Chat Container (Solid Premium Card) */}
      <div className="flex-1 flex flex-col h-[calc(100vh-16rem)] lg:h-[72vh] rounded-3xl overflow-hidden shadow-2xl relative border border-[#2A2A2A] bg-[#161616]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A] bg-[#161616] relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-500 shadow-sm">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">AI Movie Assistant</h3>
              <p className="text-[9px] text-[#B3B3B3] font-bold tracking-wider uppercase">Dashboard Interface</p>
            </div>
          </div>
          
          <button
            onClick={() => setMessages([greeting])}
            className="px-3 py-1.5 text-neutral-400 hover:text-white hover:bg-[#1F1F1F] rounded-full transition-all duration-300 flex items-center space-x-1.5 text-[10px] border border-[#2A2A2A] font-bold uppercase tracking-wider bg-[#1F1F1F]"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-none bg-[#161616]">
          <AnimatePresence initial={false}>
            {messages.length === 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center py-8 h-full max-w-md mx-auto"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-red-500 mb-5 shadow-md">
                  <Film className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white mb-2 font-display">
                  Welcome to MovieMind AI
                </h2>
                <p className="text-xs text-[#B3B3B3] mb-6 leading-relaxed">
                  I can curate watchlists, write reviews, compare films, or explain timelines. Ask me anything about cinema.
                </p>
              </motion.div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLast = idx === messages.length - 1;
              return (
                <motion.div
                  key={`${msg.role}-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`flex items-start space-x-3 sm:space-x-4 max-w-[90%] sm:max-w-[78%] ${
                    isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                    isUser
                      ? 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-red-500/20 text-white shadow-md'
                      : 'bg-[#1F1F1F] border-[#2A2A2A] text-red-500'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-5 py-4 leading-relaxed text-sm shadow-md transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-red-900 to-[#5A0F0F] border border-red-800/30 text-white rounded-tr-sm'
                      : 'bg-[#1F1F1F] border border-[#2A2A2A] border-l-2 border-l-[#DC2626] text-neutral-200 rounded-tl-sm'
                  }`}>
                    {msg.content === '' && isLoading && isLast ? (
                      <div className="flex items-center space-x-2 py-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <div className={`prose prose-invert max-w-none text-neutral-200 break-words ${
                        !isUser && isLoading && isLast ? 'stream-cursor' : ''
                      }`}>
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-[#ff3b30] font-bold" {...props} />,
                            code: ({ node, inline, ...props }) => 
                              inline ? (
                                <code className="bg-[#161616] text-[#ff3b30] px-1.5 py-0.5 rounded text-xs font-mono border border-[#2A2A2A]" {...props} />
                              ) : (
                                <code className="block bg-[#0B0B0B] border border-[#2A2A2A] p-3 rounded-lg text-xs font-mono overflow-x-auto text-[#ff3b30] my-2" {...props} />
                              )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Dock */}
        <div className="p-6 border-t border-[#2A2A2A] bg-[#161616] relative z-10">
          
          {/* Suggestion Cards */}
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-[9px] text-[#8b8b8b] font-bold uppercase tracking-widest mb-3">Suggested Topics</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className="text-left text-xs px-4 py-3.5 rounded-2xl border border-[#2A2A2A] text-neutral-300 hover:text-white hover:border-[#DC2626] bg-[#1F1F1F] flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40"
                  >
                    <span>{prompt.text}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-500 transition-colors duration-300 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Form Bar */}
          <form 
            onSubmit={(event) => { event.preventDefault(); handleSend(); }} 
            className="flex items-center space-x-3 p-1.5 rounded-full border border-[#2A2A2A] bg-[#1F1F1F] focus-within:border-[#DC2626] transition-all duration-300"
          >
            {/* Attachment Button */}
            <button 
              type="button"
              className="p-2.5 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-[#161616] transition-colors flex-shrink-0"
              title="Add attachment"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about movies, ratings, timeline analysis..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-200 placeholder-neutral-500 px-1 disabled:opacity-60"
            />

            {/* Mic Button */}
            <button 
              type="button"
              className="p-2.5 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-[#161616] transition-colors flex-shrink-0"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-bold transition-all shadow-md hover:from-red-500 hover:to-red-700 disabled:opacity-30 disabled:hover:from-[#DC2626] flex items-center justify-center flex-shrink-0 scale-95 hover:scale-100 active:scale-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Discussed Movies (Right Sidebar Gallery) */}
      {extractedMovies.length > 0 && (
        <div className="w-full lg:w-80 flex-shrink-0 rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl flex flex-col h-[30rem] lg:h-[72vh] overflow-hidden bg-[#161616]">
          <div className="flex items-center space-x-2 border-b border-[#2A2A2A] pb-3">
            <Film className="w-4 h-4 text-red-500 shadow-sm" />
            <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
              Mentioned Movies ({extractedMovies.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto mt-4 pr-1 flex-1 scrollbar-none">
            {extractedMovies.map((title) => (
              <div key={title} className="flex flex-col items-center group">
                <PosterFetcher title={title} className="w-full h-40" />
                <span className="text-[9px] text-[#B3B3B3] text-center font-bold mt-2 break-words w-full group-hover:text-red-500 transition-colors line-clamp-2" title={title}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


