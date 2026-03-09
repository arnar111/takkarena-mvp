import React, { useMemo } from 'react';
import { Clock, Zap, Trophy, Target, TrendingUp, Award, Star, Flame } from 'lucide-react';
import { BOSS_TIERS, LOOT_TIERS, SALESMAN_ROLES } from '../../constants/bossBattle';

interface ReplayEvent {
    type: 'sale' | 'ability' | 'powerup' | 'milestone';
    timestamp: number;
    userId?: string;
    userName?: string;
    amount?: number;
    abilityId?: string;
    powerupId?: string;
    milestone?: string;
}

interface BattleReplayProps {
    battle: {
        id: string;
        name: string;
        tier: string;
        targetValue: number;
        currentDamage: number;
        participants: Array<{
            userId: string;
            name: string;
            avatar: string;
            damage: number;
            salesCount: number;
            role?: string | null;
        }>;
        startTime: string;
        endTime: string;
        status: 'completed' | 'failed';
        events?: ReplayEvent[];
        lootTiers?: string[];
    };
    onClose: () => void;
}

const BattleReplay: React.FC<BattleReplayProps> = ({ battle, onClose }) => {
    const startTime = new Date(battle.startTime).getTime();
    const endTime = new Date(battle.endTime).getTime();
    const totalDuration = endTime - startTime;
    const isVictory = battle.status === 'completed';

    // Sort participants by damage for final standings
    const standings = useMemo(() => {
        return [...battle.participants].sort((a, b) => b.damage - a.damage);
    }, [battle.participants]);

    const mvp = standings[0];
    const tierConfig = BOSS_TIERS[battle.tier as keyof typeof BOSS_TIERS];

    // Generate timeline from events
    const timeline = useMemo(() => {
        if (!battle.events) return [];

        return battle.events.map(event => ({
            ...event,
            relativeTime: event.timestamp - startTime,
            percentProgress: ((event.timestamp - startTime) / totalDuration) * 100,
        }));
    }, [battle.events, startTime, totalDuration]);

    // Calculate key moments
    const keyMoments = useMemo(() => {
        const moments: Array<{ label: string; time: number; icon: React.ReactNode }> = [];

        // Find first sale
        const firstSale = timeline.find(e => e.type === 'sale');
        if (firstSale) {
            moments.push({
                label: `Fyrsta sala - ${firstSale.userName}`,
                time: firstSale.relativeTime!,
                icon: <Zap size={14} className="text-amber-400" />,
            });
        }

        // Find 50% milestone
        let runningDamage = 0;
        const halfwayEvent = timeline.find(e => {
            if (e.type === 'sale' && e.amount) {
                runningDamage += e.amount;
                return runningDamage >= battle.targetValue / 2;
            }
            return false;
        });
        if (halfwayEvent) {
            moments.push({
                label: '50% náð!',
                time: halfwayEvent.relativeTime!,
                icon: <Target size={14} className="text-indigo-400" />,
            });
        }

        // Find biggest sale
        const biggestSale = timeline
            .filter(e => e.type === 'sale' && e.amount)
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
        if (biggestSale) {
            moments.push({
                label: `Stærsta sala - ${new Intl.NumberFormat('is-IS').format(biggestSale.amount || 0)} kr`,
                time: biggestSale.relativeTime!,
                icon: <Flame size={14} className="text-rose-400" />,
            });
        }

        return moments.sort((a, b) => a.time - b.time);
    }, [timeline, battle.targetValue]);

    const formatNum = (n: number) => new Intl.NumberFormat('is-IS').format(n);
    const formatDuration = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs} klst ${mins % 60} mín` : `${mins} mín`;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER - Victory/Defeat */}
                <div className={`p-8 text-center relative overflow-hidden ${isVictory ? 'bg-gradient-to-b from-emerald-900/40 to-transparent' : 'bg-gradient-to-b from-rose-900/40 to-transparent'
                    }`}>
                    <div className={`absolute inset-0 ${isVictory ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`} />

                    <div className="relative z-10">
                        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-xl mb-4 ${isVictory ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'
                            }`}>
                            {isVictory ? <Trophy size={40} className="text-white" /> : <Target size={40} className="text-white" />}
                        </div>

                        <h2 className={`text-3xl font-black ${isVictory ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isVictory ? 'SIGUR!' : 'ÓSIGRAÐ'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">{battle.name}</p>

                        {/* Loot badges */}
                        {battle.lootTiers && battle.lootTiers.length > 0 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {battle.lootTiers.map(lootId => {
                                    const loot = LOOT_TIERS[lootId as keyof typeof LOOT_TIERS];
                                    return loot ? (
                                        <div key={lootId} className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                                            {loot.emoji} {loot.name}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* STATS */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Skaði</p>
                            <p className="text-lg font-black text-white">{formatNum(battle.currentDamage)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Markmið</p>
                            <p className="text-lg font-black text-white">{formatNum(battle.targetValue)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Lengd</p>
                            <p className="text-lg font-black text-white">{formatDuration(endTime - startTime)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Framvinda</p>
                            <p className={`text-lg font-black ${battle.currentDamage >= battle.targetValue ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {Math.round((battle.currentDamage / battle.targetValue) * 100)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* KEY MOMENTS TIMELINE */}
                {keyMoments.length > 0 && (
                    <div className="px-6 py-4 border-b border-white/10">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Lykilaugnablik</h3>
                        <div className="space-y-3">
                            {keyMoments.map((moment, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        {moment.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{moment.label}</p>
                                        <p className="text-[10px] text-slate-500">{formatDuration(moment.time)} frá byrjun</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FINAL STANDINGS */}
                <div className="px-6 py-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Award size={14} className="text-amber-400" /> Lokastig
                    </h3>

                    <div className="space-y-2">
                        {standings.map((participant, index) => {
                            const isMvp = index === 0;
                            const role = participant.role ? SALESMAN_ROLES[participant.role as keyof typeof SALESMAN_ROLES] : null;

                            return (
                                <div
                                    key={participant.userId}
                                    className={`p-3 rounded-xl flex items-center gap-3 ${isMvp ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30' : 'bg-white/5 border border-white/5'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-500 text-black' :
                                            index === 1 ? 'bg-slate-400 text-black' :
                                                index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-slate-700 text-white'
                                        }`}>
                                        {isMvp ? <Star size={14} /> : index + 1}
                                    </div>

                                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                        {participant.avatar}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-sm">{participant.name}</p>
                                            {role && <span className="text-sm">{role.emoji}</span>}
                                            {isMvp && <span className="text-[9px] bg-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-bold">MVP</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-500">{participant.salesCount} sölur</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-black text-white">{formatNum(participant.damage)}</p>
                                        <p className="text-[10px] text-slate-500">skaði</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CLOSE */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all"
                    >
                        Loka
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BattleReplay;
