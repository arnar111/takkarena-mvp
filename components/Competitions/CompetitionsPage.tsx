import React, { useState, useMemo, useEffect } from 'react';
import { Swords, Users, TrendingUp, Award, Star, Crown, Trophy } from 'lucide-react'; // <--- Added Trophy back here
import LeaderboardView from './LeaderboardView.tsx';
import DuelArenaView from './DuelArenaView.tsx';
import LiveBattlesView from './LiveBattlesView.tsx';
import BattleInsightsModal from './BattleInsightsModal.tsx';
import MultiLeaderboardView from './MultiLeaderboardView.tsx';
import LeagueSystemView from './LeagueSystemView.tsx';
import BadgeShowcase from './BadgeShowcase.tsx';
import TeamsView from './TeamsView.tsx';
import BettingModal from './BettingModal.tsx';
import RewardsPage from './RewardsPage.tsx';
import BattleInvitePanel from './BattleInvitePanel.tsx';
import LiveFeedPanel from './LiveFeedPanel.tsx';
import RivalryTracker from './RivalryTracker.tsx';
import BossBattleCreator from './BossBattleCreator.tsx';
import { Sale, Shift, User, Battle } from '../../types';
import { calculateMaxStreak } from '../../utils/dateUtils.ts';
import { ENHANCED_BADGES } from '../../utils/enhancedBadges.ts';

interface CompetitionsPageProps {
    sales: Sale[];
    shifts: Shift[];
    user: User;
    allUsers?: User[];
    battles: Battle[];
    onCreateBattle: (battle: Battle) => void;
    onCancelBattle: (battleId: string) => void;
}

const CompetitionsPage: React.FC<CompetitionsPageProps> = ({
    sales,
    shifts,
    user,
    allUsers = [],
    battles,
    onCreateBattle,
    onCancelBattle
}) => {
    // Main tab and subtabs for organized 4-category navigation
    const [mainTab, setMainTab] = useState<'battles' | 'progress' | 'teams' | 'arena'>('battles');
    const [battleSubTab, setBattleSubTab] = useState<'headtohead' | 'live' | 'boss'>('headtohead');
    const [progressSubTab, setProgressSubTab] = useState<'rankings' | 'leagues' | 'badges'>('rankings');

    const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
    const [showBetting, setShowBetting] = useState(false);
    const [bettingBattle, setBettingBattle] = useState<Battle | null>(null);
    const [showBossCreator, setShowBossCreator] = useState(false);
    const [userBattles, setUserBattles] = useState<Battle[]>([]);

    // --- MOCK BATTLES DATA (Expanded with variety and Ghost opponents) ---
    const mockBattles: Battle[] = useMemo(() => {
        // DEMO MODE: Only show mock battles for user '123'
        if (user.id !== '123' && user.staffId !== '123') return [...userBattles];

        const now = Date.now();
        return [
            // User vs Ghost - Quick Battle
            {
                id: 'ghost1',
                participants: [
                    { userId: user.id, name: 'Þú', avatar: 'ÞÚ', currentSales: 12500, salesCount: 3 },
                    { userId: 'ghost', name: 'Ghost', avatar: '👻', currentSales: 10800, salesCount: 2 },
                ],
                format: { duration: 'quick' },
                startTime: new Date(now - 1.5 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 0.5 * 60 * 60 * 1000).toISOString(),
                targetType: 'first_to',
                targetValue: 20000,
                handicaps: { [user.id]: 1.0, 'ghost': 1.0 },
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: user.id,
            },
            // Sigga vs Gunnar - Standard with handicap
            {
                id: '2',
                participants: [
                    { userId: '3', name: 'Sigga', avatar: 'SI', currentSales: 18500, salesCount: 5 },
                    { userId: '4', name: 'Gunnar', avatar: 'GU', currentSales: 16200, salesCount: 4 },
                ],
                format: { duration: 'standard' },
                startTime: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 5 * 60 * 60 * 1000).toISOString(),
                targetType: 'highest_total',
                targetValue: 25000,
                handicaps: { '3': 1.0, '4': 0.75 },
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: '3',
            },
            // Jón vs Anna - Marathon
            {
                id: '3',
                participants: [
                    { userId: '1', name: 'Jón', avatar: 'JÓ', currentSales: 32100, salesCount: 8 },
                    { userId: '5', name: 'Anna', avatar: 'AN', currentSales: 28900, salesCount: 7 },
                ],
                format: { duration: 'marathon' },
                startTime: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
                targetType: 'highest_total',
                targetValue: 50000,
                handicaps: { '1': 1.0, '5': 1.0 },
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: '1',
            },
            // Arnór vs Ghost - First to target
            {
                id: 'ghost2',
                participants: [
                    { userId: '6', name: 'Arnór', avatar: 'AR', currentSales: 22300, salesCount: 6 },
                    { userId: 'ghost2', name: 'Ghost', avatar: '👻', currentSales: 19500, salesCount: 5 },
                ],
                format: { duration: 'standard' },
                startTime: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
                targetType: 'first_to',
                targetValue: 30000,
                handicaps: { '6': 1.0, 'ghost2': 1.0 },
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: '6',
            },
            // User vs Jón - Custom 3 hour battle with handicap
            {
                id: '5',
                participants: [
                    { userId: user.id, name: 'Þú', avatar: 'ÞÚ', currentSales: 8200, salesCount: 2 },
                    { userId: '1', name: 'Jón', avatar: 'JÓ', currentSales: 9100, salesCount: 3 },
                ],
                format: { duration: 'custom', durationMinutes: 180, durationUnit: 'hours' },
                startTime: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 1 * 60 * 60 * 1000).toISOString(),
                targetType: 'most_sales',
                targetValue: 10,
                handicaps: { [user.id]: 0.75, '1': 1.0 }, // User has hard mode
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: user.id,
            },
            // Sigga vs Ghost - Final sprint
            {
                id: 'ghost3',
                participants: [
                    { userId: '3', name: 'Sigga', avatar: 'SI', currentSales: 24800, salesCount: 7 },
                    { userId: 'ghost3', name: 'Ghost', avatar: '👻', currentSales: 23200, salesCount: 6 },
                ],
                format: { duration: 'quick' },
                startTime: new Date(now - 1.75 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(now + 0.25 * 60 * 60 * 1000).toISOString(), // 15 min left
                targetType: 'highest_total',
                targetValue: 25000,
                handicaps: { '3': 1.0, 'ghost3': 1.0 },
                status: 'active',
                createdAt: new Date().toISOString(),
                createdBy: '3',
            },
            ...userBattles, // Add user-created battles
        ];
    }, [user.id, user.staffId, userBattles]);

    // Initialize mock sales for battles on mount
    useEffect(() => {
        const initSales = async () => {
            if (mockBattles.length > 0) {
                const { initializeBattleSales } = await import('../../utils/mockSalesGenerator.ts');
                await initializeBattleSales(mockBattles);
            }
        };

        // Only run if we have battles (and if user is 123)
        if (mockBattles.length > 0 && (user.id === '123' || user.staffId === '123')) {
            initSales();
        }
    }, [mockBattles, user.id, user.staffId]);

    // --- LEADERBOARD LOGIC ---
    const leaderboardData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const monthSales = sales.filter((s) => new Date(s.date).getMonth() === currentMonth);
        const myTotal = monthSales.reduce((acc, s) => acc + s.amount, 0);

        const bots = [
            {
                id: 1,
                name: 'Arnór Smárason',
                sales: Math.round(myTotal * 1.25),
                avatar: 'AS',
                rank: 1,
                trend: 'up' as const,
            },
            {
                id: 2,
                name: 'Sigga Dögg',
                sales: Math.round(myTotal * 1.1),
                avatar: 'SD',
                rank: 2,
                trend: 'stable' as const,
            },
            {
                id: 3,
                name: 'Jón Jónsson',
                sales: Math.round(myTotal * 0.9),
                avatar: 'JJ',
                rank: 3,
                trend: 'down' as const,
            },
            {
                id: 4,
                name: 'Þú (You)',
                sales: myTotal,
                avatar: user?.name?.substring(0, 2).toUpperCase() || 'ME',
                rank: 4,
                trend: 'up' as const,
            },
            {
                id: 5,
                name: 'Gunnar',
                sales: Math.round(myTotal * 0.75),
                avatar: 'GU',
                rank: 5,
                trend: 'down' as const,
            },
        ];

        // DEMO MODE CHECK: If not user 123, filter out the bots (id 1, 2, 3, 5)
        // Always keep 'You' (id 4)
        const activeParticipants = (user.id === '123' || user.staffId === '123')
            ? bots
            : bots.filter(p => p.id === 4); // Only keep the current user

        return activeParticipants.sort((a, b) => b.sales - a.sales).map((b, i) => ({ ...b, rank: i + 1 }));
    }, [sales, user]);

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative text-center space-y-2 py-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full bg-rose-500/20 pointer-events-none" />
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase relative z-10">
                    Keppni & Topp
                </h2>
                <p className="text-slate-400 font-bold text-sm tracking-wide relative z-10">
                    Kepstu og sjáðu hvar þú stendur
                </p>
            </div>

            <div className="grid grid-cols-4 gap-2 pb-4 px-4 md:px-0">
                {[
                    { id: 'battles' as const, label: 'Bardagar', icon: <Swords size={18} />, color: 'rose' },
                    { id: 'progress' as const, label: 'Framvinda', icon: <TrendingUp size={18} />, color: 'purple' },
                    { id: 'teams' as const, label: 'Lið', icon: <Users size={18} />, color: 'green' },
                    { id: 'arena' as const, label: 'Búðin', icon: <Trophy size={18} />, color: 'amber' },
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setMainTab(tab.id)}
                        className={`px-4 py-4 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-2 transition-all ${mainTab === tab.id ? `bg-${tab.color}-500 text-white shadow-2xl scale-105` : 'glass text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}>
                        {tab.icon}
                        <span className="text-xs">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 px-4 md:px-0 scrollbar-hide border-b border-white/5 mb-6">
                {mainTab === 'battles' && [
                    { id: 'headtohead', label: 'Head to Head', icon: <Swords size={14} /> },
                    { id: 'live', label: 'Live', icon: <Trophy size={14} /> },
                    { id: 'boss', label: 'Boss', icon: <Crown size={14} /> },
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setBattleSubTab(tab.id as any)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${battleSubTab === tab.id ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50' : 'text-slate-500 hover:text-white'
                            }`}>{tab.icon}{tab.label}</button>
                ))}

                {mainTab === 'progress' && [
                    { id: 'rankings', label: 'Stigatafla', icon: <TrendingUp size={14} /> },
                    { id: 'leagues', label: 'Deildir', icon: <Award size={14} /> },
                    { id: 'badges', label: 'Merki', icon: <Star size={14} /> },
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setProgressSubTab(tab.id as any)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${progressSubTab === tab.id ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/50' : 'text-slate-500 hover:text-white'
                            }`}>{tab.icon}{tab.label}</button>
                ))}
            </div>

            {/* Content Area */}
            <div className="px-4 md:px-0 min-h-[500px]">
                {/* BATTLES TAB */}
                {mainTab === 'battles' && (
                    <>
                        {battleSubTab === 'headtohead' && (
                            <DuelArenaView
                                sales={sales}
                                user={user}
                                allUsers={allUsers}
                                onBattleCreated={(battle) => {
                                    // Set pending status here (double check)
                                    const newBattle = { ...battle, status: 'pending' };
                                    onCreateBattle(newBattle);
                                    setBattleSubTab('live');
                                }}
                            />
                        )}
                        {battleSubTab === 'live' && (
                            <LiveBattlesView
                                battles={battles} // Pass global battles
                                sales={sales}
                                user={user}
                                onViewDetails={(battle) => setSelectedBattle(battle)}
                                onPlaceBet={(battle) => { setBettingBattle(battle); setShowBetting(true); }}
                                onCancelBattle={onCancelBattle} // Pass cancel handler
                            />
                        )}
                        {battleSubTab === 'boss' && (
                            <div className="space-y-4">
                                <button onClick={() => setShowBossCreator(true)}
                                    className="w-full px-6 py-4 gradient-bg rounded-2xl font-black text-white shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3">
                                    <Crown size={24} />Create Boss Battle
                                </button>
                                <div className="glass rounded-2xl p-8 text-center">
                                    <Crown className="mx-auto mb-3 text-slate-600" size={64} />
                                    <p className="text-slate-400">No active boss battles</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* PROGRESS TAB */}
                {mainTab === 'progress' && (
                    <>
                        {progressSubTab === 'rankings' && (
                            <MultiLeaderboardView sales={sales} shifts={shifts} users={allUsers.length > 0 ? allUsers : [user]} currentUser={user} />
                        )}
                        {progressSubTab === 'leagues' && (
                            <LeagueSystemView user={user}
                                userStats={{ totalSales: sales.reduce((sum, s) => sum + s.amount, 0), battleWins: 0, badgesEarned: 0 }}
                            />
                        )}
                        {progressSubTab === 'badges' && (
                            <BadgeShowcase earnedBadges={[]}
                                userStats={{ totalSales: sales.reduce((sum, s) => sum + s.amount, 0), battles: 0, battleWins: 0 }}
                            />
                        )}
                    </>
                )}

                {/* TEAMS TAB */}
                {mainTab === 'teams' && (
                    <TeamsView users={allUsers.length > 0 ? allUsers : [user]} sales={sales} currentUser={user} />
                )}

                {/* The Arena - Achievements & Shop */}
                {mainTab === 'arena' && (
                    <RewardsPage sales={sales} shifts={shifts} user={user} />
                )}
            </div>

            {/* Battle Insights Modal */}
            {selectedBattle && (
                <BattleInsightsModal
                    battle={selectedBattle}
                    sales={sales}
                    onClose={() => setSelectedBattle(null)}
                />
            )}

            {/* Betting Modal */}
            {showBetting && bettingBattle && (
                <BettingModal
                    battle={bettingBattle}
                    currentUserId={user.id}
                    userCoins={0} // TODO: Get from user
                    onPlaceBet={(bet) => {
                        console.log('Bet placed:', bet);
                        setShowBetting(false);
                    }}
                    onClose={() => setShowBetting(false)}
                />
            )}

            {/* Boss Battle Creator */}
            {showBossCreator && (
                <BossBattleCreator
                    userCoins={0} // TODO: Get from user
                    currentUserId={user.id}
                    onClose={() => setShowBossCreator(false)}
                    onCreate={(boss) => {
                        console.log('Boss created:', boss);
                        setShowBossCreator(false);
                    }}
                />
            )}
        </div>
    );
};

export default CompetitionsPage;
