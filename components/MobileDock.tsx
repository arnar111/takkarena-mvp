import React from 'react';
import { LayoutDashboard, Plus, Mic2, Menu, Trophy } from 'lucide-react';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onMenuClick: () => void;
}

const MobileDock: React.FC<MobileDockProps> = ({ activeTab, onTabChange, onMenuClick }) => {
  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-[90] pointer-events-none">
      <div className="glass bg-[#0f172a]/95 border border-white/10 rounded-[32px] p-2 shadow-2xl backdrop-blur-xl flex justify-between items-center px-6 pointer-events-auto h-20">
        
        {/* Dashboard (Monthly/Home) */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'text-white bg-white/10' : 'text-slate-500'}`}
        >
          <LayoutDashboard size={26} />
        </button>

        {/* Daily Stats (Árangur) */}
        <button
          onClick={() => onTabChange('daily')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'daily' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500'}`}
        >
          <Trophy size={26} />
        </button>

        {/* GIANT ADD BUTTON */}
        <button
          onClick={() => onTabChange('register')}
          className="absolute left-1/2 -translate-x-1/2 -top-8 h-16 w-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] border-4 border-[#01040f] active:scale-95 transition-all"
        >
          <Plus size={32} className="text-white" />
        </button>

        {/* MorriAI */}
        <button
          onClick={() => onTabChange('speech')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'speech' ? 'text-white bg-white/10' : 'text-slate-500'}`}
        >
          <Mic2 size={26} />
        </button>

        {/* Menu */}
        <button onClick={onMenuClick} className="p-3 text-slate-500">
          <Menu size={26} />
        </button>

      </div>
    </div>
  );
};

export default MobileDock;
