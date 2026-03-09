import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Users, MessageCircle, Send, X, Flame, Trophy, TrendingUp } from 'lucide-react';
import { Battle, Sale, User } from '../../types';

interface SpectatorViewProps {
    battle: Battle;
    allSales: Sale[];
    allUsers: User[];
    onClose: () => void;
    onReact?: (reaction: string) => void;
}

const REACTIONS = ['🔥', '👏', '💀', '😱', '🎉', '💪'];

const SpectatorView: React.FC<SpectatorViewProps> = ({
    battle,
    allSales,
    allUsers,
    onClose,
    onReact
}) => {
    const [spectatorCount] = useState(() => Math.floor(Math.random() * 20) + 5);
    const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Calculate live scores
    const liveParticipants = useMemo(() => {
        return battle.participants.map(p => {
            const participantSales = allSales.filter(s =>
                s.userId === p.userId &&
                new Date(s.timestamp) >= new Date(battle.startTime) &&
                new Date(s.timestamp) <= new Date(battle.endTime)
            );
            const total = participantSales.reduce((sum, sale) => sum + sale.amount, 0);
            return { ...p, currentSales: total, salesCount: participantSales.length };
        }).sort((a, b) => b.currentSales - a.currentSales);
    }, [battle, allSales]);

    const leader = liveParticipants[0];
    const secondPlace = liveParticipants[1];
    const leadMargin = leader && secondPlace ? leader.currentSales - secondPlace.currentSales : 0;

    // Handle reaction
    const handleReaction = (emoji: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        const x = Math.random() * 60 + 20; // 20-80% from left
        setReactions(prev => [...prev, { id, emoji, x }]);
        onReact?.(emoji);

        // Remove after animation
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 2000);
    };

    // Time remaining
    const timeRemaining = useMemo(() => {
        const end = new Date(battle.endTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, end - now);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [battle.endTime]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/20 rounded-full">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-rose-400">LIVE</span>
                    </div>
                    <h1 className="text-lg font-bold text-white">Battle Spectator</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{spectatorCount} áhorfendur</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            {/* Main Battle View */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                {/* Floating Reactions */}
                {reactions.map(r => (
                    <div
                        key={r.id}
                        className="absolute bottom-20 text-4xl animate-bounce"
                        style={{ left: `${r.x}%`, animation: 'floatUp 2s ease-out forwards' }}
                    >
                        {r.emoji}
                    </div>
                ))}

                {/* Participants */}
                <div className="flex items-center gap-16">
                    {liveParticipants.map((p, index) => {
                        const isLeader = index === 0;
                        const user = allUsers.find(u => u.staffId === p.userId);

                        return (
                            <div
                                key={p.userId}
                                className={`flex flex-col items-center transition-all duration-500
                  ${isLeader ? 'scale-110' : 'opacity-80'}`}
                            >
                                {/* Crown for leader */}
                                {isLeader && (
                                    <Trophy className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                                )}

                                {/* Avatar */}
                                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black
                  ${isLeader ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-white/10'}
                  border-4 ${isLeader ? 'border-amber-400' : 'border-white/20'}`}>
                                    {p.avatar}
                                </div>

                                <h3 className="mt-3 text-xl font-bold text-white">{p.name}</h3>

                                {/* Score */}
                                <div className={`mt-2 text-4xl font-black
                  ${isLeader ? 'text-amber-400' : 'text-white'}`}>
                                    {p.currentSales.toLocaleString('is-IS')}
                                    <span className="text-lg text-slate-400 ml-1">kr</span>
                                </div>

                                <div className="text-sm text-slate-500 mt-1">
                                    {p.salesCount} sölur
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">VS</span>
                    </div>
                </div>

                {/* Lead indicator */}
                {leadMargin > 0 && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">
                            +{leadMargin.toLocaleString('is-IS')} kr forskot
                        </span>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className="text-center pb-4">
                <span className="text-5xl font-black text-white font-mono">{timeRemaining}</span>
                <p className="text-sm text-slate-500 mt-1">Eftir</p>
            </div>

            {/* Reactions Bar */}
            <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4">
                {REACTIONS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="text-3xl hover:scale-125 transition-transform active:scale-90"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-200px); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default SpectatorView;
