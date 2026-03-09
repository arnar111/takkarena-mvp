import { Sale, Battle, User } from '../types';

interface OddsResult {
    player1Odds: number; // e.g., 1.50 means bet 100 to win 150
    player2Odds: number;
    player1Probability: number; // 0-100%
    player2Probability: number;
    player1Favorite: boolean;
    player2Favorite: boolean;
}

interface PlayerStats {
    avgSales: number;
    totalSales: number;
    salesCount: number;
    battleWins: number;
    battleLosses: number;
    winRate: number;
    recentForm: number; // 0-1, higher = better recent performance
}

// Calculate player statistics from sales history
export const calculatePlayerStats = (
    userId: string,
    sales: Sale[],
    battles: Battle[]
): PlayerStats => {
    // Last 30 days of sales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = sales.filter(s =>
        s.userId === userId &&
        new Date(s.timestamp || s.date) >= thirtyDaysAgo
    );

    const totalSales = recentSales.reduce((sum, s) => sum + s.amount, 0);
    const salesCount = recentSales.length;
    const avgSales = salesCount > 0 ? totalSales / salesCount : 0;

    // Battle record
    const completedBattles = battles.filter(b =>
        b.status === 'completed' &&
        b.participants.some(p => p.userId === userId)
    );

    let battleWins = 0;
    let battleLosses = 0;

    completedBattles.forEach(battle => {
        const participant = battle.participants.find(p => p.userId === userId);
        const opponent = battle.participants.find(p => p.userId !== userId);

        if (participant && opponent) {
            if (participant.currentSales > opponent.currentSales) {
                battleWins++;
            } else if (participant.currentSales < opponent.currentSales) {
                battleLosses++;
            }
        }
    });

    const winRate = (battleWins + battleLosses) > 0
        ? battleWins / (battleWins + battleLosses)
        : 0.5;

    // Recent form (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const lastWeekSales = sales.filter(s =>
        s.userId === userId &&
        new Date(s.timestamp || s.date) >= sevenDaysAgo
    ).reduce((sum, s) => sum + s.amount, 0);

    const prevWeekSales = sales.filter(s =>
        s.userId === userId &&
        new Date(s.timestamp || s.date) >= fourteenDaysAgo &&
        new Date(s.timestamp || s.date) < sevenDaysAgo
    ).reduce((sum, s) => sum + s.amount, 0);

    const recentForm = prevWeekSales > 0
        ? Math.min(1, lastWeekSales / prevWeekSales)
        : 0.5;

    return {
        avgSales,
        totalSales,
        salesCount,
        battleWins,
        battleLosses,
        winRate,
        recentForm,
    };
};

// Calculate betting odds for a matchup
export const calculateOdds = (
    player1Id: string,
    player2Id: string,
    sales: Sale[],
    battles: Battle[]
): OddsResult => {
    const p1Stats = calculatePlayerStats(player1Id, sales, battles);
    const p2Stats = calculatePlayerStats(player2Id, sales, battles);

    // Calculate power score (weighted factors)
    const calculatePower = (stats: PlayerStats): number => {
        const avgSalesWeight = 0.35;
        const winRateWeight = 0.30;
        const recentFormWeight = 0.25;
        const experienceWeight = 0.10;

        // Normalize avg sales (assume max ~50000)
        const normalizedAvg = Math.min(1, stats.avgSales / 50000);

        // Experience bonus (more battles = slight advantage)
        const experience = Math.min(1, (stats.battleWins + stats.battleLosses) / 20);

        return (
            normalizedAvg * avgSalesWeight +
            stats.winRate * winRateWeight +
            stats.recentForm * recentFormWeight +
            experience * experienceWeight
        );
    };

    const p1Power = calculatePower(p1Stats);
    const p2Power = calculatePower(p2Stats);

    // Convert power to probability (ensure sum = 100%)
    const totalPower = p1Power + p2Power;
    let p1Probability = totalPower > 0 ? (p1Power / totalPower) * 100 : 50;
    let p2Probability = totalPower > 0 ? (p2Power / totalPower) * 100 : 50;

    // Clamp probabilities between 15% and 85% (never too extreme)
    p1Probability = Math.max(15, Math.min(85, p1Probability));
    p2Probability = 100 - p1Probability;

    // Convert probability to decimal odds
    // Odds = 1 / (probability / 100) * margin
    // We use a 5% house edge (margin = 0.95)
    const margin = 0.95;
    const p1Odds = parseFloat(((100 / p1Probability) * margin).toFixed(2));
    const p2Odds = parseFloat(((100 / p2Probability) * margin).toFixed(2));

    return {
        player1Odds: p1Odds,
        player2Odds: p2Odds,
        player1Probability: Math.round(p1Probability),
        player2Probability: Math.round(p2Probability),
        player1Favorite: p1Probability > p2Probability,
        player2Favorite: p2Probability > p1Probability,
    };
};

// Format odds for display (e.g., "1.85" or "2.10")
export const formatOdds = (odds: number): string => {
    return odds.toFixed(2);
};

// Get odds color class based on value
export const getOddsColor = (odds: number): string => {
    if (odds < 1.5) return 'text-rose-400'; // Heavy favorite
    if (odds < 2.0) return 'text-amber-400'; // Slight favorite
    if (odds < 2.5) return 'text-emerald-400'; // Even
    return 'text-indigo-400'; // Underdog
};
