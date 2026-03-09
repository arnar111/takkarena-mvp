import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Coins, ChevronRight, Flame, Swords, Zap } from 'lucide-react';
import { Challenge, subscribeChallenges, claimChallengeReward } from '../services/challengeService';

interface ChallengesPanelProps {
    userId: string;
    onClaimReward?: (coins: number) => void;
}

const ChallengesPanel: React.FC<ChallengesPanelProps> = ({ userId, onClaimReward }) => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeChallenges(userId, setChallenges);
        return () => unsubscribe();
    }, [userId]);

    const dailyChallenges = challenges.filter(c => c.type === 'daily' || c.type === 'manager_assigned');
    const weeklyChallenges = challenges.filter(c => c.type === 'weekly');
    const displayedChallenges = activeTab === 'daily' ? dailyChallenges : weeklyChallenges;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'streak': return <Flame className="w-4 h-4 text-orange-400" />;
            case 'battle': return <Swords className="w-4 h-4 text-purple-400" />;
            case 'time': return <Clock className="w-4 h-4 text-blue-400" />;
            default: return <Target className="w-4 h-4 text-emerald-400" />;
        }
    };

    const handleClaim = async (challenge: Challenge) => {
        try {
            await claimChallengeReward(challenge.id);
            onClaimReward?.(challenge.reward);
        } catch (err) {
            console.error('Error claiming reward:', err);
        }
    };

    return (
        <div className="glass rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Áskoranir
                </h3>

                {/* Tab Switcher */}
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors
              ${activeTab === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dagleg
                    </button>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors
              ${activeTab === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Vikuleg
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {displayedChallenges.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Engar áskoranir í gangi</p>
                    </div>
                ) : (
                    displayedChallenges.map(challenge => {
                        const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100);
                        const isCompleted = challenge.status === 'completed';
                        const isClaimed = challenge.status === 'claimed';

                        return (
                            <div
                                key={challenge.id}
                                className={`p-3 rounded-xl border transition-all
                  ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' :
                                        isClaimed ? 'bg-white/5 border-white/5 opacity-60' :
                                            'bg-white/5 border-white/10 hover:border-white/20'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${isCompleted ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            getCategoryIcon(challenge.category)
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-white text-sm truncate">{challenge.title}</h4>
                                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                                <Coins className="w-3 h-3" />
                                                {challenge.reward}
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-2">{challenge.description}</p>

                                        {/* Progress bar */}
                                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500
                          ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-500">
                                                {challenge.progress}/{challenge.target}
                                            </span>

                                            {isCompleted && !isClaimed && (
                                                <button
                                                    onClick={() => handleClaim(challenge)}
                                                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                                >
                                                    Sækja verðlaun <ChevronRight className="w-3 h-3" />
                                                </button>
                                            )}

                                            {isClaimed && (
                                                <span className="text-xs text-slate-500">Sótt ✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChallengesPanel;
