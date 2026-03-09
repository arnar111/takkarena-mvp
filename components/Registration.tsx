import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shift, Sale, Goals, Level, User, Battle } from '../types';
import { useProjects } from '../hooks/useProjects.ts';
import { LEVELS } from '../utils/gamification.ts';
import { getRoundedTime, calculateShiftSplit } from '../utils/time.ts';
// Static Import for stability
import { getWingmanMessage } from '../geminiService.ts';
import BountyCard from './gamification/BountyCard.tsx';
import { Bounty } from '../utils/bounties.ts';
import LevelProgress from './gamification/LevelProgress.tsx';
import NumberTicker from './NumberTicker.tsx';
import DailySummaryModal from './DailySummaryModal.tsx';
import {
    ShoppingBag,
    TrendingUp,
    Clock,
    LogIn,
    LogOut,
    CheckCircle2,
    Sparkles,
    Target,
    X,
    Edit2,
    Trash2,
    UserPlus,
    TrendingUp as TrendingUpIcon,
    Plus,
    Minus,
    AlertTriangle,
    Ghost,
    Zap,
    Coffee,
    Timer,
    Swords
} from 'lucide-react';

interface RegistrationProps {
    onSaveShift: (shift: Shift) => void;
    onSaveSale: (sale: Sale) => void;
    onDeleteSale: (saleId: string) => void;
    onUpdateSale: (sale: Sale) => void;
    currentSales: Sale[];
    shifts: Shift[];
    editingShift: Shift | null;
    onUpdateShift?: (shift: Shift) => void;
    onClearEditingShift?: () => void;
    goals: Goals;
    onUpdateGoals: (g: Goals) => void;
    userRole: string;
    userId: string;
    dailyBounties?: Bounty[];
    claimedBountyIds?: string[];
    onClaimBounty?: (bountyId: string, coins: number) => void;
    onReplaceBounty?: (oldBountyId: string, newBounty: Bounty) => void;
    onRefreshBounties?: () => void;  // Add new context-aware bounties
    coachPersonality?: string;

    // --- New Props from App.tsx ---
    onTabChange?: (tab: string) => void;
    requireOFCheck?: boolean;
    autoPausesEnabled?: boolean;
    user?: User;
    activeBattle?: Battle | null;

    // Global Shift Props
    isShiftActive: boolean;
    clockInTime: Date | null;
    onClockIn: (goal: number) => void;
    onClockOut: (shiftData: any) => void;

    // Persisted State Props (survives tab switching)
    persistedSaleType: 'new' | 'upgrade';
    onSaleTypeChange: (type: 'new' | 'upgrade') => void;
    persistedSaleData: { amount: number; project: string };
    onSaleDataChange: (data: { amount: number; project: string }) => void;
    persistedBreakMinutes: number;
    onBreakMinutesChange: (mins: number) => void;
    persistedBreakEndTime: Date | null;
    onBreakEndTimeChange: (time: Date | null) => void;
    persistedOfChecked: boolean;
    onOfCheckedChange: (checked: boolean) => void;
}

const Registration: React.FC<RegistrationProps> = ({
    onSaveShift, onSaveSale, onDeleteSale, onUpdateSale, currentSales, shifts, editingShift, onUpdateShift, onClearEditingShift, goals, onUpdateGoals, userRole, userId, dailyBounties, claimedBountyIds, onClaimBounty, onReplaceBounty, onRefreshBounties, coachPersonality = "standard",
    isShiftActive, clockInTime, onClockIn, onClockOut, onTabChange, requireOFCheck, autoPausesEnabled, user, activeBattle,
    persistedSaleType, onSaleTypeChange, persistedSaleData, onSaleDataChange, persistedBreakMinutes, onBreakMinutesChange, persistedBreakEndTime, onBreakEndTimeChange, persistedOfChecked, onOfCheckedChange
}) => {
    // --- Firestore Projects Hook ---
    const { projects } = useProjects();

    const [now, setNow] = useState(new Date());
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    // --- GAMIFICATION STATE ---
    const [showConfetti, setShowConfetti] = useState(false);
    const [showInterceptor, setShowInterceptor] = useState(false);
    const [interceptorMsg, setInterceptorMsg] = useState("");

    // Goal Input Modal State
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [tempGoal, setTempGoal] = useState(goals.daily.toString());

    // Editing Sale State
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [editAmount, setEditAmount] = useState(0);
    const [editProject, setEditProject] = useState('');
    const [editType, setEditType] = useState<'new' | 'upgrade'>('new');

    // Editing Shift State
    const [editShiftDayHours, setEditShiftDayHours] = useState(0);
    const [editShiftEveningHours, setEditShiftEveningHours] = useState(0);
    const [editShiftTotalSales, setEditShiftTotalSales] = useState(0);
    const [editShiftNotes, setEditShiftNotes] = useState('');

    // Live Hours State
    const [liveHours, setLiveHours] = useState({ day: 0, evening: 0 });
    const [activeHours, setActiveHours] = useState({ day: 0, evening: 0 });

    // --- Break State (persisted from App.tsx) ---
    const breakMinutes = persistedBreakMinutes;
    const setBreakMinutes = onBreakMinutesChange;
    const breakEndTime = persistedBreakEndTime;
    const setBreakEndTime = onBreakEndTimeChange;
    const [breakTimeLeft, setBreakTimeLeft] = useState<string>("");

    // New Sale State (persisted from App.tsx)
    const saleType = persistedSaleType;
    const setSaleType = onSaleTypeChange;
    const saleData = persistedSaleData;
    const setSaleData = onSaleDataChange;

    // --- OF Check State (persisted from App.tsx) ---
    const ofChecked = persistedOfChecked;
    const setOfChecked = onOfCheckedChange;

    // Daily Summary Modal State
    const [showDailySummary, setShowDailySummary] = useState(false);
    const [dailySummaryData, setDailySummaryData] = useState<any>(null);

    // --- WINGMAN LOGIC ---
    const [wingmanMsg, setWingmanMsg] = useState<string | null>(null);
    const [isWingmanLoading, setIsWingmanLoading] = useState(false);

    // Helper to fetch wingman message
    const fetchWingmanMessage = useCallback(async (manual: boolean = false) => {
        if (!manual && Math.random() > 0.15) return;

        console.log("⚡ Fetching Wingman Message...");
        setIsWingmanLoading(true);

        try {
            const sortedSales = [...currentSales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const lastSale = sortedSales.length > 0 ? new Date(sortedSales[0].timestamp) : new Date();
            const minutesSince = Math.floor((new Date().getTime() - lastSale.getTime()) / 60000);

            const msg = await getWingmanMessage(minutesSince, coachPersonality || 'standard');
            setWingmanMsg(msg);
        } catch (e) {
            setWingmanMsg("Áfram gakk! Þú tekur næsta.");
        } finally {
            setIsWingmanLoading(false);
        }
    }, [currentSales, coachPersonality]);

    // --- Initial Load ---
    useEffect(() => {
        setTempGoal(goals.daily.toString());
    }, [goals.daily]);

    useEffect(() => {
        if (editingSale) {
            setEditAmount(editingSale.amount);
            setEditProject(editingSale.project);
            setEditType(editingSale.saleType || 'new');
        }
    }, [editingSale]);

    // Initialize shift edit form when editingShift changes
    useEffect(() => {
        if (editingShift) {
            setEditShiftDayHours(editingShift.dayHours);
            setEditShiftEveningHours(editingShift.eveningHours);
            setEditShiftTotalSales(editingShift.totalSales);
            setEditShiftNotes(editingShift.notes || '');
        }
    }, [editingShift]);

    // --- Live Timer ---
    useEffect(() => {
        const updateTime = () => {
            const current = new Date();
            setNow(current);

            if (isShiftActive && clockInTime) {
                const roundedNow = getRoundedTime(current);
                const roundedStart = getRoundedTime(clockInTime);
                setLiveHours(calculateShiftSplit(roundedStart, roundedNow, 0));
                setActiveHours(calculateShiftSplit(roundedStart, roundedNow, breakMinutes));
                if (!wingmanMsg) fetchWingmanMessage(false);
            } else {
                setLiveHours({ day: 0, evening: 0 });
                setActiveHours({ day: 0, evening: 0 });
            }
        };

        updateTime();
        const timer = setInterval(updateTime, 30000);
        return () => clearInterval(timer);
    }, [isShiftActive, clockInTime, breakMinutes, fetchWingmanMessage, wingmanMsg]);

    // --- Break Countdown ---
    useEffect(() => {
        if (!breakEndTime) {
            setBreakTimeLeft("");
            return;
        }
        const updateBreakTimer = () => {
            const diff = breakEndTime.getTime() - new Date().getTime();
            if (diff <= 0) {
                setBreakEndTime(null);
                setBreakTimeLeft("");
                setNotification({ msg: "Pása búin! Áfram gakk! 🚀", type: 'success' });
                return;
            }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setBreakTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
        };
        updateBreakTimer();
        const interval = setInterval(updateBreakTimer, 1000);
        return () => clearInterval(interval);
    }, [breakEndTime]);

    // --- Notification Auto-Dismiss ---
    useEffect(() => {
        if (notification) {
            const notifTimer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(notifTimer);
        }
    }, [notification]);

    // --- Metrics ---
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = useMemo(() => currentSales.filter(s => s.date === todayStr), [currentSales, todayStr]);
    const totalSalesToday = useMemo(() => todaySales.reduce((acc, s) => acc + s.amount, 0), [todaySales]);
    const newSalesCount = useMemo(() => todaySales.filter(s => s.saleType !== 'upgrade').length, [todaySales]);

    const { avgSalesPerHour: historicalAvgSpeed, avgShiftLength } = useMemo(() => {
        if (shifts.length === 0) return { avgSalesPerHour: 0, avgShiftLength: 4 };
        const totalHistorySales = shifts.reduce((acc, s) => acc + s.totalSales, 0);
        const totalHistoryHours = shifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0);
        const avgSpeed = totalHistoryHours > 0 ? totalHistorySales / totalHistoryHours : 0;
        const avgLen = totalHistoryHours / shifts.length;
        return { avgSalesPerHour: avgSpeed, avgShiftLength: avgLen };
    }, [shifts]);

    const activeDuration = activeHours.day + activeHours.evening;
    const currentSpeed = useMemo(() => {
        if (activeDuration < 0.1) return 0;
        return totalSalesToday / activeDuration;
    }, [totalSalesToday, activeDuration]);

    const displayedAverage = (isShiftActive && activeDuration > 0.25) ? currentSpeed : historicalAvgSpeed;
    const paidDuration = liveHours.day + liveHours.evening;
    const hoursRemaining = Math.max(0, avgShiftLength - paidDuration);
    // Use paidDuration for projection speed since breaks are paid time
    const paidSpeed = paidDuration > 0.25 ? totalSalesToday / paidDuration : historicalAvgSpeed;
    const projectionSpeed = (isShiftActive && paidDuration > 0.25 && paidSpeed > 0) ? paidSpeed : historicalAvgSpeed;
    const rawProjection = totalSalesToday + (projectionSpeed * hoursRemaining);
    const projectedFinal = Math.round(rawProjection / 100) * 100;

    const ghostTarget = historicalAvgSpeed * activeDuration;
    const isWinningGhost = totalSalesToday > ghostTarget;

    const currentStreak = useMemo(() => {
        const uniqueDates = Array.from(new Set(shifts.map(s => s.date))).sort().reverse();
        let streak = 0;
        if (uniqueDates.length > 0) streak = uniqueDates.length > 5 ? 5 : uniqueDates.length;
        return Math.max(1, streak);
    }, [shifts]);

    const currentLevel = LEVELS.find(l => totalSalesToday >= l.min && totalSalesToday < l.max) || LEVELS[LEVELS.length - 1];
    const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1);
    const distToNextLevel = nextLevel ? nextLevel.min - totalSalesToday : 0;

    // --- Bounty completion detection ---
    const upgradesCount = useMemo(() => todaySales.filter(s => s.saleType === 'upgrade').length, [todaySales]);

    const completedBountyIds = useMemo(() => {
        if (!dailyBounties) return [];

        const hourlyRate = activeDuration > 0 ? totalSalesToday / activeDuration : 0;

        return dailyBounties.filter(b => {
            switch (b.checkType) {
                case 'sales_amount':
                    return totalSalesToday >= b.threshold;
                case 'sales_count':
                    return todaySales.length >= b.threshold;
                case 'new_sales_count':
                    return newSalesCount >= b.threshold;
                case 'upgrade_count':
                    return upgradesCount >= b.threshold;
                case 'single_sale':
                    return todaySales.some(s => s.amount >= b.threshold);
                case 'hourly_rate':
                    return hourlyRate >= b.threshold;
                default:
                    return false;
            }
        }).map(b => b.id);
    }, [dailyBounties, totalSalesToday, todaySales, newSalesCount, upgradesCount, activeDuration]);

    // --- Actions ---
    const handleClockClick = () => {
        if (isShiftActive && clockInTime) {
            if (nextLevel && distToNextLevel > 0 && distToNextLevel <= 2000) {
                setInterceptorMsg(`Bíddu! Þú ert aðeins ${formatISK(distToNextLevel)} frá því að ná ${nextLevel.title}! Eina sölu í viðbót?`);
                setShowInterceptor(true);
                return;
            }
            const remainder = totalSalesToday % 10000;
            if (remainder >= 8000 && totalSalesToday > 0) {
                const distToRound = 10000 - remainder;
                setInterceptorMsg(`Vá, þú ert næstum komin í ${formatISK(totalSalesToday + distToRound)}! Aðeins ${formatISK(distToRound)} í viðbót.`);
                setShowInterceptor(true);
                return;
            }
            processClockOut();
        } else {
            setShowGoalInput(true);
        }
    };

    const confirmClockIn = () => {
        const newGoal = parseInt(tempGoal) || goals.daily;
        onUpdateGoals({ ...goals, daily: newGoal });
        onClockIn(newGoal);
        setNotification({ msg: `Markmið sett: ${formatISK(newGoal)}. Gangi þér vel!`, type: 'success' });
        setShowGoalInput(false);
        setLiveHours({ day: 0, evening: 0 });
        setActiveHours({ day: 0, evening: 0 });
        setBreakMinutes(0);
        setBreakEndTime(null);
        fetchWingmanMessage(true);
    };

    const processClockOut = () => {
        if (!clockInTime) return;
        const endTime = getRoundedTime(new Date());
        const startTime = getRoundedTime(clockInTime);
        const finalHours = calculateShiftSplit(startTime, endTime, 0);
        const hoursWorked = liveHours.day + liveHours.evening;

        // Use shift start date for sales calculation (fixes next-day logout bug)
        const shiftDateStr = startTime.toISOString().split('T')[0];
        const shiftSales = currentSales.filter(s => s.date === shiftDateStr);
        const totalShiftSales = shiftSales.reduce((acc, s) => acc + s.amount, 0);
        const avgPerSale = shiftSales.length > 0 ? totalShiftSales / shiftSales.length : 0;

        setDailySummaryData({
            totalSales: totalShiftSales,
            numberOfSales: shiftSales.length,
            avgPerSale: avgPerSale,
            avgPerHour: hoursWorked > 0 ? totalShiftSales / hoursWorked : 0,
            hoursWorked: hoursWorked,
            goal: goals.daily,
            level: currentLevel.title,
            badgesEarned: [],
            bountiesCompleted: claimedBountyIds?.length || 0
        });

        onClockOut({
            id: Math.random().toString(36).substr(2, 9),
            date: shiftDateStr,
            dayHours: parseFloat(finalHours.day.toFixed(2)),
            eveningHours: parseFloat(finalHours.evening.toFixed(2)),
            totalSales: totalShiftSales,
            notes: '',
            projectName: 'Other',
            userId: ''
        });

        setShowInterceptor(false);
        setLiveHours({ day: 0, evening: 0 });
        setBreakMinutes(0);
        setBreakEndTime(null);
        setBreakTimeLeft("");
        setNotification({ msg: `Vakt vistuð! (${hoursWorked.toFixed(2)} klst)`, type: 'success' });
        setShowDailySummary(true);
    };

    const addBreak = (minutes: number) => {
        setBreakMinutes(breakMinutes + minutes);
        const end = new Date(new Date().getTime() + minutes * 60 * 1000);
        setBreakEndTime(end);
        setNotification({ msg: `Skráð ${minutes} mín pása.`, type: 'info' });
    };

    const cancelBreakTimer = () => {
        setBreakEndTime(null);
        setBreakTimeLeft("");
    };

    const handleAddSale = (e: React.FormEvent) => {
        e.preventDefault();

        if (requireOFCheck && !ofChecked) {
            setNotification({ msg: "Vinsamlegast staðfestu OF skráningu!", type: 'info' });
            return;
        }

        if (saleData.amount <= 0) return;

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);

        onSaveSale({
            id: Math.random().toString(36).substr(2, 9),
            date: todayStr,
            timestamp: new Date().toISOString(),
            amount: saleData.amount,
            project: saleData.project,
            saleType: saleType,
            userId: ''
        });
        setSaleData({ ...saleData, amount: 0 });
        setOfChecked(false);
        setNotification({ msg: "Sölu bætt við!", type: 'success' });
        setWingmanMsg(null);
    };

    const handleUpdate = () => {
        if (editingSale && editAmount > 0) {
            onUpdateSale({
                ...editingSale,
                amount: editAmount,
                project: editProject,
                saleType: editType
            });
            setEditingSale(null);
            setNotification({ msg: "Færsla uppfærð!", type: 'success' });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Ertu viss um að þú viljir eyða þessari færslu?")) {
            onDeleteSale(id);
            setNotification({ msg: "Færslu eytt.", type: 'info' });
        }
    };

    const handleUpdateShift = () => {
        if (editingShift && onUpdateShift) {
            onUpdateShift({
                ...editingShift,
                dayHours: editShiftDayHours,
                eveningHours: editShiftEveningHours,
                totalSales: editShiftTotalSales,
                notes: editShiftNotes
            });
            onClearEditingShift?.();
            setNotification({ msg: "Vakt uppfærð!", type: 'success' });
        }
    };

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));

    const isMobile = window.innerWidth < 1024;

    const renderBreakControls = () => {
        if (!isShiftActive || autoPausesEnabled === false) return null;

        if (breakEndTime) {
            return (
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 px-4 py-3 rounded-[24px] animate-pulse">
                    <Coffee size={18} className="text-amber-400" />
                    <span className="text-amber-400 font-black text-sm tabular-nums tracking-widest">{breakTimeLeft}</span>
                    <button onClick={cancelBreakTimer} className="ml-2 hover:bg-white/10 rounded-full p-1"><X size={14} className="text-amber-400/50 hover:text-amber-400" /></button>
                </div>
            );
        }

        return (
            <>
                <button onClick={() => addBreak(15)} className="px-4 py-4 rounded-[24px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
                    <Coffee size={16} /> 15m
                </button>
                <button onClick={() => addBreak(30)} className="px-4 py-4 rounded-[24px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
                    <Timer size={16} /> 30m
                </button>
            </>
        );
    };

    const renderWingman = () => (
        <div className="glass p-5 rounded-[32px] bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/30 flex items-center gap-4 relative overflow-hidden animate-in slide-in-from-right-8 duration-500 mb-6">
            <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-violet-500/20 blur-[40px] rounded-full pointer-events-none" />
            <button
                onClick={() => fetchWingmanMessage(true)}
                disabled={isWingmanLoading}
                className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all z-10"
            >
                <Zap size={24} fill="currentColor" className={isWingmanLoading ? "animate-spin" : ""} />
            </button>
            <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">MorriAI Wingman</p>
                <p className="text-sm font-bold text-white italic leading-relaxed">
                    {isWingmanLoading ? "Hleður..." : (wingmanMsg || "Smelltu á eldinguna fyrir ráð! ⚡")}
                </p>
            </div>
            {wingmanMsg && (
                <button onClick={() => setWingmanMsg(null)} className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors"><X size={16} /></button>
            )}
        </div>
    );

    // --- Active Battle Card - COMPACT BANNER STYLE ---
    const renderActiveBattleCard = () => {
        if (!activeBattle) return null;

        // Don't show if battle has ended
        const battleEndTime = new Date(activeBattle.endTime).getTime();
        if (battleEndTime <= now.getTime()) return null;

        const myData = activeBattle.participants.find(p => p.userId === userId);
        const opponentData = activeBattle.participants.find(p => p.userId !== userId);

        if (!myData || !opponentData) return null;

        // Calculate who's winning
        const myTotal = myData.currentSales;
        const oppTotal = opponentData.currentSales;
        const isWinning = myTotal > oppTotal;
        const isTied = myTotal === oppTotal;
        const leadAmount = Math.abs(myTotal - oppTotal);

        // Time remaining
        const endTime = new Date(activeBattle.endTime).getTime();
        const timeLeft = Math.max(0, endTime - now.getTime());
        const minsLeft = Math.floor(timeLeft / 60000);
        const secsLeft = Math.floor((timeLeft % 60000) / 1000);
        const timeStr = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;
        const isUrgent = minsLeft < 10;

        // Status color
        const statusColor = isWinning ? 'emerald' : isTied ? 'amber' : 'rose';

        return (
            <div
                onClick={() => onTabChange && onTabChange('competitions')}
                className={`cursor-pointer glass rounded-2xl p-4 mb-6 border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
                    ${isWinning ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/5' :
                        isTied ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5' :
                            'border-rose-500/50 bg-gradient-to-r from-rose-500/10 via-transparent to-rose-500/5'}`}
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Live indicator + VS info */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 p-2 rounded-xl text-white shadow-lg
                            ${isWinning ? 'bg-emerald-500' : isTied ? 'bg-amber-500' : 'bg-rose-500'}`}>
                            <Swords size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse flex-shrink-0" />
                                <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Live</span>
                            </div>
                            <p className="text-sm font-bold text-white truncate">vs {opponentData.name}</p>
                        </div>
                    </div>

                    {/* Center: Score comparison */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Þú</p>
                            <p className="text-lg font-black text-white">{formatISK(myTotal)}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black
                            ${isWinning ? 'bg-emerald-500 text-white' : isTied ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'}`}>
                            VS
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{opponentData.name.split(' ')[0]}</p>
                            <p className="text-lg font-black text-white">{formatISK(oppTotal)}</p>
                        </div>
                    </div>

                    {/* Right: Status + Timer */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Lead/deficit badge */}
                        <div className={`hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1
                            ${isWinning ? 'bg-emerald-500/20 text-emerald-400' :
                                isTied ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-rose-500/20 text-rose-400'}`}>
                            {isWinning ? '🏆' : isTied ? '⚔️' : '⚡'}
                            <span>{isWinning ? `+${formatISK(leadAmount)}` : isTied ? 'Jafnt' : `-${formatISK(leadAmount)}`}</span>
                        </div>

                        {/* Timer */}
                        <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-black flex items-center gap-1.5
                            ${isUrgent ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-black/30 text-white'}`}>
                            <Timer size={14} />
                            {timeStr}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <div className="pb-32 space-y-6">
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-[500] flex items-center justify-center overflow-hidden">
                        <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ top: '40%', left: '50%' }} />
                        <div className="absolute w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ top: '60%', left: '30%' }} />
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Söluskráning</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase">{todaySales.length} færslur í dag</p>
                    </div>
                </div>

                {/* METRICS - First priority */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="glass p-4 rounded-2xl border-indigo-500/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Heildarsala</p>
                        <p className="text-xl font-black text-white"><NumberTicker value={totalSalesToday} /></p>
                    </div>
                    <div className="glass p-4 rounded-2xl border-amber-500/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Meðalsala</p>
                        <p className="text-xl font-black text-amber-400"><NumberTicker value={todaySales.length > 0 ? Math.round(totalSalesToday / todaySales.length) : 0} /></p>
                    </div>
                    <div className="glass p-4 rounded-2xl border-emerald-500/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Meðal/klst</p>
                        <p className="text-xl font-black text-emerald-400"><NumberTicker value={displayedAverage} /></p>
                    </div>
                    <div className="glass p-4 rounded-2xl border-violet-500/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fjöldi</p>
                        <p className="text-xl font-black text-violet-400">{todaySales.length}</p>
                    </div>
                </div>

                {/* SALES REGISTRATION CARD - Second priority */}
                <div className={`glass p-6 rounded-[32px] border-indigo-500/20 shadow-2xl relative overflow-hidden mb-6 ${currentStreak > 3 ? 'border-amber-500/50 shadow-amber-500/20' : ''}`}>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
                        {projects.map(p => (
                            <button key={p} onClick={() => setSaleData({ ...saleData, project: p })} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${saleData.project === p ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                        <button onClick={() => setSaleType('new')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${saleType === 'new' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                            Nýr
                        </button>
                        <button onClick={() => setSaleType('upgrade')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${saleType === 'upgrade' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                            Hækkun
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <button onClick={() => setSaleData({ ...saleData, amount: Math.max(0, saleData.amount - 500) })} className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all border border-white/5">
                            <Minus size={24} />
                        </button>
                        <div className="text-center">
                            <span className="text-4xl font-black text-white tracking-tighter">{saleData.amount}</span>
                            <span className="text-xs font-bold text-slate-500 block uppercase">Krónur</span>
                        </div>
                        <button onClick={() => setSaleData({ ...saleData, amount: saleData.amount + 500 })} className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all border border-white/5">
                            <Plus size={24} />
                        </button>
                    </div>

                    {/* --- OF CHECKBOX (MOBILE) --- */}
                    {requireOFCheck && (
                        <div onClick={() => setOfChecked(!ofChecked)} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all mb-4">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${ofChecked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'}`}>
                                {ofChecked && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold text-white">Búið að skrá í OF?</span>
                        </div>
                    )}

                    <button onClick={handleAddSale} className="w-full py-4 gradient-bg rounded-2xl text-white font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        Staðfesta Sölu
                    </button>
                </div>

                {/* BOUNTIES, LEVEL, WINGMAN - After sales card */}
                {dailyBounties && dailyBounties.length > 0 && onClaimBounty && onReplaceBounty && (
                    <BountyCard
                        bounties={dailyBounties}
                        completedIds={completedBountyIds}
                        onClaimBounty={onClaimBounty}
                        onReplaceBounty={onReplaceBounty}
                        onRefreshBounties={onRefreshBounties}
                    />
                )}

                {isShiftActive && renderWingman()}

                <LevelProgress currentLevel={currentLevel} nextLevel={nextLevel} currentAmount={totalSalesToday} />

                <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Nýlegt</h4>
                    {[...todaySales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(s => (
                        <div key={s.id} className="glass p-4 rounded-2xl border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${s.saleType === 'upgrade' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                <div>
                                    <p className="font-bold text-white text-sm">{s.project}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-white">{formatISK(s.amount)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ... (Modals) ... */}
                {showGoalInput && (
                    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl">
                        <div className="w-full max-w-sm">
                            <h3 className="text-2xl font-black text-white text-center mb-6">Dagsmarkmið?</h3>
                            <input type="number" value={tempGoal} onChange={e => setTempGoal(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-center text-white font-black text-3xl mb-6 outline-none focus:ring-2 focus:ring-emerald-500" />
                            <button onClick={confirmClockIn} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase">Byrja</button>
                        </div>
                    </div>
                )}

                {showInterceptor && (
                    <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl animate-in zoom-in-95">
                        <div className="w-full max-w-sm text-center">
                            <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto mb-6 text-amber-400 animate-bounce">
                                <AlertTriangle size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">Bíddu aðeins!</h3>
                            <p className="text-lg font-bold text-slate-300 mb-8 leading-relaxed">{interceptorMsg}</p>
                            <div className="space-y-3">
                                <button onClick={() => setShowInterceptor(false)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl active:scale-95 transition-all">
                                    Ég tek eina í viðbót! 🚀
                                </button>
                                <button onClick={processClockOut} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-slate-400 font-bold uppercase text-xs">
                                    Nei, ég þarf að fara
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {notification && (
                    <div className="fixed bottom-24 left-4 right-4 bg-emerald-500 text-white p-4 rounded-2xl font-bold shadow-2xl text-center z-[100] animate-in slide-in-from-bottom-4">
                        {notification.msg}
                    </div>
                )}

                {/* Daily Summary Modal */}
                {showDailySummary && dailySummaryData && (
                    <DailySummaryModal
                        visible={showDailySummary}
                        onClose={() => setShowDailySummary(false)}
                        totalSales={dailySummaryData.totalSales}
                        numberOfSales={dailySummaryData.numberOfSales}
                        avgPerSale={dailySummaryData.avgPerSale}
                        avgPerHour={dailySummaryData.avgPerHour}
                        hoursWorked={dailySummaryData.hoursWorked}
                        goal={dailySummaryData.goal}
                        level={dailySummaryData.level}
                        badgesEarned={dailySummaryData.badgesEarned}
                        bountiesCompleted={dailySummaryData.bountiesCompleted}
                    />
                )}
            </div>
        );
    }

    // --- DESKTOP RENDER ---
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 relative animate-in fade-in duration-500">

            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-[500] flex items-center justify-center overflow-hidden">
                    <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ top: '40%', left: '50%' }} />
                </div>
            )}

            {/* ... (Interceptor, Goal, Editing Modals same as above) ... */}
            {showInterceptor && (
                <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl animate-in zoom-in-95">
                    <div className="w-full max-w-sm text-center">
                        <div className="p-4 bg-amber-500/20 rounded-full w-fit mx-auto mb-6 text-amber-400 animate-bounce">
                            <AlertTriangle size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">Bíddu aðeins!</h3>
                        <p className="text-lg font-bold text-slate-300 mb-8 leading-relaxed">{interceptorMsg}</p>
                        <div className="space-y-3">
                            <button onClick={() => setShowInterceptor(false)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl active:scale-95 transition-all">
                                Ég tek eina í viðbót! 🚀
                            </button>
                            <button onClick={processClockOut} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-slate-400 font-bold uppercase text-xs">
                                Nei, ég þarf að fara
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showGoalInput && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass p-8 rounded-[40px] w-full max-w-sm border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative">
                        <button onClick={() => setShowGoalInput(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <div className="mb-6 flex justify-center"><div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400"><Target size={32} /></div></div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">Hvað er dagsmarkmiðið?</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Settu þér markmið og rústaðu því!</p>
                        <input type="number" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)} className="w-full bg-black/40 border border-emerald-500/30 p-4 rounded-2xl text-center text-3xl font-black text-white outline-none focus:ring-2 focus:ring-emerald-500 mb-6" autoFocus />
                        <button onClick={confirmClockIn} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl transition-all active:scale-95">Byrja Vakt</button>
                    </div>
                </div>
            )}

            {editingSale && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass p-8 rounded-[40px] w-full max-w-sm border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] relative">
                        <button onClick={() => setEditingSale(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h3 className="text-xl font-black text-white italic tracking-tighter mb-6 text-center">Breyta Færslu</h3>
                        <div className="space-y-4">
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-4">
                                <button onClick={() => setEditType('new')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${editType === 'new' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Nýr</button>
                                <button onClick={() => setEditType('upgrade')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${editType === 'upgrade' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Hækkun</button>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Upphæð</label>
                                <input type="number" value={editAmount} onChange={(e) => setEditAmount(parseInt(e.target.value) || 0)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-2xl font-black text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button onClick={handleUpdate} className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl transition-all active:scale-95 mt-4">Uppfæra</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Editing Modal */}
            {editingShift && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass p-8 rounded-[40px] w-full max-w-md border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative">
                        <button onClick={() => onClearEditingShift?.()} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>

                        <div className="mb-6 flex justify-center">
                            <div className="p-4 rounded-full bg-amber-500/20 text-amber-400">
                                <Edit2 size={32} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 text-center">Breyta Vakt</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 text-center">
                            {new Date(editingShift.date).toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Dagvinna (klst)</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={editShiftDayHours}
                                        onChange={(e) => setEditShiftDayHours(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xl font-black text-white outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Eftirvinna (klst)</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        value={editShiftEveningHours}
                                        onChange={(e) => setEditShiftEveningHours(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xl font-black text-white outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Heildarsala (ISK)</label>
                                <input
                                    type="number"
                                    value={editShiftTotalSales}
                                    onChange={(e) => setEditShiftTotalSales(parseInt(e.target.value) || 0)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-2xl font-black text-white outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Athugasemdir</label>
                                <textarea
                                    value={editShiftNotes}
                                    onChange={(e) => setEditShiftNotes(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium text-white outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                    placeholder="Athugasemdir um vaktina..."
                                />
                            </div>

                            <button
                                onClick={handleUpdateShift}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-slate-900 font-black uppercase text-sm shadow-xl transition-all active:scale-95 mt-4"
                            >
                                Vista Breytingar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-white' : 'bg-indigo-500/20 border-indigo-500/50 text-white'}`}>
                        <CheckCircle2 size={18} className={notification.type === 'success' ? "text-emerald-400" : "text-indigo-400"} />
                        <span className="font-bold text-sm">{notification.msg}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Skráning</h2>
                    <p className="text-slate-500 font-bold text-xs tracking-widest uppercase mt-1">
                        {isShiftActive ? 'Vakt í gangi - Gangi þér vel!' : 'Byrjaðu vaktina'}
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {renderBreakControls()}

                    <button onClick={handleClockClick} className={`flex-1 md:flex-none px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isShiftActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                        {isShiftActive ? <LogOut size={20} /> : <LogIn size={20} />}
                        {isShiftActive ? "Skrá út" : "Skrá inn"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div onClick={() => setExpandedMetric(expandedMetric === 'today' ? null : 'today')} className="glass p-5 rounded-[32px] border-indigo-500/10 cursor-pointer hover:bg-white/5 transition-all group">
                    <div className="flex justify-between items-start mb-1"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Heildarsala</p><div className="p-1 rounded-full bg-indigo-500/20 text-indigo-400"><Sparkles size={12} /></div></div>
                    <p className="text-xl font-black text-white"><NumberTicker value={totalSalesToday} /></p>
                </div>
                <div className="glass p-5 rounded-[32px] border-amber-500/10 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-1"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Meðalsala</p><div className="p-1 rounded-full bg-amber-500/20 text-amber-400"><TrendingUpIcon size={12} /></div></div>
                    <p className="text-xl font-black text-amber-400"><NumberTicker value={todaySales.length > 0 ? Math.round(totalSalesToday / todaySales.length) : 0} /></p>
                </div>
                <div className="glass p-5 rounded-[32px] border-emerald-500/10">
                    <div className="flex justify-between items-start mb-1"><p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Meðaltal / klst</p><div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"><TrendingUp size={12} /></div></div>
                    <p className="text-xl font-black text-emerald-400"><NumberTicker value={displayedAverage} /></p>
                </div>
                <div className="glass p-5 rounded-[32px] border-violet-500/10">
                    <div className="flex justify-between items-start mb-1"><p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Fjöldi sala</p><div className="p-1 rounded-full bg-violet-500/20 text-violet-400"><Target size={12} /></div></div>
                    <p className="text-xl font-black text-violet-400 mb-1">{todaySales.length}</p>
                </div>
                <div className="glass p-5 rounded-[32px] border-indigo-500/20">
                    <div className="flex justify-between items-start mb-1"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Áætluð lokasala</p></div>
                    <p className="text-xl font-black text-indigo-400"><NumberTicker value={projectedFinal} /></p>
                </div>
            </div>

            {/* LIVE BATTLE BANNER - Prominent position below metrics */}
            {renderActiveBattleCard()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">

                <div className="lg:col-span-2 glass p-8 md:p-10 rounded-[40px] border-white/10 flex flex-col shadow-2xl relative h-full">
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400"><ShoppingBag size={24} /></div>
                                <div><h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Skrá Sölu</h3></div>
                            </div>

                            {/* --- RE-ADDED TOGGLE BUTTONS (DESKTOP) --- */}
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
                                <button onClick={() => setSaleType('new')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${saleType === 'new' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <UserPlus size={14} /> Nýr
                                </button>
                                <button onClick={() => setSaleType('upgrade')} className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${saleType === 'upgrade' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                    <TrendingUpIcon size={14} /> Hækkun
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                            {projects.map(p => (
                                <button key={p} onClick={() => setSaleData({ ...saleData, project: p })} className={`p-4 rounded-2xl border text-[10px] font-black transition-all ${saleData.project === p ? 'gradient-bg text-white border-white/20 shadow-lg scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>{p}</button>
                            ))}
                        </div>
                        <form onSubmit={handleAddSale} className="relative max-w-2xl mx-auto">
                            <div className="flex items-center gap-4">
                                {/* Minus Button */}
                                <button
                                    type="button"
                                    onClick={() => setSaleData({ ...saleData, amount: Math.max(0, saleData.amount - 500) })}
                                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 flex-shrink-0"
                                >
                                    <Minus size={24} />
                                </button>

                                {/* Input Field */}
                                <div className="flex-1 relative">
                                    <input type="number" required placeholder="0 kr." value={saleData.amount || ''} onChange={e => setSaleData({ ...saleData, amount: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 p-8 rounded-[32px] text-5xl font-black text-white outline-none focus:ring-4 focus:ring-indigo-500/20 text-center placeholder:text-white/10" />
                                </div>

                                {/* Plus Button */}
                                <button
                                    type="button"
                                    onClick={() => setSaleData({ ...saleData, amount: saleData.amount + 500 })}
                                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 flex-shrink-0"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                            <button type="submit" className="w-full mt-4 py-4 gradient-bg rounded-[24px] text-white font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-all active:scale-95">Bæta við</button>
                        </form>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Nýlegar færslur í dag</h4>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {/* CHANGED: Sorted by timestamp descending to show newest first */}
                            {[...todaySales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(s => (
                                <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${s.saleType === 'upgrade' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                        <div className="flex flex-col"><span className="font-black text-white text-xs">{s.project}</span><span className="text-[9px] text-slate-500">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-white text-sm">{formatISK(s.amount)}</span>
                                            {s.saleType === 'upgrade' && <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Hækkun</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingSale(s)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-1 h-full">
                    {dailyBounties && dailyBounties.length > 0 && onClaimBounty && onReplaceBounty && (
                        <BountyCard
                            bounties={dailyBounties}
                            completedIds={completedBountyIds}
                            onClaimBounty={onClaimBounty}
                            onReplaceBounty={onReplaceBounty}
                            onRefreshBounties={onRefreshBounties}
                        />
                    )}

                    {/* Render Active Battle Card */}
                    {isShiftActive && renderActiveBattleCard()}

                    {/* Render Wingman */}
                    {isShiftActive && renderWingman()}

                    <LevelProgress currentLevel={currentLevel} nextLevel={nextLevel} currentAmount={totalSalesToday} />

                    <div className="glass p-6 rounded-[32px] border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Ghost size={24} className={isWinningGhost ? "text-emerald-400" : "text-rose-400"} />
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ghost Racer</p>
                                <p className={`text-lg font-black ${isWinningGhost ? "text-emerald-400" : "text-rose-400"}`}>
                                    {isWinningGhost ? `+${formatISK(totalSalesToday - ghostTarget)}` : `-${formatISK(ghostTarget - totalSalesToday)}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Summary Modal */}
            {showDailySummary && dailySummaryData && (
                <DailySummaryModal
                    visible={showDailySummary}
                    onClose={() => setShowDailySummary(false)}
                    totalSales={dailySummaryData.totalSales}
                    numberOfSales={dailySummaryData.numberOfSales}
                    avgPerSale={dailySummaryData.avgPerSale}
                    avgPerHour={dailySummaryData.avgPerHour}
                    hoursWorked={dailySummaryData.hoursWorked}
                    goal={dailySummaryData.goal}
                    level={dailySummaryData.level}
                    badgesEarned={dailySummaryData.badgesEarned}
                    bountiesCompleted={dailySummaryData.bountiesCompleted}
                />
            )}
        </div>
    );
};

export default Registration;
