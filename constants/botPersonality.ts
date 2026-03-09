// Bot opponent personality and configuration
export const BOT_CONFIG = {
    id: 'gudjon-puki',
    name: 'Guðjón Púki',
    avatar: 'GP',
    avatarUrl: '/images/gudjon-puki.png',
};

export const DIFFICULTY_LEVELS = {
    easy: {
        id: 'easy',
        name: 'Nýliði',
        emoji: '🟢',
        description: 'Góður fyrir byrjendur',
        multiplier: 0.7, // 70% of user's avg
        varianceMin: -0.15,
        varianceMax: 0.10,
        tauntThreshold: 0.15, // 15% ahead/behind to taunt
    },
    medium: {
        id: 'medium',
        name: 'Keppinautur',
        emoji: '🟡',
        description: 'Sanngjörn áskorun',
        multiplier: 1.0, // 100% of user's avg
        varianceMin: -0.10,
        varianceMax: 0.15,
        tauntThreshold: 0.20, // 20% ahead/behind
    },
    hard: {
        id: 'hard',
        name: 'Meistari',
        emoji: '🔴',
        description: 'Fyrir reynda keppinauta',
        multiplier: 1.35, // 135% of user's avg
        varianceMin: -0.05,
        varianceMax: 0.20,
        tauntThreshold: 0.22, // 22% ahead/behind
    },
    nightmare: {
        id: 'nightmare',
        name: 'Púkinn sjálfur',
        emoji: '💀',
        description: 'Aðeins fyrir bestu',
        multiplier: 1.5, // 150% of user's avg
        varianceMin: 0.0,
        varianceMax: 0.25,
        tauntThreshold: 0.25, // 25% ahead/behind
        adaptive: true, // Always tries to stay ahead
    }
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

// Taunts when bot is winning
export const WINNING_TAUNTS = [
    "Er þetta allt sem þú hefur? 😏",
    "Ég hélt þú værir betri...",
    "Þú getur ekki unnið Púkann! 💪",
    "Bara haltu áfram að reyna! 😂",
    "Ertu að sofa þarna?",
    "Ég er að njóta þessa! 🎉",
    "Þú ert að tapa, vinur...",
    "Púkinn ræður! 👑",
];

// Taunts when bot is losing
export const LOSING_TAUNTS = [
    "Vel gert... EN ekki slaka á! ⚡",
    "Ég kem aftur, bíddu bara! 🔥",
    "Þetta er ekki búið! 💪",
    "Njóttu meðan þú getur...",
    "Púkinn gefst aldrei upp!",
    "Þú hefur heppni... í bili",
    "Ég er að vakna núna! 😤",
    "Bíddu eftir endurkomu Púkans!",
];

// Pre-battle taunts
export const PRE_BATTLE_TAUNTS = [
    "Ertu tilbúinn að tapa? 😈",
    "Þú þorir að skora á Púkann?",
    "Látum þetta vera fljótlegt!",
    "Púkinn er í góðu formi í dag!",
    "Gangi þér vel... þú þarft það! 😏",
];

// Victory taunts (bot wins)
export const BOT_VICTORY_TAUNTS = [
    "Takk fyrir leikinn... næst! 😎",
    "Púkinn sigraði aftur! 🏆",
    "Ekki vera leiður, þú reyndir!",
    "Betri heppni næst! 😂",
    "Púkinn er ósigrandi!",
];

// Defeat taunts (bot loses)
export const BOT_DEFEAT_TAUNTS = [
    "Þú vannst NÚNA... en bíddu bara... 👀",
    "Púkinn kemur aftur sterkari!",
    "Vel gert... þetta skipti 🎯",
    "Njóttu sigursins meðan þú getur!",
    "Næsta skipti fer öðruvísi! 💪",
];

// Get random taunt
export const getRandomTaunt = (taunts: string[]): string => {
    return taunts[Math.floor(Math.random() * taunts.length)];
};

// Bot cosmetics (unlockable)
export const BOT_COSMETICS = {
    default: {
        id: 'default',
        name: 'Guðjón Púki',
        unlocked: true,
        requirement: null,
    },
    santa: {
        id: 'santa',
        name: 'Jóla-Púki 🎅',
        unlocked: false,
        requirement: 'Beat bot 10 times in December',
    },
    summer: {
        id: 'summer',
        name: 'Sumar-Púki 🏖️',
        unlocked: false,
        requirement: 'Beat bot on Hard in June-August',
    },
    nightmare_slayer: {
        id: 'nightmare_slayer',
        name: 'Sigurvegarinn 💀',
        unlocked: false,
        requirement: 'Beat bot on Nightmare',
    },
};

// Battle buffs for the store
export const BATTLE_BUFFS = [
    {
        id: 'head_start',
        name: 'Forskot',
        description: 'Byrjaðu með 2,000 kr forskot',
        emoji: '🚀',
        price: 50,
        effect: { type: 'head_start', value: 2000 },
    },
    {
        id: 'slow_opponent',
        name: 'Seinka andstæðingi',
        description: 'Andstæðingur byrjar 10% hægar',
        emoji: '🐢',
        price: 75,
        effect: { type: 'slow_opponent', value: 0.10 },
    },
    {
        id: 'double_first',
        name: 'Tví-fyrsta',
        description: 'Fyrsta salan þín telur tvöfalt',
        emoji: '✨',
        price: 100,
        effect: { type: 'double_first', value: 2 },
    },
    {
        id: 'comeback_shield',
        name: 'Endurkomu-skjöldur',
        description: 'Fáðu 15% aukið ef þú ert á eftir',
        emoji: '🛡️',
        price: 80,
        effect: { type: 'comeback_boost', value: 0.15 },
    },
    {
        id: 'lucky_streak',
        name: 'Heppni-röð',
        description: 'Streak bónus x1.5 í þessari keppni',
        emoji: '🍀',
        price: 120,
        effect: { type: 'streak_multiplier', value: 1.5 },
    },
    {
        id: 'time_freeze',
        name: 'Tíma-stopp',
        description: 'Andstæðingur fær engin stig í 5 mín',
        emoji: '❄️',
        price: 200,
        effect: { type: 'freeze_opponent', value: 300000 }, // 5 min in ms
    },
];
