import React, { useMemo, useState, useEffect } from 'react';
import { Sale, Goals } from '../types';
import { Trophy, Target, Clock, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface DailyStatsProps {
  sales: Sale[];
  goals: Goals;
}

const DailyStats: React.FC<DailyStatsProps> = ({ sales, goals }) => {
  const [now, setNow] = useState(new Date());
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  // --- Live Timer Logic (Duplicated for standalone functionality) ---
  useEffect(() => {
    const storedStart = localStorage.getItem('takk_shift_start');
    if (storedStart) setClockInTime(new Date(storedStart));

    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const liveHours = useMemo(() => {
    if (!clockInTime) return 0;
    return (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
  }, [now, clockInTime]);

  // --- Calculations ---
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = useMemo(() => sales.filter(s => s.date === todayStr), [sales, todayStr]);
  const totalAmount = todaySales.reduce((acc, s) => acc + s.amount, 0);
  
  const progress = Math.min(100, (totalAmount / goals.daily) * 100);
  const hourlyRate = liveHours > 0.1 ? totalAmount / liveHours : 0;
  
  const formatISK = (val: number) => new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Árangur</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Staðan í dag</p>
        </div>
        <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
            <Trophy size={24} />
        </div>
      </div>

      {/* MAIN GOAL CARD */}
      <div className="glass p-8 rounded-[40px] border-amber-500/20 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-amber-500/5 blur-3xl" />
        
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                <circle cx="96" cy="96" r="88" stroke={progress >= 100 ? "#10b981" : "#f59e0b"} strokeWidth="12" fill="none" strokeDasharray="553" strokeDashoffset={553 - (553 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">af markmiði</span>
            </div>
        </div>

        <div className="flex flex-col gap-1">
            <h3 className="text-5xl font-black text-white tracking-tighter">{formatISK(totalAmount)}</h3>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase bg-white/5 px-3 py-1 rounded-lg mx-auto">
                <Target size={12} /> Markmið: {formatISK(goals.daily)}
            </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-5 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <Clock size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Tímar</span>
            </div>
            <p className="text-2xl font-black text-white">{liveHours.toFixed(1)} <span className="text-xs text-slate-500">klst</span></p>
        </div>
        <div className="glass p-5 rounded-[32px] border-white/5">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <TrendingUp size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Meðaltal</span>
            </div>
            <p className="text-2xl font-black text-white">{formatISK(hourlyRate)} <span className="text-xs text-slate-500">kr/klst</span></p>
        </div>
      </div>

      {/* SALES LIST (Simplified) */}
      <div className="glass p-6 rounded-[32px] border-white/10">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} /> Færslur dagsins</h4>
        <div className="space-y-3">
            {todaySales.length === 0 ? (
                <div className="text-center py-8 text-slate-600 font-bold italic text-xs">Engin sala komin. Áfram gakk!</div>
            ) : (
                [...todaySales].reverse().map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${s.saleType === 'upgrade' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                            <span className="text-sm font-bold text-white">{s.project}</span>
                        </div>
                        <span className="font-black text-white">{formatISK(s.amount)}</span>
                    </div>
                ))
            )}
        </div>
      </div>

    </div>
  );
};

export default DailyStats;
