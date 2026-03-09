import { BattleModifier } from '../types';

export const BATTLE_MODIFIERS: BattleModifier[] = [
    {
        id: 'sunny_day',
        name: 'Sólríkur Dagur',
        description: '+10% sölumarkmið',
        effect: 'weather',
        multiplier: 1.1,
        icon: '☀️'
    },
    {
        id: 'rainy_day',
        name: 'Rigningardagur',
        description: '-5% sölumarkmið',
        effect: 'weather',
        multiplier: 0.95,
        icon: '🌧️'
    },
    {
        id: 'evening_rush',
        name: 'Kvöldrás',
        description: 'Tvöföld völ á kvöldin (18:00-22:00)',
        effect: 'time_bonus',
        timeWindows: [{ start: 18, end: 22, multiplier: 2.0 }],
        icon: '🌙'
    },
    {
        id: 'morning_boost',
        name: 'Morgunbyrkja',
        description: '1.5x völ á morgnana (08:00-12:00)',
        effect: 'time_bonus',
        timeWindows: [{ start: 8, end: 12, multiplier: 1.5 }],
        icon: '🌅'
    },
    {
        id: 'project_focus_samhjalp',
        name: 'Samhjálp Focus',
        description: 'Aðeins Samhjálp völ telja',
        effect: 'project_specific',
        allowedProjects: ['Samhjálp'],
        icon: '🎯'
    },
    {
        id: 'project_focus_throskahjal',
        name: 'Þroskahjálp Focus',
        description: 'Aðeins Þroskahjálp völ telja',
        effect: 'project_specific',
        allowedProjects: ['Þroskahjálp'],
        icon: '🎯'
    }
];

export function getRandomModifier(): BattleModifier {
    return BATTLE_MODIFIERS[Math.floor(Math.random() * BATTLE_MODIFIERS.length)];
}

export function applyModifier(sales: number, modifier: BattleModifier, saleTime?: Date, project?: string): number {
    if (modifier.effect === 'weather' && modifier.multiplier) {
        return sales * modifier.multiplier;
    }

    if (modifier.effect === 'time_bonus' && saleTime && modifier.timeWindows) {
        const hour = saleTime.getHours();
        for (const window of modifier.timeWindows) {
            if (hour >= window.start && hour < window.end) {
                return sales * window.multiplier;
            }
        }
    }

    if (modifier.effect === 'project_specific' && project && modifier.allowedProjects) {
        return modifier.allowedProjects.includes(project) ? sales : 0;
    }

    return sales;
}
