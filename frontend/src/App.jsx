import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smile, 
  FileText, 
  BookOpen, 
  Swords, 
  ListPlus,
  Film,
  Sparkles,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ChatInterface from './components/ChatInterface';
import MoodRecommend from './components/MoodRecommend';
import ReviewGenerator from './components/ReviewGenerator';
import MovieExplainer from './components/MovieExplainer';
import MovieComparer from './components/MovieComparer';
import WatchlistGen from './components/WatchlistGen';
import { fetchJson } from './lib/api';


import './App.css';

const tabs = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, component: ChatInterface, desc: 'Chat naturally with AI about films' },
  { id: 'mood', label: 'Mood', icon: Smile, component: MoodRecommend, desc: 'Get suggestions based on your mood' },
  { id: 'review', label: 'Reviews', icon: FileText, component: ReviewGenerator, desc: 'Generate objective film reviews' },
  { id: 'explain', label: 'Plot', icon: BookOpen, component: MovieExplainer, desc: 'Explain complicated plotlines' },
  { id: 'compare', label: 'Compare', icon: Swords, component: MovieComparer, desc: 'Compare story, acting, and visuals' },
  { id: 'watchlist', label: 'Watchlist', icon: ListPlus, component: WatchlistGen, desc: 'Build lists on genres & actors' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [modelName, setModelName] = useState('GPT-4o');

  useEffect(() => {
    fetchJson('/health')
      .then((data) => {
        if (data && data.model) {
          let name = data.model;
          if (name.startsWith('nvidia/')) {
            name = 'Nemotron-3';
          } else if (name.startsWith('gemini')) {
            name = 'Gemini-2.5';
          } else if (name.startsWith('gpt-')) {
            name = 'GPT-4o';
          }
          setModelName(name);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch health info:', err);
      });
  }, []);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || ChatInterface;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#FFFFFF] flex flex-col relative overflow-hidden font-sans">
      
      {/* 1. Cinematic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Very subtle corner red glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.03)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.02)_0%,transparent_70%)] blur-[90px]" />

        {/* Noise overlay & vignette overlay */}
        <div className="noise-overlay" />
        <div className="vignette-overlay" />
      </div>

      {/* 2. Floating Liquid Glass Top Navigation Bar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl border border-white/15 bg-white/[0.04]">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-black border border-white/20 flex items-center justify-center text-red-500 shadow-md">
            <Film className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white font-display hidden sm:inline-block">
            MovieMind AI
          </span>
        </div>

        {/* Centered Horizontally Scrollable Tab Navigation */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none max-w-[65%] sm:max-w-none flex-nowrap py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide flex items-center space-x-2 transition-all duration-300 flex-shrink-0 border border-transparent ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {/* Active Slider indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabSlider"
                    className="absolute inset-0 bg-red-600/90 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,59,48,0.25)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right System Indicators */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold hidden md:inline text-red-500 uppercase tracking-widest">Active</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden md:inline-block border-l border-white/10 pl-3">
            {modelName}
          </span>
        </div>
      </header>

      {/* 3. Main Container Area */}
      <main className="flex-1 flex flex-col min-w-0 z-10 p-4 sm:p-6 lg:p-8 pt-28 max-w-6xl w-full mx-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Page header title & description */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-display">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-neutral-400">
                  {tabs.find(t => t.id === activeTab)?.desc}
                </p>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#161616] border border-[#2A2A2A] text-[10px] text-neutral-300">
                <Tv className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold">Liquid Engine v5.0</span>
              </div>
            </div>

            {/* Render Tab Component */}
            <div className="flex-1 flex flex-col">
              <ActiveComponent />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}


