import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    DIFFICULTY_LEVELS,
    DifficultyLevel,
    WINNING_TAUNTS,
    LOSING_TAUNTS,
    getRandomTaunt,
    BOT_CONFIG
} from '../constants/botPersonality';

interface BotBattleState {
    isActive: boolean;
    difficulty: DifficultyLevel;
    botScore: number;
    userScore: number;
    startTime: Date | null;
    endTime: Date | null;
    currentTaunt: string | null;
    lastTauntTime: number;
}

interface UseBotBattleReturn {
    botBattle: BotBattleState;
    startBattle: (difficulty: DifficultyLevel, durationMinutes: number) => void;
    endBattle: () => { winner: 'user' | 'bot' | 'tie', userScore: number, botScore: number };
    updateUserScore: (score: number) => void;
    currentTaunt: string | null;
    clearTaunt: () => void;
    timeRemaining: number;
    isWinning: boolean;
    leadAmount: number;
}

export const useBotBattle = (userHistoricalAvg: number): UseBotBattleReturn => {
    const [botBattle, setBotBattle] = useState<BotBattleState>({
        isActive: false,
        difficulty: 'medium',
        botScore: 0,
        userScore: 0,
        startTime: null,
        endTime: null,
        currentTaunt: null,
        lastTauntTime: 0,
    });

    const [timeRemaining, setTimeRemaining] = useState(0);

    // Calculate if user is winning
    const isWinning = botBattle.userScore > botBattle.botScore;
    const leadAmount = Math.abs(botBattle.userScore - botBattle.botScore);

    // Start a bot battle
    const startBattle = useCallback((difficulty: DifficultyLevel, durationMinutes: number) => {
        const now = new Date();
        const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

        setBotBattle({
            isActive: true,
            difficulty,
            botScore: 0,
            userScore: 0,
            startTime: now,
            endTime,
            currentTaunt: null,
            lastTauntTime: 0,
        });
    }, []);

    // End the battle
    const endBattle = useCallback(() => {
        const result = {
            winner: botBattle.userScore > botBattle.botScore ? 'user' as const :
                botBattle.userScore < botBattle.botScore ? 'bot' as const : 'tie' as const,
            userScore: botBattle.userScore,
            botScore: botBattle.botScore,
        };

        setBotBattle(prev => ({ ...prev, isActive: false }));
        return result;
    }, [botBattle.userScore, botBattle.botScore]);

    // Update user score
    const updateUserScore = useCallback((score: number) => {
        setBotBattle(prev => ({ ...prev, userScore: score }));
    }, []);

    // Clear current taunt
    const clearTaunt = useCallback(() => {
        setBotBattle(prev => ({ ...prev, currentTaunt: null }));
    }, []);

    // Bot score simulation - runs every 30 seconds
    useEffect(() => {
        if (!botBattle.isActive || !botBattle.startTime || !botBattle.endTime) return;

        const difficultyConfig = DIFFICULTY_LEVELS[botBattle.difficulty];
        const baseRatePerMinute = (userHistoricalAvg / 60); // Per minute rate

        const updateBotScore = () => {
            const now = new Date();
            const elapsedMinutes = (now.getTime() - botBattle.startTime!.getTime()) / 60000;

            // Calculate bot score with variance
            const variance = difficultyConfig.varianceMin +
                Math.random() * (difficultyConfig.varianceMax - difficultyConfig.varianceMin);

            let calculated = baseRatePerMinute * difficultyConfig.multiplier * elapsedMinutes * (1 + variance);

            // Adaptive mode for nightmare - always tries to be slightly ahead
            if ('adaptive' in difficultyConfig && (difficultyConfig as any).adaptive && botBattle.userScore > 0) {
                const targetLead = botBattle.userScore * 0.08; // 8% ahead
                calculated = Math.max(calculated, botBattle.userScore + targetLead);
            }

            // Comeback boost if bot is losing badly
            if (botBattle.userScore > calculated * 1.2) {
                calculated *= 1.15; // 15% boost when losing
            }

            setBotBattle(prev => ({ ...prev, botScore: Math.round(calculated) }));
        };

        updateBotScore();
        const interval = setInterval(updateBotScore, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [botBattle.isActive, botBattle.startTime, botBattle.endTime, botBattle.difficulty, botBattle.userScore, userHistoricalAvg]);

    // Timer countdown
    useEffect(() => {
        if (!botBattle.isActive || !botBattle.endTime) {
            setTimeRemaining(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, botBattle.endTime!.getTime() - Date.now());
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                endBattle();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [botBattle.isActive, botBattle.endTime, endBattle]);

    // Taunt system - only when ahead/behind by threshold
    useEffect(() => {
        if (!botBattle.isActive) return;

        const difficultyConfig = DIFFICULTY_LEVELS[botBattle.difficulty];
        const total = botBattle.userScore + botBattle.botScore;
        if (total === 0) return;

        const userPercentage = botBattle.userScore / total;
        const botPercentage = botBattle.botScore / total;
        const now = Date.now();

        // Only taunt every 60 seconds minimum
        if (now - botBattle.lastTauntTime < 60000) return;

        // Check if threshold is met for taunting
        if (botPercentage - userPercentage >= difficultyConfig.tauntThreshold) {
            // Bot is winning by threshold
            setBotBattle(prev => ({
                ...prev,
                currentTaunt: getRandomTaunt(WINNING_TAUNTS),
                lastTauntTime: now,
            }));
        } else if (userPercentage - botPercentage >= difficultyConfig.tauntThreshold) {
            // User is winning by threshold
            setBotBattle(prev => ({
                ...prev,
                currentTaunt: getRandomTaunt(LOSING_TAUNTS),
                lastTauntTime: now,
            }));
        }
    }, [botBattle.isActive, botBattle.userScore, botBattle.botScore, botBattle.difficulty, botBattle.lastTauntTime]);

    // Auto-clear taunts after 5 seconds
    useEffect(() => {
        if (!botBattle.currentTaunt) return;

        const timeout = setTimeout(clearTaunt, 5000);
        return () => clearTimeout(timeout);
    }, [botBattle.currentTaunt, clearTaunt]);

    return {
        botBattle,
        startBattle,
        endBattle,
        updateUserScore,
        currentTaunt: botBattle.currentTaunt,
        clearTaunt,
        timeRemaining,
        isWinning,
        leadAmount,
    };
};
