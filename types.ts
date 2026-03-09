export interface User {
  id: string;
  name: string;
  staffId: string;
  role: 'agent' | 'manager';
  team: 'Hringurinn' | 'Verið' | 'Götuteymið';
  uid?: string;
  email?: string;
  coins?: number;
  leagueTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  leaguePoints?: number;
  equippedCosmetics?: {
    avatarFrame?: string;
    nameEffect?: string;
    victoryAnimation?: string;
    arenaTheme?: string;
  };
  requireOFCheck?: boolean;
  autoPausesEnabled?: boolean;
  kennitala?: string;  // For MyTimePlan integration (encrypted)
  avatar?: string;     // Firebase Storage URL for profile picture
  nickname?: string;   // User-chosen nickname
  displayName?: string; // Editable display name
}

export type CoachPersonality = 'standard' | 'drill_sergeant' | 'zen_master' | 'wolf';

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  effect?: string;
  type?: 'cosmetic' | 'power_up' | 'emote' | 'theme';
  category?: 'avatar' | 'effect' | 'animation' | 'sound';
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  previewUrl?: string;
}

export interface Shift {
  id: string;
  date: string;
  dayHours: number;
  eveningHours: number;
  totalSales: number;
  notes: string;
  managerNotes?: string;
  projectName: string;
  userId: string;
}

export interface Sale {
  id: string;
  date: string;
  timestamp: string;
  amount: number;
  project: string;
  userId: string;
  saleType?: 'new' | 'upgrade';
  ofRegistered?: boolean;
}

export interface WageSummary {
  grossPay: number;
  pensionFund: number;
  unionFee: number;
  tax: number;
  netPay: number;
  totalSales?: number;
  totalHours?: number;
}

export interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface WageSettings {
  dayRate: number;
  eveningRate: number;
  pensionRate: number;
  unionRate: number;
  taxRate: number;
  personalAllowance: number;
  allowanceUsage: number;
}

// Gamification System
export interface Level {
  id: number;
  min: number;
  max: number;
  title: string;
  color: string;
}

// Battle System Types
export type BattleType = 'quick' | 'standard' | 'marathon' | 'team' | 'boss';
export type BattleTargetType = 'first_to' | 'highest_total' | 'most_sales';
export type BattleStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Battle {
  id: string;
  type?: BattleType;
  participants: BattleParticipant[];
  format: BattleFormat;
  startTime: string;
  endTime: string;
  targetType: BattleTargetType;
  targetValue: number;
  handicaps: { [userId: string]: number };
  stakes?: BattleStakes;
  status: BattleStatus;
  createdBy: string;
  createdAt: string;
  modifiers?: BattleModifier[];
  teamBattle?: boolean;
  teamIds?: string[];
  winnerId?: string;
}

export interface BattleParticipant {
  userId: string;
  name: string;
  avatar: string;
  currentSales: number;
  salesCount: number;
  adjustedSales?: number;
}

export interface BattleFormat {
  duration: 'quick' | 'standard' | 'marathon' | 'custom';
  durationMinutes?: number;
  durationUnit?: 'hours' | 'minutes';
}

export interface BattleStakes {
  coinBet: number;
  winnerReward: number;
  badges?: string[];
}

export interface BattleTimelineEntry {
  timestamp: string;
  participantId: string;
  salesAmount: number;
  cumulativeTotal: number;
  eventType: 'sale' | 'lead_change' | 'milestone';
}

// Battle Modifiers
export interface BattleModifier {
  id: string;
  name: string;
  description: string;
  effect: 'weather' | 'time_bonus' | 'project_specific';
  multiplier?: number;
  allowedProjects?: string[];
  timeWindows?: { start: number; end: number; multiplier: number }[];
  icon: string;
}

// Teams
export type TeamName = 'Hringurinn' | 'Verið' | 'Götuteymið';

export interface Team {
  id: string;
  name: TeamName;
  color: string;
  icon: string;
  members: string[];
  totalSales: number;
  wins: number;
  badges: string[];
  seasonPoints: number;
}

// Leagues
export type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface UserLeague {
  userId: string;
  tier: LeagueTier;
  points: number;
  rank: number;
  seasonId: string;
  promotionProgress: number;
}

export interface LeagueSeason {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Enhanced Badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  secret?: boolean;
  requirement: string;
  reward: number;
  earnedAt?: string;
  progress?: number;
  category?: 'sales' | 'battles' | 'streaks' | 'special' | 'team';
}

// Analytics
export interface BattleAnalytics {
  battleId: string;
  timeline: { time: string; sales: { [userId: string]: number } }[];
  heatMap: { hour: number; sales: number; userId: string }[];
  peakPerformance: { userId: string; period: string; sales: number }[];
  predictions?: AIPrediction;
}

export interface AIPrediction {
  winner: string;
  confidence: number;
  reasoning: string;
  tips: string[];
  whatItTakesToWin?: { userId: string; salesNeeded: number };
}

// Rivalry
export interface Rivalry {
  id: string;
  users: [string, string];
  wins: { [userId: string]: number };
  totalBattles: number;
  currentStreak: { userId: string; count: number } | null;
  bonusMultiplier: number;
  createdAt: string;
}

// Boss Battle
export interface BossBattle {
  id: string;
  name: string;
  avatar?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
  battleType?: 'target' | 'sales_count' | 'highest_sale';
  difficulty?: number;
  targetSales?: number;
  targetValue?: number;
  currentSales?: number;
  currentDamage?: number;
  participants: string[];
  contributionLeaderboard?: { userId: string; contribution: number }[];
  rewards?: { coins: number; badges: string[]; items: string[] };
  abilities?: string[];
  powerUps?: string[];
  duration?: number;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  startedAt?: string;
  endsAt?: string;
  status?: 'pending' | 'active' | 'completed' | 'failed';
  createdBy: string;
  isManagerCreated?: boolean;
}

// Community Challenge
export interface CommunityChallenge {
  id: string;
  name: string;
  description: string;
  goal: number;
  current: number;
  participants: string[];
  contributionMap: { [userId: string]: number };
  rewards: StoreItem[];
  isActive: boolean;
  startedAt: string;
  endsAt: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'battle_ending' | 'rival_active' | 'comeback_possible' | 'achievement_close' | 'challenge_invite' | 'battle_result';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

// Betting
export interface BettingPool {
  id: string;
  battleId: string;
  bets: { userId: string; predictedWinner: string; amount: number }[];
  odds: { [userId: string]: number };
  poolTotal: number;
  isActive: boolean;
  settledAt?: string;
}

export interface UserBet {
  userId: string;
  poolId: string;
  predictedWinner: string;
  amount: number;
  potentialWinnings: number;
  settled: boolean;
  won?: boolean;
}

// Battle Invites
export interface BattleInvite {
  id: string;
  from: string;
  to: string;
  battleConfig: Partial<Battle>;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  counterOffer?: Partial<Battle>;
  createdAt: string;
  expiresAt: string;
}
