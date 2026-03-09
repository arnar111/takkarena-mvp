import React from 'react';
import { Flame, Trophy, TrendingUp, Swords } from 'lucide-react';
import { Rivalry, User } from '../../types';
import { calculateRivalryStats } from '../../utils/rivalryMatcher';

interface RivalryTrackerProps {
    rivalries: Rivalry[];
    currentUser: User;
    battles: any[];
    users: User[];
}

const RivalryTracker: React.FC<RivalryTrackerProps> = ({ rivalries, currentUser, battles, users }) => {
    const userRivalries = rivalries.filter(r => r.users.includes(currentUser.id));

    if (userRivalries.length === 0) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <Flame className="mx-auto mb-3 text-slate-600" size={48} />
                <p className="text-slate-500">No active rivalries</p>
                <p className="text-xs text-slate-600 mt-1">Battle the same opponents to create rivalries!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {userRivalries.map(rivalry => {
                const rivalId = rivalry.users.find(id => id !== currentUser.id);
                const rival = users.find(u => u.id === rivalId);

                if (!rival) return null;

                const stats = calculateRivalryStats(currentUser.id, rivalId!, battles);
                const userWins = stats.wins[currentUser.id] || 0;
                const rivalWins = stats.wins[rivalId!] || 0;
                const totalBattles = stats.totalBattles;

                const isUserWinning = userWins > rivalWins;
                const isStreaking = stats.currentStreak?.userId === currentUser.id;
                const bonusActive = rivalry.bonusMultiplier > 1.0;

                return (
                    <div
                        key={rivalry.id}
                        className={`glass rounded-2xl p-6 border-2 transition-all ${bonusActive ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${isStreaking ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}>
                                    <Flame className={isStreaking ? 'text-amber-400' : 'text-rose-400'} size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        Rivalry vs {rival.name}
                                        {bonusActive && (
                                            <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-[10px] font-black text-amber-400">
                                                {rivalry.bonusMultiplier}x BONUS
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500">{totalBattles} battles fought</div>
                                </div>
                            </div>
                            <Swords className="text-slate-600" size={24} />
                        </div>

                        {/* Win/Loss Record */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`p-4 rounded-xl border-2 ${isUserWinning ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/5'
                                }`}>
                                <div className="text-xs text-slate-500 mb-1">You</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-black text-white">{userWins}</div>
                                    {isUserWinning && <Trophy className="text-green-400" size={20} />}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">wins</div>
                            </div>

                            <div className={`p-4 rounded-xl border-2 ${!isUserWinning && rivalWins > 0 ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 bg-white/5'
                                }`}>
                                <div className="text-xs text-slate-500 mb-1">{rival.name}</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-black text-white">{rivalWins}</div>
                                    {!isUserWinning && rivalWins > 0 && <Trophy className="text-rose-400" size={20} />}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">wins</div>
                            </div>
                        </div>

                        {/* Current Streak */}
                        {stats.currentStreak && stats.currentStreak.count > 1 && (
                            <div className={`p-4 rounded-xl border ${isStreaking
                                    ? 'border-amber-500/20 bg-amber-500/5'
                                    : 'border-rose-500/20 bg-rose-500/5'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flame className={isStreaking ? 'text-amber-400' : 'text-rose-400'} size={16} />
                                        <span className="text-sm font-bold text-white">
                                            {isStreaking ? 'Your' : `${rival.name}'s`} Win Streak
                                        </span>
                                    </div>
                                    <div className={`text-2xl font-black ${isStreaking ? 'text-amber-400' : 'text-rose-400'}`}>
                                        {stats.currentStreak.count}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Win Rate */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Your Win Rate</span>
                                <span className={`font-bold ${userWins / totalBattles > 0.5 ? 'text-green-400' : 'text-rose-400'
                                    }`}>
                                    {totalBattles > 0 ? Math.round((userWins / totalBattles) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RivalryTracker;
