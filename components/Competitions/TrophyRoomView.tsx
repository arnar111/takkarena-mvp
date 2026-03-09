import React from 'react';
import { Lock, Star, Zap, Award, Target, Flame } from 'lucide-react';

export interface Badge {
    id: number;
    name: string;
    desc: string;
    icon: React.ReactNode;
    earned: boolean;
    reward: number; // Takk Coins
    date?: string;
    progress?: string;
}

interface TrophyRoomProps {
    badges: Badge[];
}

const TrophyRoomView: React.FC<TrophyRoomProps> = ({ badges }) => {

    function CrownIcon({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" /></svg> }

    return (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-700">
            {badges.map((b) => (
                <div key={b.id} className={`relative p-6 rounded-[32px] border flex flex-col items-center justify-center text-center gap-3 transition-all group overflow-hidden ${b.earned ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 grayscale opacity-70'}`}>

                    {!b.earned && (
                        <div className="absolute top-3 right-3 text-slate-600"><Lock size={16} /></div>
                    )}

                    {/* Reward Badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-amber-400 flex items-center gap-1">
                        <span>+{b.reward}</span> 🪙
                    </div>

                    <div className={`p-4 rounded-full ${b.earned ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/50 scale-110' : 'bg-white/10 text-slate-500'}`}>
                        {b.icon}
                    </div>

                    <div>
                        <h4 className={`font-black uppercase tracking-wider text-xs ${b.earned ? 'text-white' : 'text-slate-500'}`}>{b.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-tight px-2">{b.desc}</p>
                    </div>

                    {b.earned ? (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-full">{b.date}</span>
                    ) : (
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                            {/* Mock progress bar styling, assuming 50% for unearned generally looks good as a placeholder or can use logic */}
                            <div className="h-full bg-slate-600 rounded-full" style={{ width: '40%' }} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TrophyRoomView;
