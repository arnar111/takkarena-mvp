import React, { useState, useMemo } from 'react';
import { Swords, User, Ghost, Clock, Sparkles, Trophy } from 'lucide-react';
import ChallengeCreatorModal from './ChallengeCreatorModal.tsx';
import BotChallengeModal from './BotChallengeModal.tsx';
import { Sale, User as UserType } from '../../types';
import { BOT_CONFIG, DIFFICULTY_LEVELS, DifficultyLevel } from '../../constants/botPersonality';

// --- 1. DEFINE BOTS (For User 123) ---
const BOTS = [
    { userId: 'bot_1', name: 'Jón Jónsson', avatar: 'JJ', recentAvg: 18500, online: true },
    { userId: 'bot_2', name: 'Sigga Dögg', avatar: 'SD', recentAvg: 22300, online: true },
    { userId: 'bot_3', name: 'Gunnar', avatar: 'GU', recentAvg: 15200, online: true },
    { userId: 'bot_4', name: 'Anna', avatar: 'AN', recentAvg: 19800, online: false },
];

interface DuelProps {
    sales: Sale[];
    user: UserType;
    allUsers?: UserType[];
    onBattleCreated: (battle: any) => void;
}

const DuelArenaView: React.FC<DuelProps> = ({ sales, user, allUsers = [], onBattleCreated }) => {
    const [selectedOpponent, setSelectedOpponent] = useState<{
        userId: string;
        name: string;
        avatar: string;
        recentAvg: number;
    } | null>(null);

    const [showBotModal, setShowBotModal] = useState(false);

    // Calculate user's today sales for live display
    const todayStr = new Date().toISOString().split('T')[0];
    const mySales = useMemo(() => {
        return sales
            .filter((s) => s.date === todayStr && s.userId === user.staffId)
            .reduce((acc, s) => acc + s.amount, 0);
    }, [sales, todayStr, user.staffId]);

    // Mock ghost opponent (linear progression)
    const ghostSales = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(10, 0, 0, 0);
        const hoursPassed = Math.max(0, (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60));
        const ghostRatePerHour = 25000 / 8;
        return Math.round(ghostRatePerHour * hoursPassed);
    }, []);

    const target = 25000;
    const myPercent = Math.min(100, Math.max(5, (mySales / target) * 100));
    const ghostPercent = Math.min(100, Math.max(5, (ghostSales / target) * 100));

    const formatISK = (val: number) => new Intl.NumberFormat('is-IS').format(val);

    // Mock time left
    const endOfDay = new Date();
    endOfDay.setHours(18, 0, 0, 0);
    const timeLeftMs = endOfDay.getTime() - Date.now();
    const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeLeft = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`;

    // --- 2. OPPONENT LOGIC ---
    const opponents = useMemo(() => {
        // RULE: User 123 ALWAYS sees bots
        if (user.staffId === '123') {
            return BOTS;
        }

        // If we have real users passed down
        if (allUsers && allUsers.length > 0) {
            const realPeople = allUsers
                .filter(u => u.staffId !== user.staffId) // Remove self
                .map(u => {
                    // Calculate Real Stats based on sales history
                    const userHistory = sales.filter(s => s.userId === u.staffId);
                    const totalVal = userHistory.reduce((acc, s) => acc + s.amount, 0);
                    const avg = userHistory.length > 0 ? Math.round(totalVal / userHistory.length) : 0;

                    return {
                        userId: u.staffId,
                        name: u.name,
                        avatar: u.name ? u.name.substring(0, 2).toUpperCase() : '??',
                        recentAvg: avg > 0 ? avg : 15000, // Default average if new
                        online: true
                    };
                });

            // If there are real opponents, return them. Otherwise fallback to bots.
            return realPeople.length > 0 ? realPeople : BOTS;
        }

        return BOTS;
    }, [user.staffId, allUsers, sales]);

    const handleCreateChallenge = (challenge: any) => {
        const battle = {
            id: Math.random().toString(36).substring(7),
            participants: [
                {
                    userId: user.staffId,
                    name: user.name,
                    avatar: user.name.substring(0, 2).toUpperCase(),
                    currentSales: 0,
                    salesCount: 0,
                },
                {
                    userId: challenge.opponentId,
                    name: opponents.find((o) => o.userId === challenge.opponentId)?.name || 'Unknown',
                    avatar: opponents.find((o) => o.userId === challenge.opponentId)?.avatar || '??',
                    currentSales: 0,
                    salesCount: 0,
                },
            ],
            // FIX: Explicitly sanitize the format object to prevent 'undefined' values
            format: {
                duration: challenge.format.duration,
                durationMinutes: challenge.format.durationMinutes || null, // undefined -> null
                durationUnit: challenge.format.durationUnit || null // undefined -> null
            },
            startTime: new Date().toISOString(),
            endTime: new Date(
                Date.now() + (challenge.format.durationMinutes || 480) * 60 * 1000
            ).toISOString(),
            targetType: challenge.targetType,
            targetValue: challenge.targetValue,
            handicaps: {
                [user.staffId]: challenge.handicaps?.self || 1,
                [challenge.opponentId]: challenge.handicaps?.opponent || 1,
            },
            status: 'pending' as const,
            stakes: challenge.stakes || null, // undefined -> null
            createdAt: new Date().toISOString(),
            createdBy: user.staffId,
        };

        onBattleCreated(battle);
        setSelectedOpponent(null);
    };

    // Handle bot battle start
    const handleBotBattle = (difficulty: DifficultyLevel, durationMinutes: number) => {
        const now = new Date();
        const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

        const battle = {
            id: `bot-${Math.random().toString(36).substring(7)}`,
            participants: [
                {
                    userId: user.staffId,
                    name: user.name,
                    avatar: user.name.substring(0, 2).toUpperCase(),
                    currentSales: 0,
                    salesCount: 0,
                },
                {
                    userId: BOT_CONFIG.id,
                    name: BOT_CONFIG.name,
                    avatar: BOT_CONFIG.avatar,
                    currentSales: 0,
                    salesCount: 0,
                    isBot: true,
                    difficulty,
                },
            ],
            format: {
                duration: 'custom' as const,
                durationMinutes,
            },
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
            targetType: 'highest_total' as const,
            targetValue: 50000,
            handicaps: {},
            status: 'active' as const,
            createdAt: now.toISOString(),
            createdBy: user.staffId,
            isBot: true,
        };

        onBattleCreated(battle);
    };

    return (
        <div className="space-y-8 animate-in fly-in-bottom duration-700">
            {/* GUÐJÓN PÚKI - Bot Challenge Card */}
            <div
                onClick={() => setShowBotModal(true)}
                className="glass p-6 rounded-[32px] border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-rose-900/10 to-purple-900/20 relative overflow-hidden cursor-pointer hover:border-purple-500/50 transition-all group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center shadow-xl border-2 border-purple-400/50">
                            <Ghost size={32} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-black text-white">{BOT_CONFIG.name}</h3>
                                <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                            <p className="text-xs text-purple-400 font-bold">Æfingarkeppni gegn gervigreind</p>
                            <div className="flex items-center gap-3 mt-2">
                                {Object.values(DIFFICULTY_LEVELS).map(d => (
                                    <span key={d.id} className="text-xs">{d.emoji}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 rounded-xl text-white font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2">
                        <Swords size={16} />
                        Skora á
                    </button>
                </div>
            </div>

            {/* Active Practice Duel (vs Ghost) */}
            <div className="glass p-1 rounded-[40px] border-rose-500/30 bg-gradient-to-b from-rose-900/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

                <div className="p-6 pb-2 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 rounded-full text-rose-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Swords size={12} /> Practice Duel
                    </div>

                    <div className="flex justify-between items-center px-4">
                        {/* Player */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border-2 border-indigo-400 relative">
                                <User size={32} />
                                <div className="absolute -bottom-3 bg-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-indigo-400">
                                    Þú
                                </div>
                            </div>
                            <p className="text-2xl font-black text-white mt-2">{formatISK(mySales)}</p>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center gap-1">
                            <span
                                className="text-4xl font-black text-rose-500 italic relative z-10"
                                style={{ textShadow: '0 0 20px rgba(244,63,94,0.5)' }}
                            >
                                VS
                            </span>
                            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock size={10} /> {timeLeft} eftir
                            </div>
                        </div>

                        {/* Ghost */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-16 w-16 rounded-2xl bg-slate-700 flex items-center justify-center text-slate-400 border-2 border-slate-600 relative">
                                <Ghost size={32} />
                                <div className="absolute -bottom-3 bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black border border-slate-600">
                                    Ghost
                                </div>
                            </div>
                            <p className="text-2xl font-black text-slate-400 mt-2">{formatISK(ghostSales)}</p>
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="mt-8 flex gap-1 h-3 rounded-full overflow-hidden bg-white/5 relative">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-1000"
                            style={{ width: `${myPercent}%` }}
                        />
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2" />
                        <div
                            className="bg-rose-500 h-full absolute right-0 transition-all duration-1000"
                            style={{ width: `${ghostPercent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-3">
                        Markmið: Fyrstur í {formatISK(target)} kr
                    </p>
                </div>
            </div>

            {/* Challenge Others */}
            <div>
                <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Swords size={18} className="text-slate-500" /> Skora á félaga
                </h3>
                <div className="space-y-3">
                    {opponents.map((opponent) => (
                        <div
                            key={opponent.userId}
                            className="glass p-4 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                    {opponent.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{opponent.name}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${opponent.online ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {opponent.online ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOpponent(opponent)}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Skora á
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Challenge Creator Modal */}
            {selectedOpponent && (
                <ChallengeCreatorModal
                    opponent={selectedOpponent}
                    userCoins={user.coins || 0}
                    onClose={() => setSelectedOpponent(null)}
                    onCreate={handleCreateChallenge}
                />
            )}

            {/* Bot Challenge Modal */}
            <BotChallengeModal
                isOpen={showBotModal}
                onClose={() => setShowBotModal(false)}
                onStartBattle={handleBotBattle}
                userCoins={user.coins || 0}
            />
        </div>
    );
};

export default DuelArenaView;
