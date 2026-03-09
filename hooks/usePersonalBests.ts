/**
 * usePersonalBests Hook
 * Tracks and alerts on personal record breaks
 * Version 4.0.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Sale, Shift } from '../types';
import { 
  PersonalBests, 
  PersonalBestBreak,
  calculatePersonalBests, 
  checkForNewRecords,
  getApproachingRecordMessage
} from '../utils/personalBests';

interface UsePersonalBestsProps {
  staffId: string | undefined;
  sales: Sale[];
  shifts: Shift[];
  currentStreak: number;
}

interface UsePersonalBestsReturn {
  personalBests: PersonalBests;
  newRecords: PersonalBestBreak[];
  approachingRecord: string | null;
  clearNewRecords: () => void;
  isLoading: boolean;
}

export function usePersonalBests({
  staffId,
  sales,
  shifts,
  currentStreak
}: UsePersonalBestsProps): UsePersonalBestsReturn {
  const [storedBests, setStoredBests] = useState<PersonalBests | null>(null);
  const [newRecords, setNewRecords] = useState<PersonalBestBreak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate current bests from sales data
  const calculatedBests = useMemo(() => 
    calculatePersonalBests(sales, shifts),
    [sales, shifts]
  );

  // Current stats for comparison
  const currentStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date === today);
    
    const weekStart = getWeekStart();
    const thisWeekSales = sales
      .filter(s => s.date >= weekStart)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const monthStart = new Date().toISOString().substring(0, 7) + '-01';
    const thisMonthSales = sales
      .filter(s => s.date >= monthStart)
      .reduce((sum, s) => sum + s.amount, 0);

    const lastSale = todaySales[todaySales.length - 1];

    return {
      todaySales: todaySales.reduce((sum, s) => sum + s.amount, 0),
      todaySaleCount: todaySales.length,
      currentStreak,
      thisWeekSales,
      thisMonthSales,
      lastSaleAmount: lastSale?.amount
    };
  }, [sales, currentStreak]);

  // Load stored bests from Firestore
  useEffect(() => {
    if (!staffId) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'personal_bests', staffId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setStoredBests(snapshot.data() as PersonalBests);
      } else {
        setStoredBests(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [staffId]);

  // Check for new records when sales change
  useEffect(() => {
    if (!staffId || isLoading) return;

    const bestsToCompare = storedBests || calculatedBests;
    const breaks = checkForNewRecords(currentStats, bestsToCompare);

    if (breaks.length > 0) {
      setNewRecords(prev => {
        // Only add truly new records
        const newBreaks = breaks.filter(
          b => !prev.some(p => p.type === b.type && p.newValue === b.newValue)
        );
        return [...prev, ...newBreaks];
      });

      // Update stored bests
      updateStoredBests(staffId, calculatedBests);
    }
  }, [currentStats, storedBests, calculatedBests, staffId, isLoading]);

  // Save updated bests to Firestore
  const updateStoredBests = async (userId: string, bests: PersonalBests) => {
    try {
      await setDoc(doc(db, 'personal_bests', userId), {
        ...bests,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update personal bests:', error);
    }
  };

  // Check if approaching any records
  const approachingRecord = useMemo(() => {
    const bestsToCheck = storedBests || calculatedBests;
    
    // Check daily sales
    if (bestsToCheck.highestDailySales) {
      const msg = getApproachingRecordMessage(
        'highestDailySales',
        currentStats.todaySales,
        bestsToCheck.highestDailySales.amount
      );
      if (msg) return msg;
    }

    // Check sales count
    if (bestsToCheck.mostSalesInDay) {
      const msg = getApproachingRecordMessage(
        'mostSalesInDay',
        currentStats.todaySaleCount,
        bestsToCheck.mostSalesInDay.count
      );
      if (msg) return msg;
    }

    // Check weekly
    if (bestsToCheck.bestWeek) {
      const msg = getApproachingRecordMessage(
        'bestWeek',
        currentStats.thisWeekSales,
        bestsToCheck.bestWeek.amount
      );
      if (msg) return msg;
    }

    return null;
  }, [storedBests, calculatedBests, currentStats]);

  const clearNewRecords = useCallback(() => {
    setNewRecords([]);
  }, []);

  return {
    personalBests: storedBests || calculatedBests,
    newRecords,
    approachingRecord,
    clearNewRecords,
    isLoading
  };
}

// Helper
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default usePersonalBests;
