import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

interface LuckyWheelModalProps {
    onClose: () => void;
    onWin: (amount: number) => void;
}

const SEGMENTS = [
    { label: '50', value: 50, color: '#f59e0b', probability: 0.4 },
    { label: 'Tómur', value: 0, color: '#64748b', probability: 0.3 },
    { label: '100', value: 100, color: '#10b981', probability: 0.2 },
    { label: '500', value: 500, color: '#8b5cf6', probability: 0.05 },
    { label: '25', value: 25, color: '#ec4899', probability: 0.05 },
];

const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ onClose, onWin }) => {
    const controls = useAnimation();
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ label: string; value: number } | null>(null);

    const spinWheel = async () => {
        if (spinning || result) return;
        setSpinning(true);

        // Determine result based on probability
        const rand = Math.random();
        let cumulativeProb = 0;
        let selectedSegment = SEGMENTS[0];

        for (const segment of SEGMENTS) {
            cumulativeProb += segment.probability;
            if (rand <= cumulativeProb) {
                selectedSegment = segment;
                break;
            }
        }

        // Calculate rotation
        // Each segment is 360 / 5 = 72 degrees
        // Randomize extra rotations (5-10 spins)
        const segmentAngle = 360 / SEGMENTS.length;
        const extraRotations = 360 * (5 + Math.floor(Math.random() * 5));

        // Find index logic (assuming 0 is at top, needing -90 offset correction or similar)
        // Let's rely on relative rotation. 
        // We want to land on a specific index. 
        const index = SEGMENTS.indexOf(selectedSegment);

        // If 0 is top (12 o clock), logic:
        // We rotate CLOCKWISE.
        // Landing on index 0 means rotation % 360 ~= 0 (or bounded).
        // Landing on index 1 means rotation % 360 ~= -72 (or 360-72).

        // Simple hack: Random rotation ending in the "middle" of the segment wedge
        // Target angle for index i: -(i * segmentAngle)
        const targetRotation = extraRotations - (index * segmentAngle);
        // Add random jitter within wedge (-30 to +30 deg roughly)
        const jitter = (Math.random() - 0.5) * (segmentAngle - 10);
        const finalRotation = targetRotation + jitter;

        await controls.start({
            rotate: finalRotation,
            transition: { duration: 4, type: "spring", damping: 50, stiffness: 50, ease: "easeOut" }
        });

        setTimeout(() => {
            setResult(selectedSegment);
            onWin(selectedSegment.value);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm flex flex-col items-center">
                <button onClick={onClose} className="absolute -top-12 right-0 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all">
                    <X size={24} />
                </button>

                {!result ? (
                    <div className="relative w-72 h-72 md:w-80 md:h-80">
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 text-white filter drop-shadow-lg">
                            <div className="w-8 h-8 bg-rose-500 rotate-45 transform origin-center border-4 border-white rounded-sm shadow-xl" />
                        </div>

                        {/* Outer Rim */}
                        <div className="absolute inset-0 rounded-full border-[8px] border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                            <motion.div
                                animate={controls}
                                className="w-full h-full rounded-full relative"
                                style={{ transformOrigin: "center" }}
                            >
                                {SEGMENTS.map((seg, i) => {
                                    const rotation = i * (360 / SEGMENTS.length);
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 left-1/2 w-[50%] h-[50%] origin-bottom-left"
                                            style={{
                                                transform: `rotate(${rotation}deg) skewY(-18deg)`, // 72deg segments need skew hack or conical gradient usually. 
                                                // Actually pure CSS conic gradient is easier for background, but divs needed for text.
                                                // Let's use Conic Gradient for colors and absolute positioning for text.
                                            }}
                                        >

                                        </div>
                                    );
                                })}
                                {/* Re-doing wheel visually with Conic Gradient as it's cleaner than skewed divs */}
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        background: `conic-gradient(
                                            ${SEGMENTS.map((s, i) => `${s.color} ${i * (100 / SEGMENTS.length)}% ${(i + 1) * (100 / SEGMENTS.length)}%`).join(', ')}
                                        )`
                                    }}
                                />

                                {/* Labels */}
                                {SEGMENTS.map((seg, i) => {
                                    const angle = i * (360 / SEGMENTS.length) + (360 / SEGMENTS.length) / 2;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 left-0 w-full h-full flex justify-center pt-8 pointer-events-none"
                                            style={{ transform: `rotate(${angle}deg)` }}
                                        >
                                            <span className="text-white font-black text-lg drop-shadow-md rotate-180" style={{ transform: 'rotate(0deg)' }}>{seg.label}</span>
                                        </div>
                                    );
                                })}

                            </motion.div>

                            {/* Center Pin */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg z-10" />
                        </div>
                    </div>
                ) : (
                    <div className="glass p-8 rounded-[40px] text-center animate-in zoom-in duration-300 w-full relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 mb-6 flex justify-center">
                            <div className="p-6 bg-amber-500/20 rounded-full text-amber-400 animate-bounce">
                                <Trophy size={48} />
                            </div>
                        </div>

                        <h3 className="text-3xl font-black text-white italic tracking-tighter mb-2">
                            {result.value > 0 ? "Til hamingju!" : "Því miður..."}
                        </h3>
                        <p className="text-slate-400 font-bold mb-6">Þú vannst</p>

                        <div className="text-5xl font-black text-white mb-8 drop-shadow-xl">
                            {result.value} <span className="text-2xl text-amber-500">🪙</span>
                        </div>

                        <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-wider transform transition hover:scale-105 active:scale-95">
                            Loka
                        </button>
                    </div>
                )}

                {!spinning && !result && (
                    <button
                        onClick={spinWheel}
                        className="mt-12 px-12 py-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full text-white font-black uppercase tracking-widest text-xl shadow-[0_0_40px_rgba(244,63,94,0.5)] transform transition hover:scale-105 active:scale-95 animate-pulse"
                    >
                        Snúa!
                    </button>
                )}
            </div>
        </div>
    );
};

export default LuckyWheelModal;
