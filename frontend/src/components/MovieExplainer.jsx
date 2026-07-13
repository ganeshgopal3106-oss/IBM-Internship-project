import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Film, Search } from 'lucide-react';
import PosterFetcher from './PosterFetcher';
import MarkdownResult from './MarkdownResult';
import { streamEndpoint } from '../lib/api';

export default function MovieExplainer() {
  const [movieTitle, setMovieTitle] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [mode, setMode] = useState('spoiler-free');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async (event) => {
    event.preventDefault();
    const title = movieTitle.trim();
    if (!title || isLoading) return;

    setIsLoading(true);
    setStreamingText('');
    setActiveTitle(title);

    try {
      await streamEndpoint('/explain', { movie: title, mode }, setStreamingText, {
        fallbackError: 'Failed to generate plot explanation. Please try again.',
      });
    } catch (error) {
      console.error('Error during plot explanation:', error);
      setStreamingText(`**Error:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl space-y-4 bg-[#161616]">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          <span>Movie Plot Explainer</span>
        </h3>
        <form onSubmit={handleExplain} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 bg-[#1F1F1F]">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={movieTitle}
                onChange={(event) => setMovieTitle(event.target.value)}
                placeholder="Enter movie name (e.g. Tenet, Donnie Darko)..."
                className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-neutral-200 focus:outline-none placeholder-neutral-600"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !movieTitle.trim()}
              className="px-6 py-3.5 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-bold transition-all shadow-md hover:from-red-500 hover:to-red-700 disabled:opacity-45 flex items-center justify-center space-x-2 scale-95 hover:scale-100 active:scale-95 duration-300"
            >
              <Film className="w-4 h-4" />
              <span>{isLoading ? 'Decrypting plot...' : 'Explain Movie'}</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Explanation mode</span>
            <div className="flex bg-[#1F1F1F] p-1 rounded-full border border-[#2A2A2A] w-full sm:w-auto">
              <button 
                type="button" 
                onClick={() => setMode('spoiler-free')} 
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'spoiler-free' 
                    ? 'bg-[#2A2A2A] text-white border border-[#3F3F3F]' 
                    : 'text-neutral-400 border border-transparent hover:text-neutral-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-red-500" />
                <span>Spoiler-Free</span>
              </button>
              <button 
                type="button" 
                onClick={() => setMode('full')} 
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'full' 
                    ? 'bg-red-950/40 text-red-500 border border-red-900/30' 
                    : 'text-neutral-400 border border-transparent hover:text-neutral-200'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Full Spoilers</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {streamingText && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-full max-w-sm rounded-3xl p-4 border border-[#2A2A2A] shadow-2xl flex flex-col items-center space-y-4 bg-[#161616]">
              <PosterFetcher title={activeTitle} className="w-full h-80 rounded-xl" />
              <h4 className="font-bold text-neutral-200 text-xs text-center break-words px-2 line-clamp-2" title={activeTitle}>
                {activeTitle}
              </h4>
            </div>
          </div>
          <div className="md:col-span-2 rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl min-h-[22rem] bg-[#161616]">
            <h4 className="text-[9px] font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">
              Plot Analysis
            </h4>
            <MarkdownResult isLoading={isLoading}>{streamingText}</MarkdownResult>
          </div>
        </div>
      )}
    </div>
  );
}
