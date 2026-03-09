import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, Flame } from 'lucide-react';
import NumberTicker from '../NumberTicker';

interface TVLeaderboardProps {
  users: any[];
  sales: any[];
}

const TVLeaderboard: React.FC<TVLeaderboardProps> = ({ users, sales }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const leaderboardData = useMemo(() => {
    const userSales = users.map(user => {
      const userTodaySales = sales.filter(s => {
        if (s.userId !== (user.id || user.staffId)) return false;
        // Support both date string and timestamp
        const saleDate = s.date || (s.timestamp ? new Date(s.timestamp).toISOString().split('T')[0] : '');
        return saleDate === todayStr;
      });
      const totalAmount = userTodaySales.reduce((acc, s) => acc + (s.amount || 0), 0);
      const saleCount = userTodaySales.length;
      
      return {
        id: user.id || user.staffId,
        name: user.name,
        team: user.team,
        avatar: user.avatar || user.photoURL || '',
        totalSales: totalAmount,
        saleCount,
        streak: user.streak || 0,
        leagueTier: user.leagueTier || 'Bronze',
        equippedCosmetics: user.equippedCosmetics || {},
      };
    });

    return userSales
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
  }, [users, sales, todayStr]);

  const formatISK = (amount: number) => {
    return new Intl.NumberFormat('is-IS').format(amount);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-7 h-7 text-zinc-300" />;
      case 3:
        return <Award className="w-7 h-7 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-zinc-500">{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-zinc-400/20 via-zinc-300/10 to-transparent border-zinc-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-amber-600/30';
      default:
        return 'bg-zinc-900/50 border-zinc-800';
    }
  };

  const getLeagueBadge = (tier: string) => {
    const colors: Record<string, string> = {
      Bronze: 'text-amber-700 bg-amber-900/30 border-amber-700/30',
      Silver: 'text-zinc-300 bg-zinc-700/30 border-zinc-500/30',
      Gold: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
      Platinum: 'text-cyan-300 bg-cyan-900/30 border-cyan-500/30',
      Diamond: 'text-purple-300 bg-purple-900/30 border-purple-500/30',
    };
    return colors[tier] || colors.Bronze;
  };

  const totalTeamSales = useMemo(() => {
    const teams: Record<string, number> = {};
    leaderboardData.forEach(user => {
      teams[user.team] = (teams[user.team] || 0) + user.totalSales;
    });
    return Object.entries(teams).sort((a, b) => b[1] - a[1]);
  }, [leaderboardData]);

  return (
    <div className="h-full flex gap-8">
      {/* Main Leaderboard */}
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="w-12 h-12 text-yellow-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Stigatafla Dagsins</h1>
            <p className="text-xl text-zinc-400">
              {new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboardData.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-6 p-4 rounded-2xl border ${getRankBackground(index + 1)}`}
            >
              {/* Rank */}
              <div className="w-16 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <div className="relative">
                <div 
                  className={`w-16 h-16 rounded-full overflow-hidden ring-2 ${
                    index === 0 ? 'ring-yellow-400 ring-offset-2 ring-offset-black' :
                    index === 1 ? 'ring-zinc-300 ring-offset-2 ring-offset-black' :
                    index === 2 ? 'ring-amber-600 ring-offset-2 ring-offset-black' :
                    'ring-zinc-700'
                  }`}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                {user.streak >= 3 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-500 rounded-full text-xs font-bold text-white">
                    <Flame className="w-3 h-3" />
                    {user.streak}
                  </div>
                )}
              </div>

              {/* Name & Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${index < 3 ? 'text-white' : 'text-zinc-200'}`}>
                    {user.name}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getLeagueBadge(user.leagueTier)}`}>
                    {user.leagueTier}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-zinc-500">{user.team}</span>
                  <span className="text-sm text-zinc-500">•</span>
                  <span className="text-sm text-zinc-400">{user.saleCount} sölu</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className={`text-3xl font-bold font-mono ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-zinc-200' :
                  index === 2 ? 'text-amber-500' :
                  'text-white'
                }`}>
                  <NumberTicker value={user.totalSales} />
                  <span className="text-lg ml-1">kr</span>
                </div>
              </div>
            </motion.div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Trophy className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-xl">Engar sölur skráðar í dag</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Summary Sidebar */}
      <div className="w-80">
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Teymi Dagsins
          </h2>
          
          <div className="space-y-4">
            {totalTeamSales.map(([team, total], index) => (
              <motion.div
                key={team}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-400" />}
                  <span className="font-medium text-white">{team}</span>
                </div>
                <span className="font-mono text-lg text-emerald-400">
                  {formatISK(total)} kr
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today's Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 p-6"
        >
          <h3 className="text-sm font-medium text-indigo-300 mb-2">Heildarsala Dagsins</h3>
          <div className="text-4xl font-bold font-mono text-white">
            <NumberTicker value={leaderboardData.reduce((acc, u) => acc + u.totalSales, 0)} />
            <span className="text-xl ml-2">kr</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TVLeaderboard;
