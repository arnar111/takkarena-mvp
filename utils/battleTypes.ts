import { BattleType } from '../types';

export const BATTLE_TYPES: Record<BattleType, { duration: number; name: string; description: string; icon: string }> = {
    quick: {
        duration: 2,
        name: 'Hraður',
        description: '2 klst hraðskreiður bardagi',
        icon: '⚡'
    },
    standard: {
        duration: 4,
        name: 'Venjulegur',
        description: '4 klst venjulegur bardagi',
        icon: '⚔️'
    },
    marathon: {
        duration: 8,
        name: 'Maraþon',
        description: '8 klst langur bardagi',
        icon: '🏃'
    },
    team: {
        duration: 4,
        name: 'Teymis',
        description: 'Teymis bardagi',
        icon: '👥'
    },
    boss: {
        duration: 24,
        name: 'Boss',
        description: '24 klst boss bardagi',
        icon: '👑'
    }
};

export function getBattleDuration(type: BattleType): number {
    return BATTLE_TYPES[type].duration;
}
