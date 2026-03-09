import React, { useState } from 'react';
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react';
import { STORE_ITEMS } from '../../constants';
import { User, StoreItem } from '../../types';
import LuckyWheelModal from './LuckyWheelModal.tsx';

interface StoreViewProps {
    coins: number;
    onBuy: (item: StoreItem) => void;
    inventory: string[]; // List of item IDs owned
    onWheelWin: (amount: number) => void;
}

const StoreView: React.FC<StoreViewProps> = ({ coins, onBuy, inventory, onWheelWin }) => {
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [showWheel, setShowWheel] = useState(false);

    const handleBuy = (item: StoreItem) => {
        if (coins < item.price) return;

        if (item.id === 'wheel') {
            // Deduct coins immediately for wheel (Store parent handles this logic? No, onBuy normally handles it)
            // Actually, we need to trigger the deduction and THEN show modal?
            // Or show modal, and if they spin, we deduct?
            // Simpler: Buy it, which deducts coins (via onBuy), then show modal.
            // But onBuy adds to inventory... which we don't want for consumables.
            // Refactor: onBuy should ideally handle "type" or we just handle deduction manually?
            // Let's assume onBuy can handle it or we pass a special flag.
            // For now: We'll modify parent to NOT add 'wheel' to inventory if we don't want checkmarks.
            // But let's keep it simple: We call a separate `onPurchaseWheel` or just handle it locally.
            // Let's call onBuy to deduct coins, but we need to ensure it doesn't just "finish".
            // Actually, let's open modal first. The modal "spin" cost is the price.
            setPurchasing(item.id);
            setTimeout(() => {
                setPurchasing(null);
                setShowWheel(true);
                // We rely on parent to deduct price? Or we pass "onBuy" to modal?
                // Let's trigger onBuy(item) to deduct cost.
                onBuy(item);
            }, 500);
            return;
        }

        setPurchasing(item.id);
        setTimeout(() => {
            onBuy(item);
            setPurchasing(null);
        }, 800);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {showWheel && (
                <LuckyWheelModal
                    onClose={() => setShowWheel(false)}
                    onWin={(amount) => {
                        // Winner logic
                        onWheelWin(amount);
                        // Don't close immediately? The modal handles its own result state.
                    }}
                />
            )}

            {/* Balance Card */}
            <div className="glass p-8 rounded-[32px] border-amber-500/20 relative overflow-hidden text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="p-4 bg-amber-500/20 rounded-full text-amber-400 mb-2 animate-bounce">
                        <Coins size={32} />
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-xl">{coins.toLocaleString()}</h2>
                    <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Takk Coins</p>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STORE_ITEMS.map((item) => {
                    const canAfford = coins >= item.price;
                    const isOwned = inventory.includes(item.id) && item.id !== 'wheel'; // Wheel is consumable
                    const isBuying = purchasing === item.id;

                    return (
                        <div key={item.id} className={`glass p-6 rounded-[32px] border-white/5 relative group transition-all duration-300 ${canAfford ? 'hover:scale-[1.02] hover:bg-white/5' : 'opacity-70'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-4xl filter drop-shadow-md">{item.icon}</div>
                                <div className={`px-3 py-1 rounded-full text-xs font-black ${canAfford ? 'bg-amber-500 text-slate-900' : 'bg-white/10 text-slate-500'}`}>
                                    {item.price} 🪙
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-white italic mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-400 font-bold mb-6 h-10">{item.description}</p>

                            <button
                                disabled={!canAfford || isOwned || isBuying}
                                onClick={() => handleBuy(item)}
                                className={`w-full py-3 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${isOwned
                                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                    : canAfford
                                        ? 'bg-white text-slate-900 shadow-lg hover:shadow-xl'
                                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                {isBuying ? (
                                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                ) : isOwned ? (
                                    <>Eign <Check size={14} /></>
                                ) : (
                                    <>Kaupa <ShoppingBag size={14} /></>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StoreView;
