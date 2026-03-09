import React, { useState, useEffect, useMemo, useCallback } from 'react';
import NotificationBell from './components/NotificationBell.tsx';
import MessagesButton from './components/MessagesButton.tsx';
import MessagesPage from './components/MessagesPage.tsx';
import { useMessages } from './hooks/useMessages';
import { useAuth } from './hooks/useAuth';
import { useBattles } from './hooks/useBattles';
import { useUserConfig } from './hooks/useUserConfig';
import { useShiftClock } from './hooks/useShiftClock';
import { usePresence } from './hooks/usePresence';
import { useSalesData } from './hooks/useSalesData';
import { useToast } from './components/Toast';
import { useAdminCheck } from './hooks/useAdminCheck';
import { useStreaks } from './hooks/useStreaks';
import { useSounds } from './hooks/useSounds';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import {
  LayoutDashboard,
  History,
  Settings,
  Mic2,
  FileText,
  Menu,
  LogOut,
  Sparkle,
  PieChart,
  ShieldCheck,
  BarChart4,
  Trophy,
  MessageSquare,
  Users,
  Tv
} from 'lucide-react';
import { doc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import { calculateWageSummary } from './utils/calculations.ts';
import { Bounty, BountyStats, BountyContext, getDailyBounties, getReplacementBounty, getContextAwareBounties } from './utils/bounties.ts';
import { toggleMyTimePlanAttendance, parseMyTimePlanMessage } from './services/mytimeplanService.ts';

// Components
import Dashboard from './components/Dashboard.tsx';
import Registration from './components/Registration.tsx';
import ShiftList from './components/ShiftList.tsx';
import Payslip from './components/Payslip.tsx';
import Login from './components/Login.tsx';
import SpeechAssistant from './components/SpeechAssistant.tsx';
import ProjectInsights from './components/ProjectInsights.tsx';
import Admin from './components/Admin.tsx';
import Chatbot from './components/Chatbot.tsx';
import MobileDock from './components/MobileDock.tsx';
import ManagerDashboard from './components/ManagerDashboard.tsx';
import DailyStats from './components/DailyStats.tsx';
import GhostSeeder from './components/GhostSeeder.tsx';
import CompetitionsPage from './components/Competitions/CompetitionsPage.tsx';
import UserSwitcher from './components/UserSwitcher.tsx';
import StatsView from './components/StatsView.tsx';
import ChallengesPanel from './components/ChallengesPanel.tsx';
import ManagerCoachingView from './components/ManagerCoachingView.tsx';
import SpectatorView from './components/Competitions/SpectatorView.tsx';
// v3.0.0 - New components
import WhatsNewModal from './components/WhatsNewModal.tsx';
// v3.5.0 - TV Mode
import { TVDashboard } from './components/TVMode';
import AchievementsPanel from './components/AchievementsPanel.tsx';
import AchievementUnlockedModal from './components/AchievementUnlockedModal.tsx';
import OnboardingWalkthrough, { ONBOARDING_STORAGE_KEY } from './components/OnboardingWalkthrough.tsx';
import UserSettingsModal from './components/UserSettingsModal.tsx';
import { useAchievements } from './hooks/useAchievements';

const App: React.FC = () => {
  console.log("📦 App Component Rendering...");

  // --- HOOKS ---
  const { user, realUser, impersonatedUser, loading, isImpersonating, logout, switchUser } = useAuth();
  const { showToast } = useToast();

  // Battle callbacks for toast notifications
  const battleCallbacks = useMemo(() => ({
    onError: (msg: string) => showToast(msg, 'error'),
    onSuccess: (msg: string) => showToast(msg, 'success'),
  }), [showToast]);

  const {
    battles,
    invites,
    createBattle,
    cancelBattle,
    acceptInvite,
    declineInvite,
    getActiveBattleWithLiveScores
  } = useBattles(user?.staffId, battleCallbacks);

  const { isAdmin, isManager } = useAdminCheck(user);

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

  const { userStatuses } = usePresence(user?.staffId, allUsers);

  const messaging = useMessages(
    user?.staffId || '',
    user?.name || 'User',
    user?.name?.substring(0, 2).toUpperCase() || 'ME'
  );

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [logoError, setLogoError] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [spectatingBattle, setSpectatingBattle] = useState<any>(null);
  const [tvModeOpen, setTvModeOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  // --- PERSISTED REGISTRATION STATE (survives tab switching) ---
  const [persistedSaleType, setPersistedSaleType] = useState<'new' | 'upgrade'>('new');
  const [persistedSaleData, setPersistedSaleData] = useState({ amount: 0, project: 'Einstaklingur' });
  const [persistedBreakMinutes, setPersistedBreakMinutes] = useState(0);
  const [persistedBreakEndTime, setPersistedBreakEndTime] = useState<Date | null>(null);
  const [persistedOfChecked, setPersistedOfChecked] = useState(false);

  // New feature hooks
  const { currentStreak, isActive: streakIsActive } = useStreaks(user?.staffId, sales);
  const { playSound } = useSounds();
  const { isOnline, pendingCount, queueSale, syncQueue } = useOfflineQueue();

  // v3.0.0 - Achievement System
  const {
    unlockedAchievements,
    achievementProgress,
    newlyUnlocked,
    totalCoins: achievementCoins,
    totalXP: achievementXP,
    clearNewlyUnlocked
  } = useAchievements({
    staffId: user?.staffId,
    sales,
    currentStreak,
    battlesWon: battles.filter(b => b.winnerId === user?.staffId).length,
    goals: goals || { daily: 0, weekly: 0, monthly: 0 }
  });

  // --- BOUNTY SYSTEM ---
  const [dailyBounties, setDailyBounties] = useState<Bounty[]>([]);
  const [claimedBountyIds, setClaimedBountyIds] = useState<string[]>([]);

  // Compute current bounty stats from sales data
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
      hourlyRate: 0 // Will be calculated when shift is active
    };
  }, [sales]);

  // Initialize daily bounties - runs when sales change to pick appropriate challenges
  useEffect(() => {
    // Only initialize if we don't have bounties yet
    if (dailyBounties.length === 0) {
      const bounties = getDailyBounties(5, bountyStats);
      setDailyBounties(bounties);
      setClaimedBountyIds([]);
    }
  }, [bountyStats, dailyBounties.length]);

  // Bounty claim handler - shows toast with coins
  const handleClaimBounty = useCallback((bountyId: string, coins: number) => {
    setClaimedBountyIds(prev => [...prev, bountyId]);
    showToast(`+${coins} mynt! 🪙`, 'success');
    playSound('coin');
  }, [showToast, playSound]);

  // Bounty replacement handler - gets new bounty that's not already completed
  const handleReplaceBounty = useCallback((oldId: string, newBounty: Bounty) => {
    // Get a replacement that isn't already completed
    const currentIds = dailyBounties.map(b => b.id);
    const replacement = getReplacementBounty(currentIds, newBounty.difficulty, bountyStats);
    setDailyBounties(prev => prev.map(b => b.id === oldId ? replacement : b));
  }, [dailyBounties, bountyStats]);

  // Context-aware bounty refresh - replaces all bounties with new context-aware ones
  const handleRefreshBounties = useCallback(() => {
    const context: BountyContext = {
      saleType: persistedSaleType,
      currentHour: new Date().getHours(),
      stats: bountyStats,
      excludeIds: [] // Empty since we're replacing all
    };
    const newBounties = getContextAwareBounties(5, context);
    setDailyBounties(newBounties);
    setClaimedBountyIds([]); // Reset claimed to avoid stale state
    showToast(`5 ný verkefni! 🎯`, 'success');
  }, [persistedSaleType, bountyStats, showToast]);

  // Handle sidebar resize
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- AUTO-LOGOUT BY LOCATION ---
  useEffect(() => {
    // TEMPORARY: Disable for MyTimePlan testing
    const DISABLE_AUTO_LOGOUT_FOR_TESTING = true;
    if (DISABLE_AUTO_LOGOUT_FOR_TESTING) return;

    if (!user || !isShiftActive || !clockInTime) return;

    const closingHours: { [key: string]: number } = {
      'Hringurinn': 19, // 7pm
      'Verið': 21,      // 9pm
      'Götuteymið': 23  // 11pm (default late)
    };

    const checkAutoLogout = async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const closingHour = closingHours[user.team] || 23;

      if (currentHour >= closingHour) {
        console.log(`⏰ Auto-logout triggered for ${user.team} at ${currentHour}:00 (closes at ${closingHour}:00)`);
        showToast(`Sjálfvirk útskráning - ${user.team} lokar kl. ${closingHour}:00`, 'info');

        // Trigger clock out with proper shift data
        const startTime = new Date(clockInTime);
        const shiftDateStr = startTime.toISOString().split('T')[0];
        const shiftSales = sales.filter(s => s.date === shiftDateStr);
        const totalShiftSales = shiftSales.reduce((acc, s) => acc + s.amount, 0);

        await handleClockOut({
          id: Math.random().toString(36).substr(2, 9),
          date: shiftDateStr,
          dayHours: 0, // Will be calculated by hook
          eveningHours: 0,
          totalSales: totalShiftSales,
          notes: 'Sjálfvirk útskráning',
          projectName: 'Other',
          userId: ''
        }, user.staffId);
      }
    };

    // Check immediately and then every minute
    checkAutoLogout();
    const interval = setInterval(checkAutoLogout, 60000);
    return () => clearInterval(interval);
  }, [user, isShiftActive, clockInTime, sales, handleClockOut, showToast]);

  // --- DEMO BATTLE FOR USER 123 ---
  const [demoBattleState, setDemoBattleState] = useState<'winning' | 'tied' | 'losing'>('winning');
  const [demoBotScore, setDemoBotScore] = useState(15000);

  useEffect(() => {
    if (user?.staffId !== '123') return;

    // Cycle through states every 10 seconds
    const interval = setInterval(() => {
      setDemoBattleState(prev => {
        if (prev === 'winning') return 'tied';
        if (prev === 'tied') return 'losing';
        return 'winning';
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.staffId]);

  // Update bot score based on state
  useEffect(() => {
    if (user?.staffId !== '123') return;

    const todayStr = new Date().toISOString().split('T')[0];
    const userSalesToday = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.amount, 0);

    if (demoBattleState === 'winning') {
      setDemoBotScore(Math.max(0, userSalesToday - 5000 - Math.floor(Math.random() * 3000)));
    } else if (demoBattleState === 'tied') {
      setDemoBotScore(userSalesToday + Math.floor(Math.random() * 500) - 250);
    } else {
      setDemoBotScore(userSalesToday + 3000 + Math.floor(Math.random() * 5000));
    }
  }, [demoBattleState, sales, user?.staffId]);

  // Create demo battle object for user 123
  const demoBattle = useMemo(() => {
    if (user?.staffId !== '123') return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const userSalesToday = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.amount, 0);

    const now = new Date();
    const endTime = new Date(now.getTime() + 45 * 60 * 1000); // 45 min from now

    return {
      id: 'demo-battle-123',
      type: 'standard' as const,
      participants: [
        {
          userId: '123',
          name: user?.name || 'Demo User',
          avatar: 'DU',
          currentSales: userSalesToday,
          salesCount: sales.filter(s => s.date === todayStr).length
        },
        {
          userId: 'bot-rival',
          name: 'Keppandi Karl',
          avatar: 'KK',
          currentSales: demoBotScore,
          salesCount: Math.floor(demoBotScore / 1500)
        }
      ],
      format: { duration: 'standard' as const, durationMinutes: 120 },
      startTime: new Date(now.getTime() - 75 * 60 * 1000).toISOString(),
      endTime: endTime.toISOString(),
      targetType: 'highest_total' as const,
      targetValue: 50000,
      handicaps: {},
      status: 'active' as const,
      createdBy: '123',
      createdAt: new Date(now.getTime() - 75 * 60 * 1000).toISOString()
    };
  }, [user, sales, demoBotScore]);

  // --- COMPUTED VALUES ---
  const summary = useMemo(() =>
    calculateWageSummary(periodData.filteredShifts, periodData.filteredSales, wageSettings),
    [periodData, wageSettings]
  );

  const realActiveBattle = useMemo(() =>
    getActiveBattleWithLiveScores(allSales),
    [allSales, getActiveBattleWithLiveScores]
  );

  // Use demo battle for user 123 if no real battle exists
  const activeBattleWithScores = user?.staffId === '123' && !realActiveBattle ? demoBattle : realActiveBattle;

  // --- HANDLERS ---
  const onClockIn = async (goal: number) => {
    console.log('🟢🟢🟢 CLOCK IN TRIGGERED 🟢🟢🟢');
    // DEBUG: Log kennitala status
    console.log('[MyTimePlan Debug] User:', user?.staffId, 'Kennitala:', user?.kennitala || 'NOT SET');

    // First, sync with MyTimePlan if user has kennitala
    if (user?.kennitala) {
      try {
        console.log('[MyTimePlan] Attempting clock-in sync...');
        const result = await toggleMyTimePlanAttendance(user.kennitala);
        console.log('[MyTimePlan] Result:', result);
        if (result.success) {
          const parsed = parseMyTimePlanMessage(result.message);
          if (parsed) {
            showToast(`MyTimePlan: ${parsed.action} kl. ${parsed.time}`, 'success');
          } else {
            // Fallback: show the raw message or action
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

    console.log('🔴🔴🔴 CLOCK OUT TRIGGERED 🔴🔴🔴');

    // Sync with MyTimePlan if user has kennitala
    if (user?.kennitala) {
      try {
        console.log('[MyTimePlan] Attempting clock-out sync...');
        const result = await toggleMyTimePlanAttendance(user.kennitala);
        console.log('[MyTimePlan] Clock-out result:', result);
        if (result.success) {
          const parsed = parseMyTimePlanMessage(result.message);
          if (parsed) {
            showToast(`MyTimePlan: ${parsed.action} kl. ${parsed.time}`, 'success');
          } else {
            // Fallback toast
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

  // Sidebar navigation - organized by function
  const navItems = [
    // Manager-only section
    ...(isManager ? [
      { id: 'manager_dash', icon: <BarChart4 size={20} />, label: 'Command Center' },
      { id: 'coaching', icon: <Users size={20} />, label: 'Þjálfun' },
      { id: 'divider1', divider: true },
    ] : []),

    // Core workflow
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Mælaborð' },
    { id: 'register', icon: <Sparkle size={20} />, label: 'Skráning' },
    { id: 'competitions', icon: <Trophy size={20} />, label: 'The Arena' },
    { id: 'divider2', divider: true },

    // Analytics & Insights (grouped together)
    { id: 'insights', icon: <PieChart size={20} />, label: 'Greining' },
    { id: 'stats', icon: <BarChart4 size={20} />, label: 'Tölfræði' },
    { id: 'achievements', icon: <Trophy size={20} />, label: 'Afrek' },
    { id: 'divider3', divider: true },

    // Tools & Communication
    { id: 'speech', icon: <Mic2 size={20} />, label: 'MorriAI' },
    { id: 'messages', icon: <MessageSquare size={20} />, label: 'Skilaboð' },
    { id: 'divider4', divider: true },

    // Records
    { id: 'history', icon: <History size={20} />, label: 'Vaktasaga' },
    { id: 'payslip', icon: <FileText size={20} />, label: 'Launaseðill' },
    { id: 'divider5', divider: true },

    // Settings (always last)
    { id: 'settings', icon: <Settings size={20} />, label: 'Stillingar' },
    ...(isAdmin ? [{ id: 'admin', icon: <ShieldCheck size={20} />, label: 'Admin' }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#01040f] text-slate-100 font-sans overflow-hidden">

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-[40] glass border-b border-white/5 h-16 flex items-center justify-between px-6 lg:pl-72">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-all lg:hidden"><Menu size={20} /></button>
          <h1 className="text-sm font-black text-white tracking-wider hidden md:block">Takk Arena</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* TV Mode Button */}
          <button
            onClick={() => setTvModeOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-all"
            title="Opna TV Mode"
          >
            <Tv size={16} />
            <span className="text-xs font-semibold">TV</span>
          </button>
          {isImpersonating && (
            <span className="text-xs text-amber-400 font-medium hidden md:block">👁 Viewing as: {user?.name}</span>
          )}
          <span className="text-sm text-slate-400 hidden md:block">{isImpersonating ? realUser?.name : user?.name || 'User'}</span>
          {realUser && (
            <UserSwitcher
              currentUser={realUser}
              allUsers={allUsers}
              impersonatedUser={impersonatedUser}
              onSwitchUser={switchUser}
            />
          )}
          <MessagesButton
            messages={messaging.messages}
            currentUserId={user?.staffId || ''}
            onSendMessage={messaging.sendMessage}
            allUsers={allUsers.map(u => ({
              id: u.staffId,
              staffId: u.staffId,
              name: u.name,
              avatar: u.name.substring(0, 2).toUpperCase()
            }))}
            userStatuses={userStatuses}
            sales={sales}
            shifts={shifts}
          />
          <NotificationBell
            feedNotifications={[]}
            invites={invites}
            onAcceptInvite={acceptInvite}
            onDeclineInvite={declineInvite}
          />
        </div>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-[50] glass border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 lg:relative lg:translate-x-0`}>
        <div className="p-8 flex flex-col items-center border-b border-white/5 bg-white/2 min-h-[160px] justify-center">
          <img src="/logo_final.svg" alt="TAKK" className="h-24 w-full mb-3" onError={() => setLogoError(true)} />
          <h1 className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase italic">Takk Arena</h1>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item: any) =>
            item.divider ? (
              <div key={item.id} className="h-px bg-white/10 my-3 mx-2" />
            ) : (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'gradient-bg text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                {item.icon}
                <span className="font-bold text-xs tracking-wider truncate">{item.label}</span>
              </button>
            )
          )}
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
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'manager_dash' && isManager && <ManagerDashboard allShifts={[]} allSales={allSales} allUsers={allUsers} currentUser={user} personalSummary={summary} />}
            {(activeTab === 'dashboard' || (!isManager && activeTab === 'manager_dash')) && (
              <Dashboard
                isShiftActive={isShiftActive}
                clockInTime={clockInTime}
                onClockIn={onClockIn}
                onClockOut={onClockOut}
                summary={summary}
                shifts={shifts}
                periodShifts={periodData.filteredShifts}
                aiInsights={aiInsights}
                onAddClick={() => setActiveTab('register')}
                goals={goals}
                onUpdateGoals={updateGoals}
                sales={sales}
                staffId={user.staffId}
                coachPersonality={coachPersonality}
              />
            )}

            {activeTab === 'daily' && <DailyStats sales={sales} goals={goals} />}

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
                // Persisted state props
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
            {activeTab === 'insights' && <ProjectInsights sales={sales} shifts={shifts} />}

            {activeTab === 'stats' && (
              <StatsView
                sales={sales}
                shifts={shifts}
                battles={battles}
                user={user}
                claimedBountyIds={claimedBountyIds}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsPanel
                achievementProgress={achievementProgress}
                totalCoins={achievementCoins}
                totalXP={achievementXP}
              />
            )}

            {activeTab === 'coaching' && isManager && (
              <ManagerCoachingView
                currentUser={user}
                allUsers={allUsers}
                sales={allSales}
                shifts={shifts}
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

            {activeTab === 'messages' && (
              <MessagesPage
                messages={messaging.messages}
                currentUserId={user?.staffId || ''}
                currentUserName={user?.name || 'User'}
                currentUserAvatar={user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                allUsers={allUsers}
                userStatuses={userStatuses}
                onSendMessage={messaging.sendMessage}
                sales={sales}
                shifts={shifts}
              />
            )}
            {activeTab === 'speech' && <SpeechAssistant summary={summary} />}
            {activeTab === 'history' && (
              <ShiftList shifts={shifts} onDelete={async (id) => await deleteDoc(doc(db, "shifts", id))} onEdit={(s) => { setEditingShift(s); setActiveTab('register'); }} onAddShift={async (s) => await addDoc(collection(db, "shifts"), { ...s, userId: user.staffId })} />
            )}
            {activeTab === 'payslip' && <Payslip shifts={shifts} sales={sales} summary={summary} settings={wageSettings} userName={user.name} onUpdateSettings={(s) => setDoc(doc(db, "user_configs", user.staffId), { wageSettings: s }, { merge: true })} />}
            {activeTab === 'admin' && isAdmin && <Admin users={allUsers} onUpdateUsers={() => { }} />}
            {activeTab === 'settings' && (
              <div className="glass rounded-[40px] p-8 max-w-4xl border-white/10 mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-indigo-500/20">
                    <Settings size={28} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Stillingar</h2>
                    <p className="text-sm text-slate-500 font-bold">Sérsniðnar stillingar</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* User Profile Settings */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black">
                          {(user.name || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide mb-0.5">Notandaprófíll</h3>
                        <p className="text-xs text-slate-500">Nafn, gælunafn og prófílmynd</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserSettings(true)}
                      className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl border border-indigo-500/30 transition-all text-xs font-bold"
                    >
                      Breyta
                    </button>
                  </div>

                  {/* OF Check Toggle */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">Krefjast OF skráningar</h3>
                      <p className="text-xs text-slate-500">Þegar kveikt, þarftu að haka við OF reitinn áður en þú getur vistað sölu</p>
                    </div>
                    <button
                      onClick={() => updateRequireOFCheck(!requireOFCheck)}
                      className={`w-14 h-8 rounded-full transition-all relative ${requireOFCheck ? 'bg-emerald-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${requireOFCheck ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Auto Pauses Toggle */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">Sjálfvirkar pásum</h3>
                      <p className="text-xs text-slate-500">Sýna hnappa til að skrá 15 eða 30 mínútna pásum í skráningarflipa</p>
                    </div>
                    <button
                      onClick={() => updateAutoPausesEnabled(!autoPausesEnabled)}
                      className={`w-14 h-8 rounded-full transition-all relative ${autoPausesEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${autoPausesEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Coach Personality Selector */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">MorriAI Þjálfari</h3>
                    <p className="text-xs text-slate-500 mb-4">Veldu persónuleika fyrir þjálfarann þinn</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'standard', name: 'Venjulegur', emoji: '🎯', desc: 'Jákvæður og hvetjandi' },
                        { id: 'drill_sergeant', name: 'Herforingi', emoji: '🎖️', desc: 'Harður og beinskeyttur' },
                        { id: 'zen_master', name: 'Zen Meistari', emoji: '🧘', desc: 'Rólegt og íhugt' },
                        { id: 'wolf', name: 'Úlfurinn', emoji: '🐺', desc: 'Samkeppnishvattur' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => updateCoachPersonality(p.id)}
                          className={`p-4 rounded-2xl text-left transition-all ${coachPersonality === p.id
                            ? 'bg-indigo-500/30 border-2 border-indigo-500'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                            }`}
                        >
                          <span className="text-2xl mb-2 block">{p.emoji}</span>
                          <p className="font-black text-white text-sm">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Onboarding Replay */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">Kynningarleiðbeiningar</h3>
                      <p className="text-xs text-slate-500">Sýna kynninguna aftur til að rifja upp helstu eiginleika appsins</p>
                    </div>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl border border-indigo-500/30 transition-all text-xs font-bold"
                    >
                      Sýna
                    </button>
                  </div>

                  {/* Current Goals Display */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-black text-white uppercase tracking-wide mb-4">Núverandi markmið</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-2xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Daglegt</p>
                        <p className="text-xl font-black text-emerald-400">{(goals?.daily ?? 0).toLocaleString('is-IS')}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Vikulegt</p>
                        <p className="text-xl font-black text-amber-400">{(goals?.weekly ?? 0).toLocaleString('is-IS')}</p>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Mánaðarlegt</p>
                        <p className="text-xl font-black text-violet-400">{(goals?.monthly ?? 0).toLocaleString('is-IS')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <MobileDock activeTab={activeTab} onTabChange={setActiveTab} onMenuClick={() => setIsSidebarOpen(true)} />
      </div>

      <div className="hidden md:block">
        <Chatbot />
      </div>

      <GhostSeeder user={user} />

      {/* Spectator View Overlay */}
      {spectatingBattle && (
        <SpectatorView
          battle={spectatingBattle}
          allSales={allSales}
          allUsers={allUsers}
          onClose={() => setSpectatingBattle(null)}
        />
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-amber-500/90 text-black px-4 py-2 rounded-xl flex items-center gap-2 z-50 shadow-lg">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          <span className="text-sm font-bold">Utan nets - {pendingCount} í biðröð</span>
        </div>
      )}

      {/* v3.0.0 - What's New Modal */}
      <WhatsNewModal />

      {/* v3.1.0 - Onboarding Walkthrough */}
      <OnboardingWalkthrough
        forceShow={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* v3.0.0 - Achievement Unlocked Modal */}
      {newlyUnlocked.length > 0 && (
        <AchievementUnlockedModal
          achievements={newlyUnlocked}
          onClose={clearNewlyUnlocked}
          onClaimAll={() => {
            playSound('coin');
            clearNewlyUnlocked();
          }}
        />
      )}

      {/* v3.2.0 - User Settings Modal */}
      <UserSettingsModal
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        user={user}
      />

      {/* v3.5.0 - TV Mode Dashboard */}
      {tvModeOpen && (
        <TVDashboard
          users={allUsers}
          sales={allSales}
          battles={battles}
          onClose={() => setTvModeOpen(false)}
        />
      )}
    </div >
  );
};

export default App;
