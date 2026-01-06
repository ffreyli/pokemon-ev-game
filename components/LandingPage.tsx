
import React from 'react';

interface LandingPageProps {
  onNavigate: (view: 'lab' | 'arena' | 'gallery') => void;
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
          The ultimate suite for competitive Pokémon training. Build, optimize, and test your team against the world's finest champions.
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

        {/* Arena Card */}
        <div className="bg-white rounded-[40px] border-2 border-slate-200 p-10 shadow-sm hover:shadow-xl hover:border-red-300 transition-all group flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
              <span className="text-2xl">🏟️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">THE STADIUM</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8">
              Test your training in real-time battle scenarios. Face random challengers or specifically targeted opponents to refine your strategy.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('arena')}
            className="w-full bg-slate-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"
          >
            Start Battle
          </button>
        </div>
      </div>

      {/* Quick Status / Call to Action */}
      <div className="bg-red-600 rounded-[50px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black italic">READY FOR THE LEAGUE?</h2>
          <p className="font-bold opacity-80">
            {teamCount === 0 
              ? "Your current bench is empty. Start by drafting your first champion." 
              : `You have ${teamCount} Pokémon ready for deployment in the arena.`}
          </p>
        </div>
        <button 
          onClick={() => onNavigate(teamCount > 0 ? 'arena' : 'lab')}
          className="bg-white text-red-600 px-10 py-5 rounded-3xl font-black shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-tighter"
        >
          {teamCount > 0 ? 'ENTER STADIUM NOW' : 'GO TO THE LAB'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Champion Lab v4.0 • Built for the competitive training elite
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
