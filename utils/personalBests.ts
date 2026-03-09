/**
 * Personal Best Records System
 * Tracks and celebrates personal records for motivation
 * Version 4.0.0
 */

import { Sale, Shift } from '../types';

export interface PersonalBests {
  highestDailySales: { amount: number; date: string } | null;
  highestSingleSale: { amount: number; date: string; project: string } | null;
  longestStreak: { days: number; startDate: string; endDate: string } | null;
  mostSalesInDay: { count: number; date: string } | null;
  bestWeek: { amount: number; weekStart: string } | null;
  bestMonth: { amount: number; month: string } | null;
  fastestGoalHit: { minutes: number; date: string; goal: number } | null;
  highestHourlyRate: { rate: number; date: string } | null;
}

export interface PersonalBestBreak {
  type: keyof PersonalBests;
  label: string;
  previousValue: number;
  newValue: number;
  improvement: number; // percentage
  icon: string;
}

/**
 * Calculate all personal bests from sales history
 */
export function calculatePersonalBests(sales: Sale[], shifts: Shift[]): PersonalBests {
  if (sales.length === 0) {
    return {
      highestDailySales: null,
      highestSingleSale: null,
      longestStreak: null,
      mostSalesInDay: null,
      bestWeek: null,
      bestMonth: null,
      fastestGoalHit: null,
      highestHourlyRate: null,
    };
  }

  // Group sales by date
  const salesByDate = groupSalesByDate(sales);
  
  // 1. Highest Daily Sales
  let highestDailySales: PersonalBests['highestDailySales'] = null;
  for (const [date, daySales] of Object.entries(salesByDate)) {
    const total = daySales.reduce((sum, s) => sum + s.amount, 0);
    if (!highestDailySales || total > highestDailySales.amount) {
      highestDailySales = { amount: total, date };
    }
  }

  // 2. Highest Single Sale
  let highestSingleSale: PersonalBests['highestSingleSale'] = null;
  for (const sale of sales) {
    if (!highestSingleSale || sale.amount > highestSingleSale.amount) {
      highestSingleSale = { 
        amount: sale.amount, 
        date: sale.date,
        project: sale.project 
      };
    }
  }

  // 3. Most Sales in Day (count)
  let mostSalesInDay: PersonalBests['mostSalesInDay'] = null;
  for (const [date, daySales] of Object.entries(salesByDate)) {
    if (!mostSalesInDay || daySales.length > mostSalesInDay.count) {
      mostSalesInDay = { count: daySales.length, date };
    }
  }

  // 4. Best Week
  const salesByWeek = groupSalesByWeek(sales);
  let bestWeek: PersonalBests['bestWeek'] = null;
  for (const [weekStart, weekSales] of Object.entries(salesByWeek)) {
    const total = weekSales.reduce((sum, s) => sum + s.amount, 0);
    if (!bestWeek || total > bestWeek.amount) {
      bestWeek = { amount: total, weekStart };
    }
  }

  // 5. Best Month
  const salesByMonth = groupSalesByMonth(sales);
  let bestMonth: PersonalBests['bestMonth'] = null;
  for (const [month, monthSales] of Object.entries(salesByMonth)) {
    const total = monthSales.reduce((sum, s) => sum + s.amount, 0);
    if (!bestMonth || total > bestMonth.amount) {
      bestMonth = { amount: total, month };
    }
  }

  // 6. Longest Streak
  const longestStreak = calculateLongestStreak(Object.keys(salesByDate).sort());

  // 7. Highest Hourly Rate (requires shifts)
  let highestHourlyRate: PersonalBests['highestHourlyRate'] = null;
  for (const shift of shifts) {
    const totalHours = shift.dayHours + shift.eveningHours;
    if (totalHours > 0 && shift.totalSales > 0) {
      const rate = shift.totalSales / totalHours;
      if (!highestHourlyRate || rate > highestHourlyRate.rate) {
        highestHourlyRate = { rate, date: shift.date };
      }
    }
  }

  return {
    highestDailySales,
    highestSingleSale,
    longestStreak,
    mostSalesInDay,
    bestWeek,
    bestMonth,
    fastestGoalHit: null, // Requires goal tracking over time
    highestHourlyRate,
  };
}

/**
 * Check if current performance breaks any personal bests
 */
export function checkForNewRecords(
  currentStats: {
    todaySales: number;
    todaySaleCount: number;
    currentStreak: number;
    thisWeekSales: number;
    thisMonthSales: number;
    lastSaleAmount?: number;
    hourlyRate?: number;
  },
  personalBests: PersonalBests
): PersonalBestBreak[] {
  const breaks: PersonalBestBreak[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Check highest daily sales
  if (personalBests.highestDailySales && 
      currentStats.todaySales > personalBests.highestDailySales.amount) {
    breaks.push({
      type: 'highestDailySales',
      label: 'Hæsta dagsala!',
      previousValue: personalBests.highestDailySales.amount,
      newValue: currentStats.todaySales,
      improvement: calculateImprovement(
        personalBests.highestDailySales.amount, 
        currentStats.todaySales
      ),
      icon: '📈'
    });
  }

  // Check most sales in day
  if (personalBests.mostSalesInDay && 
      currentStats.todaySaleCount > personalBests.mostSalesInDay.count) {
    breaks.push({
      type: 'mostSalesInDay',
      label: 'Flestar sölur á dag!',
      previousValue: personalBests.mostSalesInDay.count,
      newValue: currentStats.todaySaleCount,
      improvement: calculateImprovement(
        personalBests.mostSalesInDay.count, 
        currentStats.todaySaleCount
      ),
      icon: '🎯'
    });
  }

  // Check longest streak
  if (personalBests.longestStreak && 
      currentStats.currentStreak > personalBests.longestStreak.days) {
    breaks.push({
      type: 'longestStreak',
      label: 'Lengsta strík!',
      previousValue: personalBests.longestStreak.days,
      newValue: currentStats.currentStreak,
      improvement: calculateImprovement(
        personalBests.longestStreak.days, 
        currentStats.currentStreak
      ),
      icon: '🔥'
    });
  }

  // Check single sale record
  if (personalBests.highestSingleSale && 
      currentStats.lastSaleAmount && 
      currentStats.lastSaleAmount > personalBests.highestSingleSale.amount) {
    breaks.push({
      type: 'highestSingleSale',
      label: 'Stærsta einstaka sala!',
      previousValue: personalBests.highestSingleSale.amount,
      newValue: currentStats.lastSaleAmount,
      improvement: calculateImprovement(
        personalBests.highestSingleSale.amount, 
        currentStats.lastSaleAmount
      ),
      icon: '💎'
    });
  }

  // Check best week
  if (personalBests.bestWeek && 
      currentStats.thisWeekSales > personalBests.bestWeek.amount) {
    breaks.push({
      type: 'bestWeek',
      label: 'Besta vikan!',
      previousValue: personalBests.bestWeek.amount,
      newValue: currentStats.thisWeekSales,
      improvement: calculateImprovement(
        personalBests.bestWeek.amount, 
        currentStats.thisWeekSales
      ),
      icon: '🏆'
    });
  }

  // Check best month
  if (personalBests.bestMonth && 
      currentStats.thisMonthSales > personalBests.bestMonth.amount) {
    breaks.push({
      type: 'bestMonth',
      label: 'Besti mánuðurinn!',
      previousValue: personalBests.bestMonth.amount,
      newValue: currentStats.thisMonthSales,
      improvement: calculateImprovement(
        personalBests.bestMonth.amount, 
        currentStats.thisMonthSales
      ),
      icon: '👑'
    });
  }

  return breaks;
}

// Helper functions

function groupSalesByDate(sales: Sale[]): Record<string, Sale[]> {
  return sales.reduce((acc, sale) => {
    if (!acc[sale.date]) acc[sale.date] = [];
    acc[sale.date].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);
}

function groupSalesByWeek(sales: Sale[]): Record<string, Sale[]> {
  return sales.reduce((acc, sale) => {
    const weekStart = getWeekStart(sale.date);
    if (!acc[weekStart]) acc[weekStart] = [];
    acc[weekStart].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);
}

function groupSalesByMonth(sales: Sale[]): Record<string, Sale[]> {
  return sales.reduce((acc, sale) => {
    const month = sale.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);
}

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}

function calculateLongestStreak(sortedDates: string[]): PersonalBests['longestStreak'] {
  if (sortedDates.length === 0) return null;

  let longestStreak = { days: 1, startDate: sortedDates[0], endDate: sortedDates[0] };
  let currentStreak = { days: 1, startDate: sortedDates[0], endDate: sortedDates[0] };

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      currentStreak.days++;
      currentStreak.endDate = sortedDates[i];
    } else {
      // Streak broken
      if (currentStreak.days > longestStreak.days) {
        longestStreak = { ...currentStreak };
      }
      currentStreak = { days: 1, startDate: sortedDates[i], endDate: sortedDates[i] };
    }
  }

  // Check final streak
  if (currentStreak.days > longestStreak.days) {
    longestStreak = { ...currentStreak };
  }

  return longestStreak;
}

function calculateImprovement(previous: number, current: number): number {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format personal best for display
 */
export function formatPersonalBestValue(
  type: keyof PersonalBests, 
  value: number
): string {
  switch (type) {
    case 'highestDailySales':
    case 'highestSingleSale':
    case 'bestWeek':
    case 'bestMonth':
      return new Intl.NumberFormat('is-IS').format(value) + ' kr';
    case 'mostSalesInDay':
      return value + ' sölur';
    case 'longestStreak':
      return value + ' dagar';
    case 'highestHourlyRate':
      return new Intl.NumberFormat('is-IS').format(Math.round(value)) + ' kr/klst';
    default:
      return String(value);
  }
}

/**
 * Get motivational message for approaching a record
 */
export function getApproachingRecordMessage(
  type: keyof PersonalBests,
  currentValue: number,
  recordValue: number
): string | null {
  const percentage = (currentValue / recordValue) * 100;
  const remaining = recordValue - currentValue;

  if (percentage >= 90 && percentage < 100) {
    switch (type) {
      case 'highestDailySales':
        return `🔥 Aðeins ${new Intl.NumberFormat('is-IS').format(remaining)} kr til að slá dagsmet!`;
      case 'mostSalesInDay':
        return `🎯 ${remaining} sala/sölur til að slá fjöldamet!`;
      case 'bestWeek':
        return `📈 ${new Intl.NumberFormat('is-IS').format(remaining)} kr til vikumets!`;
      default:
        return null;
    }
  }

  return null;
}
