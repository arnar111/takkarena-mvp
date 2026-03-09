import React, { useMemo, useState, useEffect } from 'react';
import { X, Trophy, Swords, Calendar, TrendingUp, Clock, Zap, Target, BarChart3, Flame, TrendingDown } from 'lucide-react';
import { Battle, Sale } from '../../types';
import { calculateOdds, formatOdds, getOddsColor } from '../../utils/oddsCalculator';

interface BattleInsightsModalProps {
    battle: Battle;
    sales: Sale[];
    onClose: () => void;
}

const BattleInsightsModal: React.FC<BattleInsightsModalProps> = ({ battle, sales, onClose }) => {
    const [now, setNow] = useState(new Date());

    // Update time every second for live countdown
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Compute LIVE scores from the sales array
    const getLiveScore = (userId: string) => {
        const battleStart = new Date(battle.startTime).getTime();
        const battleEnd = new Date(battle.endTime).getTime();

        return sales
            .filter(s => {
                const saleTime = new Date(s.timestamp || s.date).getTime();
                return s.userId === userId && saleTime >= battleStart && saleTime <= battleEnd;
            })
            .reduce((sum, s) => sum + s.amount, 0);
    };

    const getLiveSalesCount = (userId: string) => {
        const battleStart = new Date(battle.startTime).getTime();
        const battleEnd = new Date(battle.endTime).getTime();

        return sales.filter(s => {
            const saleTime = new Date(s.timestamp || s.date).getTime();
            return s.userId === userId && saleTime >= battleStart && saleTime <= battleEnd;
        }).length;
    };

    // Create participants with live data
    const liveParticipants = useMemo(() => {
        return battle.participants.map(p => ({
            ...p,
            currentSales: getLiveScore(p.userId),
            salesCount: getLiveSalesCount(p.userId),
        }));
    }, [battle.participants, sales]);

    // Time calculations
    const battleEnd = new Date(battle.endTime).getTime();
    const battleStart = new Date(battle.startTime).getTime();
    const timeLeft = Math.max(0, battleEnd - now.getTime());
    const totalDuration = battleEnd - battleStart;
    const elapsed = totalDuration - timeLeft;
    const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);

    const mins = Math.floor(timeLeft / 60000);
    const secs = Math.floor((timeLeft % 60000) / 1000);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const isLive = battle.status === 'active' && timeLeft > 0;
    const isUrgent = mins < 10 && isLive;

    // Determine leader
    const p1 = liveParticipants[0];
    const p2 = liveParticipants[1];
    const p1Leading = p1?.currentSales > p2?.currentSales;
    const p2Leading = p2?.currentSales > p1?.currentSales;
    const isTied = p1?.currentSales === p2?.currentSales;
    const leadAmount = Math.abs((p1?.currentSales || 0) - (p2?.currentSales || 0));

    // Calculate stats
    const p1AvgPerSale = p1?.salesCount > 0 ? Math.round(p1.currentSales / p1.salesCount) : 0;
    const p2AvgPerSale = p2?.salesCount > 0 ? Math.round(p2.currentSales / p2.salesCount) : 0;
    const p1Rate = elapsed > 0 ? Math.round(p1?.currentSales / (elapsed / 3600000)) : 0; // per hour
    const p2Rate = elapsed > 0 ? Math.round(p2?.currentSales / (elapsed / 3600000)) : 0;

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(val);

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md relative animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* CLOSE BUTTON - Large clickable area */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 z-50 w-10 h-10 bg-slate-800 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20"
                >
                    <X size={20} className="text-white" />
                </button>

                {/* BETTING SLIP CARD */}
                <div className="bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

                    {/* HEADER - Live indicator */}
                    <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-rose-900/50 px-5 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            {isLive ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black uppercase text-rose-400 tracking-widest">Live</span>
                                </div>
                            ) : (
                                <span className="text-xs font-bold text-slate-500 uppercase">Lokið</span>
                            )}
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">{battle.format.duration === 'quick' ? 'Sprettur' : 'Maraþon'}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-black ${isUrgent ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-black/30 text-white'}`}>
                            <Clock size={14} />
                            {timeStr}
                        </div>
                    </div>

                    {/* MAIN BATTLE AREA */}
                    <div className="p-5">

                        {/* VS DISPLAY */}
                        <div className="flex items-center justify-between mb-6">
                            {/* Player 1 */}
                            <div className="flex-1 text-center">
                                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg mb-2 ${p1Leading ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-400/50' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                                    {p1?.avatar || '??'}
                                </div>
                                <p className="font-bold text-white text-sm truncate px-2">{p1?.name?.split(' ')[0] || 'Player 1'}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{p1?.salesCount || 0} sölur</p>
                            </div>

                            {/* Score Display */}
                            <div className="flex-shrink-0 px-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-3xl font-black ${p1Leading ? 'text-emerald-400' : isTied ? 'text-amber-400' : 'text-white'}`}>
                                        {formatISK(p1?.currentSales || 0)}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="text-xs font-black text-slate-400">VS</span>
                                    </div>
                                    <span className={`text-3xl font-black ${p2Leading ? 'text-emerald-400' : isTied ? 'text-amber-400' : 'text-white'}`}>
                                        {formatISK(p2?.currentSales || 0)}
                                    </span>
                                </div>
                                <p className="text-center text-[10px] text-slate-500 mt-1">kr.</p>
                            </div>

                            {/* Player 2 */}
                            <div className="flex-1 text-center">
                                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg mb-2 ${p2Leading ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-400/50' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                                    {p2?.avatar || '??'}
                                </div>
                                <p className="font-bold text-white text-sm truncate px-2">{p2?.name?.split(' ')[0] || 'Player 2'}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{p2?.salesCount || 0} sölur</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative mb-6">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-500">{Math.round(progressPercent)}% liðið</span>
                                <span className="text-[10px] text-slate-500">Markmið: {formatISK(battle.targetValue)}</span>
                            </div>
                        </div>

                        {/* BETTING ODDS SECTION */}
                        {(() => {
                            const odds = calculateOdds(p1?.userId || '', p2?.userId || '', sales, []);
                            return (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {/* Bet on Player 1 */}
                                    <button className="p-3 rounded-xl bg-gradient-to-b from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 hover:border-indigo-400/50 transition-all group">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-slate-400">1</span>
                                            {odds.player1Favorite && <Trophy size={10} className="text-amber-400" />}
                                        </div>
                                        <p className={`text-lg font-black ${getOddsColor(odds.player1Odds)} group-hover:scale-105 transition-transform`}>
                                            {formatOdds(odds.player1Odds)}
                                        </p>
                                        <p className="text-[9px] text-slate-500">{odds.player1Probability}% líkur</p>
                                    </button>

                                    {/* Draw / Tie */}
                                    <button className="p-3 rounded-xl bg-gradient-to-b from-slate-500/20 to-slate-600/10 border border-slate-500/30 hover:border-slate-400/50 transition-all group">
                                        <div className="flex items-center justify-center mb-1">
                                            <span className="text-[10px] text-slate-400">X</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-400 group-hover:scale-105 transition-transform">
                                            5.00
                                        </p>
                                        <p className="text-[9px] text-slate-500">Jafntefli</p>
                                    </button>

                                    {/* Bet on Player 2 */}
                                    <button className="p-3 rounded-xl bg-gradient-to-b from-rose-500/20 to-rose-600/10 border border-rose-500/30 hover:border-rose-400/50 transition-all group">
                                        <div className="flex items-center justify-between mb-1">
                                            {odds.player2Favorite && <Trophy size={10} className="text-amber-400" />}
                                            <span className="text-[10px] text-slate-400 ml-auto">2</span>
                                        </div>
                                        <p className={`text-lg font-black ${getOddsColor(odds.player2Odds)} group-hover:scale-105 transition-transform`}>
                                            {formatOdds(odds.player2Odds)}
                                        </p>
                                        <p className="text-[9px] text-slate-500">{odds.player2Probability}% líkur</p>
                                    </button>
                                </div>
                            );
                        })()}

                        {/* LEAD INDICATOR */}
                        {!isTied && (
                            <div className={`text-center py-3 px-4 rounded-xl mb-4 ${p1Leading ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                                <div className="flex items-center justify-center gap-2">
                                    {p1Leading ? <Trophy className="w-4 h-4 text-emerald-400" /> : <Zap className="w-4 h-4 text-rose-400" />}
                                    <span className={`text-sm font-bold ${p1Leading ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {p1Leading ? p1?.name?.split(' ')[0] : p2?.name?.split(' ')[0]} leiðir með {formatISK(leadAmount)} kr
                                    </span>
                                </div>
                            </div>
                        )}
                        {isTied && (
                            <div className="text-center py-3 px-4 rounded-xl mb-4 bg-amber-500/10 border border-amber-500/30">
                                <span className="text-sm font-bold text-amber-400">⚔️ Jafntefli!</span>
                            </div>
                        )}

                        {/* INSIGHTS GRID */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 size={12} className="text-indigo-400" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Meðalsala</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-black text-white">{formatISK(p1AvgPerSale)}</span>
                                    <span className="text-sm font-black text-white">{formatISK(p2AvgPerSale)}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Flame size={12} className="text-orange-400" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Hraði/klst</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-black text-white">{formatISK(p1Rate)}</span>
                                    <span className="text-sm font-black text-white">{formatISK(p2Rate)}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target size={12} className="text-purple-400" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Markmið %</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-black text-white">{Math.round(((p1?.currentSales || 0) / battle.targetValue) * 100)}%</span>
                                    <span className="text-sm font-black text-white">{Math.round(((p2?.currentSales || 0) / battle.targetValue) * 100)}%</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={12} className="text-emerald-400" />
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Fjöldi</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-black text-white">{p1?.salesCount || 0}</span>
                                    <span className="text-sm font-black text-white">{p2?.salesCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-5 py-3 bg-black/30 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(battle.createdAt).toLocaleDateString('is-IS')}
                        </p>
                        {isLive && (
                            <div className="flex items-center gap-1 text-emerald-400">
                                <TrendingUp size={12} className="animate-pulse" />
                                <span className="text-[10px] font-bold">Keppni í gangi</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattleInsightsModal;
