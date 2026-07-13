import React, { useState } from 'react';
import { Search, Swords } from 'lucide-react';
import PosterFetcher from './PosterFetcher';
import MarkdownResult from './MarkdownResult';
import { streamEndpoint } from '../lib/api';

export default function MovieComparer() {
  const [movieA, setMovieA] = useState('');
  const [movieB, setMovieB] = useState('');
  const [activeA, setActiveA] = useState('');
  const [activeB, setActiveB] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async (event) => {
    event.preventDefault();
    const a = movieA.trim();
    const b = movieB.trim();
    if (!a || !b || isLoading) return;

    setIsLoading(true);
    setStreamingText('');
    setActiveA(a);
    setActiveB(b);

    try {
      await streamEndpoint('/compare', { movie_a: a, movie_b: b }, setStreamingText, {
        fallbackError: 'Failed to generate comparison. Please try again.',
      });
    } catch (error) {
      console.error('Error during movie comparison:', error);
      setStreamingText(`**Error:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl bg-[#161616]">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Swords className="w-5 h-5 text-red-500" />
          <span>Movie Comparer</span>
        </h3>
        <form onSubmit={handleCompare} className="flex flex-col md:flex-row items-center gap-4 mt-6">
          <div className="relative flex-1 w-full glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 bg-[#1F1F1F]">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
            <input 
              value={movieA} 
              onChange={(event) => setMovieA(event.target.value)} 
              placeholder="Enter first movie (e.g. Inception)..." 
              className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-neutral-200 focus:outline-none placeholder-neutral-600" 
              disabled={isLoading} 
            />
          </div>
          
          <div className="flex items-center justify-center p-3.5 rounded-2xl bg-[#1F1F1F] border border-[#2A2A2A] text-red-500 shadow-md shadow-black/20 flex-shrink-0">
            <span className="text-xs font-black px-1 tracking-widest">VS</span>
          </div>
          
          <div className="relative flex-1 w-full glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 bg-[#1F1F1F]">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
            <input 
              value={movieB} 
              onChange={(event) => setMovieB(event.target.value)} 
              placeholder="Enter second movie (e.g. Tenet)..." 
              className="w-full bg-transparent rounded-2xl pl-11 pr-4 py-3.5 text-sm text-neutral-200 focus:outline-none placeholder-neutral-600" 
              disabled={isLoading} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !movieA.trim() || !movieB.trim()} 
            className="w-full md:w-auto px-6 py-3.5 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-bold transition-all shadow-md hover:from-red-500 hover:to-red-700 disabled:opacity-45 flex items-center justify-center space-x-2 scale-95 hover:scale-100 active:scale-95 duration-300"
          >
            <Swords className="w-4 h-4" />
            <span>{isLoading ? 'Comparing...' : 'Compare'}</span>
          </button>
        </form>
      </div>

      {streamingText && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="hidden md:block" />
            {[activeA, activeB].map((title) => (
              <div key={title} className="rounded-3xl p-4 border border-[#2A2A2A] shadow-2xl flex flex-col items-center space-y-3 bg-[#161616]">
                <PosterFetcher title={title} className="w-full h-56 rounded-lg" />
                <h4 className="font-bold text-xs text-neutral-200 break-words w-full text-center px-1 line-clamp-2" title={title}>
                  {title}
                </h4>
              </div>
            ))}
            <div className="hidden md:block" />
          </div>
          <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl min-h-[18rem] overflow-x-auto bg-[#161616]">
            <h4 className="text-[9px] font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">
              Comparison Table & Verdict
            </h4>
            <MarkdownResult isLoading={isLoading}>{streamingText}</MarkdownResult>
          </div>
        </div>
      )}
    </div>
  );
}
