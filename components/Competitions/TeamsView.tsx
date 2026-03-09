import React, { useMemo } from 'react';
import { Users, Trophy, TrendingUp, Award } from 'lucide-react';
import { User, Sale } from '../../types';
import { TEAMS, getTeamColor, getTeamIcon } from '../../utils/teams';

interface TeamsViewProps {
    users: User[];
    sales: Sale[];
    currentUser: User;
}

const TeamsView: React.FC<TeamsViewProps> = ({ users, sales, currentUser }) => {
    const teamStats = useMemo(() => {
        return Object.values(TEAMS).map(team => {
            // Get team members
            const members = users.filter(u => u.team === team.name);

            // Calculate team total sales
            const teamSales = sales.filter(s =>
                members.some(m => m.staffId === s.userId)
            ).reduce((sum, s) => sum + s.amount, 0);

            // Calculate average per member
            const avgPerMember = members.length > 0 ? teamSales / members.length : 0;

            return {
                ...team,
                members,
                memberCount: members.length,
                totalSales: teamSales,
                avgPerMember
            };
        });
    }, [users, sales]);

    // Sort teams by total sales
    const rankedTeams = [...teamStats].sort((a, b) => b.totalSales - a.totalSales);

    return (
        <div className="space-y-6">
            {/* Team  Rankings */}
            <div className="grid gap-4">
                {rankedTeams.map((team, index) => {
                    const isUserTeam = team.name === currentUser.team;
                    const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

                    return (
                        <div
                            key={team.id}
                            className={`glass rounded-2xl p-6 transition-all ${isUserTeam ? 'border-2 shadow-lg' : 'border border-white/5'
                                }`}
                            style={isUserTeam ? { borderColor: team.color } : {}}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{rankIcon}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{team.icon}</span>
                                            <h3 className="text-2xl font-black" style={{ color: team.color }}>
                                                {team.name}
                                            </h3>
                                        </div>
                                        <div className="text-sm text-slate-500">{team.memberCount} meðlimir</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Heildarsala</div>
                                    <div className="text-2xl font-black" style={{ color: team.color }}>
                                        {team.totalSales.toLocaleString()} kr
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Meðaltal: {Math.round(team.avgPerMember).toLocaleString()} kr/meðlim
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-2">
                                    <Users size={14} />
                                    Liðsfélagar
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {team.members.slice(0, 6).map(member => {
                                        const memberSales = sales
                                            .filter(s => s.userId === member.staffId)
                                            .reduce((sum, s) => sum + s.amount, 0);

                                        return (
                                            <div
                                                key={member.id}
                                                className={`glass rounded-lg p-2 ${member.staffId === currentUser.staffId ? 'border border-white/20' : ''
                                                    }`}
                                            >
                                                <div className="font-bold text-sm text-white truncate">
                                                    {member.name}
                                                    {member.staffId === currentUser.staffId && ' (You)'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {memberSales.toLocaleString()} kr
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {team.memberCount > 6 && (
                                        <div className="glass rounded-lg p-2 flex items-center justify-center text-slate-500">
                                            +{team.memberCount - 6} fleiri
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Team Battle Stats (Placeholder for future) */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-black text-white mb-4 flex items-center gap-2">
                    <Trophy size={20} />
                    Lið á móti Liði
                </h3>
                <div className="text-center py-8 text-slate-500">
                    Liðabardagar í bígerð!
                </div>
            </div>
        </div>
    );
};

export default TeamsView;
