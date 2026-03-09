import { Battle, BattleParticipant, Sale } from '../types';

/**
 * Apply handicap multiplier to sales amount
 */
export function applyHandicap(amount: number, multiplier: number): number {
    return Math.round(amount * multiplier);
}

/**
 * Calculate current battle progress with handicaps applied
 */
export function calculateBattleProgress(
    battle: Battle,
    allSales: Sale[]
): BattleParticipant[] {
    const battleStart = new Date(battle.startTime).getTime();
    const battleEnd = new Date(battle.endTime).getTime();

    return battle.participants.map((participant) => {
        // Filter sales for this participant during battle time
        const participantSales = allSales.filter(
            (sale) =>
                sale.userId === participant.userId &&
                new Date(sale.timestamp).getTime() >= battleStart &&
                new Date(sale.timestamp).getTime() <= battleEnd
        );

        const currentSales = participantSales.reduce((sum, s) => sum + s.amount, 0);
        const salesCount = participantSales.length;
        const handicap = battle.handicaps[participant.userId] || 1.0;
        const adjustedSales = applyHandicap(currentSales, handicap);

        return {
            ...participant,
            currentSales,
            salesCount,
            adjustedSales,
        };
    });
}

/**
 * Predict winner based on current pace
 */
export function predictWinner(
    battle: Battle,
    participants: BattleParticipant[]
): { predictedWinnerId: string; confidence: number; message: string } {
    const now = new Date().getTime();
    const battleStart = new Date(battle.startTime).getTime();
    const battleEnd = new Date(battle.endTime).getTime();

    const elapsedMs = now - battleStart;
    const totalMs = battleEnd - battleStart;
    const progress = Math.min(1, elapsedMs / totalMs);

    if (progress < 0.1) {
        return {
            predictedWinnerId: '',
            confidence: 0,
            message: 'Too early to predict',
        };
    }

    // Sort by adjusted sales
    const sorted = [...participants].sort(
        (a, b) => (b.adjustedSales || 0) - (a.adjustedSales || 0)
    );
    const leader = sorted[0];
    const secondPlace = sorted[1];

    if (!leader || !secondPlace) {
        return {
            predictedWinnerId: leader?.userId || '',
            confidence: 50,
            message: 'Insufficient data',
        };
    }

    const leaderSales = leader.adjustedSales || 0;
    const secondSales = secondPlace.adjustedSales || 0;
    const gap = leaderSales - secondSales;
    const gapPercentage = leaderSales > 0 ? (gap / leaderSales) * 100 : 0;

    // Calculate based on target type
    if (battle.targetType === 'first_to') {
        const leaderProgress = (leaderSales / battle.targetValue) * 100;
        const secondProgress = (secondSales / battle.targetValue) * 100;

        if (leaderProgress >= 90) {
            return {
                predictedWinnerId: leader.userId,
                confidence: 95,
                message: `${leader.name} is almost at the target!`,
            };
        }

        const confidence = Math.min(90, 50 + gapPercentage);
        return {
            predictedWinnerId: leader.userId,
            confidence,
            message: `${leader.name} leads by ${gap.toLocaleString('is-IS')} ISK`,
        };
    }

    // For 'highest_total', confidence increases with time
    const timeConfidence = progress * 50;
    const gapConfidence = Math.min(40, gapPercentage);
    const totalConfidence = Math.min(95, timeConfidence + gapConfidence);

    return {
        predictedWinnerId: leader.userId,
        confidence: Math.round(totalConfidence),
        message:
            gapPercentage > 20
                ? `${leader.name} has a strong lead`
                : `Close race between ${leader.name} and ${secondPlace.name}`,
    };
}

/**
 * Get battle status indicator
 */
export function getBattleStatus(
    battle: Battle,
    participants: BattleParticipant[]
): { icon: string; label: string; color: string } {
    const sorted = [...participants].sort(
        (a, b) => (b.adjustedSales || 0) - (a.adjustedSales || 0)
    );

    if (sorted.length < 2) {
        return { icon: '💤', label: 'Slow Start', color: 'slate' };
    }

    const leader = sorted[0];
    const second = sorted[1];
    const gap = (leader.adjustedSales || 0) - (second.adjustedSales || 0);
    const gapPercentage =
        leader.adjustedSales && leader.adjustedSales > 0
            ? (gap / leader.adjustedSales) * 100
            : 0;

    const now = new Date().getTime();
    const battleEnd = new Date(battle.endTime).getTime();
    const timeLeft = battleEnd - now;
    const minutesLeft = timeLeft / (1000 * 60);

    if (minutesLeft < 30) {
        return { icon: '🏁', label: 'Final Sprint', color: 'rose' };
    }

    if (gapPercentage < 10) {
        return { icon: '⚡', label: 'Neck-and-Neck', color: 'amber' };
    }

    if (gapPercentage > 30) {
        return { icon: '🔥', label: 'Dominating', color: 'orange' };
    }

    return { icon: '🎯', label: 'Active', color: 'indigo' };
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(endTime: string): string {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Lokið';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')} eftir`;
    }

    return `${minutes} mín eftir`;
}

/**
 * Convert duration minutes to display format
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} mín`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} klst`;
    }

    return `${hours} klst ${mins} mín`;
}
