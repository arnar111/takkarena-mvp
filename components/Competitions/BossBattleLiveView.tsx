import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Zap, Shield, Heart, Clock, Users, TrendingUp, Flame, Trophy, Target } from 'lucide-react';
import {
    BOSS_TIERS,
    BATTLE_TYPES,
    SALESMAN_ROLES,
    BOSS_ABILITIES,
    TEAM_POWERUPS,
    LOOT_TIERS,
    BossTier,
    BattleType,
} from '../../constants/bossBattle';

interface BossParticipant {
    userId: string;
    name: string;
    avatar: string;
    damage: number;
    salesCount: number;
    role?: string | null;
}

interface ActivePowerUp {
    id: string;
    expiresAt: number;
}

interface BossBattleData {
    id: string;
    name: string;
    tier: BossTier;
    battleType: BattleType;
    targetValue: number;
    currentDamage: number;
    participants: BossParticipant[];
    abilities: { id: string; triggeredAt: number }[];
    powerUps: ActivePowerUp[];
    startTime: string;
    endTime: string;
    status: 'active' | 'completed' | 'failed';
}

interface BossBattleLiveViewProps {
    battle: BossBattleData;
    onClose: () => void;
}

const BossBattleLiveView: React.FC<BossBattleLiveViewProps> = ({ battle, onClose }) => {
    const [now, setNow] = useState(Date.now());
    const [showAbilityPopup, setShowAbilityPopup] = useState<string | null>(null);

    // Update time every second
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate HP
    const hpPercent = Math.min(100, (battle.currentDamage / battle.targetValue) * 100);
    const remainingHp = Math.max(0, battle.targetValue - battle.currentDamage);

    // Time calculations
    const endTime = new Date(battle.endTime).getTime();
    const startTime = new Date(battle.startTime).getTime();
    const timeLeft = Math.max(0, endTime - now);
    const totalDuration = endTime - startTime;
    const timePercent = ((totalDuration - timeLeft) / totalDuration) * 100;

    const mins = Math.floor(timeLeft / 60000);
    const secs = Math.floor((timeLeft % 60000) / 1000);
    const isRageMode = timeLeft < 15 * 60 * 1000 && timeLeft > 0;

    // Sort participants by damage (leaderboard)
    const leaderboard = useMemo(() => {
        return [...battle.participants].sort((a, b) => b.damage - a.damage);
    }, [battle.participants]);

    const mvp = leaderboard[0];
    const tierConfig = BOSS_TIERS[battle.tier];
    const typeConfig = BATTLE_TYPES[battle.battleType];

    // Format numbers
    const formatNum = (n: number) => new Intl.NumberFormat('is-IS').format(n);

    // Active power-ups
    const activePowerUps = battle.powerUps.filter(p => p.expiresAt > now);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER - Boss Info */}
                <div className="p-6 bg-gradient-to-b from-purple-900/40 via-rose-900/20 to-transparent relative overflow-hidden">
                    {/* Rage mode overlay */}
                    {isRageMode && (
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-rose-500/10 animate-pulse" />
                    )}

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center shadow-xl border-2 border-purple-400/50">
                                <Crown size={32} className="text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">{tierConfig.emoji}</span>
                                    <h2 className="text-xl font-black text-white">{battle.name}</h2>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span>{typeConfig.emoji} {typeConfig.name}</span>
                                    <span>•</span>
                                    <span>{battle.participants.length} þátttakendur</span>
                                </div>
                            </div>
                        </div>

                        {/* Timer */}
                        <div className={`px-4 py-2 rounded-xl font-mono text-lg font-black ${isRageMode ? 'bg-rose-500/30 text-rose-400 animate-pulse' : 'bg-black/40 text-white'}`}>
                            <div className="flex items-center gap-2">
                                {isRageMode && <Zap size={16} className="text-rose-400" />}
                                <Clock size={16} />
                                <span>{mins}:{secs.toString().padStart(2, '0')}</span>
                            </div>
                            {isRageMode && <p className="text-[9px] text-rose-300 text-center mt-1">RAGE MODE!</p>}
                        </div>
                    </div>

                    {/* HP BAR */}
                    <div className="mt-6">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400 flex items-center gap-1">
                                <Heart size={12} className="text-rose-400" /> HP
                            </span>
                            <span className="text-white font-bold">
                                {formatNum(remainingHp)} / {formatNum(battle.targetValue)}
                            </span>
                        </div>
                        <div className="h-6 bg-black/40 rounded-full overflow-hidden relative border border-white/10">
                            {/* Damage done (from left) */}
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                                style={{ width: `${hpPercent}%` }}
                            />
                            {/* Remaining HP indicator */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-black text-white drop-shadow-lg">
                                    {Math.round(hpPercent)}% skaði
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE POWER-UPS */}
                    {(activePowerUps.length > 0 || isRageMode) && (
                        <div className="mt-4 flex gap-2">
                            {isRageMode && (
                                <div className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                                    <Zap size={12} /> 2x Skaði!
                                </div>
                            )}
                            {activePowerUps.map(pu => {
                                const config = TEAM_POWERUPS[pu.id as keyof typeof TEAM_POWERUPS];
                                return config ? (
                                    <div key={pu.id} className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs font-bold flex items-center gap-1">
                                        {config.emoji} {config.name}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>

                {/* LEADERBOARD */}
                <div className="p-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-purple-400" /> Live Leaderboard
                    </h3>

                    <div className="space-y-2">
                        {leaderboard.map((participant, index) => {
                            const isMvp = index === 0;
                            const damagePercent = battle.currentDamage > 0
                                ? (participant.damage / battle.currentDamage) * 100
                                : 0;
                            const role = participant.role ? SALESMAN_ROLES[participant.role as keyof typeof SALESMAN_ROLES] : null;

                            return (
                                <div
                                    key={participant.userId}
                                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${isMvp ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30' : 'bg-white/5 border border-white/5'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-500 text-black' :
                                            index === 1 ? 'bg-slate-400 text-black' :
                                                index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-slate-700 text-white'
                                        }`}>
                                        {isMvp ? <Crown size={14} /> : index + 1}
                                    </div>

                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                            {participant.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white text-sm truncate">{participant.name}</p>
                                                {role && <span className="text-sm">{role.emoji}</span>}
                                                {isMvp && <span className="text-[9px] bg-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-bold">MVP</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                                <span>{participant.salesCount} sölur</span>
                                                <span>{Math.round(damagePercent)}% af skaða</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Damage */}
                                    <div className="text-right">
                                        <p className="font-black text-white">{formatNum(participant.damage)}</p>
                                        <p className="text-[10px] text-slate-500">skaði</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BOSS ABILITIES LOG */}
                {battle.abilities.length > 0 && (
                    <div className="px-6 pb-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Boss atburðir</h4>
                        <div className="flex flex-wrap gap-2">
                            {battle.abilities.slice(-3).map((ability, i) => {
                                const config = BOSS_ABILITIES[ability.id as keyof typeof BOSS_ABILITIES];
                                return config ? (
                                    <div key={i} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1">
                                        {config.emoji} {config.name}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* CLOSE BUTTON */}
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

export default BossBattleLiveView;
