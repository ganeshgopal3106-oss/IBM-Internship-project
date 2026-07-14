import React, { useEffect, useState } from 'react';
import { Film, Heart, ListPlus, Sparkles, UserCheck } from 'lucide-react';
import PosterFetcher from './PosterFetcher';
import MarkdownResult from './MarkdownResult';
import { streamEndpoint } from '../lib/api';
import { extractMovieTitles } from '../lib/movieText';

export default function WatchlistGen() {
  const [favoriteMovies, setFavoriteMovies] = useState('');
  const [favoriteActor, setFavoriteActor] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedMovies, setExtractedMovies] = useState([]);

  useEffect(() => setExtractedMovies(extractMovieTitles(streamingText)), [streamingText]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if ((!favoriteMovies.trim() && !favoriteActor.trim() && !favoriteGenre.trim()) || isLoading) return;

    setIsLoading(true);
    setStreamingText('');

    try {
      await streamEndpoint(
        '/watchlist',
        {
          favorite_movies: favoriteMovies.trim(),
          favorite_actor: favoriteActor.trim(),
          favorite_genre: favoriteGenre.trim(),
        },
        setStreamingText,
        { fallbackError: 'Failed to generate watchlist. Please try again.' }
      );
    } catch (error) {
      console.error('Error during watchlist generation:', error);
      setStreamingText(`**Error:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl bg-[#161616]">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ListPlus className="w-5 h-5 text-red-500" />
          <span>Personalized Watchlist Curator</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1.5">Provide your tastes and MovieMind will craft a balanced set of film picks.</p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Field icon={Film} label="Favorite Movies" value={favoriteMovies} onChange={setFavoriteMovies} placeholder="Inception, Interstellar..." isLoading={isLoading} />
          <Field icon={UserCheck} label="Actor or Director" value={favoriteActor} onChange={setFavoriteActor} placeholder="Christopher Nolan..." isLoading={isLoading} />
          <Field icon={Heart} label="Favorite Genres" value={favoriteGenre} onChange={setFavoriteGenre} placeholder="Sci-Fi, Thriller..." isLoading={isLoading} />
          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || (!favoriteMovies.trim() && !favoriteActor.trim() && !favoriteGenre.trim())}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-bold transition-all shadow-md hover:from-red-500 hover:to-red-700 disabled:opacity-45 flex items-center justify-center space-x-2 scale-95 hover:scale-100 active:scale-95 duration-300"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Curating your selection...' : 'Curate My Watchlist'}</span>
            </button>
          </div>
        </form>
      </div>

      {streamingText && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl min-h-[16rem] bg-[#161616]">
            <h4 className="text-[9px] font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">Curated Selection</h4>
            <MarkdownResult isLoading={isLoading}>{streamingText}</MarkdownResult>
          </div>
          <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl space-y-4 bg-[#161616]">
            <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">Watchlist Posters ({extractedMovies.length})</h4>
            {extractedMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-500 text-center">
                <Film className="w-10 h-10 mb-3 opacity-20 text-red-500" />
                <p className="text-xs">Posters will appear as recommendations stream.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-1 scrollbar-none">
                {extractedMovies.map((title) => (
                  <div key={title} className="flex flex-col items-center group">
                    <PosterFetcher title={title} className="w-full h-44" />
                    <span className="text-[9px] text-neutral-400 text-center font-bold mt-2 break-words w-full group-hover:text-red-500 transition-colors line-clamp-2" title={title}>{title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, isLoading }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
        <Icon className="w-3.5 h-3.5 text-red-500" />
        <span>{label}</span>
      </label>
      <div className="glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 bg-[#1F1F1F] overflow-hidden">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3 text-sm text-neutral-200 focus:outline-none placeholder-neutral-600"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

