/**
 * Achievement System for ArnarFlow / Takk Arena
 * Version 3.0.0
 */

export type AchievementCategory = 'daily' | 'weekly' | 'milestone' | 'special';
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji
  category: AchievementCategory;
  rarity: AchievementRarity;
  requirement: AchievementRequirement;
  reward: {
    coins: number;
    xp: number;
  };
  secret?: boolean; // Hidden until unlocked
}

export interface AchievementRequirement {
  type: 'sales_count' | 'sales_amount' | 'streak' | 'battles_won' | 'hours_worked' | 
        'daily_goal' | 'weekly_goal' | 'upgrade_count' | 'single_sale' | 'custom';
  value: number;
  period?: 'day' | 'week' | 'month' | 'all_time';
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date
  notified: boolean;
}

// Rarity colors for UI
export const RARITY_COLORS: Record<AchievementRarity, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
  uncommon: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  rare: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  epic: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  legendary: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' }
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Algengt',
  uncommon: 'Sjaldgæft',
  rare: 'Mjög sjaldgæft',
  epic: 'Epískt',
  legendary: 'Legendary'
};

// All achievements
export const ACHIEVEMENTS: Achievement[] = [
  // ===== DAILY ACHIEVEMENTS =====
  {
    id: 'first_sale',
    title: 'Fyrsta Sala Dagsins',
    description: 'Skráðu fyrstu söluna þína í dag',
    icon: '🌅',
    category: 'daily',
    rarity: 'common',
    requirement: { type: 'sales_count', value: 1, period: 'day' },
    reward: { coins: 10, xp: 25 }
  },
  {
    id: 'triple_threat',
    title: 'Þrjár í röð',
    description: 'Skráðu 3 sölur á sama degi',
    icon: '🎯',
    category: 'daily',
    rarity: 'common',
    requirement: { type: 'sales_count', value: 3, period: 'day' },
    reward: { coins: 25, xp: 50 }
  },
  {
    id: 'high_roller',
    title: 'Stór Fiskur',
    description: 'Náðu 10.000 kr í sölu á einum degi',
    icon: '💰',
    category: 'daily',
    rarity: 'uncommon',
    requirement: { type: 'sales_amount', value: 10000, period: 'day' },
    reward: { coins: 50, xp: 100 }
  },
  {
    id: 'daily_goal_crusher',
    title: 'Markmiðsmógúll',
    description: 'Náðu daglegu markmiði þínu',
    icon: '✅',
    category: 'daily',
    rarity: 'uncommon',
    requirement: { type: 'daily_goal', value: 1, period: 'day' },
    reward: { coins: 75, xp: 150 }
  },
  {
    id: 'five_star',
    title: 'Fimm Stjörnur',
    description: 'Skráðu 5 sölur á sama degi',
    icon: '⭐',
    category: 'daily',
    rarity: 'rare',
    requirement: { type: 'sales_count', value: 5, period: 'day' },
    reward: { coins: 100, xp: 200 }
  },
  {
    id: 'whale_hunter',
    title: 'Hvalveiðimaður',
    description: 'Skráðu eina sölu yfir 50.000 kr',
    icon: '🐋',
    category: 'daily',
    rarity: 'epic',
    requirement: { type: 'single_sale', value: 50000 },
    reward: { coins: 200, xp: 400 }
  },

  // ===== WEEKLY ACHIEVEMENTS =====
  {
    id: 'weekly_warrior',
    title: 'Vikuhetja',
    description: 'Skráðu sölu alla virka daga vikunnar',
    icon: '🗓️',
    category: 'weekly',
    rarity: 'uncommon',
    requirement: { type: 'custom', value: 5, period: 'week' },
    reward: { coins: 100, xp: 250 }
  },
  {
    id: 'weekly_goal',
    title: 'Vikulega Markmiðið',
    description: 'Náðu vikulegu markmiði þínu',
    icon: '🏆',
    category: 'weekly',
    rarity: 'rare',
    requirement: { type: 'weekly_goal', value: 1, period: 'week' },
    reward: { coins: 150, xp: 300 }
  },
  {
    id: 'upgrade_master',
    title: 'Uppfærslumeistari',
    description: 'Skráðu 5 uppfærslur á einni viku',
    icon: '⬆️',
    category: 'weekly',
    rarity: 'rare',
    requirement: { type: 'upgrade_count', value: 5, period: 'week' },
    reward: { coins: 125, xp: 275 }
  },
  {
    id: 'marathon_week',
    title: 'Maraþonvika',
    description: 'Skráðu yfir 100.000 kr í sölu á einni viku',
    icon: '🏃',
    category: 'weekly',
    rarity: 'epic',
    requirement: { type: 'sales_amount', value: 100000, period: 'week' },
    reward: { coins: 250, xp: 500 }
  },

  // ===== MILESTONE ACHIEVEMENTS =====
  {
    id: 'first_steps',
    title: 'Fyrstu Skrefin',
    description: 'Skráðu 10 sölur samtals',
    icon: '👣',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'sales_count', value: 10, period: 'all_time' },
    reward: { coins: 50, xp: 100 }
  },
  {
    id: 'century',
    title: 'Hundrað',
    description: 'Skráðu 100 sölur samtals',
    icon: '💯',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'sales_count', value: 100, period: 'all_time' },
    reward: { coins: 300, xp: 600 }
  },
  {
    id: 'millionaire',
    title: 'Milljónamæringur',
    description: 'Náðu 1.000.000 kr í heildarsölu',
    icon: '💎',
    category: 'milestone',
    rarity: 'epic',
    requirement: { type: 'sales_amount', value: 1000000, period: 'all_time' },
    reward: { coins: 500, xp: 1000 }
  },
  {
    id: 'sales_legend',
    title: 'Sölugoðsögn',
    description: 'Skráðu 500 sölur samtals',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    requirement: { type: 'sales_count', value: 500, period: 'all_time' },
    reward: { coins: 1000, xp: 2000 }
  },

  // ===== STREAK ACHIEVEMENTS =====
  {
    id: 'streak_3',
    title: 'Hat Trick',
    description: 'Haltu 3 daga streak',
    icon: '🔥',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'streak', value: 3 },
    reward: { coins: 30, xp: 75 }
  },
  {
    id: 'streak_7',
    title: 'Vikureki',
    description: 'Haltu 7 daga streak',
    icon: '🔥',
    category: 'milestone',
    rarity: 'uncommon',
    requirement: { type: 'streak', value: 7 },
    reward: { coins: 100, xp: 200 }
  },
  {
    id: 'streak_30',
    title: 'Mánaðareldur',
    description: 'Haltu 30 daga streak',
    icon: '🌋',
    category: 'milestone',
    rarity: 'epic',
    requirement: { type: 'streak', value: 30 },
    reward: { coins: 500, xp: 1000 }
  },

  // ===== BATTLE ACHIEVEMENTS =====
  {
    id: 'first_blood',
    title: 'Fyrsta Blóð',
    description: 'Vinndu fyrstu 1v1 keppnina þína',
    icon: '⚔️',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'battles_won', value: 1, period: 'all_time' },
    reward: { coins: 75, xp: 150 }
  },
  {
    id: 'battle_veteran',
    title: 'Bardagaöldungur',
    description: 'Vinndu 10 keppnir',
    icon: '🛡️',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'battles_won', value: 10, period: 'all_time' },
    reward: { coins: 200, xp: 400 }
  },
  {
    id: 'arena_champion',
    title: 'Vígvallameistari',
    description: 'Vinndu 50 keppnir',
    icon: '🏟️',
    category: 'special',
    rarity: 'legendary',
    requirement: { type: 'battles_won', value: 50, period: 'all_time' },
    reward: { coins: 750, xp: 1500 }
  },

  // ===== SECRET ACHIEVEMENTS =====
  {
    id: 'night_owl',
    title: 'Náttúgla',
    description: 'Skráðu sölu eftir kl. 22:00',
    icon: '🦉',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'custom', value: 1 },
    reward: { coins: 50, xp: 100 },
    secret: true
  },
  {
    id: 'early_bird',
    title: 'Snemmbúinn Fugl',
    description: 'Skráðu sölu fyrir kl. 09:00',
    icon: '🐦',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'custom', value: 1 },
    reward: { coins: 50, xp: 100 },
    secret: true
  },
  {
    id: 'perfect_day',
    title: 'Fullkominn Dagur',
    description: 'Náðu 200% af daglegu markmiði',
    icon: '🌟',
    category: 'special',
    rarity: 'epic',
    requirement: { type: 'custom', value: 1 },
    reward: { coins: 250, xp: 500 },
    secret: true
  }
];

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

/**
 * Calculate total coins from unlocked achievements
 */
export function calculateTotalCoinsFromAchievements(unlockedIds: string[]): number {
  return unlockedIds.reduce((total, id) => {
    const achievement = getAchievement(id);
    return total + (achievement?.reward.coins ?? 0);
  }, 0);
}

/**
 * Get progress towards an achievement
 */
export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
}

export function getAchievementProgress(
  achievement: Achievement,
  stats: {
    salesCountToday: number;
    salesAmountToday: number;
    salesCountWeek: number;
    salesAmountWeek: number;
    salesCountTotal: number;
    salesAmountTotal: number;
    currentStreak: number;
    battlesWon: number;
    dailyGoal: number;
    dailyProgress: number;
    weeklyGoal: number;
    weeklyProgress: number;
    upgradesThisWeek: number;
    maxSingleSale: number;
  },
  unlockedIds: string[]
): AchievementProgress {
  const isUnlocked = unlockedIds.includes(achievement.id);
  let current = 0;
  let target = achievement.requirement.value;

  const { type, period } = achievement.requirement;

  switch (type) {
    case 'sales_count':
      if (period === 'day') current = stats.salesCountToday;
      else if (period === 'week') current = stats.salesCountWeek;
      else current = stats.salesCountTotal;
      break;
    case 'sales_amount':
      if (period === 'day') current = stats.salesAmountToday;
      else if (period === 'week') current = stats.salesAmountWeek;
      else current = stats.salesAmountTotal;
      break;
    case 'streak':
      current = stats.currentStreak;
      break;
    case 'battles_won':
      current = stats.battlesWon;
      break;
    case 'daily_goal':
      current = stats.dailyProgress >= stats.dailyGoal ? 1 : 0;
      break;
    case 'weekly_goal':
      current = stats.weeklyProgress >= stats.weeklyGoal ? 1 : 0;
      break;
    case 'upgrade_count':
      current = stats.upgradesThisWeek;
      break;
    case 'single_sale':
      current = stats.maxSingleSale;
      break;
    default:
      current = 0;
  }

  const percentage = Math.min(100, Math.round((current / target) * 100));

  return {
    achievement,
    current,
    target,
    percentage,
    isUnlocked
  };
}
