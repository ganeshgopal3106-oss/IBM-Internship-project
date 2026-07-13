import React, { useEffect, useState } from 'react';
import { Film, Filter, Play, Sparkles } from 'lucide-react';
import PosterFetcher from './PosterFetcher';
import MarkdownResult from './MarkdownResult';
import { streamEndpoint } from '../lib/api';
import { extractMovieTitles } from '../lib/movieText';

const moods = [
  { id: 'happy', label: 'Happy', marker: 'Uplifting', color: 'from-red-500/10 to-red-800/5 text-red-400 border-red-500/20' },
  { id: 'romantic', label: 'Romantic', marker: 'Intimate', color: 'from-rose-500/15 to-red-950/10 text-rose-400 border-rose-500/30' },
  { id: 'sad', label: 'Sad', marker: 'Emotional', color: 'from-neutral-800/40 to-neutral-900/40 text-neutral-400 border-neutral-700/30' },
  { id: 'thriller', label: 'Thriller Night', marker: 'High Tension', color: 'from-red-950/30 to-black/60 text-red-500 border-red-500/40 glow-red' },
  { id: 'motivational', label: 'Motivational', marker: 'Inspiring', color: 'from-neutral-200/10 to-neutral-800/10 text-neutral-200 border-neutral-500/30' },
];

export default function MoodRecommend() {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState('');
  const [selectedActor, setSelectedActor] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedMovies, setExtractedMovies] = useState([]);

  useEffect(() => setExtractedMovies(extractMovieTitles(streamingText)), [streamingText]);

  const handleRecommend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStreamingText('');

    try {
      await streamEndpoint(
        '/recommend',
        {
          mood: moods.find((mood) => mood.id === selectedMood)?.label || 'Happy',
          genre: selectedGenre,
          language: selectedLanguage,
          runtime: selectedRuntime,
          actor: selectedActor,
        },
        setStreamingText,
        { fallbackError: 'Failed to generate recommendations. Please try again.' }
      );
    } catch (error) {
      console.error('Error during recommendations:', error);
      setStreamingText(`**Error:** ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl space-y-6 bg-[#161616]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span>How is your mood today?</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {moods.map((mood) => (
              <button 
                key={mood.id} 
                onClick={() => setSelectedMood(mood.id)} 
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                  selectedMood === mood.id 
                    ? `bg-gradient-to-b ${mood.color} border-white/20 shadow-lg scale-[1.02] text-white` 
                    : 'bg-[#1F1F1F] border-[#2A2A2A] text-neutral-400 hover:bg-[#262626] hover:text-white'
                }`}
              >
                <span className="text-[9px] uppercase tracking-widest font-bold mb-1.5 opacity-60">{mood.marker}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-6">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-red-500" />
            <span>Fine-Tune Recommendations</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 overflow-hidden bg-[#1F1F1F]">
              <select 
                value={selectedGenre} 
                onChange={(event) => setSelectedGenre(event.target.value)} 
                className="w-full bg-transparent px-4 py-3 text-sm text-neutral-200 focus:outline-none"
              >
                <option value="">Any Genre</option>
                {['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Romance', 'Horror', 'Mystery', 'Animation', 'Fantasy'].map((item) => (
                  <option key={item} value={item} className="bg-[#0A0A0A]">{item}</option>
                ))}
              </select>
            </div>
            
            <div className="glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 overflow-hidden bg-[#1F1F1F]">
              <select 
                value={selectedLanguage} 
                onChange={(event) => setSelectedLanguage(event.target.value)} 
                className="w-full bg-transparent px-4 py-3 text-sm text-neutral-200 focus:outline-none"
              >
                <option value="">Any Language</option>
                {['English', 'Spanish', 'French', 'Japanese', 'Korean', 'Hindi'].map((item) => (
                  <option key={item} value={item} className="bg-[#0A0A0A]">{item}</option>
                ))}
              </select>
            </div>

            <div className="glow-red-border-focus rounded-2xl border border-[#2A2A2A] transition-all duration-300 overflow-hidden bg-[#1F1F1F]">
              <select 
                value={selectedRuntime} 
                onChange={(event) => setSelectedRuntime(event.target.value)} 
                className="w-full bg-transparent px-4 py-3 text-sm text-neutral-200 focus:outline-none"
              >
                <option value="">Any Runtime</option>
                <option value="under 90 minutes" className="bg-[#0A0A0A]">Under 90 minutes</option>
                <option value="under 2 hours" className="bg-[#0A0A0A]">Under 2 hours</option>
                <option value="around 2 to 2.5 hours" className="bg-[#0A0A0A]">2 to 2.5 hours</option>
                <option value="over 2.5 hours" className="bg-[#0A0A0A]">Over 2.5 hours</option>
              </select>
            </div>

            <input 
              value={selectedActor} 
              onChange={(event) => setSelectedActor(event.target.value)} 
              placeholder="Specific actor or director..." 
              className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-neutral-200 focus:outline-none glow-red-border-focus placeholder-neutral-600 transition-all duration-300" 
            />
          </div>
        </div>

        <button 
          onClick={handleRecommend} 
          disabled={isLoading} 
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-bold transition-all shadow-md hover:from-red-500 hover:to-red-700 disabled:opacity-45 flex items-center justify-center space-x-2 scale-95 hover:scale-100 active:scale-95 duration-300"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isLoading ? 'Scanning libraries...' : 'Generate Recommendations'}</span>
        </button>
      </div>

      {streamingText && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl min-h-[16rem] bg-[#161616]">
            <h4 className="text-[9px] font-bold text-neutral-400 mb-4 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">
              AI Recommendation List
            </h4>
            <MarkdownResult isLoading={isLoading}>{streamingText}</MarkdownResult>
          </div>
          <PosterGallery title="Featured Recommendations" movies={extractedMovies} />
        </div>
      )}
    </div>
  );
}

function PosterGallery({ title, movies }) {
  return (
    <div className="rounded-3xl p-6 border border-[#2A2A2A] shadow-2xl space-y-4 bg-[#161616]">
      <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#2A2A2A] pb-3">
        {title} ({movies.length})
      </h4>
      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500 text-center">
          <Film className="w-10 h-10 mb-3 opacity-20 text-red-500" />
          <p className="text-xs">Posters will appear as recommendations generate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-1 scrollbar-none">
          {movies.map((title) => (
            <div key={title} className="flex flex-col items-center group">
              <PosterFetcher title={title} className="w-full h-44" />
              <span className="text-[9px] text-neutral-400 text-center font-bold mt-2 break-words w-full group-hover:text-red-500 transition-colors line-clamp-2" title={title}>
                {title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

