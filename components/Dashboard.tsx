import React, { useMemo, useState, useEffect } from 'react';
import { WageSummary, Shift, Goals, Sale } from '../types';
import { TrendingUp, Award, Calendar, DollarSign, Activity, Target, Play, StopCircle, Clock, Timer, Zap, MessageCircle } from 'lucide-react';
import { getSmartDashboardAnalysis, getPreShiftBriefing } from '../geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import NumberTicker from './NumberTicker.tsx';

interface DashboardProps {
    summary: WageSummary;
    shifts: Shift[];
    periodShifts: Shift[];
    aiInsights: string;
    onAddClick: () => void;
    goals: Goals;
    onUpdateGoals: (g: Goals) => void;
    sales: Sale[];
    staffId: string;
    isShiftActive: boolean;
    clockInTime: Date | null;
    onClockIn: (goal: number) => void;
    onClockOut: (shiftData: any) => void;
    coachPersonality: string;
}

const Dashboard: React.FC<DashboardProps> = ({
    summary, shifts, periodShifts, onAddClick, goals, onUpdateGoals, sales,
    isShiftActive, clockInTime, onClockIn, onClockOut, coachPersonality
}) => {
    const [aiData, setAiData] = useState<{ smartAdvice: string, trend: string, motivationalQuote: string } | null>(null);
    const [briefing, setBriefing] = useState<{ title: string, body: string } | null>(null);
    const [timerStr, setTimerStr] = useState("00:00");
    const [hoursWorked, setHoursWorked] = useState(0);

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (!isShiftActive || !clockInTime) {
            setTimerStr("00:00");
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const diff = now.getTime() - clockInTime.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimerStr(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            setHoursWorked(diff / (1000 * 60 * 60));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [isShiftActive, clockInTime]);

    const salesToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return sales.filter(s => s.date === todayStr).reduce((acc, s) => acc + s.amount, 0);
    }, [sales]);

    useEffect(() => {
        const fetchData = async () => {
            if (summary.totalSales > 0) {
                const data = await getSmartDashboardAnalysis(
                    summary.totalSales,
                    summary.totalSales,
                    goals,
                    coachPersonality
                );
                setAiData(data);
            }

            const briefingData = await getPreShiftBriefing(15000, coachPersonality);
            setBriefing(briefingData);
        };
        fetchData();
    }, [summary.totalSales, goals, coachPersonality]);

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(val);

    const metrics = useMemo(() => {
        // Calculate total sales from period shifts (not from summary)
        const periodTotalSales = periodShifts.reduce((acc, s) => acc + (s.totalSales || 0), 0);

        // Filter out sick days from shift count for average calculation
        const workShifts = periodShifts.filter(s => s.projectName !== 'Veikindi');
        const completedShifts = workShifts.length;
        const effectiveShiftCount = completedShifts + (isShiftActive ? 1 : 0);

        // Meðaltal/vakt = Total collected this month / Number of work shifts
        const avgPerShift = effectiveShiftCount > 0 ? periodTotalSales / effectiveShiftCount : 0;
        const projected = avgPerShift * 20;

        return {
            total: periodTotalSales,
            count: effectiveShiftCount,
            average: avgPerShift,
            projected,
            progress: Math.min(100, (periodTotalSales / goals.monthly) * 100)
        };
    }, [periodShifts, isShiftActive, goals.monthly]);

    const chartData = useMemo(() => {
        const salesByDate: Record<string, number> = {};
        periodShifts.forEach(s => {
            const d = s.date.split('T')[0];
            salesByDate[d] = (salesByDate[d] || 0) + s.totalSales;
        });
        const sortedDates = Object.keys(salesByDate).sort();
        let cumulative = 0;
        const points = sortedDates.map(date => {
            cumulative += salesByDate[date];
            return { date, value: cumulative, daily: salesByDate[date] };
        });
        if (points.length === 0) return { points: [], svgPath: "", fillPath: "", max: goals.monthly, bestDay: 0 };
        const maxVal = Math.max(goals.monthly, cumulative * 1.1);
        const bestDay = Math.max(...points.map(p => p.daily));
        return { points, svgPath: "", fillPath: "", max: maxVal, bestDay };
    }, [periodShifts, goals.monthly]);

    const handleStart = () => {
        const g = prompt("Dagsmarkmið?", goals.daily.toString());
        onClockIn(g ? parseInt(g) : goals.daily);
    };

    const handleStop = () => {
        if (!confirm("Ertu viss um að þú viljir skrá þig út?")) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const end = new Date();
        if (!clockInTime) return;

        const diffHours = (end.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        let day = diffHours;
        let evening = 0;

        if (end.getHours() >= 17 && end.getDay() !== 0 && end.getDay() !== 6) {
            const eveningPart = Math.max(0, end.getHours() - 17 + (end.getMinutes() / 60));
            evening = Math.min(diffHours, eveningPart);
            day = diffHours - evening;
        } else if (end.getDay() === 0 || end.getDay() === 6) {
            evening = diffHours;
            day = 0;
        }

        onClockOut({
            id: Math.random().toString(36).substr(2, 9),
            date: todayStr,
            dayHours: parseFloat(day.toFixed(2)),
            eveningHours: parseFloat(evening.toFixed(2)),
            totalSales: salesToday,
            notes: '',
            projectName: 'Other',
            userId: ''
        });
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header with shift controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Mælaborð</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>

                <div className="flex items-center gap-4">
                    <AnimatePresence mode="wait">
                        {!isShiftActive ? (
                            <motion.button
                                key="start"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onClick={handleStart}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl flex items-center gap-3 text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                                <Play size={20} fill="currentColor" />
                                <span className="font-black uppercase tracking-widest text-sm">Byrja Vakt</span>
                            </motion.button>
                        ) : (
                            <motion.div key="active" className="flex items-center gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-2xl flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tími</p>
                                        <p className="text-xl font-black text-white font-mono">{timerStr}</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sala í dag</p>
                                        <p className="text-xl font-black text-emerald-400">{formatISK(salesToday)}</p>
                                    </div>
                                </div>
                                <button onClick={onAddClick} className="p-3 bg-indigo-500 rounded-2xl text-white hover:scale-110 transition-transform shadow-lg" title="Skrá Sölu">
                                    <DollarSign size={20} />
                                </button>
                                <button onClick={handleStop} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg" title="Hætta">
                                    <StopCircle size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-[40px] border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-lg">
                                {metrics.progress.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Heildartekjur</p>
                        <h3 className="text-4xl font-black text-white mb-1"><NumberTicker value={metrics.total} /></h3>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${metrics.progress}%` }} />
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-[40px] border-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                    <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 w-fit">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Meðaltal/vakt</p>
                        <h3 className="text-4xl font-black text-emerald-400"><NumberTicker value={metrics.average} /></h3>
                        <p className="text-xs text-slate-400 mt-3 font-bold">{metrics.count} vaktir í tímabilinu</p>
                    </div>
                </div>

                <div className="glass p-8 rounded-[40px] border-violet-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-24 bg-violet-500/10 blur-[60px] rounded-full group-hover:bg-violet-500/20 transition-all" />
                    <div className="relative z-10">
                        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 mb-4 w-fit">
                            <Target size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Spáð lokasala</p>
                        <h3 className="text-4xl font-black text-violet-400"><NumberTicker value={metrics.projected} /></h3>
                        <div className="flex gap-3 mt-3">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Spáð lokasölu</span>
                                <span className="text-sm font-black text-violet-300">{formatISK(metrics.projected)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Horizontal Progress Bar Chart */}
            <div className="glass p-8 rounded-[48px] border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={20} /> Framvinda mánaðarins
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Besta vaktin</p>
                                <p className="text-lg font-black text-emerald-400">{formatISK(chartData.bestDay)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-baseline mb-3">
                                <span className="text-sm font-black text-white">Núverandi staða</span>
                                <span className="text-2xl font-black text-indigo-400">{formatISK(metrics.total)}</span>
                            </div>
                            <div className="h-8 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-emerald-500/50 z-10"
                                    style={{ left: '100%' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                                        Markmið
                                    </div>
                                </div>

                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative overflow-hidden"
                                    style={{ width: `${metrics.progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" style={{ animation: 'shimmer 3s infinite' }} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-slate-400 font-bold">{metrics.progress.toFixed(1)}% af markmiði</span>
                                <span className="text-xs text-slate-400 font-bold">{formatISK(goals.monthly - metrics.total)} eftir</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass p-4 rounded-2xl border-indigo-500/10">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vaktir</p>
                                <p className="text-2xl font-black text-white">{metrics.count}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">af 20 áætluðum</p>
                            </div>
                            <div className="glass p-4 rounded-2xl border-emerald-500/10">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Meðaltal/vakt</p>
                                <p className="text-2xl font-black text-emerald-400">{formatISK(metrics.average)}</p>
                            </div>
                            <div className="glass p-4 rounded-2xl border-violet-500/10">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Spáð lokasala</p>
                                <p className="text-2xl font-black text-violet-400">{formatISK(metrics.projected)}</p>
                                <p className={`text-[10px] font-bold mt-1 ${metrics.projected >= goals.monthly ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {metrics.projected >= goals.monthly ? '✓ Á réttri leið' : '⚠ Þarfnast aukinnar vinnu'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            </div>

            {/* AI Insights */}
            {aiData && (
                <div className="glass p-8 rounded-[40px] border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">MorriAI Greining</h3>
                    </div>
                    <p className="text-lg font-bold text-white mb-2">{aiData.smartAdvice}</p>
                    <p className="text-sm text-slate-400 italic">"{aiData.motivationalQuote}"</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
