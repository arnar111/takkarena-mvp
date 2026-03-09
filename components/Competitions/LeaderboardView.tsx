import React from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

interface Leader {
    id: number;
    name: string;
    sales: number;
    avatar: string;
    rank: number;
    trend: 'up' | 'down' | 'stable';
}

interface LeaderboardProps {
    leaders: Leader[];
    inventory: string[];
}

const LeaderboardView: React.FC<LeaderboardProps> = ({ leaders, inventory }) => {

    // Sort just in case
    const sortedLeaders = [...leaders].sort((a, b) => b.sales - a.sales);
    const top3 = sortedLeaders.slice(0, 3);

    // Assign proper places for visuals
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(val);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 mb-12 pt-8">
                {/* 2nd Place */}
                {second && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center text-slate-300 font-black text-sm shadow-[0_0_15px_rgba(148,163,184,0.3)] relative">
                            {second.avatar}
                            <div className="absolute -bottom-2 bg-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">#2</div>
                        </div>
                        <div className="w-20 h-24 bg-gradient-to-t from-slate-800/50 to-slate-700/20 rounded-t-2xl border-x border-t border-white/5 flex items-end justify-center pb-2">
                            <span className="text-xs font-black text-slate-400">{formatISK(second.sales)}</span>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {first && (
                    <div className="flex flex-col items-center gap-2 z-10">
                        <Crown size={24} className="text-amber-400 animate-bounce" />
                        <div className="h-16 w-16 rounded-full border-4 border-amber-500/50 bg-amber-900/50 flex items-center justify-center text-amber-200 font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] relative">
                            {first.avatar}
                            <div className="absolute -bottom-3 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400">#1</div>
                        </div>
                        <div className="w-24 h-32 bg-gradient-to-t from-amber-600/20 to-amber-500/10 rounded-t-2xl border-x border-t border-amber-500/30 flex items-end justify-center pb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                            <span className="text-sm font-black text-amber-400 relative">{formatISK(first.sales)}</span>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {third && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full border-2 border-amber-700 bg-amber-950 flex items-center justify-center text-amber-700 font-black text-sm shadow-[0_0_15px_rgba(180,83,9,0.3)] relative">
                            {third.avatar}
                            <div className="absolute -bottom-2 bg-amber-800 text-amber-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full">#3</div>
                        </div>
                        <div className="w-20 h-16 bg-gradient-to-t from-amber-900/40 to-amber-800/10 rounded-t-2xl border-x border-t border-white/5 flex items-end justify-center pb-2">
                            <span className="text-xs font-black text-amber-700">{formatISK(third.sales)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-3">
                {sortedLeaders.map((l, i) => (
                    <div key={l.id} className={`glass p-4 rounded-2xl flex items-center justify-between border transition-all hover:scale-[1.02] 
                            ${l.name.includes('(You)')
                            ? inventory.includes('vip_pass')
                                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                : 'border-amber-500/50 bg-amber-500/5'
                            : 'border-white/5 bg-white/5'
                        }`}>
                        <div className="flex items-center gap-4">
                            <span className={`font-black w-6 text-center ${i < 3 ? 'text-amber-400 text-lg' : 'text-slate-500 text-sm'}`}>{l.rank}</span>
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">{l.avatar}</div>
                            <div>
                                <p className={`text-sm font-bold flex items-center gap-2 
                                    ${l.name.includes('(You)')
                                        ? inventory.includes('gold_name')
                                            ? 'text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]'
                                            : 'text-amber-400'
                                        : 'text-white'
                                    }`}>
                                    {l.name}
                                    {l.name.includes('(You)') && inventory.includes('vip_pass') && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30">VIP</span>}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sala mánaðarins</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-white">{formatISK(l.sales)}</p>
                            {l.name.includes('(You)') && <p className="text-[9px] text-emerald-400 font-bold flex items-center justify-end gap-1"><TrendingUp size={8} /> +12%</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardView;
