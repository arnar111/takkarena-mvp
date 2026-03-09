import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.ts';
import { User } from '../types.ts';
import { UserPlus, Users, Trash2, Shield, X, Edit3, Mail, Briefcase, Plus, Heart, Activity, PieChart, Server, CreditCard } from 'lucide-react';

interface AdminProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

interface Project {
  id: string;
  name: string;
}

const Admin: React.FC<AdminProps> = () => {
  // Data States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [role, setRole] = useState<'agent' | 'manager'>('agent');
  const [team, setTeam] = useState<'Hringurinn' | 'Verið' | 'Other'>('Other');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Project Form State
  const [newProject, setNewProject] = useState('');

  // --- 1. Fetch Users & Projects ---
  useEffect(() => {
    // Users Listener
    const unsubUsers = onSnapshot(query(collection(db, "users")), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setLoading(false);
    });

    // Projects Listener
    const unsubProjects = onSnapshot(query(collection(db, "projects")), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    });

    return () => { unsubUsers(); unsubProjects(); };
  }, []);

  // --- User Handlers ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = staffId.trim();
    if (!name || cleanId.length !== 3) {
      alert("Nafn verður að vera til staðar og ID nákvæmlega 3 tölustafir!");
      return;
    }

    try {
      const q = query(collection(db, "users"), where("staffId", "==", cleanId));
      const existing = await getDocs(q);

      if (!existing.empty) {
        alert("Þetta númer er þegar í notkun!");
        return;
      }

      await addDoc(collection(db, "users"), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        staffId: cleanId,
        role,
        team
      });

      setName(''); setEmail(''); setStaffId('');
    } catch (err) {
      alert("Villa við að vista notanda.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        name: editingUser.name,
        email: (editingUser.email || '').trim().toLowerCase(),
        role: editingUser.role,
        team: editingUser.team,
        kennitala: editingUser.kennitala || null
      });
      setEditingUser(null);
    } catch (err) {
      alert("Villa við að uppfæra.");
    }
  };

  const handleDeleteUser = async (id: string, staffId: string) => {
    if (staffId === '570') { alert("Ekki hægt að eyða kerfisstjóra!"); return; }
    if (confirm(`Viltu eyða starfsmanni?`)) {
      await deleteDoc(doc(db, "users", id));
    }
  };

  // --- Project Handlers ---
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    try {
      await addDoc(collection(db, "projects"), { name: newProject.trim() });
      setNewProject('');
    } catch (err) {
      alert("Villa við að vista félag.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Ertu viss?")) await deleteDoc(doc(db, "projects", id));
  };

  // Helper
  const getUsername = (emailStr?: string) => emailStr ? emailStr.split('@')[0] : 'vantar-netfang';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400">
          <Shield size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Stjórnborð</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Kerfisstjórn & Umsjón</p>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass p-10 rounded-[40px] w-full max-w-md border-[#d4af37]/40 shadow-2xl relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6">Breyta Starfsmanni</h3>
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Nafn</label>
                <input type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-[#d4af37]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Netfang</label>
                <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-[#d4af37]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Hlutverk</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black uppercase outline-none focus:ring-2 focus:ring-[#d4af37]">
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Teymi</label>
                  <select value={editingUser.team} onChange={e => setEditingUser({ ...editingUser, team: e.target.value as any })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black uppercase outline-none focus:ring-2 focus:ring-[#d4af37]">
                    <option value="Other">Annað</option>
                    <option value="Hringurinn">Hringurinn</option>
                    <option value="Verið">Verið</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><CreditCard size={12} /> Kennitala (MyTimePlan)</label>
                <input type="text" maxLength={10} value={editingUser.kennitala || ''} onChange={e => setEditingUser({ ...editingUser, kennitala: e.target.value.replace(/\D/g, '') })} placeholder="10 stafir" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-[#d4af37] tracking-widest" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#d4af37] hover:bg-[#b5952f] text-slate-900 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all">Vista Breytingar</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* --- LEFT COLUMN: FORMS --- */}
        <div className="space-y-8">

          {/* 1. Add User Form */}
          <div className="glass rounded-[40px] p-8 border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3 relative z-10">
              <UserPlus className="text-indigo-400" size={24} /> Nýr Starfsmaður
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Fullt nafn" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all" required />
                <input type="text" maxLength={3} value={staffId} onChange={e => setStaffId(e.target.value.replace(/\D/g, ''))} placeholder="ID (3 stafir)" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black text-center outline-none focus:border-indigo-500/50 transition-all" required />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Microsoft Netfang" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={role} onChange={e => setRole(e.target.value as any)} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black uppercase outline-none cursor-pointer"><option value="agent">Agent</option><option value="manager">Manager</option></select>
                <select value={team} onChange={e => setTeam(e.target.value as any)} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black uppercase outline-none cursor-pointer"><option value="Other">Annað</option><option value="Hringurinn">Hringurinn</option><option value="Verið">Verið</option></select>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl gradient-bg text-white font-black uppercase text-xs tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Stofna Aðgang</button>
            </form>
          </div>

          {/* 2. Add Project Form */}
          <div className="glass rounded-[40px] p-8 border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3 relative z-10">
              <Heart className="text-emerald-400" size={24} /> Nýtt Góðgerðarfélag
            </h3>
            <form onSubmit={handleAddProject} className="flex gap-4 relative z-10">
              <input type="text" value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="Nafn félags (t.d. Rauði Krossinn)" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500/50 transition-all" />
              <button type="submit" className="p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all active:scale-95"><Plus size={24} /></button>
            </form>
          </div>

          {/* 3. New Card: Team Stats */}
          <div className="glass rounded-[40px] p-8 border-white/10 relative">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><PieChart size={16} /> Liðaskipting</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white mb-1"><span>Hringurinn</span><span>{allUsers.filter(u => u.team === 'Hringurinn').length}</span></div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(allUsers.filter(u => u.team === 'Hringurinn').length / allUsers.length) * 100}%` }}></div></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white mb-1"><span>Verið</span><span>{allUsers.filter(u => u.team === 'Verið').length}</span></div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${(allUsers.filter(u => u.team === 'Verið').length / allUsers.length) * 100}%` }}></div></div>
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: LISTS --- */}
        <div className="space-y-8">

          {/* 1. User List */}
          <div className="glass rounded-[40px] border-white/5 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-6 border-b border-white/5 bg-white/2 sticky top-0 backdrop-blur-md z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users className="text-indigo-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Starfsmenn</h3>
              </div>
              <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{allUsers.length}</span>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {allUsers.map(u => (
                <div key={u.id} className="group flex items-center justify-between p-3 bg-white/2 hover:bg-white/5 rounded-2xl border border-white/5 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${u.role === 'manager' ? 'bg-[#d4af37] text-slate-900' : 'bg-white/10'}`}>{u.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">@{getUsername(u.email)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{u.staffId}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Edit3 size={14} /></button>
                      <button onClick={() => handleDeleteUser(u.id, u.staffId)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Project List */}
          <div className="glass rounded-[40px] border-white/5 overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-6 border-b border-white/5 bg-white/2 sticky top-0 backdrop-blur-md z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Heart className="text-emerald-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Góðgerðarfélög</h3>
              </div>
              <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg">{projects.length}</span>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
              {projects.length === 0 ? <p className="text-center text-slate-600 text-xs py-4 font-bold italic">Engin félög skráð.</p> : projects.map(p => (
                <div key={p.id} className="group flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 rounded-2xl border border-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-white text-sm">{p.name}</span>
                  </div>
                  <button onClick={() => handleDeleteProject(p.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. New Card: System Status */}
          <div className="glass rounded-[40px] p-6 border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400"><Server size={20} /></div>
              <div>
                <h4 className="text-white font-bold text-sm">System Status</h4>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><Activity size={10} /> Online & Syncing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black">Database</p>
              <p className="text-white font-black">Firestore</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;
