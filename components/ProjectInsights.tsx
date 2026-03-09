import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Sale, Shift } from '../types';
import { useProjects } from '../hooks/useProjects.ts';
import { TrendingUp, Target, ShoppingBag, ChevronRight, Activity, Award, Sparkles, Zap, BarChart3 } from 'lucide-react';
import { getAIProjectComparison } from '../geminiService.ts';

interface ProjectInsightsProps {
    sales: Sale[];
    shifts: Shift[];
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ sales }) => {
    const { projects } = useProjects();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [aiData, setAiData] = useState<{ headline: string, tip: string } | null>(null);

    useEffect(() => {
        const fetchAiAnalysis = async () => {
            if (sales.length === 0) return;
            const res = await getAIProjectComparison(sales);
            setAiData(res);
        };
        fetchAiAnalysis();
    }, [sales]);

    const formatISK = (val: number) => {
        return new Intl.NumberFormat('is-IS', { style: 'currency', currency: 'ISK', maximumFractionDigits: 0 }).format(val);
    };

    // --- Data Processing ---
    const projectStats = useMemo(() => {
        const stats = projects.map((p, index) => {
            const pSales = sales.filter(s => s.project === p);
            const total = pSales.reduce((acc, s) => acc + s.amount, 0);
            const count = pSales.length;

            // Calculate specific new vs upgrade
            const newSales = pSales.filter(s => s.saleType !== 'upgrade').length;
            const upgrades = pSales.filter(s => s.saleType === 'upgrade').length;

            return {
                name: p,
                total,
                count,
                newSales,
                upgrades,
                avgTicket: count > 0 ? total / count : 0,
                color: `hsl(${220 + (index * 25)}, 90%, 60%)` // Dynamic blue/purple/indigo gradients
            };
        }).sort((a, b) => b.total - a.total);

        return stats;
    }, [sales]);

    const activeStats = useMemo(() => {
        return projectStats.find(p => p.name === selectedProject) || projectStats[0]; // Default to top project
    }, [selectedProject, projectStats]);

    // Top Performers for Cards
    const bestProject = projectStats[0];
    const mostActive = [...projectStats].sort((a, b) => b.count - a.count)[0];
    const bestAvg = [...projectStats].filter(p => p.count > 1).sort((a, b) => b.avgTicket - a.avgTicket)[0];

    return (
        <div className="space-y-8 pb-32 max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* 1. Header & AI Insight */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Greining</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-400" />
                        {aiData ? aiData.headline : "Gervigreind að reikna..."}
                    </p>
                </div>

                {aiData && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-3 md:max-w-xs">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10} /> Ábending</p>
                        <p className="text-xs text-white font-bold leading-relaxed">"{aiData.tip}"</p>
                    </div>
                )}
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bestProject && (
                    <div className="glass p-6 rounded-[32px] border-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400"><Award size={20} /></div>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">#1 Sæti</span>
                        </div>
                        <h4 className="text-white font-black text-lg truncate relative z-10">{bestProject.name}</h4>
                        <p className="text-2xl font-black text-white tracking-tighter relative z-10">{formatISK(bestProject.total)}</p>
                    </div>
                )}

                {bestAvg && (
                    <div className="glass p-6 rounded-[32px] border-violet-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-violet-500/10 blur-[50px] rounded-full group-hover:bg-violet-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400"><TrendingUp size={20} /></div>
                            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-1 rounded-lg">Hæsta Meðaltal</span>
                        </div>
                        <h4 className="text-white font-black text-lg truncate relative z-10">{bestAvg.name}</h4>
                        <p className="text-2xl font-black text-white tracking-tighter relative z-10">{formatISK(bestAvg.avgTicket)}</p>
                    </div>
                )}

                {mostActive && (
                    <div className="glass p-6 rounded-[32px] border-amber-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400"><Target size={20} /></div>
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg">Vinsælast</span>
                        </div>
                        <h4 className="text-white font-black text-lg truncate relative z-10">{mostActive.name}</h4>
                        <p className="text-2xl font-black text-white tracking-tighter relative z-10">{mostActive.count} <span className="text-sm font-bold text-slate-400">sölur</span></p>
                    </div>
                )}
            </div>

            {/* 3. Main Chart Section */}
            <div className="glass p-8 rounded-[40px] border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400"><BarChart3 size={20} /></div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Heildarsala eftir Verkefnum</h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectStats.filter(p => p.total > 0)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                formatter={(value: number) => [formatISK(value), 'Sala']}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={24} onClick={(data) => setSelectedProject(data.name)} className="cursor-pointer">
                                {projectStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. Interactive List & Detail Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Project List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-4">Öll Verkefni</h4>
                    {projectStats.map((stat) => (
                        <button
                            key={stat.name}
                            onClick={() => setSelectedProject(stat.name)}
                            className={`w-full glass p-4 rounded-[24px] flex items-center justify-between border-white/5 transition-all hover:border-indigo-500/30 group ${selectedProject === stat.name ? 'gradient-bg border-white/20 shadow-xl scale-[1.02]' : 'bg-white/2'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedProject === stat.name ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    {stat.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className={`font-black uppercase tracking-tight text-xs ${selectedProject === stat.name ? 'text-white' : 'text-slate-300'}`}>{stat.name}</p>
                                    <p className={`text-[9px] font-bold uppercase opacity-60 ${selectedProject === stat.name ? 'text-white/80' : 'text-slate-500'}`}>{stat.count} sölur</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-black text-xs ${selectedProject === stat.name ? 'text-white' : 'text-slate-200'}`}>{formatISK(stat.total)}</p>
                                <ChevronRight size={14} className={`${selectedProject === stat.name ? 'text-white' : 'text-slate-700 group-hover:text-slate-400'} ml-auto mt-1`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Focus Card (Sticky) */}
                <div className="relative">
                    {activeStats && (
                        <div className="glass p-8 rounded-[40px] border-white/10 sticky top-28 shadow-2xl animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Valið Verkefni</p>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{activeStats.name}</h3>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl text-white">
                                    <ShoppingBag size={24} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Heildarsala</p>
                                        <p className="text-xl font-black text-white">{formatISK(activeStats.total)}</p>
                                    </div>
                                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Meðaltal</p>
                                        <p className="text-xl font-black text-slate-200">{formatISK(activeStats.avgTicket)}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/2 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tegund Sala</p>
                                        <span className="text-xs font-black text-white">{activeStats.count} stk</span>
                                    </div>

                                    {/* Breakdown Bar */}
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex mb-2">
                                        <div className="h-full bg-indigo-500" style={{ width: `${(activeStats.newSales / (activeStats.count || 1)) * 100}%` }} />
                                        <div className="h-full bg-amber-500" style={{ width: `${(activeStats.upgrades / (activeStats.count || 1)) * 100}%` }} />
                                    </div>

                                    <div className="flex justify-between text-[9px] font-bold uppercase">
                                        <span className="text-indigo-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Nýir ({activeStats.newSales})</span>
                                        <span className="text-amber-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Hækkanir ({activeStats.upgrades})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProjectInsights;
