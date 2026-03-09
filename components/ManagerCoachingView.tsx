import React, { useState } from 'react';
import {
    Users, Target, MessageCircle, Send, TrendingUp, Award,
    ChevronRight, Plus, Bell, X, UserCheck
} from 'lucide-react';
import { User, Sale, Shift } from '../types';
import { assignChallenge } from '../services/challengeService';

interface ManagerCoachingViewProps {
    currentUser: User;
    allUsers: User[];
    sales: Sale[];
    shifts: Shift[];
    onSendNudge?: (userId: string, message: string) => void;
}

const ManagerCoachingView: React.FC<ManagerCoachingViewProps> = ({
    currentUser,
    allUsers,
    sales,
    shifts,
    onSendNudge
}) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showAssignChallenge, setShowAssignChallenge] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState('');

    // Challenge form
    const [challengeTitle, setChallengeTitle] = useState('');
    const [challengeDesc, setChallengeDesc] = useState('');
    const [challengeTarget, setChallengeTarget] = useState(1);
    const [challengeReward, setChallengeReward] = useState(25);

    // Get team members (exclude self)
    const teamMembers = allUsers.filter(u => u.staffId !== currentUser.staffId);

    // Calculate user stats
    const getUserStats = (user: User) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const userSales = sales.filter(s => s.userId === user.staffId);
        const todaySales = userSales.filter(s => s.timestamp.startsWith(todayStr));
        const todayTotal = todaySales.reduce((sum, s) => sum + s.amount, 0);

        // Monthly average
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthSales = userSales.filter(s => new Date(s.timestamp) >= thirtyDaysAgo);
        const monthTotal = monthSales.reduce((sum, s) => sum + s.amount, 0);
        const daysActive = new Set(monthSales.map(s => s.timestamp.split('T')[0])).size;
        const avgDaily = daysActive > 0 ? monthTotal / daysActive : 0;

        return { todayTotal, todaySales: todaySales.length, monthTotal, avgDaily };
    };

    const handleAssignChallenge = async () => {
        if (!selectedUser || !challengeTitle) return;

        try {
            await assignChallenge(
                currentUser.staffId,
                selectedUser.staffId,
                challengeTitle,
                challengeDesc,
                challengeTarget,
                challengeReward,
                1 // expires in 1 day
            );

            setShowAssignChallenge(false);
            setChallengeTitle('');
            setChallengeDesc('');
            setChallengeTarget(1);
            setChallengeReward(25);
        } catch (err) {
            console.error('Failed to assign challenge:', err);
        }
    };

    const handleSendNudge = () => {
        if (!selectedUser || !nudgeMessage.trim()) return;
        onSendNudge?.(selectedUser.staffId, nudgeMessage);
        setNudgeMessage('');
    };

    const formatISK = (val: number) => val.toLocaleString('is-IS') + ' kr';

    return (
        <div className="h-full flex">
            {/* User List */}
            <div className="w-80 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Liðsmenn
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {teamMembers.map(user => {
                        const stats = getUserStats(user);
                        const isSelected = selectedUser?.staffId === user.staffId;

                        return (
                            <button
                                key={user.staffId}
                                onClick={() => setSelectedUser(user)}
                                className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors
                  ${isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                                  flex items-center justify-center text-sm font-bold text-white">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.team}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-400">{formatISK(stats.todayTotal)}</p>
                                        <p className="text-xs text-slate-500">í dag</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* User Detail / Actions */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* User Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 
                                flex items-center justify-center text-2xl font-bold text-white">
                                    {selectedUser.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                                    <p className="text-slate-400">{selectedUser.team} • {selectedUser.role}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                {(() => {
                                    const stats = getUserStats(selectedUser);
                                    return (
                                        <>
                                            <div className="glass rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500">Í dag</p>
                                                <p className="text-lg font-bold text-white">{formatISK(stats.todayTotal)}</p>
                                            </div>
                                            <div className="glass rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500">Sölur í dag</p>
                                                <p className="text-lg font-bold text-white">{stats.todaySales}</p>
                                            </div>
                                            <div className="glass rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500">Mánaðarsala</p>
                                                <p className="text-lg font-bold text-white">{formatISK(stats.monthTotal)}</p>
                                            </div>
                                            <div className="glass rounded-xl p-3 border border-white/5">
                                                <p className="text-xs text-slate-500">Meðaltal/dag</p>
                                                <p className="text-lg font-bold text-white">{formatISK(Math.round(stats.avgDaily))}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            {/* Assign Challenge */}
                            <div className="glass rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-purple-400" />
                                        Úthluta áskorun
                                    </h3>
                                    <button
                                        onClick={() => setShowAssignChallenge(!showAssignChallenge)}
                                        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
                                    >
                                        {showAssignChallenge ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </button>
                                </div>

                                {showAssignChallenge && (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Titill áskorunar"
                                            value={challengeTitle}
                                            onChange={(e) => setChallengeTitle(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Lýsing"
                                            value={challengeDesc}
                                            onChange={(e) => setChallengeDesc(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500"
                                        />
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500">Markmið</label>
                                                <input
                                                    type="number"
                                                    value={challengeTarget}
                                                    onChange={(e) => setChallengeTarget(parseInt(e.target.value) || 1)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500">Verðlaun (coins)</label>
                                                <input
                                                    type="number"
                                                    value={challengeReward}
                                                    onChange={(e) => setChallengeReward(parseInt(e.target.value) || 10)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAssignChallenge}
                                            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
                                        >
                                            Senda áskorun
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Send Nudge */}
                            <div className="glass rounded-2xl p-4 border border-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <Bell className="w-5 h-5 text-amber-400" />
                                    Senda hvatningu
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Skrifa skilaboð..."
                                        value={nudgeMessage}
                                        onChange={(e) => setNudgeMessage(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendNudge()}
                                    />
                                    <button
                                        onClick={handleSendNudge}
                                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Quick nudges */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {['Gott gengi! 💪', 'Þú getur þetta! 🔥', 'Ýttu á! 🚀'].map(msg => (
                                        <button
                                            key={msg}
                                            onClick={() => {
                                                setNudgeMessage(msg);
                                            }}
                                            className="px-3 py-1 rounded-full bg-white/5 text-sm text-slate-400 hover:bg-white/10 transition-colors"
                                        >
                                            {msg}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500">Veldu liðsmann til að stjórna</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerCoachingView;
