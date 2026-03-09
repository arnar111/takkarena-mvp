import { BettingPool, UserBet, Battle } from '../types';

/**
 * Betting Engine - Calculate odds and manage betting pools
 */

export function calculateOdds(battle: Battle, bets: UserBet[]): { [userId: string]: number } {
    const odds: { [userId: string]: number } = {};

    // Calculate total bets per participant
    const participantBets: { [userId: string]: number } = {};
    let totalPool = 0;

    bets.forEach(bet => {
        participantBets[bet.predictedWinner] = (participantBets[bet.predictedWinner] || 0) + bet.amount;
        totalPool += bet.amount;
    });

    // Calculate odds for each participant
    battle.participants.forEach(p => {
        const betsOnParticipant = participantBets[p.userId] || 0;

        if (betsOnParticipant === 0) {
            // No bets on this participant = high odds
            odds[p.userId] = 10.0;
        } else {
            // Odds = Total Pool / Bets on Participant
            odds[p.userId] = Math.max(1.1, totalPool / betsOnParticipant);
        }
    });

    return odds;
}

export function calculatePotentialWinnings(betAmount: number, odds: number): number {
    return Math.floor(betAmount * odds);
}

export function createBettingPool(battle: Battle): BettingPool {
    return {
        id: `pool_${battle.id}_${Date.now()}`,
        battleId: battle.id,
        bets: [],
        odds: {},
        poolTotal: 0,
        isActive: true
    };
}

export function placeBet(
    pool: BettingPool,
    userId: string,
    predictedWinner: string,
    amount: number
): { pool: BettingPool; bet: UserBet } {
    const bet: UserBet = {
        userId,
        poolId: pool.id,
        predictedWinner,
        amount,
        potentialWinnings: 0,
        settled: false
    };

    const updatedPool: BettingPool = {
        ...pool,
        bets: [...pool.bets, bet],
        poolTotal: pool.poolTotal + amount
    };

    // Recalculate odds
    updatedPool.odds = calculateOdds(
        { participants: Object.keys(updatedPool.odds).map(userId => ({ userId } as any)) } as Battle,
        updatedPool.bets.map(b => b as UserBet)
    );

    // Update potential winnings for this bet
    bet.potentialWinnings = calculatePotentialWinnings(amount, updatedPool.odds[predictedWinner] || 1.0);

    return { pool: updatedPool, bet };
}

export function settleBettingPool(
    pool: BettingPool,
    winnerId: string
): { pool: BettingPool; payouts: { userId: string; amount: number }[] } {
    const payouts: { userId: string; amount: number }[] = [];

    // Find all winning bets
    const winningBets = pool.bets.filter(b => b.predictedWinner === winnerId);
    const losingBetsTotal = pool.bets
        .filter(b => b.predictedWinner !== winnerId)
        .reduce((sum, b) => sum + b.amount, 0);

    if (winningBets.length === 0) {
        // No winners - pool goes to house/charity
        return {
            pool: { ...pool, isActive: false, settledAt: new Date().toISOString() },
            payouts: []
        };
    }

    // Distribute winnings proportionally
    const totalWinningBets = winningBets.reduce((sum, b) => sum + b.amount, 0);

    winningBets.forEach(bet => {
        const proportion = bet.amount / totalWinningBets;
        const winnings = bet.amount + Math.floor(losingBetsTotal * proportion);

        payouts.push({
            userId: bet.userId,
            amount: winnings
        });
    });

    return {
        pool: { ...pool, isActive: false, settledAt: new Date().toISOString() },
        payouts
    };
}

export function getUserBets(pools: BettingPool[], userId: string): UserBet[] {
    const allBets: UserBet[] = [];

    pools.forEach(pool => {
        const userBets = pool.bets.filter(b => b.userId === userId);
        allBets.push(...(userBets as UserBet[]));
    });

    return allBets;
}

export function getActivePools(pools: BettingPool[]): BettingPool[] {
    return pools.filter(p => p.isActive);
}
