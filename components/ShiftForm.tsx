import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { Save, Calendar, Clock, DollarSign, Tag, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

interface ShiftFormProps {
  onSave: (shift: Shift) => void;
  userId: string; // Required for secure Firebase drafts
}

const ShiftForm: React.FC<ShiftFormProps> = ({ onSave, userId }) => {
  const defaultState = {
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    hourlyRate: 3500,
    breakMinutes: 30,
    isHoliday: false,
    type: 'Dagur' as 'Dagur' | 'Eftirvinna' | 'Næturvinna' | 'Helgarvinna',
    notes: ''
  };

  const [formData, setFormData] = useState(defaultState);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load Draft from Firestore on Mount
  useEffect(() => {
    if (!userId) {
        setIsLoadingDraft(false);
        return;
    }

    const loadDraft = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'drafts', 'shiftForm');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Merge saved data with default state
          setFormData({ ...defaultState, ...docSnap.data() } as any);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraft();
  }, [userId]);

  // 2. Auto-Save to Firestore (Debounced 1000ms)
  useEffect(() => {
    if (!userId || isLoadingDraft) return;

    const saveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'users', userId, 'drafts', 'shiftForm');
        await setDoc(docRef, formData);
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [formData, userId, isLoadingDraft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate duration
    const [sH, sM] = formData.startTime.split(':').map(Number);
    const [eH, eM] = formData.endTime.split(':').map(Number);
    let duration = (eH + eM / 60) - (sH + sM / 60);
    if (duration < 0) duration += 24; 
    duration -= (formData.breakMinutes / 60);

    const dayHours = formData.type === 'Dagur' ? Math.max(0, duration) : 0;
    const eveningHours = formData.type === 'Eftirvinna' ? Math.max(0, duration) : 0;

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      date: formData.date,
      dayHours: dayHours,
      eveningHours: eveningHours,
      totalSales: 0,
      notes: formData.notes,
      projectName: 'Other',
      userId: userId 
    });

    // 3. Clear the draft from Firestore after successful save
    if (userId) {
        try {
            const docRef = doc(db, 'users', userId, 'drafts', 'shiftForm');
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error clearing draft:", error);
        }
    }

    // Reset form
    setFormData({ ...defaultState, date: formData.date, hourlyRate: formData.hourlyRate });
  };

  if (isLoadingDraft) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-white font-bold">Hleð uppkasti...</p>
        </div>
    );
  }

  return (
    <div className="glass rounded-[40px] border-white/10 p-10 max-w-4xl mx-auto relative">
      {isSaving && (
          <div className="absolute top-4 right-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
              <Save size={10} /> Saving Draft...
          </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" /> Dagsetning vaktar
              </label>
              <input 
                type="date" required value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" /> Byrjar
                </label>
                <input 
                  type="time" required value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-indigo-400" /> Endar
                </label>
                <input 
                  type="time" required value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
               <input 
                 type="checkbox" id="isHoliday" checked={formData.isHoliday}
                 onChange={e => setFormData({...formData, isHoliday: e.target.checked})}
                 className="h-6 w-6 rounded-lg bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500"
               />
               <label htmlFor="isHoliday" className="text-sm font-bold text-slate-300 cursor-pointer">
                 Opinber frídagur (1.8x)
               </label>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} className="text-indigo-400" /> Daglaun (ISK/klst)
              </label>
              <input 
                type="number" required value={formData.hourlyRate}
                onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black text-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14} className="text-indigo-400" /> Tegund vaktar
                </label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                >
                  <option value="Dagur">Dagvakt</option>
                  <option value="Eftirvinna">Eftirvinna</option>
                  <option value="Næturvinna">Næturvinna</option>
                  <option value="Helgarvinna">Helgarvakt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" /> Pása (mín)
                </label>
                <input 
                  type="number" value={formData.breakMinutes}
                  onChange={e => setFormData({...formData, breakMinutes: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Athugasemdir</label>
              <textarea 
                rows={2} value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Skráðu eitthvað sérstakt hér..."
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-xl shadow-2xl shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Save size={24} /> Vista Vakt
        </button>
      </form>
    </div>
  );
};

export default ShiftForm;
