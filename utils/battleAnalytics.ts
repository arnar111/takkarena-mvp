import { Battle, BattleAnalytics, Sale, BattleParticipant } from '../types';

export function analyzeBattle(battle: Battle, sales: Sale[]): BattleAnalytics {
    const battleStart = new Date(battle.startTime).getTime();
    const battleEnd = new Date(battle.endTime).getTime();

    // Filter sales within battle timeframe
    const battleSales = sales.filter(s => {
        const saleTime = new Date(s.timestamp).getTime();
        return saleTime >= battleStart && saleTime <= battleEnd &&
            battle.participants.some(p => p.userId === s.userId);
    });

    // Create timeline (hourly breakdown)
    const timeline: { time: string; sales: { [userId: string]: number } }[] = [];
    const hours = Math.ceil((battleEnd - battleStart) / (1000 * 60 * 60));

    for (let i = 0; i <= hours; i++) {
        const hourTime = new Date(battleStart + i * 60 * 60 * 1000);
        const hourSales: { [userId: string]: number } = {};

        battle.participants.forEach(p => {
            const userSalesInHour = battleSales.filter(s => {
                const saleTime = new Date(s.timestamp).getTime();
                return s.userId === p.userId &&
                    saleTime >= hourTime.getTime() &&
                    saleTime < hourTime.getTime() + 60 * 60 * 1000;
            }).reduce((sum, s) => sum + s.amount, 0);

            hourSales[p.userId] = userSalesInHour;
        });

        timeline.push({
            time: hourTime.toISOString(),
            sales: hourSales
        });
    }

    // Create heat map (sales by hour of day)
    const heatMap: { hour: number; sales: number; userId: string }[] = [];

    for (let hour = 0; hour < 24; hour++) {
        battle.participants.forEach(p => {
            const salesInHour = battleSales.filter(s => {
                const saleHour = new Date(s.timestamp).getHours();
                return s.userId === p.userId && saleHour === hour;
            }).reduce((sum, s) => sum + s.amount, 0);

            if (salesInHour > 0) {
                heatMap.push({ hour, sales: salesInHour, userId: p.userId });
            }
        });
    }

    // Find peak performance periods
    const peakPerformance: { userId: string; period: string; sales: number }[] = [];

    battle.participants.forEach(p => {
        let maxSales = 0;
        let maxPeriod = '';

        timeline.forEach((entry, idx) => {
            if (entry.sales[p.userId] > maxSales) {
                maxSales = entry.sales[p.userId];
                maxPeriod = `Hour ${idx + 1}`;
            }
        });

        if (maxSales > 0) {
            peakPerformance.push({
                userId: p.userId,
                period: maxPeriod,
                sales: maxSales
            });
        }
    });

    return {
        battleId: battle.id,
        timeline,
        heatMap,
        peakPerformance
    };
}

export function calculateBattleStats(participant: BattleParticipant, sales: Sale[], battle: Battle): {
    totalSales: number;
    salesCount: number;
    avgSaleSize: number;
    peakHour: number;
} {
    const battleStart = new Date(battle.startTime).getTime();
    const battleEnd = new Date(battle.endTime).getTime();

    const userSales = sales.filter(s => {
        const saleTime = new Date(s.timestamp).getTime();
        return s.userId === participant.userId &&
            saleTime >= battleStart &&
            saleTime <= battleEnd;
    });

    const totalSales = userSales.reduce((sum, s) => sum + s.amount, 0);
    const salesCount = userSales.length;
    const avgSaleSize = salesCount > 0 ? totalSales / salesCount : 0;

    // Find peak hour
    const hourCounts: { [hour: number]: number } = {};
    userSales.forEach(s => {
        const hour = new Date(s.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + s.amount;
    });

    let peakHour = 0;
    let maxSales = 0;
    Object.entries(hourCounts).forEach(([hour, sales]) => {
        if (sales > maxSales) {
            maxSales = sales;
            peakHour = parseInt(hour);
        }
    });

    return {
        totalSales,
        salesCount,
        avgSaleSize,
        peakHour
    };
}
