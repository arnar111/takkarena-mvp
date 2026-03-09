import React, { useState, useMemo } from 'react';
import { Crown, Users, TrendingUp, AlertCircle, Send, Eye, Zap, Target, Clock, BarChart3 } from 'lucide-react';
import { BOSS_TIERS, SALESMAN_ROLES } from '../../constants/bossBattle';

interface Participant {
    userId: string;
    name: string;
    avatar: string;
    damage: number;
    salesCount: number;
    role?: string | null;
    lastSaleTime?: number;
}

interface BossBattle {
    id: string;
    name: string;
    tier: string;
    targetValue: number;
    currentDamage: number;
    participants: Participant[];
    startTime: string;
    endTime: string;
    status: 'active' | 'completed' | 'failed';
}

interface ManagerWarRoomProps {
    battle: BossBattle;
    onSendNudge: (userId: string, message: string) => void;
    onViewParticipant: (userId: string) => void;
}

const ManagerWarRoom: React.FC<ManagerWarRoomProps> = ({ battle, onSendNudge, onViewParticipant }) => {
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
    const [nudgeMessage, setNudgeMessage] = useState('');

    const now = Date.now();
    const hpPercent = (battle.currentDamage / battle.targetValue) * 100;
    const endTime = new Date(battle.endTime).getTime();
    const startTime = new Date(battle.startTime).getTime();
    const timeLeft = Math.max(0, endTime - now);
    const totalDuration = endTime - startTime;
    const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

    // Sort participants by damage
    const rankedParticipants = useMemo(() => {
        return [...battle.participants].sort((a, b) => b.damage - a.damage);
    }, [battle.participants]);

    // Identify struggling participants (no sale in last 30 min or below avg)
    const avgDamage = battle.currentDamage / battle.participants.length;
    const strugglingIds = useMemo(() => {
        return battle.participants
            .filter(p => {
                const inactive = p.lastSaleTime && (now - p.lastSaleTime) > 30 * 60 * 1000;
                const belowAvg = p.damage < avgDamage * 0.5;
                return inactive || belowAvg;
            })
            .map(p => p.userId);
    }, [battle.participants, avgDamage, now]);

    const formatNum = (n: number) => new Intl.NumberFormat('is-IS').format(n);
    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs}:${(mins % 60).toString().padStart(2, '0')} klst` : `${mins} mín`;
    };

    const tierConfig = BOSS_TIERS[battle.tier as keyof typeof BOSS_TIERS];

    const handleNudge = (userId: string) => {
        if (nudgeMessage.trim()) {
            onSendNudge(userId, nudgeMessage);
            setNudgeMessage('');
            setSelectedParticipant(null);
        }
    };

    const quickNudges = [
        { emoji: '💪', text: 'Þú getur þetta!' },
        { emoji: '🔥', text: 'Höldum áfram!' },
        { emoji: '⏰', text: 'Tíminn er að renna út!' },
        { emoji: '🎯', text: 'Eina salan enn!' },
    ];

    return (
        <div className="bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10">
            {/* HEADER */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <BarChart3 size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">War Room</h2>
                            <p className="text-xs text-slate-400">{battle.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-white">{tierConfig?.emoji} {tierConfig?.name}</p>
                        <p className="text-xs text-slate-500">{formatTime(timeLeft)} eftir</p>
                    </div>
                </div>

                {/* STATS OVERVIEW */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Framvinda</p>
                        <p className="text-lg font-black text-white">{Math.round(hpPercent)}%</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Skaði</p>
                        <p className="text-lg font-black text-emerald-400">{formatNum(battle.currentDamage)}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Markmið</p>
                        <p className="text-lg font-black text-white">{formatNum(battle.targetValue)}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Liðsmenn</p>
                        <p className="text-lg font-black text-white">{battle.participants.length}</p>
                    </div>
                </div>
            </div>

            {/* TEAM STATUS */}
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} className="text-indigo-400" /> Liðið
                    </h3>
                    {strugglingIds.length > 0 && (
                        <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                            <AlertCircle size={12} /> {strugglingIds.length} þurfa hvatningu
                        </span>
                    )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {rankedParticipants.map((participant, index) => {
                        const isStruggling = strugglingIds.includes(participant.userId);
                        const role = participant.role ? SALESMAN_ROLES[participant.role as keyof typeof SALESMAN_ROLES] : null;
                        const damagePercent = battle.currentDamage > 0 ? (participant.damage / battle.currentDamage) * 100 : 0;
                        const isSelected = selectedParticipant === participant.userId;

                        return (
                            <div
                                key={participant.userId}
                                className={`rounded-xl border transition-all ${isStruggling
                                        ? 'bg-rose-500/10 border-rose-500/30'
                                        : isSelected
                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                            : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="p-3 flex items-center gap-3">
                                    {/* Rank */}
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${index === 0 ? 'bg-amber-500 text-black' :
                                            index === 1 ? 'bg-slate-400 text-black' :
                                                index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-slate-700 text-white'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white relative">
                                            {participant.avatar}
                                            {isStruggling && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                                                    <AlertCircle size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-white text-sm truncate">{participant.name}</p>
                                                {role && <span className="text-sm">{role.emoji}</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <span>{formatNum(participant.damage)} skaði</span>
                                                <span>•</span>
                                                <span>{Math.round(damagePercent)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onViewParticipant(participant.userId)}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedParticipant(isSelected ? null : participant.userId)}
                                            className={`p-2 rounded-lg transition-all ${isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400'
                                                }`}
                                        >
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Nudge Panel */}
                                {isSelected && (
                                    <div className="px-3 pb-3 pt-1 border-t border-white/5">
                                        <div className="flex gap-2 mb-2">
                                            {quickNudges.map(nudge => (
                                                <button
                                                    key={nudge.text}
                                                    onClick={() => {
                                                        onSendNudge(participant.userId, nudge.text);
                                                        setSelectedParticipant(null);
                                                    }}
                                                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-[10px] font-bold transition-all"
                                                >
                                                    {nudge.emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={nudgeMessage}
                                                onChange={e => setNudgeMessage(e.target.value)}
                                                placeholder="Sérsniðin skilaboð..."
                                                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                            />
                                            <button
                                                onClick={() => handleNudge(participant.userId)}
                                                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white text-xs font-bold transition-all"
                                            >
                                                Senda
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ManagerWarRoom;
