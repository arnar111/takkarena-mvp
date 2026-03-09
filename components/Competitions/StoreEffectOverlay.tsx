import React, { useState, useEffect } from 'react';
import { Phone, X, Gift, MessageCircle, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreEffectOverlayProps {
    activeModal: 'none' | 'boss_call' | 'mystery_box' | 'compliment';
    onClose: () => void;
    onMysteryWin?: (amount: number) => void;
}

const StoreEffectOverlay: React.FC<StoreEffectOverlayProps> = ({ activeModal, onClose, onMysteryWin }) => {

    // --- BOSS CALL LOGIC ---
    const [callStatus, setCallStatus] = useState<'incoming' | 'connected'>('incoming');

    useEffect(() => {
        if (activeModal === 'boss_call') {
            setCallStatus('incoming');
            // Play ringtone here if we had sound
        }
    }, [activeModal]);

    const handleAnswer = () => {
        setCallStatus('connected');
        setTimeout(() => {
            onClose();
        }, 4000);
    };

    // --- MYSTERY BOX LOGIC ---
    const [boxOpen, setBoxOpen] = useState(false);
    const [mysteryResult, setMysteryResult] = useState(0);

    useEffect(() => {
        if (activeModal === 'mystery_box') {
            setBoxOpen(false);
            setMysteryResult(0);
        }
    }, [activeModal]);

    const openBox = () => {
        if (boxOpen) return;
        setBoxOpen(true);
        // Random logic: 30% nothing, 50% small (50-200), 20% big (200-500)
        const rand = Math.random();
        let win = 0;
        if (rand > 0.3) {
            win = Math.floor(Math.random() * 150) + 50;
            if (rand > 0.8) win += 300;
        }

        setMysteryResult(win);
        if (onMysteryWin && win > 0) onMysteryWin(win);

        setTimeout(() => {
            onClose();
        }, 4000); // Close after showing result
    };


    if (activeModal === 'none') return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">

            {/* BOSS CALL */}
            {activeModal === 'boss_call' && (
                <div className="w-full max-w-xs bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-700 relative h-[600px] flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center pt-20 text-center space-y-4">
                        <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mb-4 overflow-hidden border-4 border-slate-700">
                            <span className="text-6xl">🤵</span>
                        </div>
                        <h2 className="text-3xl font-black text-white">Bjarni Ben</h2>
                        <p className="text-slate-400 font-medium animate-pulse">
                            {callStatus === 'incoming' ? 'Hringir í þig...' : '00:03'}
                        </p>
                    </div>

                    <div className="p-12 pb-20">
                        {callStatus === 'incoming' ? (
                            <div className="flex justify-between items-center gap-8">
                                <button onClick={onClose} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all">
                                        <Phone size={28} className="rotate-[135deg]" />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase">Hafna</span>
                                </button>
                                <button onClick={handleAnswer} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg animate-bounce group-active:scale-95 transition-all">
                                        <Phone size={28} />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase">Svara</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8">
                                <p className="text-white text-lg font-bold">"Heyrðu, glæsileg sala þarna áðan! Haltu þessu áfram!"</p>
                                <button onClick={onClose} className="w-16 h-16 rounded-full bg-rose-500 text-white mx-auto flex items-center justify-center mt-8">
                                    <Phone size={28} className="rotate-[135deg]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MYSTERY BOX */}
            {activeModal === 'mystery_box' && (
                <div className="text-center relative">
                    <AnimatePresence>
                        {!boxOpen ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                onClick={openBox}
                                className="cursor-pointer group"
                            >
                                <div className="w-64 h-64 bg-slate-800 rounded-3xl flex items-center justify-center border-4 border-amber-500/20 shadow-[0_0_100px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-all animate-bounce-slow">
                                    <Gift size={100} className="text-amber-500" />
                                </div>
                                <p className="text-white font-black uppercase tracking-widest mt-8 animate-pulse">Ýttu til að opna</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="glass p-12 rounded-[40px] border-white/10"
                            >
                                <div className="mb-6 flex justify-center">
                                    <div className="p-6 bg-white/10 rounded-full text-white">
                                        {mysteryResult > 0 ? <Sparkles size={48} className="text-amber-400" /> : <X size={48} className="text-slate-500" />}
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white italic mb-2">
                                    {mysteryResult > 0 ? "Vinningur!" : "Tómt..."}
                                </h3>
                                {mysteryResult > 0 && (
                                    <div className="text-5xl font-black text-amber-500 drop-shadow-md mb-6">
                                        +{mysteryResult} 🪙
                                    </div>
                                )}
                                <p className="text-slate-400 font-bold max-w-[200px] mx-auto">
                                    {mysteryResult > 0 ? "Ekki slæmt!" : "Betra næst..."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* COMPLIMENT */}
            {activeModal === 'compliment' && (
                <div onClick={onClose} className="glass p-8 rounded-[32px] max-w-sm text-center border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] cursor-pointer">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white italic mb-4">Skilaboð frá MorriAI</h3>
                    <p className="text-lg font-bold text-slate-300">
                        "Þú ert algjör vél! Ef sölu-guðirnir væru til, væru þeir hræddir við þig."
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-6">Ýttu til að loka</p>
                </div>
            )}

        </div>
    );
};

export default StoreEffectOverlay;
