/**
 * AchievementUnlockedModal Component
 * Celebratory modal when user unlocks new achievements
 * Version 3.0.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '../utils/achievements';

interface AchievementUnlockedModalProps {
  achievements: Achievement[];
  onClose: () => void;
  onClaimAll?: () => void;
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
  achievements,
  onClose,
  onClaimAll
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  const currentAchievement = achievements[currentIndex];
  const hasMore = currentIndex < achievements.length - 1;
  const rarityStyle = RARITY_COLORS[currentAchievement?.rarity || 'common'];

  // Total rewards
  const totalCoins = achievements.reduce((sum, a) => sum + a.reward.coins, 0);
  const totalXP = achievements.reduce((sum, a) => sum + a.reward.xp, 0);

  useEffect(() => {
    // Trigger animation on mount
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    // Hide confetti after a few seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentAchievement) return null;

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(true);
    } else {
      onClaimAll?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect rarity={currentAchievement.rarity} />}

      {/* Modal */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-500 ${
          isAnimating ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Glow effect based on rarity */}
        <div 
          className={`absolute inset-0 blur-3xl opacity-30 ${rarityStyle.bg}`}
          style={{ transform: 'scale(1.5)' }}
        />

        <div className={`relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 ${rarityStyle.border} overflow-hidden shadow-2xl`}>
          {/* Rarity banner */}
          <div className={`${rarityStyle.bg} py-2 text-center`}>
            <span className={`text-xs font-black uppercase tracking-[0.3em] ${rarityStyle.text}`}>
              {RARITY_LABELS[currentAchievement.rarity]} Afrek Aflæst!
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X size={20} className="text-white/70" />
          </button>

          {/* Counter (if multiple) */}
          {achievements.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">
              {currentIndex + 1} / {achievements.length}
            </div>
          )}

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon with animation */}
            <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-3xl ${rarityStyle.bg} mb-6 ${
              isAnimating ? 'animate-bounce' : ''
            }`}>
              <span className="text-7xl filter drop-shadow-lg">
                {currentAchievement.icon}
              </span>
              
              {/* Sparkle effects */}
              <Sparkles 
                size={24} 
                className={`absolute -top-2 -right-2 ${rarityStyle.text} animate-pulse`} 
              />
              <Sparkles 
                size={16} 
                className={`absolute -bottom-1 -left-1 ${rarityStyle.text} animate-pulse`} 
                style={{ animationDelay: '0.2s' }}
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              {currentAchievement.title}
            </h2>

            {/* Description */}
            <p className="text-slate-400 mb-6 text-sm">
              {currentAchievement.description}
            </p>

            {/* Rewards */}
            <div className="flex justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-3xl">🪙</span>
                </div>
                <p className="text-2xl font-black text-amber-400">
                  +{currentAchievement.reward.coins}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Mynt</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-3xl">⭐</span>
                </div>
                <p className="text-2xl font-black text-indigo-400">
                  +{currentAchievement.reward.xp}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">XP</p>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-bold text-white text-sm uppercase tracking-wider transition-all hover:opacity-90 shadow-lg ${
                hasMore
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30'
              }`}
            >
              {hasMore ? `Næsta (${achievements.length - currentIndex - 1} eftir)` : 'Sækja Verðlaun! 🎉'}
            </button>

            {/* Total rewards summary (if multiple) */}
            {achievements.length > 1 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  Heildarverðlaun
                </p>
                <p className="text-sm text-slate-400">
                  <span className="text-amber-400 font-bold">{totalCoins} mynt</span>
                  {' + '}
                  <span className="text-indigo-400 font-bold">{totalXP} XP</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple confetti effect component
const ConfettiEffect: React.FC<{ rarity: string }> = ({ rarity }) => {
  const colors = {
    common: ['#94a3b8', '#cbd5e1'],
    uncommon: ['#34d399', '#10b981'],
    rare: ['#60a5fa', '#3b82f6'],
    epic: ['#a78bfa', '#8b5cf6'],
    legendary: ['#fbbf24', '#f59e0b', '#ef4444']
  };

  const confettiColors = colors[rarity as keyof typeof colors] || colors.common;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AchievementUnlockedModal;
