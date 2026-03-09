import React, { useState } from 'react';
import { X, Swords, Clock, Target, Zap, TrendingUp, Trophy, AlertCircle } from 'lucide-react';
import { applyHandicap, formatDuration } from '../../utils/battleUtils';

interface Opponent {
    userId: string;
    name: string;
    avatar: string;
    recentAvg: number; // Last 7 days average
}

interface ChallengeCreatorProps {
    opponent: Opponent;
    userCoins: number;
    onClose: () => void;
    onCreate: (challenge: {
        opponentId: string;
        format: {
            duration: 'quick' | 'standard' | 'marathon' | 'custom';
            durationMinutes?: number;
            durationUnit?: 'hours' | 'minutes';
        };
        targetType: 'first_to' | 'highest_total' | 'most_sales';
        targetValue: number;
        handicaps: {
            opponent: number;
            self: number;
        };
        stakes?: {
            coinBet: number;
        };
    }) => void;
}

const ChallengeCreatorModal: React.FC<ChallengeCreatorProps> = ({
    opponent,
    userCoins,
    onClose,
    onCreate,
}) => {
    const [step, setStep] = useState(1);

    // Step 2: Battle Format
    const [battleDuration, setBattleDuration] = useState<'quick' | 'standard' | 'marathon' | 'custom'>('standard');
    const [customTimeUnit, setCustomTimeUnit] = useState<'hours' | 'minutes'>('hours');
    const [customTimeValue, setCustomTimeValue] = useState<number>(4);
    const [targetType, setTargetType] = useState<'first_to' | 'highest_total' | 'most_sales'>('highest_total');
    const [targetValue, setTargetValue] = useState<number>(25000);

    // Step 3: Handicaps
    const [opponentHandicap, setOpponentHandicap] = useState<number>(1.0);
    const [selfHandicap, setSelfHandicap] = useState<number>(1.0);

    // Step 4: Stakes
    const [enableStakes, setEnableStakes] = useState(false);
    const [coinBet, setCoinBet] = useState<number>(50);

    const getDurationMinutes = (): number => {
        switch (battleDuration) {
            case 'quick':
                return 120; // 2 hours
            case 'standard':
                return 480; // 8 hours (full shift)
            case 'marathon':
                return 1440; // 24 hours
            case 'custom':
                return customTimeUnit === 'hours' ? customTimeValue * 60 : customTimeValue;
            default:
                return 480;
        }
    };

    const handleCreate = () => {
        onCreate({
            opponentId: opponent.userId,
            format: {
                duration: battleDuration,
                durationMinutes: battleDuration === 'custom' ? getDurationMinutes() : undefined,
                durationUnit: battleDuration === 'custom' ? customTimeUnit : undefined,
            },
            targetType,
            targetValue,
            handicaps: {
                opponent: opponentHandicap,
                self: selfHandicap,
            },
            stakes: enableStakes ? { coinBet } : undefined,
        });
        onClose();
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 rounded-full text-rose-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Swords size={14} /> Skora á
                </div>
                <h3 className="text-2xl font-black text-white">Opponent Valinn</h3>
                <p className="text-sm text-slate-400">Staðfestu andstæðing þinn</p>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 text-center space-y-4">
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/10">
                    {opponent.avatar}
                </div>
                <div>
                    <h4 className="text-xl font-black text-white">{opponent.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Andstæðingur</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="text-center">
                        <p className="text-2xl font-black text-indigo-400">{opponent.recentAvg.toLocaleString('is-IS')}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Meðaltal (7 dagar)</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-emerald-400">Online</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Staða</p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black uppercase tracking-wider rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-rose-500/30"
            >
                Áfram <TrendingUp size={16} className="inline ml-2" />
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Clock size={14} /> Snið
                </div>
                <h3 className="text-2xl font-black text-white">Battle Format</h3>
                <p className="text-sm text-slate-400">Veldu tíma og markmið</p>
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tímalengd</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'quick', label: 'Skjótt', time: '2 klst' },
                        { value: 'standard', label: 'Venjulegt', time: '8 klst' },
                        { value: 'marathon', label: 'Maraþon', time: '24 klst' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setBattleDuration(opt.value as any)}
                            className={`p-3 rounded-xl text-xs font-black uppercase transition-all ${battleDuration === opt.value
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'glass border-white/5 text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            <div>{opt.label}</div>
                            <div className="text-[10px] opacity-70 mt-1">{opt.time}</div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setBattleDuration('custom')}
                    className={`w-full p-3 rounded-xl text-xs font-black uppercase transition-all ${battleDuration === 'custom'
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'glass border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                >
                    Sérsniðið Tími
                </button>

                {/* Custom Time Input */}
                {battleDuration === 'custom' && (
                    <div className="glass p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCustomTimeUnit('hours')}
                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${customTimeUnit === 'hours'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                Klukkutímar
                            </button>
                            <button
                                onClick={() => setCustomTimeUnit('minutes')}
                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${customTimeUnit === 'minutes'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                Mínútur
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max={customTimeUnit === 'hours' ? 24 : 1440}
                                value={customTimeValue}
                                onChange={(e) => setCustomTimeValue(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold text-center text-2xl focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">
                                {customTimeUnit === 'hours' ? 'klst' : 'mín'}
                            </span>
                        </div>

                        <p className="text-center text-xs text-indigo-400 font-bold">
                            Heildartími: {formatDuration(getDurationMinutes())}
                        </p>
                    </div>
                )}
            </div>

            {/* Target Type */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Markmið</label>
                <div className="space-y-2">
                    {[
                        { value: 'highest_total', label: 'Hæsta heildarsala', icon: <Trophy size={14} /> },
                        { value: 'first_to', label: 'Fyrst í markið', icon: <Target size={14} /> },
                        { value: 'most_sales', label: 'Flestar sölur', icon: <Zap size={14} /> },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTargetType(opt.value as any)}
                            className={`w-full p-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${targetType === opt.value
                                ? 'bg-indigo-500 text-white shadow-lg'
                                : 'glass border-white/5 text-slate-400 hover:bg-white/5'
                                }`}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>

                {targetType === 'first_to' && (
                    <div className="glass p-4 rounded-2xl border border-indigo-500/30">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Markmiðsupphæð
                        </label>
                        <input
                            type="number"
                            step="1000"
                            value={targetValue}
                            onChange={(e) => setTargetValue(parseInt(e.target.value) || 25000)}
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold text-center text-xl focus:outline-none focus:border-indigo-500 transition-all"
                        />
                        <p className="text-center text-xs text-slate-500 mt-2">{targetValue.toLocaleString('is-IS')} ISK</p>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 glass border-white/10 text-slate-400 font-black uppercase rounded-xl hover:bg-white/5 transition-all"
                >
                    Til baka
                </button>
                <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black uppercase rounded-xl hover:scale-[1.02] transition-all shadow-lg"
                >
                    Áfram
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Zap size={14} /> Handicap
                </div>
                <h3 className="text-2xl font-black text-white">Balance Keppnina</h3>
                <p className="text-sm text-slate-400">Stilltu multiplierar fyrir báða leikmenn</p>
            </div>

            {/* Info Box */}
            <div className="glass p-4 rounded-2xl border border-amber-500/20 flex gap-3">
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-amber-400">Handicap</span> breytir því hvernig sala telst. Ef þú selur
                    10.000 ISK með <span className="font-bold">0.5x handicap</span>, telur það sem{' '}
                    <span className="font-bold text-rose-400">5.000 ISK</span> í keppninni.
                </div>
            </div>

            {/* Opponent Handicap */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Handicap fyrir</span>
                    <span className="text-white">{opponent.name}</span>
                </label>

                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                    <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={opponentHandicap}
                        onChange={(e) => setOpponentHandicap(parseFloat(e.target.value))}
                        className="w-full handicap-slider"
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Auðveldara (2.0x)</span>
                        <span className="text-2xl font-black text-amber-400">{opponentHandicap.toFixed(1)}x</span>
                        <span className="text-xs text-slate-500">Erfiðara (0.1x)</span>
                    </div>

                    {/* Live Preview */}
                    <div className="glass p-3 rounded-xl bg-black/30 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Dæmi</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">10,000 ISK sala</span>
                            <span className="text-xs text-slate-600 mx-2">→</span>
                            <span className="text-sm font-black text-amber-400">
                                {applyHandicap(10000, opponentHandicap).toLocaleString('is-IS')} ISK
                            </span>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="flex gap-2">
                        {[
                            { label: 'Jafnt', value: 1.0 },
                            { label: 'Lítill', value: 0.75 },
                            { label: 'Erfiður', value: 0.5 },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setOpponentHandicap(preset.value)}
                                className="flex-1 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Self Handicap */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Handicap fyrir</span>
                    <span className="text-white">þig (Hard Mode)</span>
                </label>

                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                    <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={selfHandicap}
                        onChange={(e) => setSelfHandicap(parseFloat(e.target.value))}
                        className="w-full handicap-slider"
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Hard Mode (0.1x)</span>
                        <span className="text-2xl font-black text-rose-400">{selfHandicap.toFixed(1)}x</span>
                        <span className="text-xs text-slate-500">Auðveldara (2.0x)</span>
                    </div>

                    {/* Live Preview */}
                    <div className="glass p-3 rounded-xl bg-black/30 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Dæmi (þín sala)</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">10,000 ISK sala</span>
                            <span className="text-xs text-slate-600 mx-2">→</span>
                            <span className="text-sm font-black text-rose-400">
                                {applyHandicap(10000, selfHandicap).toLocaleString('is-IS')} ISK
                            </span>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="flex gap-2">
                        {[
                            { label: 'Jafnt', value: 1.0 },
                            { label: 'Hard', value: 0.75 },
                            { label: 'Beast', value: 0.5 },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => setSelfHandicap(preset.value)}
                                className="flex-1 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 glass border-white/10 text-slate-400 font-black uppercase rounded-xl hover:bg-white/5 transition-all"
                >
                    Til baka
                </button>
                <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase rounded-xl hover:scale-[1.02] transition-all shadow-lg"
                >
                    Áfram
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Trophy size={14} /> Stakes
                </div>
                <h3 className="text-2xl font-black text-white">Stakes & Rewards</h3>
                <p className="text-sm text-slate-400">Veðdu Takk Coins (valfrjálst)</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Virkja Stakes</span>
                    <button
                        onClick={() => setEnableStakes(!enableStakes)}
                        className={`w-12 h-6 rounded-full transition-all ${enableStakes ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                    >
                        <div
                            className={`h-5 w-5 bg-white rounded-full transition-all ${enableStakes ? 'translate-x-6' : 'translate-x-0.5'
                                }`}
                        />
                    </button>
                </div>

                {enableStakes && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Veðmál (Takk Coins)</label>
                            <input
                                type="number"
                                min="10"
                                max={userCoins}
                                step="10"
                                value={coinBet}
                                onChange={(e) => setCoinBet(Math.min(userCoins, parseInt(e.target.value) || 50))}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold text-center text-xl focus:outline-none focus:border-emerald-500 transition-all"
                            />
                            <p className="text-xs text-slate-500 text-center">
                                Þú átt: <span className="text-emerald-400 font-bold">{userCoins}</span> coins
                            </p>
                        </div>

                        <div className="glass p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <p className="text-xs text-slate-400 mb-2">Verðlaun fyrir sigurvegara:</p>
                            <p className="text-3xl font-black text-emerald-400 text-center">{coinBet * 2} 🪙</p>
                            <p className="text-[10px] text-slate-500 text-center mt-1 uppercase tracking-wider">
                                Winner Takes All
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 glass border-white/10 text-slate-400 font-black uppercase rounded-xl hover:bg-white/5 transition-all"
                >
                    Til baka
                </button>
                <button
                    onClick={() => setStep(5)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-xl hover:scale-[1.02] transition-all shadow-lg"
                >
                    Áfram
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 rounded-full text-rose-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Swords size={14} /> Staðfesting
                </div>
                <h3 className="text-2xl font-black text-white">Battle Yfirlit</h3>
                <p className="text-sm text-slate-400">Endurskoðaðu áður en þú byrjar</p>
            </div>

            <div className="space-y-3">
                {/* Participants */}
                <div className="glass p-5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Keppendur</p>
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm mb-2">
                                ÞÚ
                            </div>
                            <p className="text-xs font-bold text-white">Þú</p>
                            <p className="text-[10px] text-rose-400 font-bold mt-1">{selfHandicap.toFixed(1)}x handicap</p>
                        </div>

                        <Swords size={20} className="text-slate-600" />

                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold text-sm mb-2">
                                {opponent.avatar}
                            </div>
                            <p className="text-xs font-bold text-white">{opponent.name}</p>
                            <p className="text-[10px] text-amber-400 font-bold mt-1">{opponentHandicap.toFixed(1)}x handicap</p>
                        </div>
                    </div>
                </div>

                {/* Format */}
                <div className="glass p-5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Format</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-400">Tímalengd:</span>
                            <span className="text-sm font-bold text-white">{formatDuration(getDurationMinutes())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-400">Markmið:</span>
                            <span className="text-sm font-bold text-white">
                                {targetType === 'highest_total' && 'Hæsta heildarsala'}
                                {targetType === 'first_to' && `Fyrst í ${targetValue.toLocaleString('is-IS')} ISK`}
                                {targetType === 'most_sales' && 'Flestar sölur'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stakes */}
                {enableStakes && (
                    <div className="glass p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Stakes</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Veðmál:</span>
                            <span className="text-xl font-black text-emerald-400">{coinBet} 🪙</span>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-3">
                            Sigurvegari fær <span className="text-emerald-400 font-bold">{coinBet * 2} coins</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-3 glass border-white/10 text-slate-400 font-black uppercase rounded-xl hover:bg-white/5 transition-all"
                >
                    Til baka
                </button>
                <button
                    onClick={handleCreate}
                    className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-rose-500/30"
                >
                    Byrja Keppni! 🔥
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 lg:left-64 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="glass max-w-lg w-full rounded-[32px] border border-white/10 p-6 md:p-8 relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                    <X size={18} />
                </button>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-rose-500' : s < step ? 'w-6 bg-rose-500/50' : 'w-4 bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
        </div>
    );
};

export default ChallengeCreatorModal;
