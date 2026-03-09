import React, { useState } from 'react';
import { Shift } from '../types';
import { Trash2, Calendar, ShoppingBag, Edit2, PlusCircle, X, Thermometer, Briefcase, FileText } from 'lucide-react';
import DailySummaryModal from './DailySummaryModal';

interface ShiftListProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
  onEdit: (shift: Shift) => void;
  onAddShift?: (shift: Shift) => void; // New prop for saving sick day
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts, onDelete, onEdit, onAddShift }) => {
  const [showSickModal, setShowSickModal] = useState(false);
  const [sickData, setSickData] = useState({ date: new Date().toISOString().split('T')[0], dayHours: 0, eveningHours: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'plan'>('list');
  const [selectedShiftForSummary, setSelectedShiftForSummary] = useState<Shift | null>(null);

  // Forecaster Mock Data
  const forecastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const isWeekendDay = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: d,
      projected: isWeekendDay ? 0 : 35000 + Math.random() * 15000,
      isWeekend: isWeekendDay
    };
  });

  const handleSaveSickDay = () => {
    if (onAddShift) {
      onAddShift({
        id: Math.random().toString(36).substr(2, 9),
        date: sickData.date,
        dayHours: sickData.dayHours,
        eveningHours: sickData.eveningHours,
        totalSales: 0, // No sales on sick day
        projectName: 'Veikindi',
        notes: 'Veikindadagur',
        userId: '' // Handled by App.tsx wrapper
      });
      setShowSickModal(false);
      setSickData({ date: new Date().toISOString().split('T')[0], dayHours: 0, eveningHours: 0 });
    }
  };

  const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(Math.round(val));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 relative">

      {/* --- SICK DAY MODAL --- */}
      {showSickModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass p-8 rounded-[40px] w-full max-w-sm border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center relative">
            <button onClick={() => setShowSickModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>

            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-rose-500/20 text-rose-400">
                <Thermometer size={32} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">Skrá Veikindi</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Skráðu tíma sem falla niður</p>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Dagsetning</label>
                <input
                  type="date"
                  value={sickData.date}
                  onChange={(e) => setSickData({ ...sickData, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Dagvinna</label>
                  <input
                    type="number"
                    value={sickData.dayHours}
                    onChange={(e) => setSickData({ ...sickData, dayHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Eftirvinna</label>
                  <input
                    type="number"
                    value={sickData.eveningHours}
                    onChange={(e) => setSickData({ ...sickData, eveningHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <button onClick={handleSaveSickDay} className="w-full mt-8 py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl text-white font-black uppercase text-sm shadow-xl transition-all active:scale-95">
              Staðfesta
            </button>
          </div>
        </div>
      )}

      {/* Header with Sick Button */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Vaktasaga</h2>
        <button
          onClick={() => setShowSickModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-2xl border border-rose-500/20 transition-all font-bold text-xs uppercase tracking-wider"
        >
          <Thermometer size={16} /> Skrá Veikindi
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex bg-white/5 p-1 rounded-2xl mx-2 mb-6 border border-white/5">
        <button onClick={() => setViewMode('list')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Saga</button>
        <button onClick={() => setViewMode('plan')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${viewMode === 'plan' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Áætlun & Spá</button>
      </div>

      {viewMode === 'plan' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
          <div className="glass p-6 rounded-[32px] border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2 relative z-10">Smart Schedule</h3>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6 relative z-10">Spáð tekjur næstu 7 daga miðað við meðaltal</p>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {forecastDays.map((day, i) => (
                <div key={i} className={`flex-shrink-0 w-28 p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${day.isWeekend ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-[9px] font-black uppercase text-slate-500">{day.date.toLocaleDateString('is-IS', { weekday: 'short' })}</span>
                  <span className="text-xl font-black text-white">{day.date.getDate()}</span>
                  <div className="h-0.5 w-8 bg-white/10 my-1" />
                  <span className="text-[10px] font-bold text-emerald-400">+{formatISK(day.projected)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (shifts.length === 0 ? (
        <div className="glass rounded-[40px] p-24 text-center border-2 border-dashed border-white/5">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mb-8">
            <Calendar size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Engar vaktir skráðar</h3>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          {shifts.map((shift) => (
            <div key={shift.id} className="glass p-5 rounded-[32px] border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all group relative overflow-hidden">

              {shift.projectName === 'Veikindi' && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
              )}

              <div className="flex items-center gap-6 pl-2">
                <div className={`h-14 w-14 rounded-2xl border flex flex-col items-center justify-center ${shift.projectName === 'Veikindi' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                  <span className="text-[9px] font-black uppercase opacity-50">{new Date(shift.date).toLocaleDateString('is-IS', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(shift.date).getDate()}</span>
                </div>

                <div>
                  <h4 className="font-black text-white tracking-tight capitalize text-sm mb-1 flex items-center gap-2">
                    {new Date(shift.date).toLocaleDateString('is-IS', { weekday: 'long' })}
                    {shift.projectName === 'Veikindi' && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest">Veikindi</span>}
                  </h4>
                  <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <span className="text-indigo-400">Dagv: {shift.dayHours}h</span>
                    <span className="text-violet-400">Eftirv: {shift.eveningHours}h</span>
                    <span className={`flex items-center gap-1 ${shift.totalSales > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <ShoppingBag size={10} /> {formatISK(shift.totalSales)} ISK
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedShiftForSummary(shift)}
                  className="p-3 bg-white/5 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 rounded-2xl transition-all"
                  title="Skoða uppgjör"
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => onEdit(shift)}
                  className="p-3 bg-white/5 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 rounded-2xl transition-all"
                  title="Breyta vakt"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(shift.id)}
                  className="p-3 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all"
                  title="Eyða vakt"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Daily Summary Modal */}
      {selectedShiftForSummary && (
        <DailySummaryModal
          visible={!!selectedShiftForSummary}
          onClose={() => setSelectedShiftForSummary(null)}
          totalSales={selectedShiftForSummary.totalSales}
          numberOfSales={0} // Not tracked per shift
          avgPerSale={0} // Not tracked per shift
          avgPerHour={selectedShiftForSummary.totalSales / (selectedShiftForSummary.dayHours + selectedShiftForSummary.eveningHours)}
          hoursWorked={selectedShiftForSummary.dayHours + selectedShiftForSummary.eveningHours}
          goal={0} // Historical shift doesn't have goal
          level="N/A"
          badgesEarned={[]}
          bountiesCompleted={0}
        />
      )}
    </div>
  );
};

export default ShiftList;
