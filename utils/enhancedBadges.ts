import { Badge } from '../types';

// Expanded badge system with 40+ badges across categories
export const ENHANCED_BADGES: Badge[] = [
    // SALES MILESTONES (Common → Legendary progression)
    { id: 'first_sale', name: 'Fyrsta Salan', description: 'Skráðu eina sölu', icon: '🌟', rarity: 'Common', requirement: 'sales >= 1', reward: 10, category: 'sales' },
    { id: '100k_club', name: '100k Klúbburinn', description: '100.000 kr heildarsala', icon: '🥉', rarity: 'Common', requirement: 'totalSales >= 100000', reward: 50, category: 'sales' },
    { id: 'half_million', name: 'Hálf Milljón', description: '500.000 kr heildarsala', icon: '🥈', rarity: 'Rare', requirement: 'totalSales >= 500000', reward: 100, category: 'sales' },
    { id: 'millionaire', name: 'Milljónamæringur', description: '1.000.000 kr heildarsala', icon: '🥇', rarity: 'Epic', requirement: 'totalSales >= 1000000', reward: 200, category: 'sales' },
    { id: 'multi_millionaire', name: 'Multi-Milljón', description: '5.000.000 kr heildarsala', icon: '👑', rarity: 'Epic', requirement: 'totalSales >= 5000000', reward: 500, category: 'sales' },
    { id: 'tycoon', name: 'Auðjöfur', description: '10.000.000 kr heildarsala', icon: '💎', rarity: 'Legendary', requirement: 'totalSales >= 10000000', reward: 1000, category: 'sales' },

    // DAILY PERFORMANCE
    { id: 'daily_champion', name: 'Dagshetja', description: '50.000 kr á einum degi', icon: '⚡', rarity: 'Rare', requirement: 'dailySales >= 50000', reward: 75, category: 'sales' },
    { id: 'unstoppable', name: 'Óstöðvandi', description: '100.000 kr á einum degi', icon: '🔥', rarity: 'Epic', requirement: 'dailySales >= 100000', reward: 150, category: 'sales' },
    { id: 'legend', name: 'Goðsögn', description: '200.000 kr á einum degi', icon: '⭐', rarity: 'Legendary', requirement: 'dailySales >= 200000', reward: 300, category: 'sales' },

    // BATTLE ACHIEVEMENTS
    { id: 'first_blood', name: 'Fyrsti Bardagi', description: 'Kláraðu fyrsta bardagann', icon: '⚔️', rarity: 'Common', requirement: 'battles >= 1', reward: 25, category: 'battles' },
    { id: 'warrior', name: 'Bardagamaður', description: 'Vindu 5 bardaga', icon: '🛡️', rarity: 'Common', requirement: 'battleWins >= 5', reward: 50, category: 'battles' },
    { id: 'champion', name: 'Meistari', description: 'Vindu 10 bardaga', icon: '🏆', rarity: 'Rare', requirement: 'battleWins >= 10', reward: 100, category: 'battles' },
    { id: 'gladiator', name: 'Gladíator', description: 'Vindu 25 bardaga', icon: '⚔️', rarity: 'Epic', requirement: 'battleWins >= 25', reward: 250, category: 'battles' },
    { id: 'legend_fighter', name: 'Goðsagnamaður', description: 'Vindu 50 bardaga', icon: '👑', rarity: 'Legendary', requirement: 'battleWins >= 50', reward: 500, category: 'battles' },
    { id: 'comeback_king', name: 'Comeback Kóngur', description: 'Vinndu bardaga þar sem þú varst á eftir', icon: '💪', rarity: 'Rare', requirement: 'comebackWins >= 1', reward: 100, category: 'battles', secret: true },
    { id: 'perfectionist', name: 'Fullkomin', description: 'Vindu bardaga með 2x markmiði', icon: '✨', rarity: 'Epic', requirement: 'perfectWins >= 1', reward: 150, category: 'battles' },
    { id: 'marathon_master', name: 'Maraþon Meistari', description: 'Vindu maraþon bardaga', icon: '🏃', rarity: 'Rare', requirement: 'marathonWins >= 1', reward: 200, category: 'battles' },

    // STREAK ACHIEVEMENTS
    { id: 'streak_3', name: '3 Í Röð', description: 'Vindu 3 bardaga í röð', icon: '🔥', rarity: 'Common', requirement: 'winStreak >= 3', reward: 50, category: 'streaks' },
    { id: 'streak_5', name: '5 Í Röð', description: 'Vindu 5 bardaga í röð', icon: '🔥🔥', rarity: 'Rare', requirement: 'winStreak >= 5', reward: 100, category: 'streaks' },
    { id: 'streak_10', name: 'Óstöðvandi Röð', description: 'Vindu 10 bardaga í röð', icon: '🔥🔥🔥', rarity: 'Epic', requirement: 'winStreak >= 10', reward: 250, category: 'streaks' },
    { id: 'daily_streak_7', name: 'Viku Röð', description: '7 daga sala í röð', icon: '📅', rarity: 'Rare', requirement: 'dailyStreak >= 7', reward: 100, category: 'streaks' },
    { id: 'daily_streak_30', name: 'Mánaðar Röð', description: '30 daga sala í röð', icon: '📆', rarity: 'Epic', requirement: 'dailyStreak >= 30', reward: 500, category: 'streaks' },

    // TEAM ACHIEVEMENTS
    { id: 'team_player', name: 'Liðsmaður', description: 'Vinndu team bardaga', icon: '👥', rarity: 'Common', requirement: 'teamWins >= 1', reward: 75, category: 'team' },
    { id: 'team_captain', name: 'Liðsforingi', description: 'Vindu 5 team bardaga', icon: '🎖️', rarity: 'Rare', requirement: 'teamWins >= 5', reward: 150, category: 'team' },
    { id: 'team_legend', name: 'Teymis Goðsögn', description: 'Vindu 10 team bardaga', icon: '👑', rarity: 'Epic', requirement: 'teamWins >= 10', reward: 300, category: 'team' },
    { id: 'team_mvp', name: 'MVP', description: 'Vertu besti leikmaðurinn í team bardaga', icon: '⭐', rarity: 'Rare', requirement: 'teamMVP >= 1', reward: 200, category: 'team', secret: true },

    // SPECIAL & SECRET BADGES
    { id: 'night_owl', name: 'Næturuggla', description: 'Selja eftir klukkan 22:00', icon: '🦉', rarity: 'Rare', requirement: 'lateSales >= 5', reward: 100, category: 'special', secret: true },
    { id: 'early_bird', name: 'Snemma Fuglar', description: 'Selja fyrir klukkan 09:00', icon: '🐦', rarity: 'Rare', requirement: 'earlySales >= 5', reward: 100, category: 'special', secret: true },
    { id: 'speed_demon', name: 'Hraðinn', description: '3 sölur innan 30 mínútna', icon: '⚡', rarity: 'Epic', requirement: 'rapidSales >= 1', reward: 150, category: 'special', secret: true },
    { id: 'boss_slayer', name: 'Boss Bani', description: 'Vindu boss bardaga', icon: '🐉', rarity: 'Legendary', requirement: 'bossWins >= 1', reward: 500, category: 'special' },
    { id: 'community_hero', name: 'Samfélagshetja', description: 'Kláraðu community challenge', icon: '🌟', rarity: 'Epic', requirement: 'communityWins >= 1', reward: 200, category: 'special' },
    { id: 'lucky_seven', name: 'Heppinn 7', description: 'Vindu bardaga 7:77', icon: '🍀', rarity: 'Legendary', requirement: 'luckyWin >= 1', reward: 777, category: 'special', secret: true },
    { id: 'underdog', name: 'Undirbuningur', description: 'Vindu með 50%+ handicap', icon: '🐕', rarity: 'Epic', requirement: 'underdogWins >= 1', reward: 200, category: 'special', secret: true },
    { id: 'collector', name: 'Safnari', description: 'Afltu 20 merkja', icon: '📚', rarity: 'Epic', requirement: 'badges >= 20', reward: 300, category: 'special' },
    { id: 'completionist', name: 'Allt Eða Ein', description: 'Afltu ALLRA merkja', icon: '💯', rarity: 'Legendary', requirement: 'badges >= ALL', reward: 1000, category: 'special', secret: true },

    // PROJECT SPECIALISTS
    { id: 'samhjalp_master', name: 'Samhjálp Sérfræðingur', description: '100.000 kr í Samhjálp', icon: '🎯', rarity: 'Rare', requirement: 'projectSales.Samhjálp >= 100000', reward: 100, category: 'special' },
    { id: 'throskahjal_master', name: 'Þroskahjálp Sérfræðingur', description: '100.000 kr í Þroskahjálp', icon: '🎯', rarity: 'Rare', requirement: 'projectSales.Þroskahjálp >= 100000', reward: 100, category: 'special' },
    { id: 'versatile', name: 'Fjölhæfur', description: 'Selja í 5+ verkefnum', icon: '🌈', rarity: 'Rare', requirement: 'projectsDiversity >= 5', reward: 150, category: 'special' },

    // LEAGUE ACHIEVEMENTS
    { id: 'bronze_league', name: 'Bronze Deild', description: 'Náðu Bronze deildinni', icon: '🥉', rarity: 'Common', requirement: 'league == Bronze', reward: 50, category: 'special' },
    { id: 'silver_league', name: 'Silver Deild', description: 'Náðu Silver deildinni', icon: '🥈', rarity: 'Rare', requirement: 'league == Silver', reward: 100, category: 'special' },
    { id: 'gold_league', name: 'Gold Deild', description: 'Náðu Gold deildinni', icon: '🥇', rarity: 'Epic', requirement: 'league == Gold', reward: 200, category: 'special' },
    { id: 'platinum_league', name: 'Platinum Deild', description: 'Náðu Platinum deildinni', icon: '💎', rarity: 'Epic', requirement: 'league == Platinum', reward: 500, category: 'special' },
    { id: 'diamond_league', name: 'Diamond Deild', description: 'Náðu Diamond deildinni', icon: '👑', rarity: 'Legendary', requirement: 'league == Diamond', reward: 1000, category: 'special' },
];

export function calculateBadgeProgress(badge: Badge, userStats: any): number {
    // Extract requirement value
    const match = badge.requirement.match(/([a-zA-Z_]+)\s*(>=|==)\s*(\d+|[A-Z]+)/);
    if (!match) return 0;

    const [, stat, operator, value] = match;
    const currentValue = userStats[stat] || 0;
    const targetValue = value === 'ALL' ? ENHANCED_BADGES.length : parseInt(value);

    if (operator === '==') {
        return currentValue === targetValue ? 100 : 0;
    }

    return Math.min(100, (currentValue / targetValue) * 100);
}

export function checkBadgeUnlocked(badge: Badge, userStats: any): boolean {
    return calculateBadgeProgress(badge, userStats) >= 100;
}

export function getBadgesByRarity(rarity: string): Badge[] {
    return ENHANCED_BADGES.filter(b => b.rarity === rarity);
}

export function getBadgesByCategory(category: string): Badge[] {
    return ENHANCED_BADGES.filter(b => b.category === category);
}

export function getSecretBadges(): Badge[] {
    return ENHANCED_BADGES.filter(b => b.secret);
}
