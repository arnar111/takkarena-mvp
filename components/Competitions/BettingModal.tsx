import React, { useState } from 'react';
import { DollarSign, TrendingUp, Trophy, Users, X } from 'lucide-react';
import { Battle, BettingPool, UserBet } from '../../types';
import { calculateOdds, placeBet, calculatePotentialWinnings } from '../../utils/bettingEngine';

interface BettingModalProps {
    battle: Battle;
    currentUserId: string;
    userCoins: number;
    existingPool?: BettingPool;
    onPlaceBet: (bet: { predictedWinner: string; amount: number }) => void;
    onClose: () => void;
}

const BettingModal: React.FC<BettingModalProps> = ({
    battle,
    currentUserId,
    userCoins,
    existingPool,
    onPlaceBet,
    onClose
}) => {
    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
    const [betAmount, setBetAmount] = useState<number>(50);

    // Calculate current odds
    const currentOdds = existingPool
        ? existingPool.odds
        : battle.participants.reduce((acc, p) => ({ ...acc, [p.userId]: 2.0 }), {});

    const potentialWinnings = selectedWinner
        ? calculatePotentialWinnings(betAmount, currentOdds[selectedWinner] || 1.0)
        : 0;

    const canAfford = betAmount <= userCoins;
    const canBet = selectedWinner && betAmount > 0 && canAfford;

    const handlePlaceBet = () => {
        if (!canBet || !selectedWinner) return;

        onPlaceBet({
            predictedWinner: selectedWinner,
            amount: betAmount
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 lg:left-64 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <DollarSign className="text-amber-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white">Place Your Bet</h3>
                            <p className="text-sm text-slate-400">Predict the winner and earn coins!</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Your Balance */}
                <div className="glass rounded-2xl p-4 mb-6 bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Your Balance</span>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-amber-400" />
                            <span className="text-xl font-black text-white">{userCoins}</span>
                            <span className="text-slate-500">coins</span>
                        </div>
                    </div>
                </div>

                {/* Pool Info */}
                {existingPool && (
                    <div className="glass rounded-2xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={16} className="text-indigo-400" />
                            <span className="text-sm font-bold text-white">Pool Stats</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Total Pool:</span>
                                <span className="ml-2 font-bold text-white">{existingPool.poolTotal} coins</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Total Bets:</span>
                                <span className="ml-2 font-bold text-white">{existingPool.bets.length}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Select Winner */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-3">Who will win?</label>
                    <div className="space-y-3">
                        {battle.participants.map(participant => {
                            const odds = currentOdds[participant.userId] || 1.0;
                            const isSelected = selectedWinner === participant.userId;

                            return (
                                <button
                                    key={participant.userId}
                                    onClick={() => setSelectedWinner(participant.userId)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center font-black text-white">
                                                {participant.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white">{participant.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    Current: {participant.currentSales.toLocaleString()} ISK
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-amber-400">{odds.toFixed(2)}x</div>
                                            <div className="text-xs text-slate-500">Odds</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bet Amount */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-3">Bet Amount</label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="number"
                                min="1"
                                max={userCoins}
                                value={betAmount}
                                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Enter amount"
                            />
                        </div>
                        {[50, 100, 250, 500].map(amount => (
                            <button
                                key={amount}
                                onClick={() => setBetAmount(Math.min(amount, userCoins))}
                                className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors font-bold text-sm whitespace-nowrap"
                                disabled={amount > userCoins}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                    {!canAfford && (
                        <p className="text-xs text-rose-400 mt-2">Not enough coins!</p>
                    )}
                </div>

                {/* Potential Winnings */}
                {selectedWinner && (
                    <div className="glass rounded-2xl p-6 mb-6 bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-indigo-400" size={24} />
                                <span className="font-bold text-white">Potential Winnings</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-indigo-400">
                                    {potentialWinnings}
                                </div>
                                <div className="text-xs text-slate-500">
                                    +{potentialWinnings - betAmount} profit
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 glass rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePlaceBet}
                        disabled={!canBet}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canBet
                                ? 'gradient-bg text-white shadow-lg hover:scale-105'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <Trophy size={20} />
                        Place Bet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BettingModal;
