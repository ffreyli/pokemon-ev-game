
import React from 'react';

interface LandingPageProps {
  // Fix: Removed 'arena' and 'multiplayer' which are unused in navigation and caused type errors in App.tsx
  onNavigate: (view: 'lab' | 'gallery' | 'stadium') => void;
  teamCount: number;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, teamCount }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-16 py-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 italic">
          THE CHAMPION'S <span className="text-red-600">LAB</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
          The ultimate suite for competitive Pokémon training. Build, optimize, and test your team in real-time battles.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lab Card */}
        <div className="bg-white rounded-[40px] border-2 border-slate-200 p-10 shadow-sm hover:shadow-xl hover:border-red-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-red-200 group-hover:rotate-6 transition-transform">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">THE LAB</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
              Craft your squad from scratch. Optimize every EV point, select the perfect nature, and experiment with movesets in our hyper-accurate teambuilder.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('lab')}
            className="w-full bg-slate-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all"
          >
            Enter Laboratory
          </button>
        </div>

        {/* Gallery Card */}
        <div className="bg-white rounded-[40px] border-2 border-slate-200 p-10 shadow-sm hover:shadow-xl hover:border-red-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-slate-200 group-hover:rotate-6 transition-transform">
              <span className="text-2xl">🏛️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">THE EXHIBIT</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
              Browse legendary team compositions from around the globe. Draft community teams or challenge them directly in the arena.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('gallery')}
            className="w-full bg-slate-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"
          >
            Browse Gallery
          </button>
        </div>

        {/* Stadium Card */}
        <div className="bg-white rounded-[40px] border-2 border-slate-200 p-10 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-200 group-hover:rotate-6 transition-transform">
              <span className="text-2xl">🏟️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">THE STADIUM</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
              The grand stage. Challenge high-performance AI bots offline or duel real players globally via PVP sync codes.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('stadium')}
            className="w-full bg-slate-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all"
          >
            Enter Stadium
          </button>
        </div>
      </div>

      {/* Quick Status / Call to Action */}
      <div className="bg-red-600 rounded-[50px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <h2 className="text-3xl font-black italic">ARE YOU THE NEXT CHAMPION?</h2>
          <p className="font-bold opacity-80">
            {teamCount === 0 
              ? "Your current bench is empty. Start by drafting your first champion." 
              : `You have ${teamCount} Pokémon ready for deployment in the arena.`}
          </p>
        </div>
        <button 
          onClick={() => onNavigate(teamCount > 0 ? 'stadium' : 'lab')}
          className="bg-white text-red-600 px-10 py-5 rounded-3xl font-black shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-tighter relative z-10"
        >
          {teamCount > 0 ? 'ENTER STADIUM' : 'GO TO THE LAB'}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
