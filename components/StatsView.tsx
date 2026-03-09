import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Calendar, Clock, Trophy, Target,
    Flame, Swords, Award, BarChart3, Gift, Crown, Coins, Medal, Star
} from 'lucide-react';
import { Sale, Shift, Battle, User } from '../types';

interface StatsViewProps {
    sales: Sale[];
    shifts: Shift[];
    battles: Battle[];
    user: User;
    claimedBountyIds?: string[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const StatsView: React.FC<StatsViewProps> = ({ sales, shifts, battles, user, claimedBountyIds = [] }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'showcase'>('stats');

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentSales = sales.filter(s =>
            s.userId === user.staffId &&
            new Date(s.timestamp) >= thirtyDaysAgo
        );

        const totalSales = recentSales.reduce((sum, s) => sum + s.amount, 0);
        const avgPerSale = recentSales.length > 0 ? totalSales / recentSales.length : 0;

        // Best/worst days
        const salesByDay: { [day: string]: number } = {};
        recentSales.forEach(s => {
            const day = new Date(s.timestamp).toLocaleDateString('is-IS', { weekday: 'long' });
            salesByDay[day] = (salesByDay[day] || 0) + s.amount;
        });
        const dayEntries = Object.entries(salesByDay).sort((a, b) => b[1] - a[1]);
        const bestDay = dayEntries[0]?.[0] || '-';
        const worstDay = dayEntries[dayEntries.length - 1]?.[0] || '-';

        // Best hours
        const salesByHour: { [hour: number]: number } = {};
        recentSales.forEach(s => {
            const hour = new Date(s.timestamp).getHours();
            salesByHour[hour] = (salesByHour[hour] || 0) + s.amount;
        });
        const hourEntries = Object.entries(salesByHour).sort((a, b) => b[1] - a[1]);
        const bestHour = hourEntries[0] ? parseInt(hourEntries[0][0]) : 0;

        // Battle stats
        const userBattles = battles.filter(b =>
            b.status === 'completed' &&
            b.participants.some(p => p.userId === user.staffId)
        );
        const wins = userBattles.filter(b => {
            const sorted = [...b.participants].sort((a, b) => b.currentSales - a.currentSales);
            return sorted[0]?.userId === user.staffId;
        }).length;
        const losses = userBattles.length - wins;

        return {
            totalSales,
            avgPerSale,
            salesCount: recentSales.length,
            bestDay,
            worstDay,
            bestHour,
            wins,
            losses,
            winRate: userBattles.length > 0 ? (wins / userBattles.length) * 100 : 0
        };
    }, [sales, battles, user]);

    // Daily sales chart data
    const dailyChartData = useMemo(() => {
        const data: { date: string; amount: number }[] = [];
        const now = new Date();

        for (let i = 13; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const daySales = sales.filter(s =>
                s.userId === user.staffId &&
                s.timestamp.startsWith(dateStr)
            ).reduce((sum, s) => sum + s.amount, 0);

            data.push({
                date: date.toLocaleDateString('is-IS', { weekday: 'short', day: 'numeric' }),
                amount: daySales
            });
        }

        return data;
    }, [sales, user]);

    // Hourly performance data
    const hourlyData = useMemo(() => {
        const hours: { hour: string; amount: number }[] = [];
        for (let h = 8; h <= 22; h++) {
            const hourSales = sales.filter(s => {
                const saleHour = new Date(s.timestamp).getHours();
                return s.userId === user.staffId && saleHour === h;
            }).reduce((sum, s) => sum + s.amount, 0);

            hours.push({
                hour: `${h}:00`,
                amount: hourSales
            });
        }
        return hours;
    }, [sales, user]);

    // Project breakdown
    const projectData = useMemo(() => {
        const projects: { [p: string]: number } = {};
        sales.filter(s => s.userId === user.staffId).forEach(s => {
            projects[s.project] = (projects[s.project] || 0) + s.amount;
        });
        return Object.entries(projects).map(([name, value]) => ({ name, value }));
    }, [sales, user]);

    const formatISK = (val: number) => val.toLocaleString('is-IS') + ' kr';

    // Showcase badge data
    const showcaseData = useMemo(() => {
        // Calculate achievements based on total performance
        const allUserSales = sales.filter(s => s.userId === user.staffId);
        const totalAllTime = allUserSales.reduce((sum, s) => sum + s.amount, 0);
        const totalCount = allUserSales.length;

        // Milestones
        const milestones = [
            { name: '100k Club', threshold: 100000, emoji: '💯', achieved: totalAllTime >= 100000 },
            { name: '500k Club', threshold: 500000, emoji: '🌟', achieved: totalAllTime >= 500000 },
            { name: '1M Club', threshold: 1000000, emoji: '💎', achieved: totalAllTime >= 1000000 },
            { name: '5M Club', threshold: 5000000, emoji: '👑', achieved: totalAllTime >= 5000000 },
            { name: '50 Sölur', threshold: 50, emoji: '🎯', achieved: totalCount >= 50 },
            { name: '100 Sölur', threshold: 100, emoji: '🌊', achieved: totalCount >= 100 },
            { name: '500 Sölur', threshold: 500, emoji: '🔥', achieved: totalCount >= 500 },
            { name: '1000 Sölur', threshold: 1000, emoji: '⚡', achieved: totalCount >= 1000 },
        ];

        // Calculate estimated coins from claimed bounties (rough estimate)
        const estimatedCoins = claimedBountyIds.length * 50; // avg 50 coins per bounty

        return {
            bountiesCompleted: claimedBountyIds.length,
            estimatedCoins,
            milestones,
            achievedMilestones: milestones.filter(m => m.achieved).length,
            battleWins: stats.wins,
            winRate: stats.winRate,
        };
    }, [sales, user, claimedBountyIds, stats]);

    return (
        <div className="space-y-6 p-4">
            {/* Header with Tabs */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-indigo-400" />
                        Tölfræði - {user.name}
                    </h2>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2
                            ${activeTab === 'stats'
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        <BarChart3 size={18} />
                        Tölfræði
                    </button>
                    <button
                        onClick={() => setActiveTab('showcase')}
                        className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2
                            ${activeTab === 'showcase'
                                ? 'bg-amber-500 text-white shadow-lg'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        <Trophy size={18} />
                        Sýningarsalur
                    </button>
                </div>
            </div>

            {/* Stats Tab Content */}
            {activeTab === 'stats' && (
                <>
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-slate-400">Heildarsala (30d)</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatISK(stats.totalSales)}</p>
                        </div>

                        <div className="glass rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-slate-400">Meðaltal/sala</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{formatISK(Math.round(stats.avgPerSale))}</p>
                        </div>

                        <div className="glass rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <span className="text-sm text-slate-400">Bardagasigrar</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {stats.wins}/{stats.wins + stats.losses}
                                <span className="text-sm text-slate-500 ml-2">({Math.round(stats.winRate)}%)</span>
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-slate-400">Besta klukkustund</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.bestHour}:00</p>
                        </div>
                    </div>

                    {/* Best/Worst Days */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-2xl p-4 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-slate-400">Besti dagur</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-400">{stats.bestDay}</p>
                        </div>
                        <div className="glass rounded-2xl p-4 border border-rose-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-rose-400" />
                                <span className="text-sm text-slate-400">Versti dagur</span>
                            </div>
                            <p className="text-xl font-bold text-rose-400">{stats.worstDay}</p>
                        </div>
                    </div>

                    {/* Sales Trend Chart */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            Sala síðustu 14 daga
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dailyChartData}>
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => [formatISK(value), 'Sala']}
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                                />
                                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Hourly Performance */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            Afköst eftir klukkustund
                        </h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={hourlyData}>
                                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} hide />
                                <Tooltip
                                    formatter={(value: number) => [formatISK(value), 'Sala']}
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Project Breakdown */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            Verkefnaskipting
                        </h3>
                        <div className="flex items-center gap-8">
                            <ResponsiveContainer width={150} height={150}>
                                <PieChart>
                                    <Pie
                                        data={projectData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                    >
                                        {projectData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {projectData.slice(0, 5).map((p, i) => (
                                    <div key={p.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-sm text-slate-400">{p.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">{formatISK(p.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Showcase Tab Content */}
            {activeTab === 'showcase' && (
                <div className="space-y-6">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
                            <div className="flex items-center gap-2 mb-3">
                                <Gift className="w-6 h-6 text-amber-400" />
                                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">Bounties</span>
                            </div>
                            <p className="text-4xl font-black text-white">{showcaseData.bountiesCompleted}</p>
                            <p className="text-xs text-slate-500 mt-1">Lokið í dag</p>
                        </div>

                        <div className="glass rounded-2xl p-5 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent">
                            <div className="flex items-center gap-2 mb-3">
                                <Coins className="w-6 h-6 text-yellow-400" />
                                <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Mynt</span>
                            </div>
                            <p className="text-4xl font-black text-white">{showcaseData.estimatedCoins}</p>
                            <p className="text-xs text-slate-500 mt-1">Áætluð mynt</p>
                        </div>

                        <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent">
                            <div className="flex items-center gap-2 mb-3">
                                <Medal className="w-6 h-6 text-violet-400" />
                                <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Áfangar</span>
                            </div>
                            <p className="text-4xl font-black text-white">{showcaseData.achievedMilestones}/{showcaseData.milestones.length}</p>
                            <p className="text-xs text-slate-500 mt-1">Náðst</p>
                        </div>

                        <div className="glass rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <div className="flex items-center gap-2 mb-3">
                                <Swords className="w-6 h-6 text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Bardagar</span>
                            </div>
                            <p className="text-4xl font-black text-white">{showcaseData.battleWins}</p>
                            <p className="text-xs text-slate-500 mt-1">Sigrar ({Math.round(showcaseData.winRate)}%)</p>
                        </div>
                    </div>

                    {/* Milestones Grid */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-400" />
                            Áfangar & Verðlaun
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {showcaseData.milestones.map((milestone, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-2xl border transition-all ${milestone.achieved
                                            ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/50'
                                            : 'bg-white/5 border-white/10 opacity-50'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{milestone.emoji}</div>
                                    <p className={`text-sm font-bold ${milestone.achieved ? 'text-white' : 'text-slate-500'}`}>
                                        {milestone.name}
                                    </p>
                                    {!milestone.achieved && (
                                        <p className="text-[10px] text-slate-600 mt-1">
                                            {milestone.threshold.toLocaleString('is-IS')}
                                        </p>
                                    )}
                                    {milestone.achieved && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star size={12} className="text-amber-400" />
                                            <span className="text-[10px] text-amber-400 font-bold">NÁÐST</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bounty Progress Summary */}
                    <div className="glass rounded-2xl p-6 border border-indigo-500/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-400" />
                            Bounty Framvinda
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="url(#bountyGradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(showcaseData.bountiesCompleted / 5) * 351.86} 351.86`}
                                    />
                                    <defs>
                                        <linearGradient id="bountyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-white">{showcaseData.bountiesCompleted}</span>
                                    <span className="text-xs text-slate-500">/5 í dag</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <p className="text-sm text-slate-400">
                                    Þú hefur lokið <span className="text-white font-bold">{showcaseData.bountiesCompleted} bounties</span> í dag
                                    og safnað <span className="text-amber-400 font-bold">{showcaseData.estimatedCoins} mynt</span>.
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (showcaseData.bountiesCompleted / 5) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">{Math.round((showcaseData.bountiesCompleted / 5) * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsView;
