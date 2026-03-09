import React from 'react';
import { Battle } from '../types';
import { Trophy, Clock, TrendingUp, Zap } from 'lucide-react';

interface CompetitionCardProps {
    battle: Battle;
    currentUserId: string;
    onNavigate: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ battle, currentUserId, onNavigate }) => {
    const opponent = battle.participants.find(p => p.userId !== currentUserId);
    const currentUser = battle.participants.find(p => p.userId === currentUserId);

    if (!opponent || !currentUser) return null;

    const timeRemaining = () => {
        const now = new Date();
        const end = new Date(battle.endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return '0m';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}klst ${minutes}m`;
        return `${minutes}m`;
    };

    const isWinning = currentUser.currentSales > opponent.currentSales;
    const difference = Math.abs(currentUser.currentSales - opponent.currentSales);
    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));

    return (
        <div
            onClick={onNavigate}
            className="glass p-4 rounded-[24px] border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-rose-500/10 cursor-pointer hover:scale-[1.02] transition-all shadow-lg animate-in slide-in-from-top-4 duration-500 relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-4">
                {/* Left: Battle Info */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                        <Trophy size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Keppni í gangi</p>
                        <p className="text-sm font-black text-white">vs {opponent.name}</p>
                    </div>
                </div>

                {/* Center: Score */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">Þú</p>
                        <p className={`text-lg font-black ${isWinning ? 'text-emerald-400' : 'text-white'}`}>
                            {formatISK(currentUser.currentSales)}
                        </p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div>
                        <p className="text-xs font-bold text-slate-400">{opponent.name.split(' ')[0]}</p>
                        <p className={`text-lg font-black ${!isWinning ? 'text-rose-400' : 'text-white'}`}>
                            {formatISK(opponent.currentSales)}
                        </p>
                    </div>
                </div>

                {/* Right: Status */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg">
                        <Clock size={12} className="text-indigo-400" />
                        <span className="text-xs font-black text-white tabular-nums">{timeRemaining()}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWinning ? <TrendingUp size={12} /> : <Zap size={12} />}
                        <span>{isWinning ? '+' : '-'}{formatISK(difference)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionCard;
