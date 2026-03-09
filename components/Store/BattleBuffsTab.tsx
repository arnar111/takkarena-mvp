import React, { useState } from 'react';
import { Zap, Shield, Rocket, Turtle, Snowflake, Sparkles, Coins, Check } from 'lucide-react';
import { BATTLE_BUFFS } from '../../constants/botPersonality';

interface BattleBuffsTabProps {
    userCoins: number;
    ownedBuffs: string[];
    onPurchase: (buffId: string, price: number) => void;
}

const BUFF_ICONS: Record<string, React.ReactNode> = {
    head_start: <Rocket size={24} />,
    slow_opponent: <Turtle size={24} />,
    double_first: <Sparkles size={24} />,
    comeback_shield: <Shield size={24} />,
    lucky_streak: <Zap size={24} />,
    time_freeze: <Snowflake size={24} />,
};

const BattleBuffsTab: React.FC<BattleBuffsTabProps> = ({
    userCoins,
    ownedBuffs,
    onPurchase,
}) => {
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    const handlePurchase = (buffId: string, price: number) => {
        if (userCoins < price) return;
        setPurchasingId(buffId);
        setTimeout(() => {
            onPurchase(buffId, price);
            setPurchasingId(null);
        }, 500);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white italic tracking-tight">Battle Buffs</h3>
                    <p className="text-xs text-slate-500">Vopnaðu þig fyrir næstu keppni</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-xl">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="font-black text-amber-400">{userCoins}</span>
                </div>
            </div>

            {/* Buffs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BATTLE_BUFFS.map((buff) => {
                    const isOwned = ownedBuffs.includes(buff.id);
                    const canAfford = userCoins >= buff.price;
                    const isPurchasing = purchasingId === buff.id;

                    return (
                        <div
                            key={buff.id}
                            className={`glass p-4 rounded-2xl border transition-all ${isOwned
                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                    : canAfford
                                        ? 'border-white/10 hover:border-purple-500/50'
                                        : 'border-white/5 opacity-60'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className={`p-3 rounded-xl ${isOwned
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}
                                >
                                    {BUFF_ICONS[buff.id] || <Zap size={24} />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{buff.emoji}</span>
                                        <h4 className="font-black text-white">{buff.name}</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{buff.description}</p>

                                    {/* Action */}
                                    {isOwned ? (
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                            <Check size={14} />
                                            Keypt
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(buff.id, buff.price)}
                                            disabled={!canAfford || isPurchasing}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${canAfford
                                                    ? 'bg-purple-500 hover:bg-purple-600 text-white active:scale-95'
                                                    : 'bg-white/10 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isPurchasing ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins size={12} />
                                                    {buff.price}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="glass p-4 rounded-xl border border-amber-500/20 mt-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <Zap size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white mb-1">Hvernig virka buffs?</p>
                        <p className="text-xs text-slate-400">
                            Veldu buff áður en þú byrjar keppni. Buffið gildir aðeins fyrir eina keppni
                            og er notað sjálfkrafa þegar keppnin byrjar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BattleBuffsTab;
