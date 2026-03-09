/**
 * useAchievements Hook
 * Tracks achievement progress and handles unlocking
 * Version 3.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Achievement, 
  ACHIEVEMENTS, 
  UnlockedAchievement,
  getAchievementProgress,
  AchievementProgress
} from '../utils/achievements';
import { Sale } from '../types';

interface UseAchievementsProps {
  staffId: string | undefined;
  sales: Sale[];
  currentStreak: number;
  battlesWon: number;
  goals: { daily: number; weekly: number; monthly: number };
}

interface UseAchievementsReturn {
  unlockedAchievements: UnlockedAchievement[];
  achievementProgress: AchievementProgress[];
  newlyUnlocked: Achievement[];
  totalCoins: number;
  totalXP: number;
  clearNewlyUnlocked: () => void;
  checkAchievements: () => void;
}

export function useAchievements({
  staffId,
  sales,
  currentStreak,
  battlesWon,
  goals
}: UseAchievementsProps): UseAchievementsReturn {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Calculate stats from sales
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart();
    
    const todaySales = sales.filter(s => s.date === today);
    const weekSales = sales.filter(s => s.date >= weekStart);
    
    const salesCountToday = todaySales.length;
    const salesAmountToday = todaySales.reduce((sum, s) => sum + s.amount, 0);
    const salesCountWeek = weekSales.length;
    const salesAmountWeek = weekSales.reduce((sum, s) => sum + s.amount, 0);
    const salesCountTotal = sales.length;
    const salesAmountTotal = sales.reduce((sum, s) => sum + s.amount, 0);
    const upgradesThisWeek = weekSales.filter(s => s.saleType === 'upgrade').length;
    const maxSingleSale = sales.length > 0 ? Math.max(...sales.map(s => s.amount)) : 0;

    return {
      salesCountToday,
      salesAmountToday,
      salesCountWeek,
      salesAmountWeek,
      salesCountTotal,
      salesAmountTotal,
      currentStreak,
      battlesWon,
      dailyGoal: goals.daily,
      dailyProgress: salesAmountToday,
      weeklyGoal: goals.weekly,
      weeklyProgress: salesAmountWeek,
      upgradesThisWeek,
      maxSingleSale
    };
  }, [sales, currentStreak, battlesWon, goals]);

  // Calculate progress for all achievements
  const achievementProgress = useMemo(() => {
    const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);
    return ACHIEVEMENTS.map(achievement => 
      getAchievementProgress(achievement, stats, unlockedIds)
    );
  }, [stats, unlockedAchievements]);

  // Load unlocked achievements from Firestore
  useEffect(() => {
    if (!staffId) return;

    const docRef = doc(db, 'user_achievements', staffId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUnlockedAchievements(data.unlocked || []);
      } else {
        setUnlockedAchievements([]);
      }
    });

    return () => unsubscribe();
  }, [staffId]);

  // Check and unlock achievements
  const checkAchievements = useCallback(async () => {
    if (!staffId) return;

    const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);
    const newUnlocks: Achievement[] = [];

    for (const progress of achievementProgress) {
      // Skip already unlocked
      if (progress.isUnlocked) continue;

      // Check if requirements are met
      if (progress.current >= progress.target) {
        newUnlocks.push(progress.achievement);
      }
    }

    // Check special time-based achievements
    const hour = new Date().getHours();
    const lastSale = sales[sales.length - 1];
    
    if (lastSale) {
      const saleHour = new Date(lastSale.timestamp).getHours();
      
      // Night owl (after 22:00)
      if (saleHour >= 22 && !unlockedIds.includes('night_owl')) {
        const nightOwl = ACHIEVEMENTS.find(a => a.id === 'night_owl');
        if (nightOwl) newUnlocks.push(nightOwl);
      }
      
      // Early bird (before 09:00)
      if (saleHour < 9 && !unlockedIds.includes('early_bird')) {
        const earlyBird = ACHIEVEMENTS.find(a => a.id === 'early_bird');
        if (earlyBird) newUnlocks.push(earlyBird);
      }
    }

    // Perfect day (200% of daily goal)
    if (stats.dailyProgress >= stats.dailyGoal * 2 && !unlockedIds.includes('perfect_day')) {
      const perfectDay = ACHIEVEMENTS.find(a => a.id === 'perfect_day');
      if (perfectDay) newUnlocks.push(perfectDay);
    }

    // Save new unlocks
    if (newUnlocks.length > 0) {
      const newUnlockRecords: UnlockedAchievement[] = newUnlocks.map(a => ({
        achievementId: a.id,
        unlockedAt: new Date().toISOString(),
        notified: false
      }));

      const allUnlocked = [...unlockedAchievements, ...newUnlockRecords];
      
      await setDoc(doc(db, 'user_achievements', staffId), {
        unlocked: allUnlocked,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setNewlyUnlocked(prev => [...prev, ...newUnlocks]);
    }
  }, [staffId, unlockedAchievements, achievementProgress, sales, stats]);

  // Check achievements when sales change
  useEffect(() => {
    if (staffId && sales.length > 0) {
      checkAchievements();
    }
  }, [sales.length, staffId]); // Only trigger on new sales

  // Calculate totals
  const { totalCoins, totalXP } = useMemo(() => {
    return unlockedAchievements.reduce(
      (acc, ua) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
        if (achievement) {
          acc.totalCoins += achievement.reward.coins;
          acc.totalXP += achievement.reward.xp;
        }
        return acc;
      },
      { totalCoins: 0, totalXP: 0 }
    );
  }, [unlockedAchievements]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return {
    unlockedAchievements,
    achievementProgress,
    newlyUnlocked,
    totalCoins,
    totalXP,
    clearNewlyUnlocked,
    checkAchievements
  };
}

// Helper function
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default useAchievements;
