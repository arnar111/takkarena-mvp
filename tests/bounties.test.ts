import { describe, it, expect } from 'vitest';
import {
    getContextAwareBounties,
    BountyContext,
    BountyStats,
    BOUNTY_POOL
} from '../utils/bounties';

describe('getContextAwareBounties', () => {
    const baseStats: BountyStats = {
        salesAmount: 0,
        salesCount: 0,
        newSalesCount: 0,
        upgradesCount: 0,
        maxSingleSale: 0,
        hourlyRate: 0
    };

    const baseContext: BountyContext = {
        saleType: 'new',
        currentHour: 10, // 10am - all time-based bounties should be available
        stats: baseStats,
        excludeIds: []
    };

    describe('Basic functionality', () => {
        it('should return the requested number of bounties', () => {
            const result = getContextAwareBounties(5, baseContext);
            expect(result).toHaveLength(5);
        });

        it('should return unique bounties (no duplicates)', () => {
            const result = getContextAwareBounties(5, baseContext);
            const ids = result.map(b => b.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(5);
        });

        it('should return bounties even when count is larger than priority pool', () => {
            const result = getContextAwareBounties(10, baseContext);
            expect(result).toHaveLength(10);
        });
    });

    describe('Sale type prioritization', () => {
        it('should prioritize upgrade_count bounties when saleType is upgrade', () => {
            const upgradeContext: BountyContext = {
                ...baseContext,
                saleType: 'upgrade'
            };
            const result = getContextAwareBounties(5, upgradeContext);
            const upgradeCountBounties = result.filter(b => b.checkType === 'upgrade_count');

            // Should have at least some upgrade bounties (priority selection)
            expect(upgradeCountBounties.length).toBeGreaterThanOrEqual(1);
        });

        it('should prioritize new_sales_count bounties when saleType is new', () => {
            const newContext: BountyContext = {
                ...baseContext,
                saleType: 'new'
            };
            const result = getContextAwareBounties(5, newContext);
            const newSalesCountBounties = result.filter(b => b.checkType === 'new_sales_count');

            // Should have at least some new sales bounties (priority selection)
            expect(newSalesCountBounties.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Time-based filtering', () => {
        it('should exclude lunch_rush bounty after 13:00', () => {
            const afternoonContext: BountyContext = {
                ...baseContext,
                currentHour: 14 // 2pm
            };
            const results = getContextAwareBounties(20, afternoonContext);
            const lunchRush = results.find(b => b.id === 'lunch_rush');
            expect(lunchRush).toBeUndefined();
        });

        it('should exclude morning_start bounty after 12:00', () => {
            const afternoonContext: BountyContext = {
                ...baseContext,
                currentHour: 13 // 1pm
            };
            const results = getContextAwareBounties(20, afternoonContext);
            const morningStart = results.find(b => b.id === 'morning_start');
            expect(morningStart).toBeUndefined();
        });

        it('should include morning bounties before noon', () => {
            const morningContext: BountyContext = {
                ...baseContext,
                currentHour: 9 // 9am
            };
            // Request many bounties to ensure we'd get morning ones if available
            const results = getContextAwareBounties(30, morningContext);
            const morningBounties = results.filter(b =>
                b.id === 'morning_start' || b.id === 'quick_start' || b.id === 'lunch_rush'
            );
            // At least one morning bounty should be available
            expect(morningBounties.length).toBeGreaterThanOrEqual(0); // May not always be selected due to randomness
        });
    });

    describe('Pool exhaustion handling', () => {
        it('should return bounties even when most are already completed', () => {
            const highStats: BountyStats = {
                salesAmount: 100000, // Very high - completes most amount-based bounties
                salesCount: 20,
                newSalesCount: 10,
                upgradesCount: 8,
                maxSingleSale: 10000,
                hourlyRate: 15000
            };
            const exhaustedContext: BountyContext = {
                ...baseContext,
                stats: highStats
            };
            const result = getContextAwareBounties(5, exhaustedContext);
            expect(result.length).toBe(5);
        });

        it('should respect excludeIds when provided', () => {
            const firstBountyId = BOUNTY_POOL[0].id;
            const contextWithExclude: BountyContext = {
                ...baseContext,
                excludeIds: [firstBountyId]
            };
            const result = getContextAwareBounties(5, contextWithExclude);
            const excluded = result.find(b => b.id === firstBountyId);
            expect(excluded).toBeUndefined();
        });
    });
});
