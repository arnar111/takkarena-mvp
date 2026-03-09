import React from 'react';
import { Trophy, TrendingUp, Award, Lock } from 'lucide-react';
import { User } from '../../types';
import { LEAGUE_TIERS, calculateLeagueTier, getPromotionProgress, getNextTier } from '../../utils/leagueConfig';

interface LeagueSystemViewProps {
    user: User;
    userStats: {
        totalSales: number;
        battleWins: number;
        badgesEarned: number;
    };
}

const LeagueSystemView: React.FC<LeagueSystemViewProps> = ({ user, userStats }) => {
    const currentTier = user.leagueTier || 'Bronze';
    const currentPoints = user.leaguePoints || 0;
    const tierConfig = LEAGUE_TIERS[currentTier];
    const nextTier = getNextTier(currentTier);
    const promotionProgress = getPromotionProgress(currentPoints, currentTier);

    return (
        <div className="space-y-6">
            {/* Current Tier Card */}
            <div className="glass rounded-3xl p-8 border-2" style={{ borderColor: tierConfig.color }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Þín deild</div>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{tierConfig.icon}</span>
                            <div>
                                <div className="text-3xl font-black" style={{ color: tierConfig.color }}>
                                    {currentTier}
                                </div>
                                <div className="text-sm text-slate-400">{currentPoints.toLocaleString()} stig</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Tímabils verðlaun</div>
                        <div className="flex items-center gap-2 justify-end">
                            <Trophy size={20} className="text-amber-400" />
                            <span className="text-2xl font-black text-amber-400">{tierConfig.rewards}</span>
                            <span className="text-slate-500">coins</span>
                        </div>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                {nextTier && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Framvinda til {nextTier}</span>
                            <span className="font-bold text-white">{Math.round(promotionProgress)}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${promotionProgress}%`,
                                    background: `linear-gradient(90deg, ${tierConfig.color}, ${LEAGUE_TIERS[nextTier].color})`
                                }}
                            />
                        </div>
                        <div className="text-xs text-slate-500">
                            {LEAGUE_TIERS[nextTier].minPoints - currentPoints} stig í stighækkun
                        </div>
                    </div>
                )}

                {currentTier === 'Diamond' && (
                    <div className="text-center text-slate-400 italic">
                        🎉 Þú hefur náð hæsta stigi! Haltu stöðunni!
                    </div>
                )}
            </div>

            {/* All Tiers Overview */}
            <div className="space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Award size={20} />
                    Allar deildir
                </h3>

                <div className="grid gap-3">
                    {(['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'] as const).map(tier => {
                        const config = LEAGUE_TIERS[tier];
                        const isCurrentTier = tier === currentTier;
                        const isUnlocked = currentPoints >= config.minPoints;

                        return (
                            <div
                                key={tier}
                                className={`glass rounded-xl p-4 transition-all ${isCurrentTier ? 'border-2 shadow-lg' : 'border border-white/5'
                                    }`}
                                style={isCurrentTier ? { borderColor: config.color } : {}}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{config.icon}</span>
                                        <div>
                                            <div className={`font-black ${isUnlocked ? '' : 'text-slate-600'}`} style={isUnlocked ? { color: config.color } : {}}>
                                                {tier}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {config.minPoints.toLocaleString()}+ stig
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500">Verðlaun</div>
                                            <div className="font-bold text-amber-400">{config.rewards} coins</div>
                                        </div>

                                        {!isUnlocked && (
                                            <Lock size={20} className="text-slate-600" />
                                        )}
                                        {isCurrentTier && (
                                            <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs font-black text-indigo-400">
                                                NÚNA
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* How to Earn Points */}
            <div className="glass rounded-xl p-6">
                <h4 className="font-black text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Hvernig safnar þú stigum
                </h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Sölur (á hverjar 1.000 kr)</span>
                        <span className="font-bold text-white">1 stig</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Bardagasigur</span>
                        <span className="font-bold text-white">50 stig</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Merki unnið</span>
                        <span className="font-bold text-white">25 stig</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeagueSystemView;
