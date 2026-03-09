// Boss Battle Configuration & Constants

// =============================================================================
// BOSS TIERS - Escalating difficulty with better rewards
// =============================================================================
export const BOSS_TIERS = {
    bronze: {
        id: 'bronze',
        name: 'Brons',
        emoji: '🥉',
        color: 'amber',
        targetMultiplier: 1.0, // Base target
        rewardMultiplier: 1.0,
        unlockRequirement: null, // Always available
        description: 'Byrjendaboss - góður til að prófa',
    },
    silver: {
        id: 'silver',
        name: 'Silfur',
        emoji: '🥈',
        color: 'slate',
        targetMultiplier: 1.5,
        rewardMultiplier: 1.75,
        unlockRequirement: 'bronze', // Must defeat bronze first
        description: 'Meðalerfið boss - fyrir reynda liða',
    },
    gold: {
        id: 'gold',
        name: 'Gull',
        emoji: '🥇',
        color: 'yellow',
        targetMultiplier: 2.0,
        rewardMultiplier: 2.5,
        unlockRequirement: 'silver',
        description: 'Erfitt boss - þarf samvinnu',
    },
    diamond: {
        id: 'diamond',
        name: 'Demantur',
        emoji: '💎',
        color: 'cyan',
        targetMultiplier: 3.0,
        rewardMultiplier: 4.0,
        unlockRequirement: 'gold',
        description: 'Æðsta áskorunin - aðeins fyrir bestu',
    },
} as const;

export type BossTier = keyof typeof BOSS_TIERS;

// =============================================================================
// BATTLE TYPES - Different ways to defeat the boss
// =============================================================================
export const BATTLE_TYPES = {
    target: {
        id: 'target',
        name: 'Sölumarkmið',
        emoji: '🎯',
        description: 'Náið ákveðinni heildarupphæð',
        metric: 'totalSales',
        baseTarget: 100000, // 100k kr base
    },
    sales_count: {
        id: 'sales_count',
        name: 'Fjöldi salna',
        emoji: '📊',
        description: 'Náið ákveðnum fjölda salna',
        metric: 'salesCount',
        baseTarget: 50, // 50 sales base
    },
    highest_sale: {
        id: 'highest_sale',
        name: 'Hæsta sala',
        emoji: '🚀',
        description: 'Einhver í liðinu nær ákveðinni sölu',
        metric: 'highestSingleSale',
        baseTarget: 25000, // 25k single sale
    },
} as const;

export type BattleType = keyof typeof BATTLE_TYPES;

// =============================================================================
// SALESMAN ROLES - Witty team roles
// =============================================================================
export const SALESMAN_ROLES = {
    closer: {
        id: 'closer',
        name: 'Lokarinn',
        emoji: '🎯',
        description: 'Háar einingar - gerir stóru sölurnar',
        bonus: 'Sölur yfir 15.000 kr gefa 1.5x skaða',
        stat: 'avgSaleAmount',
    },
    machine_gun: {
        id: 'machine_gun',
        name: 'Vélbyssan',
        emoji: '⚡',
        description: 'Mikill fjöldi - skýtur hratt',
        bonus: '3+ sölur á klst = 1.25x skaða',
        stat: 'salesPerHour',
    },
    motivator: {
        id: 'motivator',
        name: 'Hvatinn',
        emoji: '📣',
        description: 'Heldur liðinu gangandi',
        bonus: 'Nudges til liðsfélaga auka þeirra næstu sölu',
        stat: 'nudgesSent',
    },
    anchor: {
        id: 'anchor',
        name: 'Akkerið',
        emoji: '⚓',
        description: 'Stöðugur og áreiðanlegur',
        bonus: 'Fyrsta salan hverja klst gefur 2x',
        stat: 'consistency',
    },
} as const;

export type SalesmanRole = keyof typeof SALESMAN_ROLES;

// =============================================================================
// BOSS ABILITIES - Random events during battle
// =============================================================================
export const BOSS_ABILITIES = {
    shield: {
        id: 'shield',
        name: 'Skjöldur',
        emoji: '🛡️',
        description: 'Næstu 2 sölur telja aðeins 50%',
        duration: null, // Lasts for 2 sales
        effect: { type: 'damage_reduction', value: 0.5, count: 2 },
    },
    enrage: {
        id: 'enrage',
        name: 'Reiði',
        emoji: '😤',
        description: 'Markmið hækkar um 5%',
        duration: null, // Permanent
        effect: { type: 'target_increase', value: 0.05 },
    },
    weak_point: {
        id: 'weak_point',
        name: 'Veikur punktur',
        emoji: '💥',
        description: 'Næsta sala telur 3x!',
        duration: null, // Next sale only
        effect: { type: 'damage_multiplier', value: 3, count: 1 },
    },
    heal: {
        id: 'heal',
        name: 'Lækning',
        emoji: '💚',
        description: 'Bossinn læknar sig um 10%',
        duration: null,
        effect: { type: 'heal', value: 0.10 },
    },
    freeze: {
        id: 'freeze',
        name: 'Frystir',
        emoji: '❄️',
        description: 'Enginn skaði í 5 mínútur',
        duration: 5 * 60 * 1000, // 5 minutes
        effect: { type: 'freeze', value: 1 },
    },
} as const;

export type BossAbility = keyof typeof BOSS_ABILITIES;

// =============================================================================
// POWER-UPS - Team bonuses during battle
// =============================================================================
export const TEAM_POWERUPS = {
    combo_streak: {
        id: 'combo_streak',
        name: 'Combo Streak',
        emoji: '🔥',
        description: '3 sölur í röð = 1.5x skaði næstu 5 mín',
        trigger: { type: 'consecutive_sales', threshold: 3 },
        effect: { multiplier: 1.5, duration: 5 * 60 * 1000 },
    },
    rage_mode: {
        id: 'rage_mode',
        name: 'Rage Mode',
        emoji: '⚡',
        description: 'Síðustu 15 mín = 2x skaði',
        trigger: { type: 'time_remaining', threshold: 15 * 60 * 1000 },
        effect: { multiplier: 2.0 },
    },
    momentum: {
        id: 'momentum',
        name: 'Skriðþunga',
        emoji: '🚀',
        description: '5+ sölur á síðustu 30 mín = 1.25x',
        trigger: { type: 'sales_in_window', threshold: 5, window: 30 * 60 * 1000 },
        effect: { multiplier: 1.25 },
    },
} as const;

// Boss "heals" if no sales for 30 minutes
export const BOSS_HEALING = {
    inactivityThreshold: 30 * 60 * 1000, // 30 minutes
    healPercent: 0.05, // 5% heal
};

// =============================================================================
// LOOT & REWARDS
// =============================================================================
export const LOOT_TIERS = {
    defeat: {
        id: 'defeat',
        name: 'Sigur',
        emoji: '✅',
        condition: 'Sigra bossinn',
        coinMultiplier: 1.0,
    },
    speed_kill: {
        id: 'speed_kill',
        name: 'Hraðsigur',
        emoji: '⏱️',
        condition: 'Sigra með <50% af tíma ónýttum',
        coinMultiplier: 1.25,
        badge: 'speed_demon',
    },
    overkill: {
        id: 'overkill',
        name: 'Overkill',
        emoji: '💀',
        condition: 'Ná 200%+ af markmiði',
        coinMultiplier: 1.5,
        badge: 'overkiller',
    },
    flawless: {
        id: 'flawless',
        name: 'Flawless',
        emoji: '✨',
        condition: 'Allir tóku þátt með 1+ sölu',
        coinMultiplier: 1.3,
        badge: 'team_player',
    },
    underdog: {
        id: 'underdog',
        name: 'Underdog',
        emoji: '🐕',
        condition: 'Sigra með <30 sek eftir',
        coinMultiplier: 2.0,
        badge: 'clutch_master',
    },
} as const;

// Base coin rewards per tier
export const BASE_REWARDS = {
    bronze: 50,
    silver: 100,
    gold: 175,
    diamond: 300,
} as const;

// =============================================================================
// TEAMS
// =============================================================================
export const TEAMS = {
    hringurinn: {
        id: 'hringurinn',
        name: 'Hringurinn',
        emoji: '📞',
    },
    verid: {
        id: 'verid',
        name: 'Verið',
        emoji: '🏪',
    },
    gotuteymi: {
        id: 'gotuteymi',
        name: 'Götuteymi',
        emoji: '🚶',
    },
} as const;

export type TeamId = keyof typeof TEAMS;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Calculate actual target based on tier and battle type
export const calculateBossTarget = (
    battleType: BattleType,
    tier: BossTier
): number => {
    const type = BATTLE_TYPES[battleType];
    const tierConfig = BOSS_TIERS[tier];
    return Math.round(type.baseTarget * tierConfig.targetMultiplier);
};

// Calculate coin reward
export const calculateReward = (
    tier: BossTier,
    lootTiers: string[]
): number => {
    let base = BASE_REWARDS[tier];
    let multiplier = 1.0;

    lootTiers.forEach(lootId => {
        const loot = LOOT_TIERS[lootId as keyof typeof LOOT_TIERS];
        if (loot) {
            multiplier *= loot.coinMultiplier;
        }
    });

    return Math.round(base * multiplier);
};

// Get random boss ability
export const getRandomBossAbility = (): BossAbility => {
    const abilities = Object.keys(BOSS_ABILITIES) as BossAbility[];
    return abilities[Math.floor(Math.random() * abilities.length)];
};

// Check if tier is unlocked
export const isTierUnlocked = (
    tier: BossTier,
    defeatedTiers: BossTier[]
): boolean => {
    const config = BOSS_TIERS[tier];
    if (!config.unlockRequirement) return true;
    return defeatedTiers.includes(config.unlockRequirement as BossTier);
};
