import { useState, useEffect, useCallback } from 'react';
import { addShift } from '../services/shiftService';

interface UseShiftClockReturn {
    isShiftActive: boolean;
    clockInTime: Date | null;
    handleClockIn: (goal?: number, onGoalSet?: (goal: number) => void) => void;
    handleClockOut: (shiftData: any, userId: string) => Promise<void>;
}

const STORAGE_KEY = 'takk_shift_start';

/**
 * Hook for managing shift clock in/out state
 * Persists shift state to localStorage for page refreshes
 */
export const useShiftClock = (): UseShiftClockReturn => {
    const [clockInTime, setClockInTime] = useState<Date | null>(null);
    const [isShiftActive, setIsShiftActive] = useState(false);

    // Restore shift state from localStorage on mount
    useEffect(() => {
        const storedStart = localStorage.getItem(STORAGE_KEY);
        if (storedStart) {
            setClockInTime(new Date(storedStart));
            setIsShiftActive(true);
        }
    }, []);

    const handleClockIn = useCallback((goal?: number, onGoalSet?: (goal: number) => void) => {
        const start = new Date();
        setClockInTime(start);
        setIsShiftActive(true);
        localStorage.setItem(STORAGE_KEY, start.toISOString());

        if (goal && onGoalSet) {
            onGoalSet(goal);
        }
    }, []);

    const handleClockOut = useCallback(async (shiftData: any, userId: string): Promise<void> => {
        await addShift({ ...shiftData, userId });
        setClockInTime(null);
        setIsShiftActive(false);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        isShiftActive,
        clockInTime,
        handleClockIn,
        handleClockOut
    };
};

export default useShiftClock;
