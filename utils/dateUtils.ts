export const isWeekend = (date: Date | string): boolean => {
    const d = new Date(date);
    const day = d.getDay();
    // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
};

/**
 * Calculates the maximum streak of consecutive days, ignoring weekends.
 * For example: Thu, Fri, Mon, Tue counts as 4 days.
 * @param dates Array of date strings (YYYY-MM-DD or ISO)
 */
export const calculateMaxStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    // Deduplicate and sort ascending
    const sortedDates = [...new Set(dates.map(d => d.split('T')[0]))].sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);

        // Calculate difference in days
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day
            currentStreak++;
        } else {
            // Check if larger gap is only weekends
            // Determine if the gap between prev and curr contains any weekdays.
            // Actually, simplified: if we are allowing "no work on weekends", 
            // then Fri -> Mon is a valid continuation.
            // Fri is day 5. Mon is day 1.
            // 3 days diff.
            // If the gap can be bridged by weekends, we continue.

            let isGapBridgeable = true;
            for (let j = 1; j < diffDays; j++) {
                const checkDate = new Date(prev);
                checkDate.setDate(prev.getDate() + j);
                if (!isWeekend(checkDate)) {
                    isGapBridgeable = false;
                    break;
                }
            }

            if (isGapBridgeable) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
    }

    return maxStreak;
};
