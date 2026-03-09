import React, { useMemo, useState, useEffect } from 'react';
import { WageSummary, WageSettings, Shift, Sale } from '../types';
import { Wallet, TrendingDown, Percent, AlertCircle, ChevronLeft, ChevronRight, Calendar, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { calculateSalesBonus } from '../utils/calculations.ts';

interface PayslipProps {
  shifts: Shift[];
  sales?: Sale[];
  summary: WageSummary;
  settings: WageSettings;
  userName: string;
  onUpdateSettings: (s: WageSettings) => void;
}

const Payslip: React.FC<PayslipProps> = ({ shifts, sales = [], settings, userName, onUpdateSettings }) => {
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [activeView, setActiveView] = useState<'current' | 'projection' | 'actual'>('current');

  // --- Actual payslip import (prototype) ---
  // Prototype storage: store per selectedPeriodIndex (good enough for testing; later we can key by date range).
  const storageKey = `takkarena.actualPayslip.periodIndex.${selectedPeriodIndex}`;

  const [actualRaw, setActualRaw] = useState<string>('');
  const [actual, setActual] = useState<any | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setActual(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!actual) return;
    try { localStorage.setItem(storageKey, JSON.stringify(actual)); } catch {}
  }, [actual, storageKey]);

  // Projection controls
  const [projectedRemainingShifts, setProjectedRemainingShifts] = useState<number>(10);
  const [usePaceFrom, setUsePaceFrom] = useState<'current' | 'historical'>('current');
  const [avgHoursPerShift, setAvgHoursPerShift] = useState<number>(6);

  const formatISK = (val: number) => {
    return new Intl.NumberFormat('is-IS', {
      style: 'currency',
      currency: 'ISK',
      maximumFractionDigits: 0
    }).format(val);
  };

  const parseISK = (s: string) => {
    // accepts e.g. "737.210" or "1.047.238" or "472.080,00"
    const cleaned = s.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const parseActualPayslip = (raw: string) => {
    const t = raw || '';
    const out: any = {};

    const gross = t.match(/Laun:\s*([0-9.]+)\b/);
    const ded = t.match(/Frádráttur:\s*([0-9.]+)\b/);
    const net = t.match(/Útborgu\s*ð\s*laun:\s*([0-9.]+)\b/);

    if (gross?.[1]) out.gross = parseISK(gross[1]);
    if (ded?.[1]) out.deductions = parseISK(ded[1]);
    if (net?.[1]) out.net = parseISK(net[1]);

    // Hours
    const dayH = t.match(/101\s+Dagvinna\s+([0-9]+,[0-9]+)/);
    const eveH = t.match(/1026\s+Eftirvinna\s+([0-9]+,[0-9]+)/);
    if (dayH?.[1]) out.dayHours = Number(dayH[1].replace(',', '.'));
    if (eveH?.[1]) out.eveningHours = Number(eveH[1].replace(',', '.'));

    // Bonus line
    const bonus = t.match(/1604\s+Bónus[^\n]*\s([0-9.]+)\b/);
    if (bonus?.[1]) out.bonus = parseISK(bonus[1]);

    // Tax + pension + union fee (optional)
    const tax = t.match(/910\s+Sta\s*ð\s*grei\s*ð\s*sla\s+skatta\s+([0-9.]+)\b/);
    const pension = t.match(/10\s+I\s*ð\s*gjald\s*4,00%\s+([0-9.]+)\b/);
    const union = t.match(/50\s+Félagsgjald\s+0,70%\s+([0-9.]+)\b/);
    if (tax?.[1]) out.tax = parseISK(tax[1]);
    if (pension?.[1]) out.pension = parseISK(pension[1]);
    if (union?.[1]) out.unionFee = parseISK(union[1]);

    // Date
    const date = t.match(/Dagsetning:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/);
    if (date?.[1]) out.date = date[1];

    return out;
  };

  // --- 1. Generate Last 10 Pay Periods ---
  const periods = useMemo(() => {
    const list = [];
    const now = new Date();

    let currentEnd = new Date(now);
    if (now.getDate() >= 26) {
      currentEnd.setMonth(currentEnd.getMonth() + 1);
    }
    currentEnd.setDate(25);
    currentEnd.setHours(23, 59, 59, 999);

    for (let i = 0; i < 10; i++) {
      const end = new Date(currentEnd);
      end.setMonth(end.getMonth() - i);

      const start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      start.setDate(26);
      start.setHours(0, 0, 0, 0);

      list.push({
        id: i,
        start,
        end,
        label: `${start.toLocaleDateString('is-IS', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('is-IS', { day: 'numeric', month: 'short' })}`,
        yearLabel: end.getFullYear()
      });
    }
    return list;
  }, []);

  const activePeriod = periods[selectedPeriodIndex];

  // --- 2. Calculate current period days info ---
  const periodInfo = useMemo(() => {
    if (!activePeriod) return { daysElapsed: 0, daysRemaining: 0, totalDays: 30 };

    const now = new Date();
    const start = activePeriod.start;
    const end = activePeriod.end;

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    return { daysElapsed, daysRemaining, totalDays };
  }, [activePeriod]);

  // --- 3. Calculate Payroll for Selected Period ---
  const payroll = useMemo(() => {
    if (!activePeriod) return null;

    const periodShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d >= activePeriod.start && d <= activePeriod.end;
    });

    const periodSalesList = sales.filter(s => {
      const d = new Date(s.date || s.timestamp);
      return d >= activePeriod.start && d <= activePeriod.end;
    });

    const periodTotalSales = periodSalesList.reduce((acc, s) => acc + s.amount, 0);

    const dayRate = settings.dayRate || 2724.88;
    const eveningRate = settings.eveningRate || 3768.47;
    const orlofRate = 0.1017;
    const pensionRate = 0.04;
    const unionRate = 0.007;

    const totalDayHours = periodShifts.reduce((acc, s) => acc + s.dayHours, 0);
    const totalEveningHours = periodShifts.reduce((acc, s) => acc + s.eveningHours, 0);
    const totalHours = totalDayHours + totalEveningHours;
    const shiftCount = periodShifts.length;

    const dayEarnings = totalDayHours * dayRate;
    const eveningEarnings = totalEveningHours * eveningRate;

    const bonus = calculateSalesBonus(periodTotalSales, totalHours);

    const subtotalForOrlof = dayEarnings + eveningEarnings + bonus;
    const orlof = subtotalForOrlof * orlofRate;
    const totalGross = subtotalForOrlof + orlof;
    const pensionFund = totalGross * pensionRate;
    const unionFee = totalGross * unionRate;
    const taxableIncome = totalGross - pensionFund;

    let calculatedTax = 0;
    let remainingIncome = taxableIncome;
    const step1Max = 472005;
    const step1Income = Math.min(remainingIncome, step1Max);
    calculatedTax += step1Income * 0.3145;
    remainingIncome -= step1Income;

    if (remainingIncome > 0) {
      const step2Max = 1273190 - step1Max;
      const step2Income = Math.min(remainingIncome, step2Max);
      calculatedTax += step2Income * 0.3795;
      remainingIncome -= step2Income;
    }
    if (remainingIncome > 0) calculatedTax += remainingIncome * 0.4625;

    const personalAllowance = settings.personalAllowance * (settings.allowanceUsage || 0);
    const finalTax = Math.max(0, calculatedTax - personalAllowance);
    const totalDeductions = pensionFund + unionFee + finalTax;
    const netPay = totalGross - totalDeductions;

    // Averages for projection - exclude sick days from averages (not from payroll)
    const workShifts = periodShifts.filter(s => s.projectName !== 'Veikindi');
    const workShiftCount = workShifts.length;
    const workHours = workShifts.reduce((acc, s) => acc + s.dayHours + s.eveningHours, 0);
    const workDayHours = workShifts.reduce((acc, s) => acc + s.dayHours, 0);
    const avgSalesPerShift = workShiftCount > 0 ? periodTotalSales / workShiftCount : 0;
    const avgHoursPerShiftCalc = workShiftCount > 0 ? workHours / workShiftCount : 6;
    const dayEveningRatio = workHours > 0 ? workDayHours / workHours : 0.6;

    return {
      dayHours: totalDayHours,
      eveningHours: totalEveningHours,
      dayEarnings,
      eveningEarnings,
      bonus,
      orlof,
      totalGross,
      pensionFund,
      unionFee,
      finalTax,
      totalDeductions,
      netPay,
      allowanceUsed: personalAllowance,
      totalHours,
      periodTotalSales,
      shiftCount,
      avgSalesPerShift,
      avgHoursPerShift: avgHoursPerShiftCalc,
      dayEveningRatio
    };
  }, [shifts, sales, activePeriod, settings]);

  // --- 4. Historical averages (from previous periods) ---
  const historicalAvg = useMemo(() => {
    if (periods.length < 2) return { avgSalesPerShift: 15000, avgHoursPerShift: 6, avgShiftsPerPeriod: 15 };

    const prevPeriod = periods[1];
    const prevShifts = shifts.filter(s => {
      const d = new Date(s.date);
      return d >= prevPeriod.start && d <= prevPeriod.end && s.projectName !== 'Veikindi';
    });
    const prevSales = sales.filter(s => {
      const d = new Date(s.date || s.timestamp);
      return d >= prevPeriod.start && d <= prevPeriod.end;
    });

    const totalSales = prevSales.reduce((acc, s) => acc + s.amount, 0);
    const totalHours = prevShifts.reduce((acc, s) => acc + s.dayHours + s.eveningHours, 0);
    const shiftCount = prevShifts.length;

    return {
      avgSalesPerShift: shiftCount > 0 ? totalSales / shiftCount : 15000,
      avgHoursPerShift: shiftCount > 0 ? totalHours / shiftCount : 6,
      avgShiftsPerPeriod: shiftCount || 15
    };
  }, [periods, shifts, sales]);

  // Initialize projection defaults when payroll changes
  useEffect(() => {
    if (payroll) {
      const estimatedRemaining = Math.max(0, Math.round(periodInfo.daysRemaining * 0.7)); // ~70% of remaining days are work days
      setProjectedRemainingShifts(estimatedRemaining);
      setAvgHoursPerShift(payroll.avgHoursPerShift || 6);
    }
  }, [payroll, periodInfo.daysRemaining]);

  // --- 5. Calculate Projection ---
  const projection = useMemo(() => {
    if (!payroll) return null;

    const dayRate = settings.dayRate || 2724.88;
    const eveningRate = settings.eveningRate || 3768.47;
    const orlofRate = 0.1017;
    const pensionRate = 0.04;
    const unionRate = 0.007;

    // Use selected pace source
    const salesPace = usePaceFrom === 'current' && payroll.shiftCount > 0
      ? payroll.avgSalesPerShift
      : historicalAvg.avgSalesPerShift;

    // Project remaining
    const projectedRemainingSales = salesPace * projectedRemainingShifts;
    const projectedRemainingHours = avgHoursPerShift * projectedRemainingShifts;

    // Totals
    const projectedTotalSales = payroll.periodTotalSales + projectedRemainingSales;
    const projectedTotalHours = payroll.totalHours + projectedRemainingHours;
    const projectedTotalShifts = payroll.shiftCount + projectedRemainingShifts;

    // Use same day/evening ratio as current
    const ratio = payroll.dayEveningRatio || 0.6;
    const projectedDayHours = projectedTotalHours * ratio;
    const projectedEveningHours = projectedTotalHours * (1 - ratio);

    // Earnings
    const projectedDayEarnings = projectedDayHours * dayRate;
    const projectedEveningEarnings = projectedEveningHours * eveningRate;
    const projectedBonus = calculateSalesBonus(projectedTotalSales, projectedTotalHours);

    const subtotalForOrlof = projectedDayEarnings + projectedEveningEarnings + projectedBonus;
    const projectedOrlof = subtotalForOrlof * orlofRate;
    const projectedGross = subtotalForOrlof + projectedOrlof;

    // Deductions
    const projectedPension = projectedGross * pensionRate;
    const projectedUnion = projectedGross * unionRate;
    const taxableIncome = projectedGross - projectedPension;

    let calculatedTax = 0;
    let remainingIncome = taxableIncome;
    const step1Max = 472005;
    const step1Income = Math.min(remainingIncome, step1Max);
    calculatedTax += step1Income * 0.3145;
    remainingIncome -= step1Income;
    if (remainingIncome > 0) {
      const step2Max = 1273190 - step1Max;
      const step2Income = Math.min(remainingIncome, step2Max);
      calculatedTax += step2Income * 0.3795;
      remainingIncome -= step2Income;
    }
    if (remainingIncome > 0) calculatedTax += remainingIncome * 0.4625;

    const personalAllowance = settings.personalAllowance * (settings.allowanceUsage || 0);
    const projectedTax = Math.max(0, calculatedTax - personalAllowance);
    const projectedDeductions = projectedPension + projectedUnion + projectedTax;
    const projectedNet = projectedGross - projectedDeductions;

    // Additional projection earnings
    const additionalNet = projectedNet - payroll.netPay;

    return {
      currentNet: payroll.netPay,
      projectedNet,
      additionalNet,
      projectedTotalSales,
      projectedTotalHours,
      projectedTotalShifts,
      projectedDayHours,
      projectedEveningHours,
      projectedDayEarnings,
      projectedEveningEarnings,
      projectedBonus,
      projectedOrlof,
      projectedGross,
      projectedPension,
      projectedUnion,
      projectedTax,
      projectedDeductions,
      salesPace,
      remainingSales: projectedRemainingSales,
      remainingHours: projectedRemainingHours
    };
  }, [payroll, projectedRemainingShifts, avgHoursPerShift, usePaceFrom, historicalAvg, settings]);

  if (!payroll) return <div className="text-center p-20 text-slate-500">Hleð gögnum...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Launaseðill</h2>

        <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 border border-white/10">
          <button
            onClick={() => setSelectedPeriodIndex(prev => Math.min(prev + 1, periods.length - 1))}
            disabled={selectedPeriodIndex >= periods.length - 1}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center min-w-[140px]">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
              {selectedPeriodIndex === 0 ? 'Núverandi' : `${activePeriod.yearLabel}`}
            </p>
            <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              {activePeriod.label}
            </p>
          </div>

          <button
            onClick={() => setSelectedPeriodIndex(prev => Math.max(prev - 1, 0))}
            disabled={selectedPeriodIndex === 0}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* TAB SWITCHER - Only for current period */}
      {selectedPeriodIndex === 0 && (
        <div className="flex bg-white/5 p-1.5 rounded-2xl mx-4 border border-white/5">
          <button
            onClick={() => setActiveView('current')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
              ${activeView === 'current' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Wallet size={16} /> Launaseðill
          </button>
          <button
            onClick={() => setActiveView('projection')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
              ${activeView === 'projection' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Sparkles size={16} /> Spá
          </button>
          <button
            onClick={() => setActiveView('actual')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
              ${activeView === 'actual' ? 'bg-violet-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Target size={16} /> Raunlaun
          </button>
        </div>
      )}

      {/* ACTUAL PAYSLIP (PROTOTYPE) */}
      {activeView === 'actual' && selectedPeriodIndex === 0 && (
        <div className="space-y-6 px-4">
          <div className="glass p-6 rounded-[32px] border-violet-500/20">
            <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.2em] mb-2 italic">Raun launaseðill (prototype)</p>
            <p className="text-xs text-slate-400 mb-4">Paste-a textann úr PDF (eða úr WhatsApp) hér — þá reyni ég að lesa úr honum tölurnar og bera saman við reiknað.</p>

            <textarea
              value={actualRaw}
              onChange={(e) => setActualRaw(e.target.value)}
              placeholder="Límdu inn textann úr launaseðlinum hér..."
              className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl p-4 text-xs text-slate-200 font-mono"
            />

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => {
                  const parsed = parseActualPayslip(actualRaw);
                  setActual(parsed);
                }}
                className="px-4 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-black uppercase tracking-wider"
              >
                Lesa úr texta
              </button>
              <button
                onClick={() => { setActual(null); setActualRaw(''); }}
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-black uppercase tracking-wider"
              >
                Hreinsa
              </button>
              {actual && (
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <AlertCircle size={14} className="text-slate-500" />
                  <span>Vistað local (á þessu tæki) fyrir tímabilið.</span>
                </div>
              )}
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-6 rounded-[32px] border-white/10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Reiknað nettó</p>
              <p className="text-2xl font-black text-indigo-400">{payroll ? formatISK(payroll.netPay) : '—'}</p>
              <p className="text-[10px] text-slate-500 mt-1">(úr vöktum + sölu)</p>
            </div>
            <div className="glass p-6 rounded-[32px] border-violet-500/20">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Raun nettó</p>
              <p className="text-2xl font-black text-violet-400">{actual?.net ? formatISK(actual.net) : '—'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{actual?.date ? `Dagsetning: ${actual.date}` : ''}</p>
            </div>
            <div className="glass p-6 rounded-[32px] border-emerald-500/20">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Mismunur</p>
              <p className="text-2xl font-black text-emerald-400">
                {payroll && actual?.net != null ? formatISK((actual.net || 0) - payroll.netPay) : '—'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">(raun − reiknað)</p>
            </div>
          </div>

          {actual && (
            <div className="glass p-6 rounded-[32px] border-white/10">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4">Lesið úr launaseðli</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Brúttó</span><span className="text-white font-bold">{actual.gross ? formatISK(actual.gross) : '—'}</span></div>
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Frádráttur</span><span className="text-white font-bold">{actual.deductions ? formatISK(actual.deductions) : '—'}</span></div>
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Dagklst</span><span className="text-white font-bold">{actual.dayHours != null ? actual.dayHours.toFixed(2) : '—'}</span></div>
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Yfirvinna klst</span><span className="text-white font-bold">{actual.eveningHours != null ? actual.eveningHours.toFixed(2) : '—'}</span></div>
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Bónus</span><span className="text-white font-bold">{actual.bonus ? formatISK(actual.bonus) : '—'}</span></div>
                <div className="flex justify-between bg-white/5 rounded-2xl p-3"><span className="text-slate-400">Staðgreiðsla</span><span className="text-white font-bold">{actual.tax ? formatISK(actual.tax) : '—'}</span></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4">Þetta er bara prototype til að hjálpa okkur að finna hvar reiknivélin er vitlaus. Næsta skref: true PDF import + 6 mánaða trend.</p>
            </div>
          )}
        </div>
      )}

      {/* PROJECTION VIEW */}
      {activeView === 'projection' && selectedPeriodIndex === 0 && projection && (
        <div className="space-y-6 px-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-6 rounded-[32px] border-indigo-500/20">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Núverandi</p>
              <p className="text-2xl font-black text-indigo-400">{formatISK(projection.currentNet)}</p>
              <p className="text-[10px] text-slate-500 mt-1">{payroll.shiftCount} vaktir</p>
            </div>
            <div className="glass p-6 rounded-[32px] border-emerald-500/20">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Spáð viðbót</p>
              <p className="text-2xl font-black text-emerald-400">+{formatISK(projection.additionalNet)}</p>
              <p className="text-[10px] text-slate-500 mt-1">+{projectedRemainingShifts} vaktir</p>
            </div>
            <div className="glass p-6 rounded-[32px] border-violet-500/20 bg-violet-500/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Samtals spá</p>
              <p className="text-2xl font-black text-violet-400">{formatISK(projection.projectedNet)}</p>
              <p className="text-[10px] text-slate-500 mt-1">{projection.projectedTotalShifts} vaktir</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="glass p-6 rounded-[32px] border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Framvinda tímabils</span>
              <span className="text-xs font-bold text-indigo-400">{periodInfo.daysRemaining} dagar eftir</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${(periodInfo.daysElapsed / periodInfo.totalDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Adjustable Inputs */}
          <div className="glass p-6 rounded-[32px] border-emerald-500/10 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Aðlaga spá</h4>
            </div>

            {/* Remaining Shifts Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Áætlaðar vaktir eftir</span>
                <span className="text-sm font-black text-emerald-400">{projectedRemainingShifts}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={projectedRemainingShifts}
                onChange={(e) => setProjectedRemainingShifts(parseInt(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Hours per Shift Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meðalklst á vakt</span>
                <span className="text-sm font-black text-emerald-400">{avgHoursPerShift.toFixed(1)}h</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={avgHoursPerShift}
                onChange={(e) => setAvgHoursPerShift(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Pace Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setUsePaceFrom('current')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                  ${usePaceFrom === 'current' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
              >
                Núverandi hraði
              </button>
              <button
                onClick={() => setUsePaceFrom('historical')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                  ${usePaceFrom === 'historical' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
              >
                Sögulegt meðaltal
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Söluhraði: {formatISK(projection.salesPace)} á vakt
            </p>

            {/* Personal Allowance Slider */}
            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Percent size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nýting persónuafsláttar</span>
                </div>
                <span className="text-xs font-black text-indigo-400">{Math.round((settings.allowanceUsage || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.allowanceUsage || 0}
                onChange={(e) => onUpdateSettings({ ...settings, allowanceUsage: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Projected Breakdown */}
          <div className="glass rounded-[48px] border-white/10 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600" />
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter">Spáð Sundurliðun</h3>
                  <p className="text-xs text-slate-500">Miðað við {projectedRemainingShifts} vaktir í viðbót</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Wallet size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Laun</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dagvinna ({projection.projectedDayHours.toFixed(1)}h)</span>
                      <span className="font-bold text-white">{formatISK(projection.projectedDayEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Eftirvinna ({projection.projectedEveningHours.toFixed(1)}h)</span>
                      <span className="font-bold text-white">{formatISK(projection.projectedEveningEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Bónus</span>
                      <span className="font-bold text-emerald-400">{formatISK(projection.projectedBonus)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/5">
                      <span className="text-indigo-400">Orlof</span>
                      <span className="font-bold text-indigo-400">{formatISK(projection.projectedOrlof)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <TrendingDown size={16} className="text-rose-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frádráttur</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lífeyrir (4%)</span>
                      <span className="font-bold text-rose-400">-{formatISK(projection.projectedPension)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Félagsgjald</span>
                      <span className="font-bold text-rose-400">-{formatISK(projection.projectedUnion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Staðgreiðsla</span>
                      <span className="font-bold text-rose-400">-{formatISK(projection.projectedTax)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/5">
                      <span className="text-rose-400">Samtals</span>
                      <span className="font-bold text-rose-400">-{formatISK(projection.projectedDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Net Pay */}
              <div className="pt-8 border-t-2 border-dashed border-white/5 text-center">
                <p className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.4em] mb-3 italic">Spáð laun til útgreiðslu</p>
                <div className="inline-block p-1.5 rounded-[32px] bg-gradient-to-r from-emerald-600 to-teal-600 shadow-2xl shadow-emerald-600/30">
                  <div className="bg-[#020617] rounded-[28px] px-12 py-8">
                    <h4 className="text-5xl font-black text-white tracking-tighter italic">{formatISK(projection.projectedNet)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CURRENT PAYSLIP VIEW */}
      {(activeView === 'current' || selectedPeriodIndex !== 0) && (
        <div className="glass rounded-[48px] border-white/10 overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600" />
          <div className="p-8 md:p-14 space-y-12">

            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white italic tracking-tighter">TAKK ehf.</h2>
                <p className="text-slate-400 text-sm font-medium">Laugavegur 123, 101 Reykjavík</p>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-[32px] p-8 min-w-[280px]">
                <div className="text-right space-y-4">
                  <div>
                    <p className="text-slate-500 font-black uppercase text-[8px] tracking-widest mb-1">Starfsmaður</p>
                    <p className="text-white font-bold">{userName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-black uppercase text-[8px] tracking-widest mb-1">Tímabil</p>
                    <p className="text-indigo-400 font-black capitalize">{activePeriod.label}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <Wallet className="text-indigo-400" size={18} />
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Laun & Greiðslur</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-200">101 Dagvinna</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{payroll.dayHours.toFixed(2)} klst @ {settings.dayRate}</p>
                    </div>
                    <span className="text-white font-black">{formatISK(payroll.dayEarnings)}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-200">1026 Eftirvinna</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{payroll.eveningHours.toFixed(2)} klst @ {settings.eveningRate}</p>
                    </div>
                    <span className="text-white font-black">{formatISK(payroll.eveningEarnings)}</span>
                  </div>

                  <div className="flex justify-between items-center group pt-2 relative">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-emerald-400">1604 Bónus</p>
                        <div className="group/tip relative">
                          <AlertCircle size={12} className="text-slate-600 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 glass border-white/10 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50">
                            <p className="font-black text-indigo-400 uppercase mb-1">Formúla</p>
                            Sala: {formatISK(payroll.periodTotalSales)}<br />
                            Þröskuldur: (636 * {payroll.totalHours.toFixed(1)}) - (79.5 * {payroll.totalHours.toFixed(1)})<br />
                            = {formatISK(636 * payroll.totalHours - 79.5 * payroll.totalHours)}
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Af sölu umfram viðmið</p>
                    </div>
                    <span className="text-emerald-400 font-black">{formatISK(payroll.bonus)}</span>
                  </div>

                  <div className="flex justify-between items-center group pt-2 border-t border-white/5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-indigo-400">901 Orlof</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">10,17% af heildarlaunum</p>
                    </div>
                    <span className="text-indigo-400 font-black">{formatISK(payroll.orlof)}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <TrendingDown className="text-rose-400" size={18} />
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Frádráttur</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-200">10 Iðgjald</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lífeyrissjóður 4%</p>
                    </div>
                    <span className="text-rose-400 font-black">-{formatISK(payroll.pensionFund)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-200">50 Félagsgjald</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stéttarfélag 0,7%</p>
                    </div>
                    <span className="text-rose-400 font-black">-{formatISK(payroll.unionFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-200">Staðgreiðsla</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Eftir persónuafslátt</p>
                    </div>
                    <span className="text-rose-400 font-black">-{formatISK(payroll.finalTax)}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-16 pt-12 border-t-2 border-dashed border-white/5">
              <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>Heildarlaun (Brúttó)</span>
                    <span className="text-white">{formatISK(payroll.totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>Samtals frádráttur</span>
                    <span className="text-rose-500">{formatISK(payroll.totalDeductions)}</span>
                  </div>
                  {/* Slider */}
                  <div className="p-6 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Percent size={14} className="text-indigo-400" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nýting persónuafsláttar</p>
                      </div>
                      <span className="text-xs font-black text-indigo-400">{Math.round((settings.allowanceUsage || 0) * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={settings.allowanceUsage || 0} onChange={(e) => onUpdateSettings({ ...settings, allowanceUsage: parseFloat(e.target.value) })} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                </div>

                <div className="w-full md:w-auto text-right">
                  <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mb-2 italic">Laun til Útgreiðslu</p>
                  <div className="inline-block p-1 rounded-[32px] bg-gradient-to-r from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-600/30">
                    <div className="bg-[#020617] rounded-[28px] px-10 py-6">
                      <h4 className="text-5xl font-black text-white tracking-tighter italic">{formatISK(payroll.netPay)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payslip;

