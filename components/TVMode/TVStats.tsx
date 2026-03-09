import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Users, Clock, Zap, Award, Flame } from 'lucide-react';
import NumberTicker from '../NumberTicker';

interface TVStatsProps {
  users: any[];
  sales: any[];
}

const TVStats: React.FC<TVStatsProps> = ({ users, sales }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todaySales = sales.filter(s => s.date === todayStr);
    const totalAmount = todaySales.reduce((acc, s) => acc + s.amount, 0);
    const totalCount = todaySales.length;
    
    // Hourly breakdown
    const hourlyData: Record<number, number> = {};
    todaySales.forEach(sale => {
      const hour = new Date(sale.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + sale.amount;
    });

    // Find best hour
    let bestHour = 0;
    let bestHourAmount = 0;
    Object.entries(hourlyData).forEach(([hour, amount]) => {
      if (amount > bestHourAmount) {
        bestHour = parseInt(hour);
        bestHourAmount = amount;
      }
    });

    // Active sellers today
    const activeSellers = new Set(todaySales.map(s => s.userId)).size;

    // Average per sale
    const avgPerSale = totalCount > 0 ? totalAmount / totalCount : 0;

    // Team breakdown
    const teamData: Record<string, { amount: number; count: number }> = {};
    todaySales.forEach(sale => {
      const user = users.find(u => u.id === sale.userId);
      const team = user?.team || 'Óþekkt';
      if (!teamData[team]) teamData[team] = { amount: 0, count: 0 };
      teamData[team].amount += sale.amount;
      teamData[team].count += 1;
    });

    return {
      totalAmount,
      totalCount,
      activeSellers,
      avgPerSale,
      bestHour,
      bestHourAmount,
      hourlyData,
      teamData,
    };
  }, [sales, users, todayStr]);

  const formatISK = (amount: number) => {
    return new Intl.NumberFormat('is-IS').format(Math.round(amount));
  };

  const getHourLabel = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Generate hour labels for chart (8am to 8pm)
  const chartHours = Array.from({ length: 13 }, (_, i) => i + 8);
  const maxHourlyAmount = Math.max(...chartHours.map(h => stats.hourlyData[h] || 0), 1);

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-8">
        <BarChart3 className="w-12 h-12 text-emerald-400" />
        <div>
          <h1 className="text-4xl font-bold text-white">Tölfræði Dagsins</h1>
          <p className="text-xl text-zinc-400">
            {new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 rounded-2xl border border-emerald-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-300 font-medium">Heildarsala</span>
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            <NumberTicker value={stats.totalAmount} />
            <span className="text-xl ml-1 text-zinc-400">kr</span>
          </div>
        </motion.div>

        {/* Sale Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 rounded-2xl border border-blue-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-blue-300 font-medium">Fjöldi Sölu</span>
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            <NumberTicker value={stats.totalCount} />
          </div>
        </motion.div>

        {/* Active Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-2xl border border-purple-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-400" />
            <span className="text-purple-300 font-medium">Virkir Sölumenn</span>
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            <NumberTicker value={stats.activeSellers} />
            <span className="text-xl ml-1 text-zinc-400">/ {users.length}</span>
          </div>
        </motion.div>

        {/* Average per Sale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl border border-amber-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="text-amber-300 font-medium">Meðaltal/Sölu</span>
          </div>
          <div className="text-4xl font-bold font-mono text-white">
            <NumberTicker value={Math.round(stats.avgPerSale)} />
            <span className="text-xl ml-1 text-zinc-400">kr</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Hourly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-semibold text-white">Sala eftir Klukkustund</span>
            </div>
            {stats.bestHourAmount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">
                  Besta klst: {getHourLabel(stats.bestHour)} ({formatISK(stats.bestHourAmount)} kr)
                </span>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-48">
            {chartHours.map((hour, index) => {
              const amount = stats.hourlyData[hour] || 0;
              const height = maxHourlyAmount > 0 ? (amount / maxHourlyAmount) * 100 : 0;
              const isBestHour = hour === stats.bestHour && amount > 0;
              const currentHour = new Date().getHours();
              const isPast = hour < currentHour;
              const isCurrent = hour === currentHour;
              
              return (
                <motion.div
                  key={hour}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-full rounded-t-lg transition-colors ${
                      isBestHour
                        ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                        : isCurrent
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                        : isPast
                        ? 'bg-gradient-to-t from-zinc-700 to-zinc-600'
                        : 'bg-zinc-800'
                    }`}
                    style={{ height: '100%' }}
                  />
                  <span className={`text-xs ${isCurrent ? 'text-indigo-400 font-bold' : 'text-zinc-500'}`}>
                    {hour}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-cyan-400" />
            <span className="text-lg font-semibold text-white">Teymi</span>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.teamData)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([team, data], index) => (
                <motion.div
                  key={team}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{team}</span>
                    <span className="text-sm text-zinc-400">{data.count} sölu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(data.amount / (stats.totalAmount || 1)) * 100}%` 
                        }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                      />
                    </div>
                    <span className="font-mono text-cyan-400 w-24 text-right">
                      {formatISK(data.amount)} kr
                    </span>
                  </div>
                </motion.div>
              ))}

            {Object.keys(stats.teamData).length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                Engin gögn
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TVStats;
