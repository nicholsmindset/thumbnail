
import React, { useEffect, useState, useRef } from 'react';
import { Youtube, Zap, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
    credits: number;
    onOpenDashboard: () => void;
}

const Header: React.FC<HeaderProps> = ({ credits, onOpenDashboard }) => {
  const [animate, setAnimate] = useState(false);
  const prevCreditsRef = useRef(credits);

  useEffect(() => {
    if (prevCreditsRef.current !== credits) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500); // 500ms animation duration
      prevCreditsRef.current = credits;
      return () => clearTimeout(timer);
    }
  }, [credits]);

  return (
    <header className="py-6 px-4 md:px-8 border-b border-slate-800/50 bg-[#0f172a]/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
             <Youtube className="text-red-500 w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
             <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none">
                    ThumbGen AI
                </h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase flex items-center gap-1">
                    Powered by Gemini 3 Pro
                </span>
             </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
             {/* Credit Badge */}
             <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full transition-all duration-300 ${animate ? 'scale-110 border-yellow-500/50 bg-yellow-500/10' : ''}`}>
                <Zap size={14} className={`text-yellow-400 fill-yellow-400 transition-transform ${animate ? 'scale-125' : ''}`} />
                <span className={`text-sm font-bold text-slate-200 transition-colors ${animate ? 'text-white' : ''}`}>{credits}</span>
                <span className="text-xs text-slate-500">credits</span>
             </div>

             <button 
                onClick={onOpenDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
             >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
             </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
