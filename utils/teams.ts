import { Team, TeamName } from '../types';

export const TEAMS: Record<TeamName, Team> = {
    'Hringurinn': {
        id: 'hringurinn',
        name: 'Hringurinn',
        color: '#3B82F6', // Blue
        icon: '🔵',
        members: [],
        totalSales: 0,
        wins: 0,
        badges: [],
        seasonPoints: 0
    },
    'Verið': {
        id: 'verid',
        name: 'Verið',
        color: '#10B981', // Green
        icon: '🟢',
        members: [],
        totalSales: 0,
        wins: 0,
        badges: [],
        seasonPoints: 0
    },
    'Götuteymið': {
        id: 'gotuteymid',
        name: 'Götuteymið',
        color: '#F59E0B', // Amber
        icon: '🟡',
        members: [],
        totalSales: 0,
        wins: 0,
        badges: [],
        seasonPoints: 0
    }
};

export function getTeamByName(name: TeamName): Team {
    return TEAMS[name];
}

export function getTeamColor(name: TeamName): string {
    return TEAMS[name].color;
}

export function getTeamIcon(name: TeamName): string {
    return TEAMS[name].icon;
}
