import React, { useState } from 'react';
import { Sale } from '../types';
import { useProjects } from '../hooks/useProjects.ts';
import { ShoppingBag, Save, Calendar, FileText, Edit2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface SaleFormProps {
  onSave: (sale: Sale) => void;
  sales?: Sale[]; // Added for list display
  onUpdateSale?: (sale: Sale) => void; // Added for editing
}

const SaleForm: React.FC<SaleFormProps> = ({ onSave, sales = [], onUpdateSale }) => {
  const { projects } = useProjects();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    project: ''
  });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Sale>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: ''
    });
    setFormData({ ...formData, amount: 0 });
  };

  const startEditing = (sale: Sale) => {
    if (editingId === sale.id) {
      setEditingId(null);
    } else {
      setEditingId(sale.id);
      setEditData(sale);
    }
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSale && editData.id) {
      // Find original sale to ensure we keep other properties like date/userId
      const original = sales.find(s => s.id === editData.id);
      if (original) {
        onUpdateSale({ ...original, ...editData } as Sale);
        setEditingId(null);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* 1. New Sale Form */}
      <div className="glass rounded-[32px] p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Skrá Sölu</h3>
            <p className="text-sm text-slate-400">Færðu inn söluupphæð dagsins</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Dagsetning
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Söluupphæð (ISK)</label>
            <input
              type="number"
              required
              value={formData.amount || ''}
              onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} /> Verkefni
            </label>
            <select
              value={formData.project}
              onChange={e => setFormData({ ...formData, project: e.target.value })}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 gradient-bg rounded-2xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} /> Vista Sölu
          </button>
        </form>
      </div>

      {/* 2. Editable Sales List */}
      {sales.length > 0 && (
        <div className="space-y-4 pt-4">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-4">Nýlegar færslur (Smelltu til að breyta)</h4>
          <div className="space-y-3">
            {sales.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(sale => (
              <div key={sale.id} className="glass rounded-[24px] border border-white/5 overflow-hidden transition-all hover:bg-white/5">

                {/* Header / Summary */}
                <div
                  onClick={() => startEditing(sale)}
                  className="p-5 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 text-indigo-400 transition-colors ${editingId === sale.id ? 'bg-indigo-500 text-white' : ''}`}>
                      {editingId === sale.id ? <Edit2 size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{new Intl.NumberFormat('is-IS').format(sale.amount)} kr.</p>
                      <p className="text-xs text-slate-400 font-medium">{sale.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
                      {new Date(sale.date).toLocaleDateString('is-IS', { day: 'numeric', month: 'short' })}
                    </span>
                    {editingId === sale.id ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-slate-600" />}
                  </div>
                </div>

                {/* Edit Form (Expanded) */}
                {editingId === sale.id && (
                  <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <form onSubmit={saveEdit} className="space-y-4 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Upphæð</label>
                          <input
                            type="number"
                            value={editData.amount}
                            onChange={e => setEditData({ ...editData, amount: parseInt(e.target.value) })}
                            className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Verkefni</label>
                          <select
                            value={editData.project}
                            onChange={e => setEditData({ ...editData, project: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white text-sm font-medium outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                          >
                            {projects.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <CheckCircle2 size={16} /> Staðfesta Breytingu
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleForm;
