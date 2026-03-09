import React, { useState } from 'react';
import { Users, UserPlus, X, Check, Swords, Clock, Trophy } from 'lucide-react';
import { User, Battle, BattleFormat } from '../../types';

interface TeamBattleCreatorProps {
    currentUser: User;
    allUsers: User[];
    onCreateBattle: (battle: Battle) => void;
    onClose: () => void;
}

type TeamSize = 2 | 3;

const TeamBattleCreator: React.FC<TeamBattleCreatorProps> = ({
    currentUser,
    allUsers,
    onCreateBattle,
    onClose
}) => {
    const [teamSize, setTeamSize] = useState<TeamSize>(2);
    const [myTeam, setMyTeam] = useState<User[]>([currentUser]);
    const [opponentTeam, setOpponentTeam] = useState<User[]>([]);
    const [duration, setDuration] = useState<'quick' | 'standard' | 'marathon'>('standard');
    const [stakes, setStakes] = useState(50);
    const [step, setStep] = useState<'size' | 'myteam' | 'opponent' | 'settings'>('size');

    const availableForMyTeam = allUsers.filter(u =>
        u.staffId !== currentUser.staffId &&
        !myTeam.some(t => t.staffId === u.staffId) &&
        !opponentTeam.some(t => t.staffId === u.staffId)
    );

    const availableForOpponent = allUsers.filter(u =>
        !myTeam.some(t => t.staffId === u.staffId) &&
        !opponentTeam.some(t => t.staffId === u.staffId)
    );

    const addToMyTeam = (user: User) => {
        if (myTeam.length < teamSize) {
            setMyTeam(prev => [...prev, user]);
        }
    };

    const addToOpponentTeam = (user: User) => {
        if (opponentTeam.length < teamSize) {
            setOpponentTeam(prev => [...prev, user]);
        }
    };

    const removeFromMyTeam = (userId: string) => {
        if (userId !== currentUser.staffId) {
            setMyTeam(prev => prev.filter(u => u.staffId !== userId));
        }
    };

    const removeFromOpponentTeam = (userId: string) => {
        setOpponentTeam(prev => prev.filter(u => u.staffId !== userId));
    };

    const getDurationMinutes = (): number => {
        switch (duration) {
            case 'quick': return 30;
            case 'standard': return 120;
            case 'marathon': return 480;
            default: return 120;
        }
    };

    const handleCreate = () => {
        const now = new Date();
        const endTime = new Date(now.getTime() + getDurationMinutes() * 60 * 1000);

        const allParticipants = [...myTeam, ...opponentTeam].map(u => ({
            userId: u.staffId,
            name: u.name,
            avatar: u.name.substring(0, 2).toUpperCase(),
            currentSales: 0,
            salesCount: 0
        }));

        const battle: Battle = {
            id: '', // Will be set by Firestore
            type: 'team',
            teamBattle: true,
            teamIds: [myTeam.map(u => u.staffId).join('-'), opponentTeam.map(u => u.staffId).join('-')],
            participants: allParticipants,
            format: { duration, durationMinutes: getDurationMinutes() },
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
            targetType: 'highest_total',
            targetValue: 0,
            handicaps: {},
            stakes: { coinBet: stakes, winnerReward: stakes * 2 },
            status: 'pending',
            createdBy: currentUser.staffId,
            createdAt: now.toISOString()
        };

        onCreateBattle(battle);
        onClose();
    };

    const canProceed = () => {
        switch (step) {
            case 'size': return true;
            case 'myteam': return myTeam.length === teamSize;
            case 'opponent': return opponentTeam.length === teamSize;
            default: return true;
        }
    };

    const nextStep = () => {
        switch (step) {
            case 'size': setStep('myteam'); break;
            case 'myteam': setStep('opponent'); break;
            case 'opponent': setStep('settings'); break;
            case 'settings': handleCreate(); break;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="glass rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Liðsbardagi</h2>
                            <p className="text-sm text-slate-400">
                                {step === 'size' && 'Veldu liðastærð'}
                                {step === 'myteam' && 'Veldu liðsfélaga'}
                                {step === 'opponent' && 'Veldu andstæðinga'}
                                {step === 'settings' && 'Stillingar'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-96">
                    {step === 'size' && (
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm mb-4">Veldu hversu margir eru í hvoru liði:</p>
                            {[2, 3].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setTeamSize(size as TeamSize)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between
                    ${teamSize === size ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Swords className={`w-6 h-6 ${teamSize === size ? 'text-purple-400' : 'text-slate-400'}`} />
                                        <span className="text-lg font-bold text-white">{size}v{size}</span>
                                    </div>
                                    {teamSize === size && <Check className="w-5 h-5 text-purple-400" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {(step === 'myteam' || step === 'opponent') && (
                        <div className="space-y-4">
                            {/* Selected team */}
                            <div className="flex gap-2 mb-4">
                                {Array.from({ length: teamSize }).map((_, i) => {
                                    const team = step === 'myteam' ? myTeam : opponentTeam;
                                    const user = team[i];
                                    return (
                                        <div
                                            key={i}
                                            className={`flex-1 h-16 rounded-xl border-2 border-dashed flex items-center justify-center
                        ${user ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'}`}
                                        >
                                            {user ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">{user.name}</span>
                                                    {user.staffId !== currentUser.staffId && (
                                                        <button
                                                            onClick={() => step === 'myteam' ? removeFromMyTeam(user.staffId) : removeFromOpponentTeam(user.staffId)}
                                                            className="p-1 hover:bg-white/10 rounded"
                                                        >
                                                            <X className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <UserPlus className="w-5 h-5 text-slate-500" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Available users */}
                            <div className="space-y-2">
                                {(step === 'myteam' ? availableForMyTeam : availableForOpponent).map(user => (
                                    <button
                                        key={user.staffId}
                                        onClick={() => step === 'myteam' ? addToMyTeam(user) : addToOpponentTeam(user)}
                                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.team}</p>
                                        </div>
                                        <UserPlus className="w-5 h-5 text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'settings' && (
                        <div className="space-y-6">
                            {/* Duration */}
                            <div>
                                <label className="text-sm font-medium text-slate-400 mb-2 block">Lengd</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['quick', 'standard', 'marathon'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={`p-3 rounded-xl border-2 transition-all
                        ${duration === d ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'}`}
                                        >
                                            <Clock className={`w-5 h-5 mx-auto mb-1 ${duration === d ? 'text-purple-400' : 'text-slate-400'}`} />
                                            <p className="text-xs font-medium text-white">
                                                {d === 'quick' ? '30 mín' : d === 'standard' ? '2 klst' : '8 klst'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stakes */}
                            <div>
                                <label className="text-sm font-medium text-slate-400 mb-2 block">Veðmál (Takk Coins)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[25, 50, 100, 200].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStakes(s)}
                                            className={`p-3 rounded-xl border-2 transition-all
                        ${stakes === s ? 'border-amber-500 bg-amber-500/10' : 'border-white/10'}`}
                                        >
                                            <Trophy className={`w-4 h-4 mx-auto mb-1 ${stakes === s ? 'text-amber-400' : 'text-slate-400'}`} />
                                            <p className="text-sm font-bold text-white">{s}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    {step !== 'size' && (
                        <button
                            onClick={() => {
                                const steps = ['size', 'myteam', 'opponent', 'settings'] as const;
                                const idx = steps.indexOf(step);
                                if (idx > 0) setStep(steps[idx - 1]);
                            }}
                            className="flex-1 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5"
                        >
                            Til baka
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold
                       disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {step === 'settings' ? 'Hefja bardaga!' : 'Áfram'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamBattleCreator;
