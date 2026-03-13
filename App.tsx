import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useBattles } from './hooks/useBattles';
import { useUserConfig } from './hooks/useUserConfig';
import { useShiftClock } from './hooks/useShiftClock';
import { useSalesData } from './hooks/useSalesData';
import { useToast } from './components/Toast';
import { useAdminCheck } from './hooks/useAdminCheck';
import { useStreaks } from './hooks/useStreaks';
import { useSounds } from './hooks/useSounds';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import {
  LayoutDashboard,
  Menu,
  LogOut,
  Sparkle,
  BarChart4,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import { doc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from './firebase.ts';
import { calculateWageSummary } from './utils/calculations.ts';
import { Bounty, BountyStats, BountyContext, getDailyBounties, getReplacementBounty, getContextAwareBounties } from './utils/bounties.ts';
import { toggleMyTimePlanAttendance, parseMyTimePlanMessage } from './services/mytimeplanService.ts';

// Components
import Dashboard from './components/Dashboard.tsx';
import Registration from './components/Registration.tsx';
import Login from './components/Login.tsx';
import Admin from './components/Admin.tsx';
import MobileDock from './components/MobileDock.tsx';
import CompetitionsPage from './components/Competitions/CompetitionsPage.tsx';
import StatsView from './components/StatsView.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

const App: React.FC = () => {
  // --- HOOKS ---
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();

  const battleCallbacks = useMemo(() => ({
    onError: (msg: string) => showToast(msg, 'error'),
    onSuccess: (msg: string) => showToast(msg, 'success'),
  }), [showToast]);

  const {
    battles,
    createBattle,
    cancelBattle,
    getActiveBattleWithLiveScores
  } = useBattles(user?.staffId, battleCallbacks);

  const { isAdmin } = useAdminCheck(user);

  const {
    goals,
    wageSettings,
    requireOFCheck,
    autoPausesEnabled,
    coachPersonality,
    updateGoals,
    updateRequireOFCheck,
    updateAutoPausesEnabled,
    updateCoachPersonality
  } = useUserConfig(user?.staffId);

  const { isShiftActive, clockInTime, handleClockIn, handleClockOut } = useShiftClock();

  const {
    sales,
    allSales,
    shifts,
    allUsers,
    periodData
  } = useSalesData(user?.staffId);

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [logoError, setLogoError] = useState(false);

  // --- PERSISTED REGISTRATION STATE ---
  const [persistedSaleType, setPersistedSaleType] = useState<'new' | 'upgrade'>('new');
  const [persistedSaleData, setPersistedSaleData] = useState({ amount: 0, project: 'Einstaklingur' });
  const [persistedBreakMinutes, setPersistedBreakMinutes] = useState(0);
  const [persistedBreakEndTime, setPersistedBreakEndTime] = useState<Date | null>(null);
  const [persistedOfChecked, setPersistedOfChecked] = useState(false);

  const { currentStreak } = useStreaks(user?.staffId, sales);
  const { playSound } = useSounds();
  const { isOnline, pendingCount } = useOfflineQueue();

  // --- BOUNTY SYSTEM ---
  const [dailyBounties, setDailyBounties] = useState<Bounty[]>([]);
  const [claimedBountyIds, setClaimedBountyIds] = useState<string[]>([]);

  const bountyStats = useMemo((): BountyStats => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.date === todayStr);
    const totalAmount = todaySales.reduce((acc, s) => acc + s.amount, 0);
    const maxSale = todaySales.length > 0 ? Math.max(...todaySales.map(s => s.amount)) : 0;
    const newSales = todaySales.filter(s => s.saleType !== 'upgrade').length;
    const upgrades = todaySales.filter(s => s.saleType === 'upgrade').length;

    return {
      salesAmount: totalAmount,
      salesCount: todaySales.length,
      newSalesCount: newSales,
      upgradesCount: upgrades,
      maxSingleSale: maxSale,
      hourlyRate: 0
    };
  }, [sales]);

  useEffect(() => {
    if (dailyBounties.length === 0) {
      const bounties = getDailyBounties(5, bountyStats);
      setDailyBounties(bounties);
      setClaimedBountyIds([]);
    }
  }, [bountyStats, dailyBounties.length]);

  const handleClaimBounty = useCallback((bountyId: string, coins: number) => {
    setClaimedBountyIds(prev => [...prev, bountyId]);
    showToast(`+${coins} mynt! 🪙`, 'success');
    playSound('coin');
  }, [showToast, playSound]);

  const handleReplaceBounty = useCallback((oldId: string, newBounty: Bounty) => {
    const currentIds = dailyBounties.map(b => b.id);
    const replacement = getReplacementBounty(currentIds, newBounty.difficulty, bountyStats);
    setDailyBounties(prev => prev.map(b => b.id === oldId ? replacement : b));
  }, [dailyBounties, bountyStats]);

  const handleRefreshBounties = useCallback(() => {
    const context: BountyContext = {
      saleType: persistedSaleType,
      currentHour: new Date().getHours(),
      stats: bountyStats,
      excludeIds: []
    };
    const newBounties = getContextAwareBounties(5, context);
    setDailyBounties(newBounties);
    setClaimedBountyIds([]);
    showToast(`5 ný verkefni! 🎯`, 'success');
  }, [persistedSaleType, bountyStats, showToast]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- COMPUTED VALUES ---
  const summary = useMemo(() =>
    calculateWageSummary(periodData.filteredShifts, periodData.filteredSales, wageSettings),
    [periodData, wageSettings]
  );

  const activeBattleWithScores = useMemo(() =>
    getActiveBattleWithLiveScores(allSales),
    [allSales, getActiveBattleWithLiveScores]
  );

  // --- HANDLERS ---
  const onClockIn = async (goal: number) => {
    if (user?.kennitala) {
      try {
        const result = await toggleMyTimePlanAttendance(user.kennitala);
        if (result.success) {
          const parsed = parseMyTimePlanMessage(result.message);
          if (parsed) {
            showToast(`MyTimePlan: ${parsed.action} kl. ${parsed.time}`, 'success');
          } else {
            const actionText = result.action === 'clock_in' ? 'Skráður inn' :
              result.action === 'clock_out' ? 'Skráður út' : 'Skráning tókst';
            showToast(`MyTimePlan: ${actionText}`, 'success');
          }
        }
      } catch (error) {
        console.error('[MyTimePlan] Clock-in sync failed:', error);
        showToast('MyTimePlan sync tókst ekki', 'error');
      }
    }

    handleClockIn(goal, (g) => {
      if (user) {
        setDoc(doc(db, "user_configs", user.staffId), { goals: { ...goals, daily: g } }, { merge: true });
        updateGoals({ ...goals, daily: g });
      }
    });
  };

  const onClockOut = async (shiftData: any) => {
    if (!user) return;

    if (user?.kennitala) {
      try {
        const result = await toggleMyTimePlanAttendance(user.kennitala);
        if (result.success) {
          const parsed = parseMyTimePlanMessage(result.message);
          if (parsed) {
            showToast(`MyTimePlan: ${parsed.action} kl. ${parsed.time}`, 'success');
          } else {
            const actionText = result.action === 'clock_in' ? 'Skráður inn' :
              result.action === 'clock_out' ? 'Skráður út' : 'Skráning tókst';
            showToast(`MyTimePlan: ${actionText}`, 'success');
          }
        }
      } catch (error) {
        console.error('[MyTimePlan] Clock-out sync failed:', error);
        showToast('MyTimePlan sync tókst ekki', 'error');
      }
    }

    await handleClockOut(shiftData, user.staffId);
  };

  // --- LOADING & AUTH ---
  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#01040f] text-white font-black">LOADING...</div>;
  }

  if (!user) {
    return <Login onLogin={() => { }} />;
  }

  // MVP Sidebar — only 5 tabs
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Mælaborð' },
    { id: 'register', icon: <Sparkle size={20} />, label: 'Skráning' },
    { id: 'competitions', icon: <Trophy size={20} />, label: 'The Arena' },
    { id: 'stats', icon: <BarChart4 size={20} />, label: 'Tölfræði' },
    ...(isAdmin ? [{ id: 'admin', icon: <ShieldCheck size={20} />, label: 'Admin' }] : []),
  ];

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#01040f] text-slate-100 font-sans overflow-hidden">

        {/* Top Header Bar */}
        <header className="fixed top-0 left-0 right-0 z-[40] glass border-b border-white/5 h-16 flex items-center justify-between px-6 lg:pl-72">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-all lg:hidden"><Menu size={20} /></button>
            <h1 className="text-sm font-black text-white tracking-wider hidden md:block">Takk Arena</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:block">{user?.name || 'User'}</span>
          </div>
        </header>

        {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

        <aside className={`fixed inset-y-0 left-0 z-[100] glass border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-[75vw] max-w-64 lg:w-64 lg:relative lg:translate-x-0`}>
          <div className="p-8 flex flex-col items-center border-b border-white/5 bg-white/2 min-h-[160px] justify-center">
            <img src="/logo_final.svg" alt="TAKK" className="h-24 w-full mb-3" onError={() => setLogoError(true)} />
            <h1 className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase italic">Takk Arena</h1>
          </div>
          <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'gradient-bg text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                {item.icon}
                <span className="font-bold text-xs tracking-wider truncate">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5 space-y-2">
            <div className="px-4 py-2 bg-indigo-500/10 rounded-xl mb-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">{user.role}</p>
              <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-400 transition-all">
              <LogOut size={20} />
              <span className="font-bold text-xs uppercase tracking-wider">Skrá út</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-[#01040f] relative overflow-hidden pt-16">
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24 md:p-8 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {activeTab === 'dashboard' && (
                <Dashboard
                  isShiftActive={isShiftActive}
                  clockInTime={clockInTime}
                  onClockIn={onClockIn}
                  onClockOut={onClockOut}
                  summary={summary}
                  shifts={shifts}
                  periodShifts={periodData.filteredShifts}
                  aiInsights={''}
                  onAddClick={() => setActiveTab('register')}
                  goals={goals}
                  onUpdateGoals={updateGoals}
                  sales={sales}
                  staffId={user.staffId}
                  coachPersonality={coachPersonality}
                />
              )}

              {activeTab === 'register' && (
                <Registration
                  isShiftActive={isShiftActive}
                  clockInTime={clockInTime}
                  onClockIn={onClockIn}
                  onClockOut={onClockOut}
                  onSaveShift={async (s) => await addDoc(collection(db, "shifts"), { ...s, userId: user.staffId })}
                  onSaveSale={async (s) => await addDoc(collection(db, "sales"), { ...s, userId: user.staffId })}
                  onDeleteSale={async (id) => await deleteDoc(doc(db, "sales", id))}
                  onUpdateSale={async (s) => await setDoc(doc(db, "sales", s.id), s, { merge: true })}
                  onUpdateShift={async (s) => { await setDoc(doc(db, "shifts", s.id), s, { merge: true }); }}
                  onClearEditingShift={() => setEditingShift(null)}
                  currentSales={sales}
                  shifts={shifts}
                  editingShift={editingShift}
                  goals={goals}
                  onUpdateGoals={updateGoals}
                  userRole={user.role}
                  userId={user.staffId}
                  dailyBounties={dailyBounties}
                  claimedBountyIds={claimedBountyIds}
                  onClaimBounty={handleClaimBounty}
                  onReplaceBounty={handleReplaceBounty}
                  onRefreshBounties={handleRefreshBounties}
                  coachPersonality={coachPersonality}
                  onTabChange={setActiveTab}
                  requireOFCheck={requireOFCheck}
                  autoPausesEnabled={autoPausesEnabled}
                  user={user}
                  activeBattle={activeBattleWithScores}
                  persistedSaleType={persistedSaleType}
                  onSaleTypeChange={setPersistedSaleType}
                  persistedSaleData={persistedSaleData}
                  onSaleDataChange={setPersistedSaleData}
                  persistedBreakMinutes={persistedBreakMinutes}
                  onBreakMinutesChange={setPersistedBreakMinutes}
                  persistedBreakEndTime={persistedBreakEndTime}
                  onBreakEndTimeChange={setPersistedBreakEndTime}
                  persistedOfChecked={persistedOfChecked}
                  onOfCheckedChange={setPersistedOfChecked}
                />
              )}

              {activeTab === 'competitions' && (
                <CompetitionsPage
                  sales={allSales}
                  shifts={shifts}
                  user={user}
                  allUsers={allUsers}
                  battles={battles}
                  onCreateBattle={createBattle}
                  onCancelBattle={cancelBattle}
                />
              )}

              {activeTab === 'stats' && (
                <StatsView
                  sales={sales}
                  shifts={shifts}
                  battles={battles}
                  user={user}
                  claimedBountyIds={claimedBountyIds}
                />
              )}

              {activeTab === 'admin' && isAdmin && <Admin users={allUsers} onUpdateUsers={() => { }} />}
            </div>
          </main>
          <MobileDock activeTab={activeTab} onTabChange={setActiveTab} onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-amber-500/90 text-black px-4 py-2 rounded-xl flex items-center gap-2 z-50 shadow-lg">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
            <span className="text-sm font-bold">Utan nets - {pendingCount} í biðröð</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
