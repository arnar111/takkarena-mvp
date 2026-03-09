// Utility functions for persistent state across tab navigation
export const saveToLocalStorage = (key: string, value: any) => {
    try {
        localStorage.setItem(`wagetrack_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
};

export const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
    try {
        const item = localStorage.getItem(`wagetrack_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return defaultValue;
    }
};

export const removeFromLocalStorage = (key: string) => {
    try {
        localStorage.removeItem(`wagetrack_${key}`);
    } catch (e) {
        console.error('Failed to remove from localStorage:', e);
    }
};
