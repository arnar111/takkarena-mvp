import React from 'react';
import { Level } from '../../types';

interface LevelProgressProps {
    currentLevel: Level;
    nextLevel?: Level;
    currentAmount: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ currentLevel, nextLevel, currentAmount }) => {
    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));
    const distToNextLevel = nextLevel ? nextLevel.min - currentAmount : 0;

    // Calculate percentage
    let width = 100;
    if (nextLevel) {
        width = ((currentAmount - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100;
    }

    // Visual enhancements based on level (starting at Level 3+)
    const levelId = currentLevel.id;
    const hasGlow = levelId >= 3;
    const hasParticles = levelId >= 5;
    const hasEnhancedGlow = levelId >= 7;
    const hasPremiumEffects = levelId >= 10;

    // Dynamic colors based on level
    const getLevelGradient = () => {
        if (levelId >= 10) return 'from-purple-500 via-pink-500 to-red-500';
        if (levelId >= 7) return 'from-blue-500 via-purple-500 to-pink-500';
        if (levelId >= 5) return 'from-cyan-500 via-blue-500 to-purple-500';
        if (levelId >= 3) return 'from-emerald-500 via-cyan-500 to-blue-500';
        return 'from-indigo-500 to-indigo-600';
    };

    const getLevelTextColor = () => {
        if (levelId >= 10) return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400';
        if (levelId >= 7) return 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400';
        if (levelId >= 5) return 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400';
        if (levelId >= 3) return 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400';
        return currentLevel.color.replace('bg-', 'text-');
    };

    return (
        <div className={`glass p-6 rounded-[32px] border-white/10 relative overflow-hidden ${hasGlow ? 'shadow-2xl' : ''}`}>
            {/* Glow effect for Level 3+ */}
            {hasGlow && (
                <div className={`absolute inset-0 bg-gradient-to-br ${getLevelGradient()} opacity-10 blur-3xl animate-pulse`} />
            )}

            {/* Enhanced glow for Level 7+ */}
            {hasEnhancedGlow && (
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-2xl animate-pulse" style={{ animationDuration: '2s' }} />
            )}

            {/* Particle effect for Level 5+ */}
            {hasParticles && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Premium shimmer for Level 10+ */}
            {hasPremiumEffects && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}

            <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Núverandi Level</p>
                        <h3 className={`text-2xl font-black ${getLevelTextColor()} ${hasPremiumEffects ? 'animate-pulse' : ''}`}>
                            {currentLevel.title}
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Næsta Level</p>
                        <p className="text-sm font-bold text-white">{nextLevel ? nextLevel.title : "MAX"}</p>
                    </div>
                </div>

                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden relative">
                    {/* Background shimmer for high levels */}
                    {levelId >= 5 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                    <div
                        className={`h-full bg-gradient-to-r ${getLevelGradient()} transition-all duration-1000 ease-out relative ${hasGlow ? 'shadow-lg' : ''}`}
                        style={{ width: `${width}%` }}
                    >
                        {/* Inner glow */}
                        {hasEnhancedGlow && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent animate-pulse" />
                        )}
                    </div>
                </div>

                {nextLevel && (
                    <p className="text-[10px] text-center mt-3 text-slate-400 font-bold">
                        Vantar {formatISK(distToNextLevel)} í næsta level
                    </p>
                )}
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100%) translateX(20px);
                        opacity: 0;
                    }
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-float {
                    animation: float 3s infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default LevelProgress;
