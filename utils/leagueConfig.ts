import { LeagueTier, UserLeague } from '../types';

export const LEAGUE_TIERS: Record<LeagueTier, { minPoints: number; maxPoints: number; color: string; icon: string; rewards: number }> = {
    'Bronze': {
        minPoints: 0,
        maxPoints: 999,
        color: '#CD7F32',
        icon: '🥉',
        rewards: 50
    },
    'Silver': {
        minPoints: 1000,
        maxPoints: 2499,
        color: '#C0C0C0',
        icon: '🥈',
        rewards: 100
    },
    'Gold': {
        minPoints: 2500,
        maxPoints: 4999,
        color: '#FFD700',
        icon: '🥇',
        rewards: 200
    },
    'Platinum': {
        minPoints: 5000,
        maxPoints: 9999,
        color: '#E5E4E2',
        icon: '💎',
        rewards: 500
    },
    'Diamond': {
        minPoints: 10000,
        maxPoints: Infinity,
        color: '#B9F2FF',
        icon: '👑',
        rewards: 1000
    }
};

export function calculateLeagueTier(points: number): LeagueTier {
    if (points >= 10000) return 'Diamond';
    if (points >= 5000) return 'Platinum';
    if (points >= 2500) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
}

export function calculateSeasonPoints(
    salesAmount: number,
    battleWins: number,
    badgesEarned: number
): number {
    const salesPoints = Math.floor(salesAmount / 1000); // 1 point per 1000 ISK
    const battlePoints = battleWins * 50; // 50 points per win
    const badgePoints = badgesEarned * 25; // 25 points per badge

    return salesPoints + battlePoints + badgePoints;
}

export function getPromotionProgress(currentPoints: number, currentTier: LeagueTier): number {
    const tierConfig = LEAGUE_TIERS[currentTier];
    const range = tierConfig.maxPoints - tierConfig.minPoints;
    const progress = currentPoints - tierConfig.minPoints;

    if (range === Infinity) return 100; // Diamond max tier

    return Math.min(100, (progress / range) * 100);
}

export function getNextTier(currentTier: LeagueTier): LeagueTier | null {
    const tiers: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;

    return tiers[currentIndex + 1];
}

export function getPreviousTier(currentTier: LeagueTier): LeagueTier | null {
    const tiers: LeagueTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex <= 0) return null;

    return tiers[currentIndex - 1];
}
