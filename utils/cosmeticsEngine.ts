import { User } from '../types';

/**
 * Cosmetics Engine - Apply visual effects to user display
 */

export function getAvatarFrameStyle(frameEffect?: string): string {
    switch (frameEffect) {
        case 'avatar_frame_bronze':
            return 'ring-4 ring-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.5)]';
        case 'avatar_frame_silver':
            return 'ring-4 ring-[#C0C0C0] shadow-[0_0_20px_rgba(192,192,192,0.6)]';
        case 'avatar_frame_gold':
            return 'ring-4 ring-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.7)]';
        case 'avatar_frame_diamond':
            return 'ring-4 ring-[#B9F2FF] shadow-[0_0_30px_rgba(185,242,255,0.8)] animate-pulse';
        default:
            return '';
    }
}

export function getNameEffectStyle(nameEffect?: string): string {
    switch (nameEffect) {
        case 'name_effect_glow':
            return 'text-shadow-[0_0_10px_currentColor] animate-pulse';
        case 'name_effect_rainbow':
            return 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient';
        case 'name_effect_fire':
            return 'text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(255,165,0,0.8)]';
        case 'badge': // Gold name
            return 'text-amber-400 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]';
        default:
            return '';
    }
}

export function getVictoryAnimation(victoryEffect?: string): {
    component: string;
    duration: number;
} {
    switch (victoryEffect) {
        case 'victory_animation_confetti':
            return { component: 'confetti', duration: 3000 };
        case 'victory_animation_fireworks':
            return { component: 'fireworks', duration: 5000 };
        case 'victory_animation_champion':
            return { component: 'champion', duration: 7000 };
        default:
            return { component: 'none', duration: 0 };
    }
}

export function getArenaThemeStyle(arenaTheme?: string): string {
    switch (arenaTheme) {
        case 'arena_theme_ocean':
            return 'bg-gradient-to-b from-blue-900 to-cyan-900';
        case 'arena_theme_forest':
            return 'bg-gradient-to-b from-green-900 to-emerald-900';
        case 'arena_theme_space':
            return 'bg-gradient-to-b from-indigo-950 to-purple-950';
        case 'theme_beach':
            return 'bg-gradient-to-b from-sky-400 to-amber-300';
        default:
            return '';
    }
}

/**
 * Apply all cosmetics to a user element
 */
export function applyCosmetics(user: User): {
    avatarClass: string;
    nameClass: string;
    victoryAnimation: { component: string; duration: number };
    arenaClass: string;
} {
    const cosmetics = user.equippedCosmetics || {};

    return {
        avatarClass: getAvatarFrameStyle(cosmetics.avatarFrame),
        nameClass: getNameEffectStyle(cosmetics.nameEffect),
        victoryAnimation: getVictoryAnimation(cosmetics.victoryAnimation),
        arenaClass: getArenaThemeStyle(cosmetics.arenaTheme)
    };
}

/**
 * Equip a cosmetic item to user
 */
export function equipCosmetic(
    user: User,
    cosmetic: { effect: string; category: string }
): User {
    const updatedCosmetics = { ...user.equippedCosmetics };

    // Determine which slot based on effect prefix
    if (cosmetic.effect.startsWith('avatar_frame_')) {
        updatedCosmetics.avatarFrame = cosmetic.effect;
    } else if (cosmetic.effect.startsWith('name_effect_') || cosmetic.effect === 'badge') {
        updatedCosmetics.nameEffect = cosmetic.effect;
    } else if (cosmetic.effect.startsWith('victory_animation_')) {
        updatedCosmetics.victoryAnimation = cosmetic.effect;
    } else if (cosmetic.effect.startsWith('arena_theme_') || cosmetic.effect === 'theme_beach') {
        updatedCosmetics.arenaTheme = cosmetic.effect;
    }

    return {
        ...user,
        equippedCosmetics: updatedCosmetics
    };
}

/**
 * Unequip a cosmetic slot
 */
export function unequipCosmetic(
    user: User,
    slot: 'avatarFrame' | 'nameEffect' | 'victoryAnimation' | 'arenaTheme'
): User {
    const updatedCosmetics = { ...user.equippedCosmetics };
    delete updatedCosmetics[slot];

    return {
        ...user,
        equippedCosmetics: updatedCosmetics
    };
}
