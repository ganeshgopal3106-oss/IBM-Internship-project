import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { fetchJson } from '../lib/api';

export default function PosterFetcher({ title, className = "w-full h-72" }) {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!title) {
      setLoading(false);
      return;
    }

    const fetchPoster = async () => {
      try {
        setLoading(true);
        const data = await fetchJson(`/poster?title=${encodeURIComponent(title)}`);
        if (active) {
          setPosterUrl(data.poster_url || null);
        }
      } catch (err) {
        console.error('Error fetching poster:', err);
        if (active) {
          setPosterUrl(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPoster();

    return () => {
      active = false;
    };
  }, [title]);

  const getInitials = (txt) => {
    if (!txt) return 'M';
    return txt
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className={`${className} skeleton-shimmer rounded-xl border border-white/5 flex items-center justify-center`}>
        <Film className="w-8 h-8 text-red-600/40 animate-pulse" />
      </div>
    );
  }

  if (posterUrl) {
    return (
      <div className={`${className} relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#161616] shadow-md group transition-all duration-400 hover:scale-[1.02] hover:border-[#3F3F3F]`}>
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setPosterUrl(null)} // fallback on image load error
        />
      </div>
    );
  }

  // Fallback Placeholder Card (Solid Dashboard Style)
  return (
    <div className={`${className} relative overflow-hidden rounded-2xl border border-[#2A2A2A] flex flex-col justify-between p-4 bg-[#1F1F1F] shadow-md group transition-all duration-400 hover:border-[#3F3F3F]`}>
      
      <div className="flex justify-between items-start w-full relative z-10">
        <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-500 border border-red-900/30 uppercase tracking-widest">
          MovieMind
        </span>
        <Film className="w-4 h-4 text-neutral-500 group-hover:text-red-500 transition-colors duration-300" />
      </div>
      
      <div className="my-auto flex flex-col items-center justify-center text-center relative z-10">
        <div className="w-11 h-11 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-neutral-300 font-bold text-sm mb-2 group-hover:scale-105 group-hover:border-red-500/40 group-hover:text-red-500 transition-all duration-300">
          {getInitials(title)}
        </div>
        <h4 className="font-bold text-neutral-200 text-xs px-1 line-clamp-3 group-hover:text-white transition-colors duration-300">
          {title}
        </h4>
      </div>
      
      <div className="text-[8px] text-neutral-500 text-center uppercase tracking-widest border-t border-[#2A2A2A] pt-2 relative z-10 group-hover:text-red-500/60 transition-colors duration-300">
        No Poster
      </div>
    </div>
  );
}
