import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, Clock, Trophy, Flame, Users, Zap } from 'lucide-react';
import NumberTicker from '../NumberTicker';

interface TVBattlesProps {
  battles: any[];
  users: any[];
}

const TVBattles: React.FC<TVBattlesProps> = ({ battles, users }) => {
  const activeBattles = useMemo(() => {
    return battles.filter(b => b.status === 'active').slice(0, 4);
  }, [battles]);

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Lokið';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}klst ${mins}mín`;
    return `${mins} mín`;
  };

  const formatISK = (amount: number) => {
    return new Intl.NumberFormat('is-IS').format(amount);
  };

  const getBattleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      quick: 'Hraðbardagi',
      standard: 'Venjulegur',
      marathon: 'Maraþon',
      team: 'Liðsbardagi',
      boss: 'Boss Bardagi',
    };
    return labels[type] || type;
  };

  const getBattleTypeIcon = (type: string) => {
    switch (type) {
      case 'quick':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'team':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'boss':
        return <Flame className="w-5 h-5 text-red-400" />;
      default:
        return <Swords className="w-5 h-5 text-indigo-400" />;
    }
  };

  if (activeBattles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Swords className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-zinc-400 mb-2">Engir bardagar í gangi</h2>
          <p className="text-xl text-zinc-600">Byrjaðu bardaga til að sjá hann hér!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-8">
        <Swords className="w-12 h-12 text-indigo-400" />
        <div>
          <h1 className="text-4xl font-bold text-white">Virkir Bardagar</h1>
          <p className="text-xl text-zinc-400">
            {activeBattles.length} bardagi{activeBattles.length !== 1 ? 'ar' : ''} í gangi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {activeBattles.map((battle, index) => {
          const participants = battle.participants || [];
          const leader = participants.reduce((a: any, b: any) => 
            (a.currentSales || 0) > (b.currentSales || 0) ? a : b
          , { currentSales: 0 });
          
          return (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="bg-zinc-900/70 rounded-3xl border border-zinc-800 overflow-hidden"
            >
              {/* Battle Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {getBattleTypeIcon(battle.type)}
                  <span className="font-semibold text-white">{getBattleTypeLabel(battle.type)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="font-mono text-zinc-300">{formatTimeRemaining(battle.endTime)}</span>
                </div>
              </div>

              {/* Participants */}
              <div className="p-6">
                <div className="space-y-4">
                  {participants.slice(0, 4).map((participant: any, pIndex: number) => {
                    const isLeader = participant.userId === leader.userId && leader.currentSales > 0;
                    const percentage = leader.currentSales > 0 
                      ? (participant.currentSales / leader.currentSales) * 100 
                      : 0;
                    
                    return (
                      <motion.div
                        key={participant.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + pIndex * 0.1 }}
                        className="relative"
                      >
                        <div className="flex items-center gap-4 relative z-10">
                          {/* Avatar */}
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${
                              isLeader ? 'ring-yellow-400' : 'ring-zinc-700'
                            }`}>
                              {participant.avatar ? (
                                <img
                                  src={participant.avatar}
                                  alt={participant.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                  {participant.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            {isLeader && (
                              <div className="absolute -top-1 -right-1">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                              </div>
                            )}
                          </div>

                          {/* Name & Progress */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold truncate ${isLeader ? 'text-yellow-400' : 'text-white'}`}>
                                {participant.name}
                              </span>
                              <span className={`font-mono text-lg ${isLeader ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                <NumberTicker value={participant.currentSales || 0} />
                                <span className="text-sm ml-1">kr</span>
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  isLeader 
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' 
                                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stakes */}
                {battle.stakes?.coinBet > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-center gap-2">
                    <span className="text-zinc-500">Veðmál:</span>
                    <span className="font-bold text-yellow-400">
                      {battle.stakes.coinBet} 🪙
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TVBattles;
