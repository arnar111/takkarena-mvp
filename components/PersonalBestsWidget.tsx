/**
 * Personal Bests Widget
 * Shows user's personal records and celebrates new ones
 * Version 4.0.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Flame, Target, Star, ChevronDown, ChevronUp, Crown, Zap } from 'lucide-react';
import { PersonalBests, PersonalBestBreak, formatPersonalBestValue } from '../utils/personalBests';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalBestsWidgetProps {
  personalBests: PersonalBests;
  approachingRecord: string | null;
  compact?: boolean;
}

export const PersonalBestsWidget: React.FC<PersonalBestsWidgetProps> = ({
  personalBests,
  approachingRecord,
  compact = false
}) => {
  const [expanded, setExpanded] = useState(!compact);

  const records = [
    {
      key: 'highestDailySales',
      label: 'Besti dagur',
      value: personalBests.highestDailySales,
      icon: <TrendingUp size={16} className="text-emerald-400" />,
      format: (v: any) => formatPersonalBestValue('highestDailySales', v.amount),
      subtext: (v: any) => formatDate(v.date)
    },
    {
      key: 'highestSingleSale',
      label: 'Stærsta sala',
      value: personalBests.highestSingleSale,
      icon: <Star size={16} className="text-amber-400" />,
      format: (v: any) => formatPersonalBestValue('highestSingleSale', v.amount),
      subtext: (v: any) => v.project
    },
    {
      key: 'longestStreak',
      label: 'Lengsta strík',
      value: personalBests.longestStreak,
      icon: <Flame size={16} className="text-orange-400" />,
      format: (v: any) => formatPersonalBestValue('longestStreak', v.days),
      subtext: (v: any) => `${formatDate(v.startDate)} - ${formatDate(v.endDate)}`
    },
    {
      key: 'mostSalesInDay',
      label: 'Flestar sölur á dag',
      value: personalBests.mostSalesInDay,
      icon: <Target size={16} className="text-blue-400" />,
      format: (v: any) => formatPersonalBestValue('mostSalesInDay', v.count),
      subtext: (v: any) => formatDate(v.date)
    },
    {
      key: 'bestWeek',
      label: 'Besta vika',
      value: personalBests.bestWeek,
      icon: <Crown size={16} className="text-purple-400" />,
      format: (v: any) => formatPersonalBestValue('bestWeek', v.amount),
      subtext: (v: any) => `Vika ${formatWeek(v.weekStart)}`
    },
    {
      key: 'highestHourlyRate',
      label: 'Hæsta tímagjald',
      value: personalBests.highestHourlyRate,
      icon: <Zap size={16} className="text-yellow-400" />,
      format: (v: any) => formatPersonalBestValue('highestHourlyRate', v.rate),
      subtext: (v: any) => formatDate(v.date)
    }
  ].filter(r => r.value !== null);

  if (records.length === 0) {
    return null; // Don't show if no records yet
  }

  return (
    <div className="glass rounded-3xl p-4 border border-white/10">
      {/* Header */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Trophy size={18} className="text-amber-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-wide">
              Persónuleg met
            </h3>
            <p className="text-[10px] text-slate-500">
              {records.length} met skráð
            </p>
          </div>
        </div>
        {compact && (
          expanded ? <ChevronUp size={16} className="text-slate-400" /> 
                   : <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {/* Approaching Record Alert */}
      <AnimatePresence>
        {approachingRecord && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-3">
              <p className="text-xs font-bold text-amber-300 animate-pulse">
                {approachingRecord}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Records Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {records.map((record) => (
              <div
                key={record.key}
                className="bg-white/5 rounded-2xl p-3 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  {record.icon}
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {record.label}
                  </span>
                </div>
                <p className="text-lg font-black text-white">
                  {record.format(record.value)}
                </p>
                <p className="text-[9px] text-slate-500 truncate">
                  {record.subtext(record.value)}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * New Record Celebration Modal
 */
interface NewRecordModalProps {
  records: PersonalBestBreak[];
  onClose: () => void;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  records,
  onClose
}) => {
  if (records.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-amber-900/90 to-orange-900/90 rounded-[32px] p-8 max-w-md w-full border border-amber-500/30 shadow-2xl"
      >
        {/* Confetti effect placeholder */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 400 - 200, rotate: 0 }}
              animate={{ 
                y: 500, 
                x: Math.random() * 400 - 200,
                rotate: 360 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                delay: Math.random() * 0.5,
                repeat: Infinity 
              }}
              className="absolute w-2 h-2 rounded-sm"
              style={{ 
                backgroundColor: ['#FFD700', '#FF6B35', '#FF3366', '#FFE66D'][i % 4],
                left: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="inline-flex p-4 rounded-full bg-amber-500/30 mb-4"
            >
              <Trophy size={48} className="text-amber-400" />
            </motion.div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Nýtt Met! 🎉
            </h2>
            <p className="text-amber-200/80 text-sm mt-1">
              Þú slóst persónulegt met!
            </p>
          </div>

          {/* Records */}
          <div className="space-y-3 mb-6">
            {records.map((record, index) => (
              <motion.div
                key={record.type}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{record.icon}</span>
                  <div>
                    <p className="text-white font-bold">{record.label}</p>
                    <p className="text-amber-200/60 text-xs">
                      Áður: {formatRecordValue(record.type, record.previousValue)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-amber-400">
                    {formatRecordValue(record.type, record.newValue)}
                  </p>
                  <p className="text-emerald-400 text-xs font-bold">
                    +{record.improvement}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            Frábært! 🏆
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Helpers
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('is-IS', { day: 'numeric', month: 'short' });
}

function formatWeek(weekStartStr: string): string {
  const date = new Date(weekStartStr);
  const weekNum = getWeekNumber(date);
  return String(weekNum);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatRecordValue(type: string, value: number): string {
  switch (type) {
    case 'highestDailySales':
    case 'highestSingleSale':
    case 'bestWeek':
    case 'bestMonth':
      return new Intl.NumberFormat('is-IS').format(value) + ' kr';
    case 'mostSalesInDay':
      return value + ' sölur';
    case 'longestStreak':
      return value + ' dagar';
    case 'highestHourlyRate':
      return new Intl.NumberFormat('is-IS').format(Math.round(value)) + ' kr/klst';
    default:
      return String(value);
  }
}

export default PersonalBestsWidget;
