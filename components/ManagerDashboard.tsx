
// Fix: Added missing export default and completed the truncated file content.
import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Shift, Sale, User, WageSummary } from '../types';
import {
  TrendingUp, Users, Target, Zap,
  ShieldCheck, Trophy, Activity, Heart, Settings, Save, DollarSign, ChevronDown, ChevronUp, Eye, EyeOff, BrainCircuit, Clock, Star, Gift
} from 'lucide-react';
import { calculateEffectiveHours, calculateVelocity } from '../utils/calculations.ts';
import { getManagerCommandAnalysis } from '../geminiService.ts';

interface ManagerDashboardProps {
  allShifts: Shift[];
  allSales: Sale[];
  allUsers: User[];
  currentUser: User;
  personalSummary: WageSummary;
}

interface TeamGoals {
  monthly: number;
}

// Added interface for charity stats to fix property access on unknown type
interface ProjectStat {
  sales: number;
  count: number;
  hours: number;
  effHours: number;
  profit: number;
  isk_per_hour: number;
}

const Speedometer = ({ value, max, label }: { value: number; max: number; label: string }) => {
  const percentage = Math.min(100, (value / max) * 100);
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center p-8 glass rounded-[48px] border-[#d4af37]/30 shadow-2xl overflow-hidden min-h-[320px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent pointer-events-none" />
      <div className="relative w-64 h-32 overflow-hidden mb-6">
        <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-white/5 rounded-full" />
        <div
          className="absolute top-0 left-0 w-64 h-64 border-[16px] border-[#d4af37] rounded-full transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(212,175,55,0.5)]"
          style={{ clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, 150% 50%)`, transform: `rotate(${rotation}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full z-10 shadow-lg border-4 border-slate-900" />
      </div>
      <div className="text-center z-10">
        <h4 className="text-5xl font-black text-white italic tracking-tighter">{Math.round(percentage)}%</h4>
        <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em] mt-2">{label}</p>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ allShifts, allSales, allUsers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'agents'>('overview');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [teamGoals, setTeamGoals] = useState<TeamGoals>({ monthly: 8000000 });
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [aiPulse, setAiPulse] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const formatISK = (val: number) => new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchGoals = async () => {
      const goalDoc = await getDoc(doc(db, "config", "team_goals"));
      if (goalDoc.exists()) setTeamGoals(goalDoc.data() as TeamGoals);
    };
    fetchGoals();
  }, []);

  const saveGoals = async () => {
    await setDoc(doc(db, "config", "team_goals"), teamGoals);
    alert("Mánaðarmarkmið vistuð!");
  };

  const displayData = useMemo(() => {
    if (!isDemoMode) return { users: allUsers, shifts: allShifts, sales: allSales };

    const demoCharities = ["Samhjálp", "SKB", "Stígamót", "Ljósið", "Krabbameinsfélagið", "Þroskahjálp"];
    const users: User[] = [
      { id: 'g1', staffId: '101', name: 'Arnar Kristinn', role: 'agent', team: 'Hringurinn' },
      { id: 'g2', staffId: '102', name: 'Brynja Dögg', role: 'agent', team: 'Verið' },
      { id: 'g3', staffId: '103', name: 'Davíð Örn', role: 'agent', team: 'Hringurinn' },
      { id: 'g4', staffId: '104', name: 'Elísabet Jóns', role: 'agent', team: 'Verið' },
      { id: 'g5', staffId: '105', name: 'Gunnar Freyr', role: 'agent', team: 'Götuteymið' },
    ];

    const shifts: Shift[] = [];
    const sales: Sale[] = [];
    const today = new Date().toISOString().split('T')[0];

    users.forEach(u => {
      shifts.push({ id: `s-${u.id}`, userId: u.staffId, date: today, dayHours: 6, eveningHours: 2, totalSales: 0, notes: 'Sýndargögn', projectName: u.team });
      demoCharities.forEach(charity => {
        if (Math.random() > 0.2) {
          const amount = 10000 + Math.random() * 80000;
          sales.push({ id: `sa-${u.id}-${charity}`, userId: u.staffId, date: today, timestamp: new Date().toISOString(), amount, project: charity });
        }
      });
    });

    return { users, shifts, sales };
  }, [isDemoMode, allUsers, allShifts, allSales]);

  // Derived Charity Metrics
  const charityStats = useMemo(() => {
    const stats: Record<string, ProjectStat> = {};

    // Aggregate sales per project
    displayData.sales.forEach(s => {
      const p = s.project || 'Annað';
      if (!stats[p]) stats[p] = { sales: 0, count: 0, hours: 0, effHours: 0, profit: 0, isk_per_hour: 0 };
      stats[p].sales += s.amount;
      stats[p].count += 1;
    });

    // Aggregate hours per project (using shift.projectName as identifier)
    displayData.shifts.forEach(s => {
      const p = s.projectName || 'Annað';
      if (stats[p]) {
        stats[p].hours += (s.dayHours + s.eveningHours);
      }
    });

    Object.keys(stats).forEach(p => {
      stats[p].effHours = calculateEffectiveHours(stats[p].hours);
      stats[p].isk_per_hour = stats[p].effHours > 0 ? stats[p].sales / stats[p].effHours : 0;
      // Hagnaður félags: (Heildarsöfnun - (Virkir tímar * 2724.88))
      stats[p].profit = stats[p].sales - (stats[p].effHours * 2724.88);
    });

    return stats;
  }, [displayData]);

  const totalTeamSales = useMemo(() => displayData.sales.reduce((acc, s) => acc + s.amount, 0), [displayData.sales]);
  const velocity = useMemo(() => calculateVelocity(totalTeamSales, teamGoals.monthly), [totalTeamSales, teamGoals.monthly]);

  const agentLeaderboard = useMemo(() => {
    return displayData.users.filter(u => u.role === 'agent').map(u => {
      const uSales = displayData.sales.filter(s => s.userId === u.staffId);
      const uShifts = displayData.shifts.filter(s => s.userId === u.staffId);
      const rev = uSales.reduce((acc, s) => acc + s.amount, 0);
      const hrs = uShifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0);
      const effH = calculateEffectiveHours(hrs);
      const count = uSales.length;

      const projectTallies: Record<string, number> = {};
      uSales.forEach(s => projectTallies[s.project] = (projectTallies[s.project] || 0) + s.amount);
      const topProject = Object.entries(projectTallies).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Engin sala';

      return {
        ...u,
        totalSales: rev,
        effHours: effH,
        efficiency: effH > 0 ? rev / effH : 0,
        avgSale: count > 0 ? rev / count : 0,
        topProject,
        count
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [displayData]);

  // AI Pulse Fetch
  useEffect(() => {
    const runAI = async () => {
      if (displayData.sales.length === 0) return;
      setIsLoadingAI(true);
      const res = await getManagerCommandAnalysis(charityStats);
      setAiPulse(res);
      setIsLoadingAI(false);
    };
    runAI();
  }, [isDemoMode, activeTab, charityStats]);

  return (
    <div className="space-y-8 pb-32">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            <ShieldCheck size={36} className="text-[#d4af37]" /> Command Center
          </h2>
          <p className="text-[10px] font-black text-[#d4af37]/60 uppercase tracking-[0.4em] mt-2 italic">Góðgerðarfélög & Sölufólk</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDemoMode ? 'bg-indigo-500 text-white shadow-lg' : 'glass text-slate-500 hover:text-white'}`}
          >
            {isDemoMode ? <Eye size={16} /> : <EyeOff size={16} />} Sýndargögn
          </button>

          <div className="flex bg-[#0f172a] p-1.5 rounded-[24px] border border-white/5 shadow-2xl">
            {[
              { id: 'overview', label: 'Yfirlit', icon: <Activity size={16} /> },
              { id: 'projects', label: 'Góðgerðarfélög', icon: <Heart size={16} /> },
              { id: 'agents', label: 'Sölumenn', icon: <Users size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#d4af37] text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Speedometer value={totalTeamSales} max={teamGoals.monthly} label="Staða liðsins" />

              <div className="glass p-10 rounded-[48px] border-white/5 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingUp size={150} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Mánaðarhraði (Velocity)</p>
                  <h3 className="text-5xl font-black text-white italic tracking-tighter">{Math.round(velocity.pacePercent)}%</h3>
                  <p className={`text-[9px] font-bold uppercase mt-2 tracking-widest italic ${velocity.pacePercent >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {velocity.pacePercent >= 100 ? 'Framar áætlun' : 'Undir áætlun'}
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-black">
                  <span className="text-slate-500 uppercase tracking-widest italic">Spáð lokasala:</span>
                  <span className="text-white text-lg italic">{formatISK(velocity.projected)}</span>
                </div>
              </div>

              <div className="glass p-10 rounded-[48px] border-[#d4af37]/20 flex flex-col justify-between bg-gradient-to-br from-[#d4af37]/5 to-transparent relative shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <BrainCircuit className="text-[#d4af37]" size={24} />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">AI Pulse</h3>
                  </div>
                  {isLoadingAI ? (
                    <div className="space-y-4 animate-pulse"><div className="h-4 w-full bg-white/5 rounded" /><div className="h-4 w-3/4 bg-white/5 rounded" /></div>
                  ) : (
                    <p className="text-sm font-bold text-slate-200 leading-relaxed italic border-l-4 border-[#d4af37] pl-6 py-2">
                      "{aiPulse?.strategicAdvice || "Greini árangur félaganna... BI er að reikna besta arðinn."}"
                    </p>
                  )}
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Hagkvæmasta verkefnið</span>
                  <span className="text-xs font-black text-white uppercase italic tracking-tighter bg-[#d4af37]/10 px-3 py-1 rounded-full">{aiPulse?.topProject || "Bíð..."}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Heildarsala liðsins', val: formatISK(totalTeamSales), color: 'text-white' },
                { label: 'Virkar vinnustundir (0.875)', val: (displayData.shifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0) * 0.875).toFixed(1) + 'h', color: 'text-indigo-400' },
                { label: 'Söfnun / klst (Meðaltal)', val: formatISK(totalTeamSales / (displayData.shifts.reduce((acc, s) => acc + (s.dayHours + s.eveningHours), 0) * 0.875 || 1)), color: 'text-emerald-400' },
                { label: 'Skráðar sölur', val: displayData.sales.length + ' stk', color: 'text-[#d4af37]' }
              ].map((m, i) => (
                <div key={i} className="glass p-8 rounded-[32px] border-white/5 shadow-xl hover:border-white/20 transition-all">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500 italic`}>{m.label}</p>
                  <p className={`text-2xl font-black italic ${m.color}`}>{m.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div key="projects" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {(Object.entries(charityStats) as [string, ProjectStat][]).sort((a, b) => b[1].sales - a[1].sales).map(([name, stats]) => (
                <div key={name} className="glass p-10 rounded-[48px] border-white/5 hover:border-[#d4af37]/30 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Heart size={80} /></div>
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Árangur félags</h4>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{name}</h3>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl text-[#d4af37]"><Activity size={24} /></div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Heildarsöfnun</p>
                        <p className="text-2xl font-black text-white italic">{formatISK(stats.sales)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Meðalgjöf</p>
                        <p className="text-sm font-black text-indigo-400 italic">{formatISK(stats.sales / stats.count)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest italic">Skilvirkni</p>
                        <p className="text-sm font-black text-emerald-400 italic">{formatISK(stats.isk_per_hour)}/h</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest italic">Virkar stundir</p>
                        <p className="text-sm font-black text-white italic">{stats.effHours.toFixed(1)}h</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-[#d4af37]/5 border border-[#d4af37]/10 flex justify-between items-center shadow-xl">
                      <div>
                        <p className="text-[9px] font-black text-[#d4af37] uppercase tracking-[0.2em] mb-1 italic">Hagnaður félags (Profitability)</p>
                        <p className="text-xl font-black text-white italic">{formatISK(stats.profit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none italic">Eftir launakostnað</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass p-12 rounded-[56px] border-[#d4af37]/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#d4af37]/5 to-transparent">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#d4af37]/20 rounded-3xl text-[#d4af37]"><BrainCircuit size={32} /></div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none italic">AI Greining: Arðsemi & Hagnaður</h3>
                  </div>
                  <p className="text-lg font-bold text-slate-200 leading-relaxed italic border-l-4 border-[#d4af37] pl-6 py-2">
                    "{aiPulse?.strategicAdvice || "Greini árangur félaganna... AI er að reikna hvaða verkefni gefur hæsta hagnaðinn miðað við launakostnað (2724.88 ISK/klst)."}"
                  </p>
                </div>
                <div className="h-[350px] w-full md:w-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(Object.entries(charityStats) as [string, ProjectStat][]).map(([name, s]) => ({ name, profit: s.profit }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} contentStyle={{ backgroundColor: '#01040f', border: 'none', borderRadius: '16px' }} />
                      <Bar dataKey="profit" fill="#d4af37" radius={[15, 15, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div key="agents" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
            <div className="glass p-12 rounded-[56px] border-white/5 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none italic">Sölumenn (Leaderboard)</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Raðað eftir heildarsölu í ISK</p>
              </div>

              <div className="space-y-4">
                {agentLeaderboard.map((agent, idx) => (
                  <div key={agent.staffId} className="space-y-4">
                    <button
                      onClick={() => setExpandedAgentId(expandedAgentId === agent.staffId ? null : agent.staffId)}
                      className={`w-full p-8 rounded-[40px] border transition-all flex items-center justify-between group ${expandedAgentId === agent.staffId ? 'bg-[#d4af37]/10 border-[#d4af37]/40 shadow-2xl' : 'bg-white/2 border-white/5 hover:border-white/20 shadow-lg'}`}
                    >
                      <div className="flex items-center gap-10">
                        <div className={`h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl transition-all ${idx < 3 ? 'bg-[#d4af37] text-slate-900' : 'bg-white/5 text-slate-600'}`}>
                          {idx + 1}
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-black text-white group-hover:text-[#d4af37] transition-all italic tracking-tight uppercase leading-none italic">{agent.name}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">ID: {agent.staffId} • {agent.team}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-16">
                        <div className="hidden xl:grid grid-cols-3 gap-12 text-center">
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase mb-1 italic tracking-widest italic">Heildarsala</p>
                            <p className="text-sm font-black text-white italic">{formatISK(agent.totalSales)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase mb-1 italic tracking-widest italic">Skilvirkni</p>
                            <p className="text-sm font-black text-emerald-400 italic">{formatISK(agent.efficiency)}/h</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-700 uppercase mb-1 italic tracking-widest italic">Vinnustundir</p>
                            <p className="text-sm font-black text-indigo-400 italic">{agent.effHours.toFixed(1)}h</p>
                          </div>
                        </div>
                        <div className="text-right border-l border-white/5 pl-12 min-w-[150px]">
                          <p className="text-2xl font-black text-[#d4af37] italic tracking-tighter leading-none">{formatISK(agent.totalSales)}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Samtals ISK</p>
                        </div>
                        {expandedAgentId === agent.staffId ? <ChevronUp size={28} className="text-[#d4af37]" /> : <ChevronDown size={28} className="text-slate-800 group-hover:text-slate-500" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedAgentId === agent.staffId && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-10">
                          <div className="p-10 bg-white/2 border-x border-b border-white/5 rounded-b-[48px] grid grid-cols-1 md:grid-cols-4 gap-10 shadow-inner">
                            <div className="p-8 bg-[#d4af37]/5 rounded-[40px] border border-[#d4af37]/10 flex flex-col justify-center text-center shadow-lg">
                              <Gift className="mx-auto mb-3 text-[#d4af37]" size={20} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Selur best fyrir</p>
                              <p className="text-xl font-black text-white uppercase italic tracking-tighter leading-none italic">{agent.topProject}</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center">
                              <TrendingUp className="mx-auto mb-3 text-emerald-400" size={20} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">ISK á klukkustund</p>
                              <p className="text-xl font-black text-white italic">{formatISK(agent.efficiency)}</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center">
                              <Clock className="mx-auto mb-3 text-indigo-400" size={20} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Vinnustundir (0.875)</p>
                              <p className="text-xl font-black text-white italic">{agent.effHours.toFixed(1)}h</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 text-center">
                              <Star className="mx-auto mb-3 text-violet-400" size={20} />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Sölu meðaltal</p>
                              <p className="text-xl font-black text-white italic">{formatISK(agent.avgSale)}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass p-12 rounded-[56px] border-[#d4af37]/20 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-6 z-10">
          <div className="p-5 bg-[#d4af37]/10 rounded-3xl text-[#d4af37] shadow-xl"><Settings size={32} /></div>
          <div>
            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none italic">Goal Matrix v2.2</h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 leading-none italic">Settu mánaðarmarkmið fyrir allt liðið</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto z-10">
          <div className="relative flex-1 lg:flex-none">
            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input
              type="number"
              value={teamGoals.monthly}
              onChange={e => setTeamGoals({ ...teamGoals, monthly: Number(e.target.value) })}
              className="w-full lg:w-72 bg-white/5 border border-white/10 p-6 pl-14 rounded-[32px] text-white font-black text-3xl outline-none focus:ring-4 focus:ring-[#d4af37]/20 transition-all text-center italic"
            />
          </div>
          <button onClick={saveGoals} className="p-7 bg-[#d4af37] text-slate-900 rounded-[32px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            <Save size={24} /> Vista
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
