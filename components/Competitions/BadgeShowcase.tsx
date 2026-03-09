import React, { useState } from 'react';
import { Lock, Star, Sparkles } from 'lucide-react';
import { Badge } from '../../types';
import { ENHANCED_BADGES, getBadgesByRarity, getBadgesByCategory } from '../../utils/enhancedBadges';

interface BadgeShowcaseProps {
    earnedBadges: Badge[];
    userStats: any; // Stats for progress calculation
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ earnedBadges, userStats }) => {
    const [filter, setFilter] = useState<'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary'>('all');
    const [showOnlyEarned, setShowOnlyEarned] = useState(false);

    const filteredBadges = ENHANCED_BADGES.filter(badge => {
        // Filter by rarity
        if (filter !== 'all' && badge.rarity !== filter) return false;

        // Filter by earned status
        if (showOnlyEarned && !earnedBadges.some(b => b.id === badge.id)) return false;

        return true;
    });

    const earnedIds = new Set(earnedBadges.map(b => b.id));
    const totalBadges = ENHANCED_BADGES.length;
    const earnedCount = earnedBadges.length;
    const completionPercent = Math.round((earnedCount / totalBadges) * 100);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'Common': return 'text-slate-400';
            case 'Rare': return 'text-blue-400';
            case 'Epic': return 'text-purple-400';
            case 'Legendary': return 'text-amber-400';
            default: return 'text-slate-400';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'Rare': return 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
            case 'Epic': return 'shadow-[0_0_20px_rgba(168,85,247,0.6)]';
            case 'Legendary': return 'shadow-[0_0_25px_rgba(245,158,11,0.7)] animate-pulse';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Collection Progress */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-black text-white">Badge Collection</h3>
                        <p className="text-sm text-slate-400">{earnedCount} of {totalBadges} badges earned</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-indigo-400">{completionPercent}%</div>
                        <div className="text-xs text-slate-500">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === 'all' ? 'gradient-bg text-white' : 'glass text-slate-400 hover:text-white'
                        }`}
                >
                    All
                </button>
                {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map(rarity => (
                    <button
                        key={rarity}
                        onClick={() => setFilter(rarity)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === rarity ? getRarityColor(rarity) + ' bg-white/10' : 'glass text-slate-500 hover:text-white'
                            }`}
                    >
                        <Sparkles size={14} className="inline mr-2" />
                        {rarity}
                    </button>
                ))}
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                    type="checkbox"
                    checked={showOnlyEarned}
                    onChange={(e) => setShowOnlyEarned(e.target.checked)}
                    className="rounded"
                />
                <span className="text-slate-400">Show only earned badges</span>
            </label>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBadges.map(badge => {
                    const isEarned = earnedIds.has(badge.id);
                    const isSecret = badge.secret && !isEarned;

                    return (
                        <div
                            key={badge.id}
                            className={`glass rounded-2xl p-4 transition-all ${isEarned ? 'border border-white/20' : 'opacity-50 grayscale'
                                } ${isEarned && badge.rarity !== 'Common' ? getRarityGlow(badge.rarity) : ''}`}
                        >
                            <div className="text-center mb-3">
                                {isSecret ? (
                                    <div className="text-5xl opacity-30">
                                        <Lock size={48} className="mx-auto text-slate-600" />
                                    </div>
                                ) : (
                                    <div className="text-5xl">{badge.icon}</div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className={`font-black text-sm ${getRarityColor(badge.rarity)}`}>
                                    {isSecret ? '???' : badge.name}
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-2">
                                    {isSecret ? 'Secret badge - keep playing to unlock!' : badge.description}
                                </div>

                                {!isSecret && (
                                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                                        <span className={`font-bold ${getRarityColor(badge.rarity)}`}>
                                            {badge.rarity}
                                        </span>
                                        <span className="text-amber-400 font-bold">
                                            +{badge.reward} coins
                                        </span>
                                    </div>
                                )}

                                {isEarned && (
                                    <div className="absolute top-2 right-2">
                                        <Star size={16} className="text-amber-400 fill-amber-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredBadges.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No badges found with current filters
                </div>
            )}
        </div>
    );
};

export default BadgeShowcase;
