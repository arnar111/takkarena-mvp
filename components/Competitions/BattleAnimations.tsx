import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Flame } from 'lucide-react';

/**
 * Battle Start Animation
 */
export const BattleStartAnimation: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={onComplete}
        >
            <motion.div
                className="text-8xl font-black"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
                <span className="text-indigo-400">VS</span>
            </motion.div>

            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 4, opacity: 0 }}
                animate={{ scale: 1, opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5 }}
            >
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            </motion.div>
        </motion.div>
    );
};

/**
 * Victory Animation
 */
export const VictoryAnimation: React.FC<{
    type?: 'confetti' | 'fireworks' | 'champion';
    onComplete?: () => void;
}> = ({ type = 'confetti', onComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={onComplete}
        >
            {type === 'confetti' && (
                <>
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7'][i % 4],
                                left: `${Math.random() * 100}%`,
                                top: -20
                            }}
                            animate={{
                                y: window.innerHeight + 100,
                                rotate: Math.random() * 360,
                                opacity: [1, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: Math.random() * 0.5
                            }}
                        />
                    ))}
                </>
            )}

            {type === 'fireworks' && (
                <>
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${20 + i * 15}%`,
                                bottom: '20%'
                            }}
                        >
                            <motion.div
                                className="text-4xl"
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 2, 3],
                                    opacity: [1, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.3
                                }}
                            >
                                🎆
                            </motion.div>
                        </motion.div>
                    ))}
                </>
            )}

            {type === 'champion' && (
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ scale: 0, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <motion.div
                        className="text-9xl"
                        animate={{
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        🏆
                    </motion.div>
                    <motion.div
                        className="text-4xl font-black text-amber-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        CHAMPION!
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * Milestone Celebration (when hitting sales goals mid-battle)
 */
export const MilestoneCelebration: React.FC<{ amount: number }> = ({ amount }) => {
    return (
        <motion.div
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[150]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2 }}
        >
            <div className="glass rounded-2xl p-6 flex items-center gap-4 shadow-2xl">
                <Sparkles className="text-amber-400" size={32} />
                <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Milestone!</div>
                    <div className="text-2xl font-black text-white">
                        {amount.toLocaleString()} ISK
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Comeback Surge Effect (when trailing player makes significant progress)
 */
export const ComebackSurge: React.FC = () => {
    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1 }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1/3 flex items-center justify-center"
                animate={{ y: [-100, 0, -100] }}
                transition={{ duration: 1 }}
            >
                <Flame className="text-orange-500" size={64} />
            </motion.div>
        </motion.div>
    );
};

/**
 * Simple fade-in animation for components
 */
export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
    children,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.div>
    );
};
