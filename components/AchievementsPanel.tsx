/**
 * AchievementsPanel Component
 * Displays all achievements with progress and unlocked status
 * Version 3.0.0
 */

import React, { useState, useMemo } from 'react';
import { Trophy, Lock, Star, Flame, Target, Zap, Filter } from 'lucide-react';
import { 
  Achievement, 
  AchievementCategory,
  AchievementProgress,
  RARITY_COLORS,
  RARITY_LABELS,
  ACHIEVEMENTS
} from '../utils/achievements';

interface AchievementsPanelProps {
  achievementProgress: AchievementProgress[];
  totalCoins: number;
  totalXP: number;
}

const CATEGORY_INFO: Record<AchievementCategory, { label: string; icon: React.ReactNode; color: string }> = {
  daily: { label: 'Dagleg', icon: <Target size={16} />, color: 'text-emerald-400' },
  weekly: { label: 'Vikuleg', icon: <Star size={16} />, color: 'text-amber-400' },
  milestone: { label: 'Áfangar', icon: <Flame size={16} />, color: 'text-orange-400' },
  special: { label: 'Sérstök', icon: <Zap size={16} />, color: 'text-purple-400' }
};

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievementProgress,
  totalCoins,
  totalXP
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    return achievementProgress.filter(ap => {
      // Category filter
      if (selectedCategory !== 'all' && ap.achievement.category !== selectedCategory) {
        return false;
      }
      // Unlocked filter
      if (showUnlockedOnly && !ap.isUnlocked) {
        return false;
      }
      // Hide secret achievements that aren't unlocked
      if (ap.achievement.secret && !ap.isUnlocked) {
        return false;
      }
      return true;
    });
  }, [achievementProgress, selectedCategory, showUnlockedOnly]);

  // Stats
  const unlockedCount = achievementProgress.filter(ap => ap.isUnlocked).length;
  const totalCount = ACHIEVEMENTS.filter(a => !a.secret).length;

  return (
    <div className="glass rounded-[40px] p-8 border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-500/20">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              Afrek
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              {unlockedCount} / {totalCount} aflæst
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mynt</p>
            <p className="text-lg font-black text-amber-400">{totalCoins.toLocaleString()}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">XP</p>
            <p className="text-lg font-black text-indigo-400">{totalXP.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          Öll
        </button>
        {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === category
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <span className={CATEGORY_INFO[category].color}>
              {CATEGORY_INFO[category].icon}
            </span>
            {CATEGORY_INFO[category].label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <button
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showUnlockedOnly
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {showUnlockedOnly ? '✓ Aflæst' : 'Aflæst'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Framvinda</span>
          <span>{Math.round((unlockedCount / totalCount) * 100)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map(({ achievement, current, target, percentage, isUnlocked }) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            current={current}
            target={target}
            percentage={percentage}
            isUnlocked={isUnlocked}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500">Engin afrek í þessum flokki</p>
        </div>
      )}
    </div>
  );
};

// Individual achievement card
interface AchievementCardProps {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  current,
  target,
  percentage,
  isUnlocked
}) => {
  const rarityStyle = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all ${
        isUnlocked
          ? `${rarityStyle.bg} ${rarityStyle.border} border-2`
          : 'bg-white/5 border-white/5 opacity-60'
      }`}
    >
      {/* Rarity badge */}
      <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${rarityStyle.bg} ${rarityStyle.text}`}>
        {RARITY_LABELS[achievement.rarity]}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
          isUnlocked ? 'bg-white/10' : 'bg-black/20'
        }`}>
          {isUnlocked ? (
            achievement.icon
          ) : (
            <Lock size={24} className="text-slate-600" />
          )}
          {isUnlocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
            {achievement.title}
          </h3>
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress bar (only show if not unlocked) */}
          {!isUnlocked && (
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>{current.toLocaleString()} / {target.toLocaleString()}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-amber-400">
              🪙 {achievement.reward.coins}
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              ⭐ {achievement.reward.xp} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;
