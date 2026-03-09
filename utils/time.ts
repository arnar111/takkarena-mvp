export const getRoundedTime = (date: Date) => {
    const coeff = 1000 * 60 * 15; // 15 minutes
    return new Date(Math.round(date.getTime() / coeff) * coeff);
};

// Now accepts optional deductionMinutes to calculate "Net Working Hours"
export const calculateShiftSplit = (start: Date, end: Date, deductionMinutes: number = 0) => {
    const isWeekend = start.getDay() === 0 || start.getDay() === 6;
    let diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Apply deduction if provided (for calculating performance metrics)
    if (deductionMinutes > 0) {
        diffHours = Math.max(0, diffHours - (deductionMinutes / 60));
    }

    if (diffHours <= 0) return { day: 0, evening: 0 };
    if (isWeekend) return { day: 0, evening: diffHours };

    const hourOfDay = end.getHours();

    // Standard logic: Evening starts at 17:00
    if (hourOfDay >= 17) {
        const eveningPartPotential = Math.max(0, hourOfDay - 17 + (end.getMinutes() / 60));
        const realEvening = Math.min(diffHours, eveningPartPotential);
        const dayPart = Math.max(0, diffHours - realEvening);
        return { day: dayPart, evening: realEvening };
    }
    
    return { day: diffHours, evening: 0 };
};
