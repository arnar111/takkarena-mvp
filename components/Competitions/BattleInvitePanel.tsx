import React from 'react';
import { Swords, Check, X, Clock } from 'lucide-react';

interface Invite {
  id: string;
  sender: string;
  time: string;
  read: boolean;
}

interface BattleInvitePanelProps {
  invites: Invite[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCounter?: (id: string) => void;
}

const BattleInvitePanel: React.FC<BattleInvitePanelProps> = ({ invites, onAccept, onDecline }) => {
  if (!invites || invites.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[150px]">
        <Swords className="mb-3 opacity-30" size={40} />
        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Engar áskoranir</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {invites.map((invite) => (
        <div key={invite.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all animate-in slide-in-from-right-4 duration-300 shadow-lg">
          
          {/* Header section */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl text-white shadow-lg shadow-rose-500/20 shrink-0">
                    <Swords size={18} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{invite.sender}</p>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Áskorun í einvígi</p>
                 </div>
             </div>
             <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1 shrink-0 bg-black/20 px-2 py-1 rounded-md">
                <Clock size={10} />
                {new Date(invite.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button 
                onClick={() => onAccept && onAccept(invite.id)} 
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
                <Check size={16} strokeWidth={3} /> Samþykkja
            </button>
            <button 
                onClick={() => onDecline && onDecline(invite.id)} 
                className="py-3 px-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all active:scale-95 border border-white/5 hover:border-rose-500/30"
            >
                <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BattleInvitePanel;
