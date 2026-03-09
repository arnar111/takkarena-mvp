import React, { useState, useEffect, useCallback } from 'react';
import { Target, Crown, CheckCircle2, Coins, Sparkles, Gift, RefreshCw } from 'lucide-react';
import { Bounty, DIFFICULTY_COLORS } from '../../utils/bounties';

interface BountyCardProps {
    bounties: Bounty[];
    completedIds: string[];
    onClaimBounty: (bountyId: string, coins: number) => void;
    onReplaceBounty: (oldBountyId: string, newBounty: Bounty) => void;
    onRefreshBounties?: () => void;  // Add new context-aware bounties
}

const BountyCard: React.FC<BountyCardProps> = ({ bounties, completedIds, onClaimBounty, onReplaceBounty, onRefreshBounties }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [celebratingId, setCelebratingId] = useState<string | null>(null);
    const [slideOutId, setSlideOutId] = useState<string | null>(null);

    if (!bounties || bounties.length === 0) return null;

    const handleClaim = useCallback((bounty: Bounty) => {
        if (claimingId) return; // Prevent double-clicks

        setClaimingId(bounty.id);
        setCelebratingId(bounty.id);

        // Play celebration
        setTimeout(() => {
            // Trigger coin reward
            onClaimBounty(bounty.id, bounty.coins);

            // Start slide out animation
            setSlideOutId(bounty.id);

            setTimeout(() => {
                // Tell parent to replace this bounty (parent handles getting new bounty with stats)
                onReplaceBounty(bounty.id, bounty);

                // Reset states
                setClaimingId(null);
                setCelebratingId(null);
                setSlideOutId(null);
            }, 400);
        }, 800);
    }, [bounties, claimingId, onClaimBounty, onReplaceBounty]);

    const completedCount = bounties.filter(b => completedIds.includes(b.id)).length;

    return (
        <div className="glass p-6 rounded-[32px] border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={16} /> Dagsverkefni
                </h3>
                <div className="flex items-center gap-2">
                    {onRefreshBounties && (
                        <button
                            onClick={() => {
                                // Check for unclaimed completed bounties
                                const unclaimedCompleted = bounties.filter(b =>
                                    completedIds.includes(b.id)
                                ).length;

                                if (unclaimedCompleted > 0) {
                                    const confirmMsg = `Þú átt ${unclaimedCompleted} ókrafin verkefni. Viltu halda áfram?`;
                                    if (!confirm(confirmMsg)) return;
                                }

                                setIsRefreshing(true);
                                onRefreshBounties();
                                setTimeout(() => setIsRefreshing(false), 500);
                            }}
                            disabled={isRefreshing}
                            className={`p-2 rounded-lg transition-all ${isRefreshing
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 active:scale-90'
                                }`}
                            title="Endurnýja verkefni"
                            aria-label="Endurnýja dagsverkefni"
                        >
                            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                        {completedCount}/{bounties.length}
                    </span>
                    {completedCount === bounties.length && (
                        <span className="text-xs font-black text-emerald-400 animate-pulse">✨ FULLKLÁRT!</span>
                    )}
                </div>
            </div>

            {/* Bounty List */}
            <div className="space-y-3">
                {bounties.map((bounty) => {
                    const isComplete = completedIds.includes(bounty.id);
                    const isClaiming = claimingId === bounty.id;
                    const isCelebrating = celebratingId === bounty.id;
                    const isSliding = slideOutId === bounty.id;
                    const colors = DIFFICULTY_COLORS[bounty.difficulty];

                    return (
                        <div
                            key={bounty.id}
                            className={`
                                relative p-4 rounded-2xl border transition-all duration-300 
                                ${isSliding ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
                                ${isCelebrating ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''}
                                ${isComplete && !isClaiming ? `${colors.bg} ${colors.border} cursor-pointer hover:scale-[1.02] active:scale-[0.98]` : 'bg-white/5 border-white/5'}
                            `}
                            onClick={() => isComplete && !isClaiming && handleClaim(bounty)}
                        >
                            {/* Celebration overlay */}
                            {isCelebrating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-2xl z-10 animate-pulse">
                                    <div className="flex items-center gap-2 text-amber-300">
                                        <Coins size={24} className="animate-bounce" />
                                        <span className="text-lg font-black">+{bounty.coins}</span>
                                        <Sparkles size={20} className="animate-spin" />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Emoji & Difficulty */}
                                <div className={`
                                    h-12 w-12 rounded-xl flex items-center justify-center text-xl
                                    ${isComplete ? colors.bg : 'bg-white/10'}
                                `}>
                                    {bounty.emoji}
                                </div>

                                {/* Task Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${isComplete ? 'text-white' : 'text-white/80'}`}>
                                        {bounty.task}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black uppercase ${colors.text}`}>
                                            {bounty.reward}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            <Coins size={10} /> {bounty.coins}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Icon */}
                                <div className={`
                                    h-10 w-10 rounded-full flex items-center justify-center transition-all
                                    ${isComplete ? `${colors.bg} ${colors.text}` : 'bg-white/10 text-slate-500'}
                                `}>
                                    {isComplete ? (
                                        isClaiming ? (
                                            <Gift size={18} className="animate-bounce" />
                                        ) : (
                                            <div className="relative">
                                                <CheckCircle2 size={18} />
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                                            </div>
                                        )
                                    ) : (
                                        <Crown size={16} />
                                    )}
                                </div>
                            </div>

                            {/* Tap to claim hint */}
                            {isComplete && !isClaiming && (
                                <div className="absolute bottom-1 right-3 text-[8px] font-bold text-amber-400/80 animate-pulse">
                                    TAP TO CLAIM
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};

export default BountyCard;
