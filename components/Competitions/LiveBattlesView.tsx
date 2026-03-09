import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Swords, Clock, Users, XCircle, Timer, Eye, Zap, TrendingUp } from 'lucide-react';
import { Battle, Sale, User } from '../../types';
import { calculateOdds, formatOdds, getOddsColor } from '../../utils/oddsCalculator';

interface LiveBattlesViewProps {
    battles: Battle[];
    sales: Sale[];
    user: User;
    onViewDetails: (battle: Battle) => void;
    onPlaceBet: (battle: Battle) => void;
    onCancelBattle: (battleId: string) => void;
    onSpectate?: (battle: Battle) => void;
}

const LiveBattlesView: React.FC<LiveBattlesViewProps> = ({
    battles,
    sales,
    user,
    onViewDetails,
    onPlaceBet,
    onCancelBattle,
    onSpectate
}) => {
    const [now, setNow] = useState(new Date());

    // Force re-render every second for live timers
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Sort: Active first, then Pending
    const sortedBattles = [...battles].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const getLiveScore = (battle: Battle, userId: string) => {
        const userSales = sales.filter(s =>
            s.userId === userId &&
            new Date(s.timestamp || s.date) >= new Date(battle.startTime) &&
            new Date(s.timestamp || s.date) <= new Date(battle.endTime)
        );
        return userSales.reduce((acc, s) => acc + s.amount, 0);
    };

    const getTimeLeft = (battle: Battle) => {
        if (battle.status === 'pending') return { str: 'Bíður...', mins: 0, urgent: false };

        const end = new Date(battle.endTime).getTime();
        const diff = end - now.getTime();

        if (diff <= 0) return { str: 'Lokið', mins: 0, urgent: false };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const str = hours > 0
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`;

        return { str, mins: hours * 60 + minutes, urgent: hours === 0 && minutes < 10 };
    };

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(val);

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            {sortedBattles.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl border-white/5">
                    <Swords className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-bold">Engar keppnir í gangi</p>
                    <p className="text-xs text-slate-500">Búðu til nýja keppni í "Head to Head" flipanum!</p>
                </div>
            ) : (
                sortedBattles.map((battle) => {
                    const p1 = battle.participants[0];
                    const p2 = battle.participants[1];
                    const p1Score = getLiveScore(battle, p1.userId);
                    const p2Score = getLiveScore(battle, p2.userId);
                    const p1Leading = p1Score > p2Score;
                    const p2Leading = p2Score > p1Score;
                    const isTied = p1Score === p2Score;
                    const timeInfo = getTimeLeft(battle);
                    const isLive = battle.status === 'active' && timeInfo.mins > 0;

                    // Calculate betting odds
                    const odds = calculateOdds(p1.userId, p2.userId, sales, battles);

                    return (
                        <div
                            key={battle.id}
                            className="bg-[#0a0e1a] rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group"
                            onClick={() => onViewDetails(battle)}
                        >
                            {/* HEADER BAR - Betting slip style */}
                            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-rose-900/30 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    {isLive ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Live</span>
                                        </div>
                                    ) : battle.status === 'pending' ? (
                                        <span className="text-[10px] font-bold text-amber-400 uppercase">Bíður</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Lokið</span>
                                    )}
                                    <span className="text-[10px] text-slate-600">•</span>
                                    <span className="text-[10px] text-slate-500">{battle.format.duration === 'quick' ? 'Sprettur' : 'Maraþon'}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-black ${timeInfo.urgent ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-black/30 text-slate-300'}`}>
                                    <Clock size={12} />
                                    {timeInfo.str}
                                </div>
                            </div>

                            {/* MAIN CONTENT - VS Display with Odds */}
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    {/* Player 1 with Odds */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white ${p1Leading ? 'bg-emerald-500 ring-2 ring-emerald-400/50' : 'bg-slate-700'}`}>
                                                {p1.avatar}
                                            </div>
                                            {odds.player1Favorite && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <Trophy size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{p1.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-black ${getOddsColor(odds.player1Odds)}`}>
                                                    {formatOdds(odds.player1Odds)}
                                                </span>
                                                <span className="text-[9px] text-slate-600">({odds.player1Probability}%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scores */}
                                    <div className="flex items-center gap-2 px-4">
                                        <span className={`text-xl font-black ${p1Leading ? 'text-emerald-400' : isTied ? 'text-amber-400' : 'text-white'}`}>
                                            {formatISK(p1Score)}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">VS</span>
                                        </div>
                                        <span className={`text-xl font-black ${p2Leading ? 'text-emerald-400' : isTied ? 'text-amber-400' : 'text-white'}`}>
                                            {formatISK(p2Score)}
                                        </span>
                                    </div>

                                    {/* Player 2 with Odds */}
                                    <div className="flex items-center gap-3 flex-1 justify-end text-right">
                                        <div>
                                            <p className="font-bold text-white text-sm">{p2.name}</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-[9px] text-slate-600">({odds.player2Probability}%)</span>
                                                <span className={`text-xs font-black ${getOddsColor(odds.player2Odds)}`}>
                                                    {formatOdds(odds.player2Odds)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white ${p2Leading ? 'bg-emerald-500 ring-2 ring-emerald-400/50' : 'bg-slate-700'}`}>
                                                {p2.avatar}
                                            </div>
                                            {odds.player2Favorite && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <Trophy size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="mt-4 flex gap-1 h-1.5 rounded-full overflow-hidden bg-white/5">
                                    <div
                                        className={`transition-all duration-700 ${p1Leading ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.max(2, (p1Score / (p1Score + p2Score || 1)) * 100)}%` }}
                                    />
                                    <div
                                        className={`transition-all duration-700 ${p2Leading ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: `${Math.max(2, (p2Score / (p1Score + p2Score || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* BETTING ODDS BAR - 1 X 2 Style */}
                            <div className="flex gap-2 px-4 pb-4">
                                {/* Bet on Player 1 */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPlaceBet(battle); }}
                                    className={`flex-1 py-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${odds.player1Odds < 1.5 ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30' :
                                            odds.player1Odds < 2.0 ? 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30' :
                                                odds.player1Odds < 2.5 ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30' :
                                                    'bg-indigo-500/20 border-indigo-500/50 hover:bg-indigo-500/30'
                                        }`}
                                >
                                    <p className="text-[9px] text-slate-400 font-bold mb-0.5">1</p>
                                    <p className={`text-lg font-black ${getOddsColor(odds.player1Odds)}`}>
                                        {formatOdds(odds.player1Odds)}
                                    </p>
                                </button>

                                {/* Tie / Draw */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPlaceBet(battle); }}
                                    className="flex-1 py-3 rounded-xl bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <p className="text-[9px] text-slate-400 font-bold mb-0.5">X</p>
                                    <p className="text-lg font-black text-slate-400">5.00</p>
                                </button>

                                {/* Bet on Player 2 */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onPlaceBet(battle); }}
                                    className={`flex-1 py-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${odds.player2Odds < 1.5 ? 'bg-rose-500/20 border-rose-500/50 hover:bg-rose-500/30' :
                                            odds.player2Odds < 2.0 ? 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30' :
                                                odds.player2Odds < 2.5 ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30' :
                                                    'bg-indigo-500/20 border-indigo-500/50 hover:bg-indigo-500/30'
                                        }`}
                                >
                                    <p className="text-[9px] text-slate-400 font-bold mb-0.5">2</p>
                                    <p className={`text-lg font-black ${getOddsColor(odds.player2Odds)}`}>
                                        {formatOdds(odds.player2Odds)}
                                    </p>
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default LiveBattlesView;
