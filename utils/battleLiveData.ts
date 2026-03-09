import { Battle, BattleParticipant } from '../types';

/**
 * Live Data Simulator for Battle Participants
 * Simulates realistic sales progression over time
 */
export class BattleLiveDataSimulator {
    private updateInterval: NodeJS.Timeout | null = null;
    private battles: Map<string, Battle> = new Map();
    private onUpdate: ((battles: Battle[]) => void) | null = null;

    /**
     * Start simulating live data for given battles
     * @param battles - Array of battles to simulate
     * @param onUpdate - Callback when sales data changes
     * @param intervalMs - Update interval in milliseconds (default: 10000 = 10s)
     */
    start(battles: Battle[], onUpdate: (battles: Battle[]) => void, intervalMs: number = 10000) {
        this.battles.clear();
        battles.forEach(battle => this.battles.set(battle.id, { ...battle }));
        this.onUpdate = onUpdate;

        // Initial update
        this.updateSales();

        // Start interval
        this.updateInterval = setInterval(() => {
            this.updateSales();
        }, intervalMs);
    }

    /**
     * Stop the simulation
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.battles.clear();
        this.onUpdate = null;
    }

    /**
     * Update sales for all active battles
     */
    private updateSales() {
        const now = Date.now();
        const updatedBattles: Battle[] = [];

        this.battles.forEach((battle) => {
            if (battle.status !== 'active') {
                updatedBattles.push(battle);
                return;
            }

            const startTime = new Date(battle.startTime).getTime();
            const endTime = new Date(battle.endTime).getTime();

            // Only update if battle is currently running
            if (now < startTime || now > endTime) {
                updatedBattles.push(battle);
                return;
            }

            // Calculate battle progress (0 to 1)
            const progress = (now - startTime) / (endTime - startTime);

            // Update each participant's sales
            const updatedParticipants = battle.participants.map((participant) => {
                return this.updateParticipant(participant, progress, battle);
            });

            updatedBattles.push({
                ...battle,
                participants: updatedParticipants,
            });

            // Update the stored battle
            this.battles.set(battle.id, {
                ...battle,
                participants: updatedParticipants,
            });
        });

        if (this.onUpdate) {
            this.onUpdate(updatedBattles);
        }
    }

    /**
     * Update individual participant with realistic sales growth
     */
    private updateParticipant(
        participant: BattleParticipant,
        progress: number,
        battle: Battle
    ): BattleParticipant {
        const baseGrowthRate = this.getGrowthRate(participant.userId);

        // Add some randomness to make it feel live (±20%)
        const randomFactor = 0.8 + Math.random() * 0.4;
        const growthRate = baseGrowthRate * randomFactor;

        // Calculate expected sales based on progress and target
        let expectedSales = 0;
        if (battle.targetType === 'first_to') {
            // First to target - aim to reach targetValue by end
            expectedSales = battle.targetValue * progress * growthRate;
        } else if (battle.targetType === 'highest_total') {
            // Highest total - aim for targetValue as approximate final
            expectedSales = battle.targetValue * progress * growthRate;
        } else if (battle.targetType === 'most_sales') {
            // Most sales - number of sales, so grow slower
            expectedSales = battle.targetValue * progress * growthRate * 0.3;
        }

        // Add incremental growth (500-2500 ISK per update)
        const increment = Math.floor((500 + Math.random() * 2000) / 500) * 500;
        const currentSales = (participant.currentSales || 0) + increment;

        // Don't exceed expected sales by too much (keeps it realistic)
        const finalSales = Math.min(currentSales, expectedSales + increment);

        // Update sales count (roughly 1 sale per 2500-4000 ISK)
        const avgSaleSize = 2500 + Math.random() * 1500;
        const salesCount = Math.max(1, Math.floor(finalSales / avgSaleSize));

        return {
            ...participant,
            currentSales: Math.round(finalSales),
            salesCount,
        };
    }

    /**
     * Get growth rate for participant (some participants are faster than others)
     */
    private getGrowthRate(userId: string): number {
        // Use userId to deterministically assign growth rates
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const normalized = (hash % 40) / 100; // 0.00 to 0.40
        return 0.8 + normalized; // Growth rate between 0.8 and 1.2
    }
}

// Export a singleton instance
export const battleSimulator = new BattleLiveDataSimulator();
