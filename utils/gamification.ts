import { Level } from '../types';

export const LEVELS: Level[] = [
    { id: 1, min: 0, max: 10000, title: "Upphitun", color: "bg-slate-500" },
    { id: 2, min: 10000, max: 20000, title: "Meðbyr", color: "bg-indigo-500" },
    { id: 3, min: 20000, max: 30000, title: "Á Eldi", color: "bg-amber-500" },
    { id: 4, min: 30000, max: 50000, title: "Goðsögn", color: "bg-emerald-500" },
    { id: 5, min: 50000, max: 999999, title: "Óstöðvandi", color: "bg-rose-500" },
];

export const getCurrentLevel = (amount: number): Level => {
    return LEVELS.find(l => amount >= l.min && amount < l.max) || LEVELS[LEVELS.length - 1];
};

export const getNextLevel = (currentId: number): Level | undefined => {
    return LEVELS.find(l => l.id === currentId + 1);
};
