import { Battle, BattleParticipant, AIPrediction } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = (): string => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
            // @ts-ignore
            return import.meta.env.VITE_GEMINI_API_KEY;
        }
    } catch (e) {
        console.warn("Could not read environment variables safely.");
    }
    return "";
};

export async function predictBattleOutcome(
    battle: Battle,
    userHistory: { wins: number; losses: number; avgSales: number },
    opponentHistory: { wins: number; losses: number; avgSales: number }
): Promise<AIPrediction | null> {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return null;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const userId = battle.participants[0].userId;
        const opponentId = battle.participants[1].userId;

        const prompt = `You are analyzing a sales battle between two competitors.

Battle Details:
- Type: ${battle.type || 'standard'}
- Duration: ${Math.floor((new Date(battle.endTime).getTime() - new Date(battle.startTime).getTime()) / (1000 * 60 * 60))} hours
- Target: ${battle.targetValue} ISK (${battle.targetType})

Competitor 1 (${battle.participants[0].name}):
- Win Rate: ${(userHistory.wins / (userHistory.wins + userHistory.losses) * 100).toFixed(1)}%
- Average Sales: ${userHistory.avgSales} ISK
- Handicap: ${battle.handicaps[userId] || 1.0}x

Competitor 2 (${battle.participants[1].name}):
- Win Rate: ${(opponentHistory.wins / (opponentHistory.wins + opponentHistory.losses) * 100).toFixed(1)}%
- Average Sales: ${opponentHistory.avgSales} ISK
- Handicap: ${battle.handicaps[opponentId] || 1.0}x

Based on this data, predict:
1. Who is more likely to win
2. Your confidence level (0-100%)
3. Brief reasoning (2-3 sentences max)
4. One actionable tip for the underdog

Format your response as JSON:
{
  "winner": "name",
  "confidence": number,
  "reasoning": "string",
  "tips": ["tip1"]
}`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        if (!response) return null;

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const prediction = JSON.parse(jsonMatch[0]);

        return {
            winner: prediction.winner,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning,
            tips: prediction.tips || []
        };
    } catch (error) {
        console.error('AI Prediction error:', error);
        return null;
    }
}

export async function generateCoachingTips(userStats: {
    totalSales: number;
    battleWins: number;
    battleLosses: number;
    avgBattleSales: number;
    peakHours: number[];
}): Promise<string[]> {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return [];

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const prompt = `Analyze this sales performance data and provide 3 concise, actionable coaching tips:

Stats:
- Total Sales: ${userStats.totalSales} ISK
- Battle Record: ${userStats.battleWins}W-${userStats.battleLosses}L
- Avg Battle Sales: ${userStats.avgBattleSales} ISK
- Peak Hours: ${userStats.peakHours.join(', ')}

Provide specific, actionable tips to improve performance. Keep each tip to 1 sentence. Return as JSON array: ["tip1", "tip2", "tip3"]`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        if (!response) return [];

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Coaching tips error:', error);
        return [];
    }
}

export async function analyzeWhatItTakesToWin(
    battle: Battle,
    currentUserId: string,
    timeRemaining: number
): Promise<{ salesNeeded: number; recommendation: string } | null> {
    try {
        const user = battle.participants.find(p => p.userId === currentUserId);
        const opponent = battle.participants.find(p => p.userId !== currentUserId);

        if (!user || !opponent) return null;

        const userSales = user.adjustedSales || 0;
        const opponentSales = opponent.adjustedSales || 0;
        const deficit = opponentSales - userSales;

        if (deficit <= 0) {
            return {
                salesNeeded: 0,
                recommendation: "You're currently winning! Maintain your pace."
            };
        }

        const hoursRemaining = timeRemaining / (1000 * 60 * 60);
        const salesPerHourNeeded = Math.ceil((deficit + 1000) / hoursRemaining);

        return {
            salesNeeded: deficit + 1000,
            recommendation: `You need ${(deficit + 1000).toLocaleString()} ISK more to win. That's about ${salesPerHourNeeded.toLocaleString()} ISK per hour for the remaining ${hoursRemaining.toFixed(1)} hours.`
        };
    } catch (error) {
        console.error('What it takes error:', error);
        return null;
    }
}
