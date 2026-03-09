import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sale } from '../types';

interface StreakState {
    currentStreak: number;
    highestStreak: number;
    lastSaleTime: Date | null;
    isActive: boolean;
    coinsEarned: number;
}

interface UseStreaksReturn extends StreakState {
    checkStreak: (newSale: Sale) => { streakBroken: boolean; newStreak: number; coinsAwarded: number };
    resetStreak: () => void;
}

const STREAK_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

// Coins awarded per streak level
const STREAK_REWARDS: { [key: number]: number } = {
    2: 5,    // 2x streak = 5 coins
    3: 10,   // 3x streak = 10 coins
    4: 20,   // 4x streak = 20 coins
    5: 50,   // 5x streak = 50 coins
    6: 75,   // 6+ streak = 75 coins each
};

/**
 * Hook for tracking sales streaks and awarding Takk Coins
 * A streak is maintained when sales are made within 30-minute windows
 */
export const useStreaks = (userId: string | undefined, sales: Sale[]): UseStreaksReturn => {
    const [streakState, setStreakState] = useState<StreakState>({
        currentStreak: 0,
        highestStreak: 0,
        lastSaleTime: null,
        isActive: false,
        coinsEarned: 0
    });

    // Calculate current streak from recent sales
    useEffect(() => {
        if (!userId || sales.length === 0) return;

        const userSales = sales
            .filter(s => s.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (userSales.length === 0) return;

        let streak = 1;
        let lastTime = new Date(userSales[0].timestamp);
        const now = new Date();

        // Check if streak is still active (last sale within window)
        const isActive = (now.getTime() - lastTime.getTime()) < STREAK_WINDOW_MS;

        // Count consecutive sales within streak window
        for (let i = 1; i < userSales.length && i < 10; i++) {
            const currentTime = new Date(userSales[i].timestamp);
            const timeDiff = lastTime.getTime() - currentTime.getTime();

            if (timeDiff <= STREAK_WINDOW_MS) {
                streak++;
                lastTime = currentTime;
            } else {
                break;
            }
        }

        setStreakState(prev => ({
            ...prev,
            currentStreak: isActive ? streak : 0,
            highestStreak: Math.max(prev.highestStreak, streak),
            lastSaleTime: new Date(userSales[0].timestamp),
            isActive
        }));
    }, [userId, sales]);

    // Check if a new sale extends or breaks the streak
    const checkStreak = useCallback((newSale: Sale): { streakBroken: boolean; newStreak: number; coinsAwarded: number } => {
        const now = new Date(newSale.timestamp);
        const lastTime = streakState.lastSaleTime;

        if (!lastTime) {
            // First sale - start streak
            return { streakBroken: false, newStreak: 1, coinsAwarded: 0 };
        }

        const timeDiff = now.getTime() - lastTime.getTime();

        if (timeDiff <= STREAK_WINDOW_MS) {
            // Streak continues!
            const newStreak = streakState.currentStreak + 1;
            const coinsAwarded = STREAK_REWARDS[Math.min(newStreak, 6)] || 0;

            setStreakState(prev => ({
                ...prev,
                currentStreak: newStreak,
                highestStreak: Math.max(prev.highestStreak, newStreak),
                lastSaleTime: now,
                isActive: true,
                coinsEarned: prev.coinsEarned + coinsAwarded
            }));

            return { streakBroken: false, newStreak, coinsAwarded };
        } else {
            // Streak broken
            setStreakState(prev => ({
                ...prev,
                currentStreak: 1,
                lastSaleTime: now,
                isActive: true
            }));

            return { streakBroken: true, newStreak: 1, coinsAwarded: 0 };
        }
    }, [streakState]);

    const resetStreak = useCallback(() => {
        setStreakState({
            currentStreak: 0,
            highestStreak: 0,
            lastSaleTime: null,
            isActive: false,
            coinsEarned: 0
        });
    }, []);

    return {
        ...streakState,
        checkStreak,
        resetStreak
    };
};

export default useStreaks;
