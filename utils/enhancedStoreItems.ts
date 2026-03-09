import { StoreItem } from '../types';

// Enhanced Store Items with Categories
export const ENHANCED_STORE_ITEMS: StoreItem[] = [
    // COSMETICS - Avatar Frames
    {
        id: 'frame_bronze',
        title: 'Bronze Rammi',
        description: 'Bronze umgjörð fyrir avatar þinn',
        price: 100,
        icon: '🥉',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Common',
        effect: 'avatar_frame_bronze'
    },
    {
        id: 'frame_silver',
        title: 'Silver Rammi',
        description: 'Silver umgjörð fyrir avatar þinn',
        price: 250,
        icon: '🥈',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Rare',
        effect: 'avatar_frame_silver'
    },
    {
        id: 'frame_gold',
        title: 'Gull Rammi',
        description: 'Gull umgjörð fyrir avatar þinn',
        price: 500,
        icon: '🥇',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Epic',
        effect: 'avatar_frame_gold'
    },
    {
        id: 'frame_diamond',
        title: 'Demanta Rammi',
        description: 'Demanta umgjörð fyrir avatar þinn',
        price: 1000,
        icon: '💎',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Legendary',
        effect: 'avatar_frame_diamond'
    },

    // COSMETICS - Name Effects
    {
        id: 'name_glow',
        title: 'Nafn Glóð',
        description: 'Nafnið þitt glóir',
        price: 200,
        icon: '✨',
        type: 'cosmetic',
        category: 'effect',
        rarity: 'Rare',
        effect: 'name_effect_glow'
    },
    {
        id: 'name_rainbow',
        title: 'Regnboga Nafn',
        description: 'Regnboga litir á nafni',
        price: 400,
        icon: '🌈',
        type: 'cosmetic',
        category: 'effect',
        rarity: 'Epic',
        effect: 'name_effect_rainbow'
    },
    {
        id: 'name_fire',
        title: 'Eldur Nafn',
        description: 'Eldur áhrif á nafni',
        price: 600,
        icon: '🔥',
        type: 'cosmetic',
        category: 'effect',
        rarity: 'Epic',
        effect: 'name_effect_fire'
    },

    // COSMETICS - Victory Animations
    {
        id: 'victory_confetti',
        title: 'Konfetti Sigur',
        description: 'Konfetti ský þegar þú vinnur',
        price: 150,
        icon: '🎊',
        type: 'cosmetic',
        category: 'animation',
        rarity: 'Common',
        effect: 'victory_animation_confetti'
    },
    {
        id: 'victory_fireworks',
        title: 'Flugeldar Sigur',
        description: 'Flugeldar þegar þú vinnur',
        price: 350,
        icon: '🎆',
        type: 'cosmetic',
        category: 'animation',
        rarity: 'Rare',
        effect: 'victory_animation_fireworks'
    },
    {
        id: 'victory_champion',
        title: 'Meistari Sigur',
        description: 'Trófe og gylltur blær',
        price: 750,
        icon: '🏆',
        type: 'cosmetic',
        category: 'animation',
        rarity: 'Legendary',
        effect: 'victory_animation_champion'
    },

    // COSMETICS - Arena Themes
    {
        id: 'theme_ocean',
        title: 'Haf Þema',
        description: 'Hafið bakgrunnur fyrir bardaga',
        price: 300,
        icon: '🌊',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Rare',
        effect: 'arena_theme_ocean'
    },
    {
        id: 'theme_forest',
        title: 'Skóg Þema',
        description: 'Skógur bakgrunnur fyrir bardaga',
        price: 300,
        icon: '🌲',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Rare',
        effect: 'arena_theme_forest'
    },
    {
        id: 'theme_space',
        title: 'Geimur Þema',
        description: 'Geimur bakgrunnur fyrir bardaga',
        price: 500,
        icon: '🌌',
        type: 'cosmetic',
        category: 'avatar',
        rarity: 'Epic',
        effect: 'arena_theme_space'
    },

    // POWER-UPS (Original items)
    {
        id: 'coffee',
        title: 'Kaffipása',
        description: 'Segir MorriAI að þegja í 5 mín.',
        price: 50,
        icon: '☕',
        type: 'power_up',
        category: 'effect',
        rarity: 'Common',
        effect: 'silence'
    },
    {
        id: 'wheel',
        title: 'Lukkuhjólið',
        description: 'Snýr lukkuhjóli fyrir auka tækifæri á vinning.',
        price: 100,
        icon: '🎰',
        type: 'power_up',
        category: 'effect',
        rarity: 'Rare',
        effect: 'gamble'
    },
    {
        id: 'boss_call',
        title: 'Símtal frá Bjarna',
        description: 'Fáðu símtal frá "forstjóranum" með hrósi.',
        price: 500,
        icon: '📞',
        type: 'power_up',
        category: 'effect',
        rarity: 'Epic',
        effect: 'notification'
    },
    {
        id: 'vacation',
        title: 'Draumur um Tene',
        description: 'Breytir bakgrunni í sólarströnd í smá stund.',
        price: 1000,
        icon: '🏖️',
        type: 'power_up',
        category: 'effect',
        rarity: 'Epic',
        effect: 'theme_beach'
    },
    {
        id: 'ceo',
        title: 'Forstjórinn',
        description: 'MorriAI talar við þig eins og þú sért eigandinn.',
        price: 1000,
        icon: '👑',
        type: 'power_up',
        category: 'effect',
        rarity: 'Epic',
        effect: 'theme'
    },
    {
        id: 'gold_name',
        title: 'Gullna Nafnið',
        description: 'Nafnið þitt verður gullitað á listanum.',
        price: 5000,
        icon: '✨',
        type: 'cosmetic',
        category: 'effect',
        rarity: 'Legendary',
        effect: 'badge'
    }
];

export function getItemsByCategory(category: string): StoreItem[] {
    return ENHANCED_STORE_ITEMS.filter(item => item.category === category);
}

export function getItemsByType(type: string): StoreItem[] {
    return ENHANCED_STORE_ITEMS.filter(item => item.type === type);
}

export function getItemsByRarity(rarity: string): StoreItem[] {
    return ENHANCED_STORE_ITEMS.filter(item => item.rarity === rarity);
}
