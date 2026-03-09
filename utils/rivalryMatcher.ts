import { User, Rivalry, Battle } from '../types';

/**
 * Rivalry Matcher - Suggests rivals based on similar performance
 */

export function suggestRivals(
    currentUser: User,
    allUsers: User[],
    battles: Battle[],
    sales: any[]
): User[] {
    // Exclude current user and same team
    const candidates = allUsers.filter(
        u => u.id !== currentUser.id && u.team !== currentUser.team
    );

    // Calculate stats for current user
    const userBattles = battles.filter(b =>
        b.participants.some(p => p.userId === currentUser.id)
    );
    const userWins = userBattles.filter(b => {
        const winner = b.participants.reduce((max, p) =>
            p.currentSales > max.currentSales ? p : max
        );
        return winner.userId === currentUser.id;
    }).length;

    const userSales = sales
        .filter(s => s.userId === currentUser.id)
        .reduce((sum, s) => sum + s.amount, 0);

    // Score each candidate
    const scoredCandidates = candidates.map(candidate => {
        const candidateBattles = battles.filter(b =>
            b.participants.some(p => p.userId === candidate.id)
        );
        const candidateWins = candidateBattles.filter(b => {
            const winner = b.participants.reduce((max, p) =>
                p.currentSales > max.currentSales ? p : max
            );
            return winner.userId === candidate.id;
        }).length;

        const candidateSales = sales
            .filter(s => s.userId === candidate.id)
            .reduce((sum, s) => sum + s.amount, 0);

        // Calculate similarity score (lower is better)
        const battleDiff = Math.abs(userBattles.length - candidateBattles.length);
        const winDiff = Math.abs(userWins - candidateWins);
        const salesDiff = Math.abs(userSales - candidateSales) / 10000; // Scale down

        const similarityScore = battleDiff + winDiff + salesDiff;

        // Calculate head-to-head history
        const headToHead = battles.filter(b =>
            b.participants.some(p => p.userId === currentUser.id) &&
            b.participants.some(p => p.userId === candidate.id)
        ).length;

        return {
            user: candidate,
            similarityScore,
            headToHeadCount: headToHead
        };
    });

    // Sort by similarity (prefer those with some h2h history)
    scoredCandidates.sort((a, b) => {
        // Prefer users with head-to-head history
        if (a.headToHeadCount > 0 && b.headToHeadCount === 0) return -1;
        if (b.headToHeadCount > 0 && a.headToHeadCount === 0) return 1;

        // Then by similarity
        return a.similarityScore - b.similarityScore;
    });

    // Return top 3
    return scoredCandidates.slice(0, 3).map(c => c.user);
}

export function calculateRivalryStats(
    userId1: string,
    userId2: string,
    battles: Battle[]
): {
    totalBattles: number;
    wins: { [userId: string]: number };
    currentStreak: { userId: string; count: number } | null;
} {
    // Get all battles between these two users
    const rivalBattles = battles.filter(
        b =>
            b.participants.some(p => p.userId === userId1) &&
            b.participants.some(p => p.userId === userId2) &&
            b.status === 'completed'
    );

    const wins: { [userId: string]: number } = {
        [userId1]: 0,
        [userId2]: 0
    };

    // Calculate wins
    rivalBattles.forEach(battle => {
        const winner = battle.participants.reduce((max, p) =>
            p.currentSales > max.currentSales ? p : max
        );
        wins[winner.userId] = (wins[winner.userId] || 0) + 1;
    });

    // Calculate current streak
    let currentStreak: { userId: string; count: number } | null = null;
    if (rivalBattles.length > 0) {
        // Sort by end time (most recent first)
        const sorted = [...rivalBattles].sort(
            (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
        );

        let streakUser = '';
        let streakCount = 0;

        for (const battle of sorted) {
            const winner = battle.participants.reduce((max, p) =>
                p.currentSales > max.currentSales ? p : max
            );

            if (!streakUser) {
                streakUser = winner.userId;
                streakCount = 1;
            } else if (winner.userId === streakUser) {
                streakCount++;
            } else {
                break;
            }
        }

        if (streakCount > 0) {
            currentStreak = { userId: streakUser, count: streakCount };
        }
    }

    return {
        totalBattles: rivalBattles.length,
        wins,
        currentStreak
    };
}
