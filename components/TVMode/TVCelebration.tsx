import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, Swords, Award, Star, Sparkles, PartyPopper } from 'lucide-react';
import Confetti from '../Confetti';
import { TVCelebration as TCelebration } from '../../hooks/useTVMode';

interface TVCelebrationProps {
  celebration: TCelebration;
}

const TVCelebration: React.FC<TVCelebrationProps> = ({ celebration }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [celebration.id]);

  const getCelebrationConfig = (type: string) => {
    switch (type) {
      case 'sale':
        return {
          icon: <Trophy className="w-24 h-24" />,
          gradient: 'from-emerald-500 via-green-400 to-emerald-500',
          bgGradient: 'from-emerald-900/40 to-emerald-950/60',
          title: 'Ný Sala!',
          color: 'text-emerald-400',
        };
      case 'goal':
        return {
          icon: <Target className="w-24 h-24" />,
          gradient: 'from-blue-500 via-cyan-400 to-blue-500',
          bgGradient: 'from-blue-900/40 to-blue-950/60',
          title: 'Markmiði Náð!',
          color: 'text-blue-400',
        };
      case 'battle_win':
        return {
          icon: <Swords className="w-24 h-24" />,
          gradient: 'from-purple-500 via-indigo-400 to-purple-500',
          bgGradient: 'from-purple-900/40 to-purple-950/60',
          title: 'Bardagasigur!',
          color: 'text-purple-400',
        };
      case 'achievement':
        return {
          icon: <Award className="w-24 h-24" />,
          gradient: 'from-amber-500 via-yellow-400 to-amber-500',
          bgGradient: 'from-amber-900/40 to-amber-950/60',
          title: 'Afrek Opnað!',
          color: 'text-amber-400',
        };
      case 'streak':
        return {
          icon: <Flame className="w-24 h-24" />,
          gradient: 'from-orange-500 via-red-400 to-orange-500',
          bgGradient: 'from-orange-900/40 to-orange-950/60',
          title: 'Röð Haldist!',
          color: 'text-orange-400',
        };
      case 'personal_best':
        return {
          icon: <Star className="w-24 h-24" />,
          gradient: 'from-yellow-500 via-amber-400 to-yellow-500',
          bgGradient: 'from-yellow-900/40 to-yellow-950/60',
          title: 'Persónuleg Met!',
          color: 'text-yellow-400',
        };
      default:
        return {
          icon: <Sparkles className="w-24 h-24" />,
          gradient: 'from-indigo-500 via-purple-400 to-indigo-500',
          bgGradient: 'from-indigo-900/40 to-indigo-950/60',
          title: 'Til Hamingju!',
          color: 'text-indigo-400',
        };
    }
  };

  const config = getCelebrationConfig(celebration.type);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('is-IS').format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient}`} />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <Confetti />
        </div>
      )}

      {/* Animated Rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute top-1/2 left-1/2 w-2 h-[200%] bg-gradient-to-t ${config.gradient} opacity-10`}
            style={{
              transformOrigin: 'center top',
              rotate: `${i * 30}deg`,
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-12">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className={`inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br ${config.gradient} mb-8 shadow-2xl`}
        >
          <div className="text-white">
            {config.icon}
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-6xl font-bold mb-4 ${config.color}`}
        >
          {config.title}
        </motion.h1>

        {/* User Name */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-bold text-white mb-6"
        >
          {celebration.userName}
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto"
        >
          {celebration.message}
        </motion.p>

        {/* Amount (if applicable) */}
        {celebration.amount && celebration.amount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.7 }}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold text-3xl shadow-lg`}
          >
            <span>{formatAmount(celebration.amount)}</span>
            <span>kr</span>
          </motion.div>
        )}

        {/* Animated Emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['🎉', '🎊', '✨', '🌟', '💫', '🎯', '🏆', '⭐'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{
                y: -100,
                x: Math.random() * window.innerWidth,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TVCelebration;
