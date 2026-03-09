import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Calendar, Users, Flame, Target } from 'lucide-react';
import { Sale, Shift, User } from '../../types';

interface MultiLeaderboardViewProps {
    sales: Sale[];
    shifts: Shift[];
    users: User[];
    currentUser: User;
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'all_time';
type Category = 'sales' | 'battles' | 'team' | 'streaks' | 'projects';

const MultiLeaderboardView: React.FC<MultiLeaderboardViewProps> = ({ sales, shifts, users, currentUser }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
    const [category, setCategory] = useState<Category>('sales');

    // Calculate leaderboard data based on time range and category
    const leaderboardData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        // Set time range
        switch (timeRange) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'all_time':
                startDate = new Date(0);
                break;
        }

        // Filter sales by time range
        const filteredSales = sales.filter(s => new Date(s.date) >= startDate);

        // Calculate rankings
        const rankings = users.map(user => {
            const userSales = filteredSales.filter(s => s.userId === user.staffId);
            const totalSales = userSales.reduce((sum, s) => sum + s.amount, 0);
            const salesCount = userSales.length;

            return {
                userId: user.staffId,
                name: user.name,
                team: user.team,
                totalSales,
                salesCount,
                avgSaleSize: salesCount > 0 ? totalSales / salesCount : 0
            };
        });

        // Sort by total sales
        rankings.sort((a, b) => b.totalSales - a.totalSales);

        return rankings;
    }, [sales, users, timeRange]);

    const timeRanges: { id: TimeRange; label: string; icon: any }[] = [
        { id: 'daily', label: 'Daglega', icon: Calendar },
        { id: 'weekly', label: 'Vikuna', icon: TrendingUp },
        { id: 'monthly', label: 'Mánuðinn', icon: Trophy },
        { id: 'all_time', label: 'Allt', icon: Flame }
    ];

    const userRank = leaderboardData.findIndex(r => r.userId === currentUser.staffId) + 1;

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex gap-2 overflow-x-auto">
                {timeRanges.map(range => {
                    const Icon = range.icon;
                    return (
                        <button
                            key={range.id}
                            onClick={() => setTimeRange(range.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${timeRange === range.id
                                    ? 'gradient-bg text-white shadow-lg scale-105'
                                    : 'glass text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={16} />
                            {range.label}
                        </button>
                    );
                })}
            </div>

            {/* Your Position Card */}
            {userRank > 0 && (
                <div className="glass rounded-2xl p-4 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Þín staða</div>
                            <div className="text-2xl font-black text-indigo-400">#{userRank}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Heildarsala</div>
                            <div className="text-2xl font-black text-white">
                                {leaderboardData[userRank - 1]?.totalSales.toLocaleString()} kr
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 bg-white/2">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Sæti</div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Nafn</div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider text-right">Sala</div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-wider text-right">Fjöldi</div>
                </div>

                <div className="divide-y divide-white/5">
                    {leaderboardData.slice(0, 20).map((entry, index) => {
                        const isCurrentUser = entry.userId === currentUser.staffId;
                        const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500';

                        return (
                            <div
                                key={entry.userId}
                                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 transition-colors ${isCurrentUser ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'hover:bg-white/2'
                                    }`}
                            >
                                {/* Rank */}
                                <div className={`font-black text-lg ${rankColor} flex items-center justify-center w-8`}>
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `#${index + 1}`}
                                </div>

                                {/* Name & Team */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center font-black text-white">
                                        {entry.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className={`font-bold ${isCurrentUser ? 'text-indigo-400' : 'text-white'}`}>
                                            {entry.name}
                                            {isCurrentUser && ' (You)'}
                                        </div>
                                        <div className="text-xs text-slate-500">{entry.team}</div>
                                    </div>
                                </div>

                                {/* Total Sales */}
                                <div className="text-right">
                                    <div className="font-black text-white">{entry.totalSales.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500">kr</div>
                                </div>

                                {/* Sales Count */}
                                <div className="text-right">
                                    <div className="font-bold text-slate-400">{entry.salesCount}</div>
                                    <div className="text-xs text-slate-600">sölur</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MultiLeaderboardView;
