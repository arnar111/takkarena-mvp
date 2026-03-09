import { useState, useEffect, useMemo } from 'react';
import { Shift, Sale } from '../types';
import { subscribeSales, subscribeAllSales, addSale, updateSale, deleteSale } from '../services/salesService';
import { subscribeShifts, addShift, deleteShift } from '../services/shiftService';
import { subscribeUsers } from '../services/userService';
import { User } from '../types';

interface UseSalesDataReturn {
    sales: Sale[];
    allSales: Sale[];
    shifts: Shift[];
    allUsers: User[];
    addSale: (sale: Omit<Sale, 'id'>) => Promise<string>;
    updateSale: (id: string, data: Partial<Sale>) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    addShift: (shift: Omit<Shift, 'id'>) => Promise<string>;
    deleteShift: (id: string) => Promise<void>;
    periodData: {
        filteredShifts: Shift[];
        filteredSales: Sale[];
    };
}

/**
 * Hook for managing sales, shifts, and users data subscriptions
 * Includes performance optimizations with date filtering
 */
export const useSalesData = (userId: string | undefined): UseSalesDataReturn => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Subscribe to user's sales
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeSales(userId, setSales);
        return () => unsubscribe();
    }, [userId]);

    // Subscribe to all sales (with 30-day limit for performance)
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeAllSales(setAllSales);
        return () => unsubscribe();
    }, [userId]);

    // Subscribe to user's shifts
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeShifts(userId, setShifts);
        return () => unsubscribe();
    }, [userId]);

    // Subscribe to all users
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeUsers(setAllUsers);
        return () => unsubscribe();
    }, [userId]);

    // Calculate period data (26th to 25th billing cycle)
    const periodData = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDate();
        let start = new Date(now);
        let end = new Date(now);

        if (currentDay >= 26) {
            start.setDate(26);
            end.setMonth(end.getMonth() + 1);
            end.setDate(25);
        } else {
            start.setMonth(start.getMonth() - 1);
            start.setDate(26);
            end.setDate(25);
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const filterByDate = (item: any) => {
            const itemDate = new Date(item.date || item.timestamp);
            return itemDate >= start && itemDate <= end;
        };

        return {
            filteredShifts: shifts.filter(filterByDate),
            filteredSales: sales.filter(filterByDate)
        };
    }, [shifts, sales]);

    return {
        sales,
        allSales,
        shifts,
        allUsers,
        addSale,
        updateSale,
        deleteSale: deleteSale,
        addShift,
        deleteShift,
        periodData
    };
};

export default useSalesData;
