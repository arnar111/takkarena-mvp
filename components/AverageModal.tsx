import React from 'react';
import { X, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

interface AverageModalProps {
    visible: boolean;
    onClose: () => void;
    totalSales: number;
    numberOfSales: number;
    hoursWorked: number;
}

const AverageModal: React.FC<AverageModalProps> = ({
    visible,
    onClose,
    totalSales,
    numberOfSales,
    hoursWorked
}) => {
    if (!visible) return null;

    const avgPerSale = numberOfSales > 0 ? totalSales / numberOfSales : 0;
    const avgPerHour = hoursWorked > 0 ? totalSales / hoursWorked : 0;
    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass p-8 rounded-[40px] w-full max-w-md border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400">
                        <BarChart3 size={32} />
                    </div>
                </div>

                <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 text-center">Meðaltal Í Dag</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 text-center">
                    Sundurliðun á söluframmistöðu
                </p>

                <div className="space-y-4">
                    {/* Average Per Sale */}
                    <div className="glass bg-white/5 p-5 rounded-2xl border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meðalstærð Sölu</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-emerald-400">{formatISK(avgPerSale)}</p>
                        <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                                style={{ width: `${Math.min(100, (avgPerSale / 5000) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Average Per Hour */}
                    <div className="glass bg-white/5 p-5 rounded-2xl border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-indigo-400" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meðaltal / Klst</span>
                            </div>
                        </div>
                        <p className="text-3xl font-black text-indigo-400">{formatISK(avgPerHour)}</p>
                        <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-1000"
                                style={{ width: `${Math.min(100, (avgPerHour / 30000) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fjöldi Sölu</p>
                            <p className="text-2xl font-black text-white">{numberOfSales}</p>
                        </div>
                        <div className="glass bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vaktartími</p>
                            <p className="text-2xl font-black text-white">{hoursWorked.toFixed(1)}h</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl transition-all active:scale-95"
                >
                    Loka
                </button>
            </div>
        </div>
    );
};

export default AverageModal;
