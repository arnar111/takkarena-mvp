import React from 'react';
import { X, Trophy, Target, TrendingUp, Clock, Star, Award } from 'lucide-react';

interface DailySummaryModalProps {
    visible: boolean;
    onClose: () => void;
    totalSales: number;
    numberOfSales: number;
    avgPerSale: number;
    avgPerHour: number;
    hoursWorked: number;
    goal: number;
    level: string;
    badgesEarned: string[];
    bountiesCompleted: number;
}

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
    visible,
    onClose,
    totalSales,
    numberOfSales,
    avgPerSale,
    avgPerHour,
    hoursWorked,
    goal,
    level,
    badgesEarned,
    bountiesCompleted
}) => {
    if (!visible) return null;

    const goalAchieved = totalSales >= goal;
    const goalProgress = Math.min(100, (totalSales / goal) * 100);
    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Dagsuppgjör - ${new Date().toLocaleDateString('is-IS')}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 40px;
                        background: white;
                        color: #1e293b;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        border-bottom: 3px solid #6366f1;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 32px;
                        font-weight: 900;
                        color: #1e293b;
                        margin-bottom: 8px;
                    }
                    .header p {
                        font-size: 14px;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .main-stats {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .stat-card {
                        background: #f8fafc;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 24px;
                    }
                    .stat-card.primary {
                        border-color: #6366f1;
                        background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
                    }
                    .stat-card.success {
                        border-color: #10b981;
                        background: linear-gradient(135deg, #ecfdf5 0%, #f8fafc 100%);
                    }
                    .stat-label {
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #64748b;
                        margin-bottom: 8px;
                    }
                    .stat-value {
                        font-size: 36px;
                        font-weight: 900;
                        color: #1e293b;
                        margin-bottom: 12px;
                    }
                    .progress-bar {
                        height: 8px;
                        background: #e2e8f0;
                        border-radius: 4px;
                        overflow: hidden;
                        margin-bottom: 8px;
                    }
                    .progress-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
                        width: ${goalProgress}%;
                    }
                    .secondary-stats {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        margin-bottom: 30px;
                    }
                    .small-stat {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 16px;
                        text-align: center;
                    }
                    .small-stat-label {
                        font-size: 9px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #94a3b8;
                        margin-bottom: 6px;
                    }
                    .small-stat-value {
                        font-size: 24px;
                        font-weight: 800;
                        color: #1e293b;
                    }
                    .achievements {
                        background: #fffbeb;
                        border: 2px solid #fbbf24;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    .achievements h3 {
                        font-size: 12px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #92400e;
                        margin-bottom: 12px;
                    }
                    .achievement-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #fde68a;
                    }
                    .achievement-row:last-child {
                        border-bottom: none;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #e2e8f0;
                        text-align: center;
                        color: #94a3b8;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${goalAchieved ? '🎉 Markmið Náð!' : 'Dagsuppgjör'}</h1>
                    <p>${new Date().toLocaleDateString('is-IS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div class="main-stats">
                    <div class="stat-card primary">
                        <div class="stat-label">Heildarsala</div>
                        <div class="stat-value">${formatISK(totalSales)} kr</div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600;">
                            ${goalProgress.toFixed(0)}% af markmiði (${formatISK(goal)} kr)
                        </div>
                    </div>

                    <div class="stat-card success">
                        <div class="stat-label">Meðaltal / Klst</div>
                        <div class="stat-value">${formatISK(avgPerHour)} kr</div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 600;">
                            ${numberOfSales} ${numberOfSales === 1 ? 'sala' : 'sölur'} á ${hoursWorked.toFixed(1)}h
                        </div>
                    </div>
                </div>

                <div class="secondary-stats">
                    <div class="small-stat">
                        <div class="small-stat-label">⏰ Tími</div>
                        <div class="small-stat-value">${hoursWorked.toFixed(1)}h</div>
                    </div>
                    <div class="small-stat">
                        <div class="small-stat-label">📊 Meðalstærð</div>
                        <div class="small-stat-value">${formatISK(avgPerSale)} kr</div>
                    </div>
                    <div class="small-stat">
                        <div class="small-stat-label">⭐ Level</div>
                        <div class="small-stat-value">${level}</div>
                    </div>
                </div>

                ${(badgesEarned.length > 0 || bountiesCompleted > 0) ? `
                    <div class="achievements">
                        <h3>🏆 Afrek Dagsins</h3>
                        ${bountiesCompleted > 0 ? `
                            <div class="achievement-row">
                                <span style="font-weight: 600;">Verkefni kláruð</span>
                                <span style="font-weight: 800; color: #92400e;">${bountiesCompleted}</span>
                            </div>
                        ` : ''}
                        ${badgesEarned.length > 0 ? `
                            <div class="achievement-row">
                                <span style="font-weight: 600;">Merki unnin</span>
                                <span style="font-weight: 800; color: #92400e;">${badgesEarned.length}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="footer">
                    <p><strong>WageTrack Pro</strong> · Dagsuppgjör</p>
                    <p style="margin-top: 4px;">Prentuð ${new Date().toLocaleTimeString('is-IS')}</p>
                </div>

                <script>
                    window.onload = () => {
                        window.print();
                        window.onafterprint = () => window.close();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass p-8 rounded-[48px] w-full max-w-2xl border-indigo-500/30 shadow-[0_0_80px_rgba(99,102,241,0.3)] relative overflow-hidden">
                {goalAchieved && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ top: '20%', left: '10%' }} />
                        <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ top: '80%', left: '90%', animationDelay: '0.5s' }} />
                        <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ top: '40%', right: '20%', animationDelay: '1s' }} />
                    </div>
                )}

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-full bg-indigo-500/20 text-indigo-400 mb-4">
                        <Trophy size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">
                        {goalAchieved ? '🎉 Markmið Náð!' : 'Dagsuppgjör'}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Árangur dagsins
                    </p>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-[40px] rounded-full" />
                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Heildarsala</p>
                        <p className="text-3xl font-black text-white relative z-10">{formatISK(totalSales)}</p>
                        <div className="mt-3 relative z-10">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${goalProgress}%` }}
                                />
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-1">{goalProgress.toFixed(0)}% af markmiði</p>
                        </div>
                    </div>

                    <div className="glass bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-[40px] rounded-full" />
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 relative z-10">Meðaltal/Klst</p>
                        <p className="text-3xl font-black text-white relative z-10">{formatISK(avgPerHour)}</p>
                        <p className="text-xs font-bold text-slate-400 mt-3 relative z-10">
                            {numberOfSales} {numberOfSales === 1 ? 'sala' : 'sölur'} á {hoursWorked.toFixed(1)}h
                        </p>
                    </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="glass bg-white/5 p-4 rounded-2xl border border-white/5">
                        <Clock size={20} className="text-violet-400 mb-2" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tími</p>
                        <p className="text-xl font-black text-white">{hoursWorked.toFixed(1)}h</p>
                    </div>
                    <div className="glass bg-white/5 p-4 rounded-2xl border border-white/5">
                        <TrendingUp size={20} className="text-amber-400 mb-2" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Meðalstærð</p>
                        <p className="text-xl font-black text-white">{formatISK(avgPerSale)}</p>
                    </div>
                    <div className="glass bg-white/5 p-4 rounded-2xl border border-white/5">
                        <Star size={20} className="text-rose-400 mb-2" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Level</p>
                        <p className="text-xl font-black text-white">{level}</p>
                    </div>
                </div>

                {/* Achievements */}
                {(badgesEarned.length > 0 || bountiesCompleted > 0) && (
                    <div className="glass bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Award size={20} className="text-amber-400" />
                            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">Afrek Dagsins</h3>
                        </div>
                        <div className="space-y-2">
                            {bountiesCompleted > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white">Verkefni kláruð</span>
                                    <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 font-black text-sm">{bountiesCompleted}</span>
                                </div>
                            )}
                            {badgesEarned.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white">Merki unnin</span>
                                    <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 font-black text-sm">{badgesEarned.length}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white font-black uppercase text-sm transition-all"
                    >
                        Loka
                    </button>
                    <button
                        onClick={handlePrint}
                        className="py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl transition-all active:scale-95"
                    >
                        Prenta PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailySummaryModal;
