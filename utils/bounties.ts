/**
 * Bounty System - 100+ Daily Challenges
 * Each bounty has a task, reward name, coin value, and check function ID
 */

export interface Bounty {
    id: string;
    task: string;
    reward: string;
    coins: number;
    emoji: string;
    // Check type determines how completion is evaluated
    checkType: 'sales_amount' | 'sales_count' | 'new_sales_count' | 'upgrade_count' | 'single_sale' | 'hourly_rate' | 'streak' | 'time_based';
    threshold: number; // The value to check against
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

// Generate bounty pool - 100+ unique bounties
export const BOUNTY_POOL: Bounty[] = [
    // ===== EASY (10-25 coins) =====
    { id: 'first_sale', task: 'Fyrsta sala dagsins', reward: 'First Blood', coins: 10, emoji: '🩸', checkType: 'sales_count', threshold: 1, difficulty: 'easy' },
    { id: 'two_sales', task: 'Tvær sölur', reward: 'Double Tap', coins: 15, emoji: '✌️', checkType: 'sales_count', threshold: 2, difficulty: 'easy' },
    { id: 'three_sales', task: 'Þrjár sölur', reward: 'Triple Threat', coins: 20, emoji: '🎲', checkType: 'sales_count', threshold: 3, difficulty: 'easy' },
    { id: 'five_k', task: 'Náðu 5.000 kr', reward: 'Getting Started', coins: 10, emoji: '🌱', checkType: 'sales_amount', threshold: 5000, difficulty: 'easy' },
    { id: 'ten_k', task: 'Náðu 10.000 kr', reward: 'Warmed Up', coins: 15, emoji: '🔥', checkType: 'sales_amount', threshold: 10000, difficulty: 'easy' },
    { id: 'first_new', task: 'Fyrsti nýi viðskiptavinur', reward: 'Fresh Catch', coins: 15, emoji: '🎣', checkType: 'new_sales_count', threshold: 1, difficulty: 'easy' },
    { id: 'first_upgrade', task: 'Fyrsta hækkun', reward: 'Level Up', coins: 15, emoji: '⬆️', checkType: 'upgrade_count', threshold: 1, difficulty: 'easy' },
    { id: 'small_sale', task: 'Sala undir 1.000 kr', reward: 'Every Bit Counts', coins: 10, emoji: '🪙', checkType: 'single_sale', threshold: 999, difficulty: 'easy' },
    { id: 'morning_start', task: 'Sala fyrir hádegi', reward: 'Early Bird', coins: 20, emoji: '🐦', checkType: 'time_based', threshold: 12, difficulty: 'easy' },
    { id: 'quick_start', task: 'Sala á fyrstu 30 mín', reward: 'Quick Draw', coins: 25, emoji: '⚡', checkType: 'time_based', threshold: 30, difficulty: 'easy' },

    // ===== MEDIUM (30-75 coins) =====
    { id: 'five_sales', task: '5 sölur', reward: 'High Five', coins: 35, emoji: '🖐️', checkType: 'sales_count', threshold: 5, difficulty: 'medium' },
    { id: 'fifteen_k', task: 'Náðu 15.000 kr', reward: 'Cruising', coins: 30, emoji: '🚗', checkType: 'sales_amount', threshold: 15000, difficulty: 'medium' },
    { id: 'twenty_k', task: 'Náðu 20.000 kr', reward: 'Nice Round Number', coins: 40, emoji: '🎯', checkType: 'sales_amount', threshold: 20000, difficulty: 'medium' },
    { id: 'twenty_five_k', task: 'Náðu 25.000 kr', reward: 'Quarter Master', coins: 50, emoji: '💰', checkType: 'sales_amount', threshold: 25000, difficulty: 'medium' },
    { id: 'three_new', task: '3 nýir viðskiptavinir', reward: 'Hat Trick', coins: 45, emoji: '🎩', checkType: 'new_sales_count', threshold: 3, difficulty: 'medium' },
    { id: 'two_upgrades', task: '2 hækkanir', reward: 'Double Upgrade', coins: 40, emoji: '📈', checkType: 'upgrade_count', threshold: 2, difficulty: 'medium' },
    { id: 'big_sale_2k', task: 'Sala yfir 2.000 kr', reward: 'Big Spender', coins: 30, emoji: '💸', checkType: 'single_sale', threshold: 2000, difficulty: 'medium' },
    { id: 'big_sale_3k', task: 'Sala yfir 3.000 kr', reward: 'Whale Alert', coins: 45, emoji: '🐋', checkType: 'single_sale', threshold: 3000, difficulty: 'medium' },
    { id: 'hourly_5k', task: '5.000 kr/klst meðaltal', reward: 'Speed Demon', coins: 50, emoji: '👹', checkType: 'hourly_rate', threshold: 5000, difficulty: 'medium' },
    { id: 'four_sales', task: '4 sölur', reward: 'Fantastic Four', coins: 30, emoji: '4️⃣', checkType: 'sales_count', threshold: 4, difficulty: 'medium' },
    { id: 'streak_two', task: '2 sölur í röð án pásu', reward: 'On Fire', coins: 35, emoji: '🔥', checkType: 'streak', threshold: 2, difficulty: 'medium' },
    { id: 'afternoon_push', task: 'Sala eftir 15:00', reward: 'Afternoon Hustle', coins: 30, emoji: '☀️', checkType: 'time_based', threshold: 15, difficulty: 'medium' },
    { id: 'evening_warrior', task: 'Sala eftir 17:00', reward: 'Evening Warrior', coins: 35, emoji: '🌆', checkType: 'time_based', threshold: 17, difficulty: 'medium' },

    // ===== HARD (80-150 coins) =====
    { id: 'thirty_k', task: 'Náðu 30.000 kr', reward: 'Thirty Thousand Club', coins: 80, emoji: '🏅', checkType: 'sales_amount', threshold: 30000, difficulty: 'hard' },
    { id: 'thirty_five_k', task: 'Náðu 35.000 kr', reward: 'High Roller', coins: 100, emoji: '🎰', checkType: 'sales_amount', threshold: 35000, difficulty: 'hard' },
    { id: 'forty_k', task: 'Náðu 40.000 kr', reward: 'Monster Day', coins: 120, emoji: '👾', checkType: 'sales_amount', threshold: 40000, difficulty: 'hard' },
    { id: 'seven_sales', task: '7 sölur', reward: 'Lucky Seven', coins: 80, emoji: '🍀', checkType: 'sales_count', threshold: 7, difficulty: 'hard' },
    { id: 'eight_sales', task: '8 sölur', reward: 'Octopus', coins: 90, emoji: '🐙', checkType: 'sales_count', threshold: 8, difficulty: 'hard' },
    { id: 'ten_sales', task: '10 sölur', reward: 'Perfect 10', coins: 120, emoji: '🔟', checkType: 'sales_count', threshold: 10, difficulty: 'hard' },
    { id: 'five_new', task: '5 nýir viðskiptavinir', reward: 'New Business King', coins: 100, emoji: '👑', checkType: 'new_sales_count', threshold: 5, difficulty: 'hard' },
    { id: 'four_upgrades', task: '4 hækkanir', reward: 'Upgrade Master', coins: 90, emoji: '🚀', checkType: 'upgrade_count', threshold: 4, difficulty: 'hard' },
    { id: 'big_sale_4k', task: 'Sala yfir 4.000 kr', reward: 'Mega Deal', coins: 80, emoji: '💎', checkType: 'single_sale', threshold: 4000, difficulty: 'hard' },
    { id: 'big_sale_5k', task: 'Sala yfir 5.000 kr', reward: 'Jackpot', coins: 100, emoji: '🎰', checkType: 'single_sale', threshold: 5000, difficulty: 'hard' },
    { id: 'hourly_7k', task: '7.000 kr/klst meðaltal', reward: 'Machine Mode', coins: 100, emoji: '🤖', checkType: 'hourly_rate', threshold: 7000, difficulty: 'hard' },
    { id: 'streak_three', task: '3 sölur í röð', reward: 'Streak Master', coins: 85, emoji: '⚡', checkType: 'streak', threshold: 3, difficulty: 'hard' },
    { id: 'six_sales', task: '6 sölur', reward: 'Six Shooter', coins: 70, emoji: '🔫', checkType: 'sales_count', threshold: 6, difficulty: 'hard' },

    // ===== LEGENDARY (200+ coins) =====
    { id: 'fifty_k', task: 'Náðu 50.000 kr', reward: 'Legend', coins: 200, emoji: '🏆', checkType: 'sales_amount', threshold: 50000, difficulty: 'legendary' },
    { id: 'sixty_k', task: 'Náðu 60.000 kr', reward: 'Unstoppable', coins: 300, emoji: '💥', checkType: 'sales_amount', threshold: 60000, difficulty: 'legendary' },
    { id: 'seventy_k', task: 'Náðu 70.000 kr', reward: 'God Mode', coins: 400, emoji: '⚡', checkType: 'sales_amount', threshold: 70000, difficulty: 'legendary' },
    { id: 'twelve_sales', task: '12 sölur', reward: 'Dozen Master', coins: 200, emoji: '🥚', checkType: 'sales_count', threshold: 12, difficulty: 'legendary' },
    { id: 'fifteen_sales', task: '15 sölur', reward: 'Sales Machine', coins: 300, emoji: '🏭', checkType: 'sales_count', threshold: 15, difficulty: 'legendary' },
    { id: 'seven_new', task: '7 nýir viðskiptavinir', reward: 'Acquisition King', coins: 250, emoji: '👑', checkType: 'new_sales_count', threshold: 7, difficulty: 'legendary' },
    { id: 'six_upgrades', task: '6 hækkanir', reward: 'Upgrade God', coins: 200, emoji: '🌟', checkType: 'upgrade_count', threshold: 6, difficulty: 'legendary' },
    { id: 'mega_sale', task: 'Sala yfir 7.000 kr', reward: 'Whale Hunter', coins: 200, emoji: '🐳', checkType: 'single_sale', threshold: 7000, difficulty: 'legendary' },
    { id: 'super_sale', task: 'Sala yfir 10.000 kr', reward: 'Unicorn Deal', coins: 300, emoji: '🦄', checkType: 'single_sale', threshold: 10000, difficulty: 'legendary' },
    { id: 'hourly_10k', task: '10.000 kr/klst meðaltal', reward: 'Terminator', coins: 250, emoji: '🤖', checkType: 'hourly_rate', threshold: 10000, difficulty: 'legendary' },
    { id: 'streak_five', task: '5 sölur í röð', reward: 'Streak God', coins: 250, emoji: '🔥', checkType: 'streak', threshold: 5, difficulty: 'legendary' },

    // ===== MORE VARIETY =====
    // Additional Easy
    { id: 'two_new', task: '2 nýir viðskiptavinir', reward: 'Double Fresh', coins: 25, emoji: '🌊', checkType: 'new_sales_count', threshold: 2, difficulty: 'easy' },
    { id: 'seven_k', task: 'Náðu 7.500 kr', reward: 'Lucky Number', coins: 12, emoji: '🎲', checkType: 'sales_amount', threshold: 7500, difficulty: 'easy' },
    { id: 'twelve_k', task: 'Náðu 12.000 kr', reward: 'Dozen Thousand', coins: 22, emoji: '🔢', checkType: 'sales_amount', threshold: 12000, difficulty: 'easy' },

    // Additional Medium
    { id: 'three_upgrades', task: '3 hækkanir', reward: 'Triple Upgrade', coins: 60, emoji: '📊', checkType: 'upgrade_count', threshold: 3, difficulty: 'medium' },
    { id: 'four_new', task: '4 nýir viðskiptavinir', reward: 'Fresh Four', coins: 65, emoji: '🌿', checkType: 'new_sales_count', threshold: 4, difficulty: 'medium' },
    { id: 'hourly_4k', task: '4.000 kr/klst meðaltal', reward: 'Steady Pace', coins: 40, emoji: '⏱️', checkType: 'hourly_rate', threshold: 4000, difficulty: 'medium' },
    { id: 'eighteen_k', task: 'Náðu 18.000 kr', reward: 'Legal Age', coins: 35, emoji: '🎂', checkType: 'sales_amount', threshold: 18000, difficulty: 'medium' },
    { id: 'twenty_two_k', task: 'Náðu 22.000 kr', reward: 'Catch 22', coins: 45, emoji: '🎯', checkType: 'sales_amount', threshold: 22000, difficulty: 'medium' },

    // Additional Hard
    { id: 'nine_sales', task: '9 sölur', reward: 'Cloud Nine', coins: 95, emoji: '☁️', checkType: 'sales_count', threshold: 9, difficulty: 'hard' },
    { id: 'hourly_8k', task: '8.000 kr/klst meðaltal', reward: 'Overdrive', coins: 110, emoji: '🚀', checkType: 'hourly_rate', threshold: 8000, difficulty: 'hard' },
    { id: 'six_new', task: '6 nýir viðskiptavinir', reward: 'Six Pack', coins: 130, emoji: '🍺', checkType: 'new_sales_count', threshold: 6, difficulty: 'hard' },
    { id: 'five_upgrades', task: '5 hækkanir', reward: 'Upgrade Spree', coins: 120, emoji: '⚡', checkType: 'upgrade_count', threshold: 5, difficulty: 'hard' },
    { id: 'forty_five_k', task: 'Náðu 45.000 kr', reward: 'Half Century', coins: 140, emoji: '🎖️', checkType: 'sales_amount', threshold: 45000, difficulty: 'hard' },
    { id: 'streak_four', task: '4 sölur í röð', reward: 'Hot Streak', coins: 110, emoji: '🌡️', checkType: 'streak', threshold: 4, difficulty: 'hard' },

    // Fun/Themed Bounties
    { id: 'coffee_break', task: 'Sala eftir kaffi pásu', reward: 'Caffeinated', coins: 25, emoji: '☕', checkType: 'sales_count', threshold: 1, difficulty: 'easy' },
    { id: 'power_hour', task: '5.000 kr á einum tíma', reward: 'Power Hour', coins: 60, emoji: '⚡', checkType: 'hourly_rate', threshold: 5000, difficulty: 'medium' },
    { id: 'comeback_kid', task: 'Sala eftir 30 mín þurrk', reward: 'Comeback Kid', coins: 50, emoji: '🔄', checkType: 'time_based', threshold: 30, difficulty: 'medium' },
    { id: 'lunch_rush', task: 'Sala á hádegivakt', reward: 'Lunch Rush', coins: 30, emoji: '🍔', checkType: 'time_based', threshold: 12, difficulty: 'easy' },
    { id: 'closing_strong', task: 'Sala á síðustu 30 mín', reward: 'Closing Strong', coins: 45, emoji: '🔒', checkType: 'time_based', threshold: 0, difficulty: 'medium' },

    // Project-specific (generic)
    { id: 'variety_pack', task: '3 mismunandi verkefni', reward: 'Variety Pack', coins: 55, emoji: '🎨', checkType: 'sales_count', threshold: 3, difficulty: 'medium' },
    { id: 'specialist', task: '5 sölur á sama verkefni', reward: 'Specialist', coins: 70, emoji: '🎯', checkType: 'sales_count', threshold: 5, difficulty: 'hard' },

    // Competitive
    { id: 'beat_average', task: 'Slá meðaltal', reward: 'Above Average', coins: 60, emoji: '📈', checkType: 'hourly_rate', threshold: 0, difficulty: 'medium' },
    { id: 'personal_best', task: 'Ný persónuleg met', reward: 'Personal Best', coins: 150, emoji: '🏅', checkType: 'sales_amount', threshold: 0, difficulty: 'hard' },

    // Challenge combos
    { id: 'balanced_day', task: 'Jafn fjöldi nýir og hækkanir', reward: 'Perfect Balance', coins: 75, emoji: '⚖️', checkType: 'sales_count', threshold: 0, difficulty: 'hard' },
    { id: 'no_small_sales', task: 'Allar sölur yfir 1.000 kr', reward: 'No Small Fry', coins: 80, emoji: '🍟', checkType: 'single_sale', threshold: 1000, difficulty: 'hard' },

    // More easy fillers
    { id: 'warm_up', task: 'Fyrstu 3.000 kr', reward: 'Warming Up', coins: 8, emoji: '🌡️', checkType: 'sales_amount', threshold: 3000, difficulty: 'easy' },
    { id: 'getting_going', task: 'Náðu 8.000 kr', reward: 'Getting Going', coins: 14, emoji: '🏃', checkType: 'sales_amount', threshold: 8000, difficulty: 'easy' },
    { id: 'dime', task: 'Náðu 10.000 kr', reward: 'Perfect Dime', coins: 18, emoji: '💎', checkType: 'sales_amount', threshold: 10000, difficulty: 'easy' },

    // More medium fillers
    { id: 'twenty_seven_k', task: 'Náðu 27.000 kr', reward: 'Club 27', coins: 55, emoji: '🎸', checkType: 'sales_amount', threshold: 27000, difficulty: 'medium' },
    { id: 'twenty_eight_k', task: 'Náðu 28.000 kr', reward: 'Almost There', coins: 58, emoji: '🏁', checkType: 'sales_amount', threshold: 28000, difficulty: 'medium' },
    { id: 'twenty_three_k', task: 'Náðu 23.000 kr', reward: 'Jordan Number', coins: 48, emoji: '🏀', checkType: 'sales_amount', threshold: 23000, difficulty: 'medium' },

    // Additional legendary
    { id: 'eighty_k', task: 'Náðu 80.000 kr', reward: 'Mythic', coins: 500, emoji: '🐉', checkType: 'sales_amount', threshold: 80000, difficulty: 'legendary' },
    { id: 'twenty_sales', task: '20 sölur', reward: 'Absolute Unit', coins: 400, emoji: '🦍', checkType: 'sales_count', threshold: 20, difficulty: 'legendary' },
    { id: 'ten_new', task: '10 nýir viðskiptavinir', reward: 'Empire Builder', coins: 350, emoji: '🏰', checkType: 'new_sales_count', threshold: 10, difficulty: 'legendary' },
    { id: 'eight_upgrades', task: '8 hækkanir', reward: 'Upgrade Emperor', coins: 300, emoji: '👑', checkType: 'upgrade_count', threshold: 8, difficulty: 'legendary' },
];

/**
 * Current progress stats for filtering bounties
 */
export interface BountyStats {
    salesAmount: number;
    salesCount: number;
    newSalesCount: number;
    upgradesCount: number;
    maxSingleSale: number;
    hourlyRate: number;
}

/**
 * Check if a bounty would already be completed with current stats
 */
function isBountyAlreadyCompleted(bounty: Bounty, stats: BountyStats): boolean {
    switch (bounty.checkType) {
        case 'sales_amount':
            return stats.salesAmount >= bounty.threshold;
        case 'sales_count':
            return stats.salesCount >= bounty.threshold;
        case 'new_sales_count':
            return stats.newSalesCount >= bounty.threshold;
        case 'upgrade_count':
            return stats.upgradesCount >= bounty.threshold;
        case 'single_sale':
            return stats.maxSingleSale >= bounty.threshold;
        case 'hourly_rate':
            return stats.hourlyRate >= bounty.threshold;
        default:
            // time_based and streak are harder to pre-check, allow them
            return false;
    }
}

/**
 * Get random bounties for the day based on difficulty distribution
 * Filters out bounties that would already be completed
 * Returns 3 bounties: 1 easy, 1 medium, 1 hard/legendary
 */
export function getDailyBounties(count: number = 3, stats?: BountyStats): Bounty[] {
    // Filter out already-completed bounties if stats provided
    const availablePool = stats
        ? BOUNTY_POOL.filter(b => !isBountyAlreadyCompleted(b, stats))
        : BOUNTY_POOL;

    const easy = availablePool.filter(b => b.difficulty === 'easy');
    const medium = availablePool.filter(b => b.difficulty === 'medium');
    const hard = availablePool.filter(b => b.difficulty === 'hard' || b.difficulty === 'legendary');

    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const selected: Bounty[] = [];

    // Pick 1 easy, 1 medium, 1 hard (or adjust based on count)
    // Fall back to any difficulty if a tier is empty
    if (count >= 1 && easy.length > 0) selected.push(shuffle(easy)[0]);
    if (count >= 2 && medium.length > 0) selected.push(shuffle(medium)[0]);
    if (count >= 3 && hard.length > 0) selected.push(shuffle(hard)[0]);

    // If we don't have enough, fill from any available
    while (selected.length < count && availablePool.length > selected.length) {
        const remaining = shuffle(availablePool)
            .filter(b => !selected.some(s => s.id === b.id));
        if (remaining.length > 0) {
            selected.push(remaining[0]);
        } else {
            break;
        }
    }

    return selected;
}

/**
 * Get a replacement bounty (different from current ones, not already completed)
 */
export function getReplacementBounty(currentIds: string[], preferredDifficulty?: string, stats?: BountyStats): Bounty {
    // Filter out current bounties and already-completed ones
    let pool = BOUNTY_POOL.filter(b => !currentIds.includes(b.id));

    if (stats) {
        pool = pool.filter(b => !isBountyAlreadyCompleted(b, stats));
    }

    if (preferredDifficulty) {
        const filtered = pool.filter(b => b.difficulty === preferredDifficulty);
        if (filtered.length > 0) pool = filtered;
    }

    // If all bounties are completed, return any random one
    if (pool.length === 0) {
        pool = BOUNTY_POOL.filter(b => !currentIds.includes(b.id));
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Context for intelligent bounty selection
 */
export interface BountyContext {
    saleType: 'new' | 'upgrade';      // Current sale type selection
    currentHour: number;               // 0-23
    stats: BountyStats;                // Current progress stats
    excludeIds: string[];              // IDs of current bounties to exclude
}

/**
 * Time-based bounty IDs that should be filtered based on current hour
 */
const TIME_SENSITIVE_BOUNTIES: { id: string; maxHour: number }[] = [
    { id: 'lunch_rush', maxHour: 13 },      // Sala á hádegivakt - not after 1pm
    { id: 'morning_start', maxHour: 12 },   // Sala fyrir hádegi - not after noon
    { id: 'quick_start', maxHour: 12 },     // Fyrstu 30 mín - not after noon
    { id: 'afternoon_push', maxHour: 17 },  // Eftir 15:00 - not after 5pm
    { id: 'evening_warrior', maxHour: 20 }, // Eftir 17:00 - not after 8pm
];

/**
 * Get context-aware bounties that prioritize based on current work context
 * - Prioritizes upgrade bounties when in upgrade mode
 * - Filters out time-inappropriate bounties (e.g., no lunch rush at 2pm)
 * - Always returns requested count (falls back to any available bounties)
 */
export function getContextAwareBounties(count: number, context: BountyContext): Bounty[] {
    const { saleType, currentHour, stats, excludeIds } = context;

    // Start with full pool, exclude current bounties
    let pool = BOUNTY_POOL.filter(b => !excludeIds.includes(b.id));

    // Filter out already-completed bounties
    pool = pool.filter(b => !isBountyAlreadyCompleted(b, stats));

    // Filter out time-inappropriate bounties
    pool = pool.filter(b => {
        const timeRule = TIME_SENSITIVE_BOUNTIES.find(t => t.id === b.id);
        if (timeRule && currentHour >= timeRule.maxHour) {
            return false; // Exclude this bounty - too late in the day
        }
        return true;
    });

    // Fallback if pool is too small
    if (pool.length < count) {
        // Add back non-excluded bounties that aren't already in pool
        const additionalPool = BOUNTY_POOL.filter(b =>
            !excludeIds.includes(b.id) && !pool.some(p => p.id === b.id)
        );
        pool = [...pool, ...additionalPool];
    }

    // Final fallback: if still not enough, use entire pool minus excludes
    if (pool.length < count) {
        pool = BOUNTY_POOL.filter(b => !excludeIds.includes(b.id));
    }

    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    // Prioritize based on sale type
    const priorityCheckType = saleType === 'upgrade' ? 'upgrade_count' : 'new_sales_count';
    const priorityBounties = pool.filter(b => b.checkType === priorityCheckType);
    const otherBounties = pool.filter(b => b.checkType !== priorityCheckType);

    const selected: Bounty[] = [];

    // Pick from priority bounties first (up to half)
    const priorityCount = Math.min(Math.ceil(count / 2), priorityBounties.length);
    const shuffledPriority = shuffle(priorityBounties);
    for (let i = 0; i < priorityCount; i++) {
        selected.push(shuffledPriority[i]);
    }

    // Fill remaining from other bounties
    const remaining = count - selected.length;
    const shuffledOther = shuffle(otherBounties);
    for (let i = 0; i < remaining && i < shuffledOther.length; i++) {
        selected.push(shuffledOther[i]);
    }

    // If still not enough (edge case), fill from entire shuffled pool
    if (selected.length < count) {
        const allShuffled = shuffle(pool).filter(b => !selected.some(s => s.id === b.id));
        for (let i = 0; selected.length < count && i < allShuffled.length; i++) {
            selected.push(allShuffled[i]);
        }
    }

    return selected;
}

/**
 * Difficulty colors for UI
 */
export const DIFFICULTY_COLORS = {
    easy: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
    medium: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
    hard: { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400' },
    legendary: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-400' },
};
