import React from 'react';
import { LayoutDashboard, BarChart4, Trophy, Sparkle, Menu } from 'lucide-react';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onMenuClick: () => void;
}

const MobileDock: React.FC<MobileDockProps> = ({ activeTab, onTabChange, onMenuClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80]">
      <div className="bg-[#0a0f1e]/98 border-t border-white/10 backdrop-blur-xl flex justify-around items-end px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2">

        {/* Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-bold tracking-wide">Heim</span>
        </button>

        {/* Skráning */}
        <button
          onClick={() => onTabChange('register')}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all ${activeTab === 'register' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Sparkle size={22} />
          <span className="text-[10px] font-bold tracking-wide">Skráning</span>
        </button>

        {/* The Arena */}
        <button
          onClick={() => onTabChange('competitions')}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all ${activeTab === 'competitions' ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <Trophy size={22} />
          <span className="text-[10px] font-bold tracking-wide">Arena</span>
        </button>

        {/* Tölfræði */}
        <button
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-all ${activeTab === 'stats' ? 'text-white' : 'text-slate-500'}`}
        >
          <BarChart4 size={22} />
          <span className="text-[10px] font-bold tracking-wide">Tölfræði</span>
        </button>

        {/* Menu (sidebar) */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl text-slate-500"
        >
          <Menu size={22} />
          <span className="text-[10px] font-bold tracking-wide">Meira</span>
        </button>

      </div>
    </div>
  );
};

export default MobileDock;
