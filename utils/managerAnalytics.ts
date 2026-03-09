import { Shift, Sale, User } from '../types';

export interface ProjectMomentum {
  hringurinn: number; // 0-100 score
  verid: number;      // 0-100 score
  recommendation: string;
}

export const getProjectMomentum = (shifts: Shift[], sales: Sale[]): ProjectMomentum => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const getStats = (projectName: string) => {
    const projectSales = sales.filter(s => s.project === projectName && new Date(s.date) >= sevenDaysAgo);
    const projectShifts = shifts.filter(s => s.projectName === projectName && new Date(s.date) >= sevenDaysAgo);
    
    const totalSales = projectSales.reduce((acc, s) => acc + s.amount, 0);
    const totalHours = projectShifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0);
    const effectiveHours = totalHours * 0.875;
    
    const efficiency = effectiveHours > 0 ? totalSales / effectiveHours : 0;
    const count = projectSales.length;
    
    return { efficiency, count, totalSales };
  };

  const hStats = getStats('Hringurinn');
  const vStats = getStats('Verið');

  const maxEff = Math.max(hStats.efficiency, vStats.efficiency, 1);
  const maxVol = Math.max(hStats.count, vStats.count, 1);

  const hScore = ((hStats.efficiency / maxEff) * 70) + ((hStats.count / maxVol) * 30);
  const vScore = ((vStats.efficiency / maxEff) * 70) + ((vStats.count / maxVol) * 30);

  let recommendation = "";
  if (hScore > vScore + 10) {
    recommendation = "Hringurinn sýnir sterka sölutækni núna. Mælt með að fókusa á það verkefni.";
  } else if (vScore > hScore + 10) {
    recommendation = "Verið er á mikilli siglingu. Gjöfult verkefni í augnablikinu.";
  } else {
    recommendation = "Jafnvægi er á milli verkefna. Bæði skila góðum árangri.";
  }

  return {
    hringurinn: Math.round(hScore),
    verid: Math.round(vScore),
    recommendation
  };
};

export const calculateTeamMetrics = (users: User[], shifts: Shift[], sales: Sale[]) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return users.filter(u => u.role === 'agent').map(u => {
    const uSales = sales.filter(s => s.userId === u.staffId && new Date(s.date) >= startOfMonth);
    const uShifts = shifts.filter(s => s.userId === u.staffId && new Date(s.date) >= startOfMonth);
    
    const totalSales = uSales.reduce((acc, s) => acc + s.amount, 0);
    const totalHours = uShifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0);
    const effectiveHours = totalHours * 0.875;
    
    // 636 ISK threshold per effective hour
    const threshold = effectiveHours * 636;
    const achievement = threshold > 0 ? (totalSales / threshold) * 100 : 0;
    
    // Real-Time Wage Estimate (Integrated)
    const dayEarnings = uShifts.reduce((acc, s) => acc + (s.dayHours * 2724.88), 0);
    const eveningEarnings = uShifts.reduce((acc, s) => acc + (s.eveningHours * 3768.47), 0);
    const bonus = Math.max(0, totalSales - threshold);
    
    // Using simple gross estimation for "Real-Time Wage" visualization
    const totalEarned = dayEarnings + eveningEarnings + bonus;
    const hourlyWage = totalHours > 0 ? totalEarned / totalHours : 0;

    return {
      name: u.name,
      staffId: u.staffId,
      team: u.team || 'Other',
      totalSales,
      totalHours,
      effectiveHours,
      achievement: Math.round(achievement),
      bonus: Math.round(bonus),
      hourlyWage: Math.round(hourlyWage)
    };
  }).sort((a, b) => b.achievement - a.achievement);
};