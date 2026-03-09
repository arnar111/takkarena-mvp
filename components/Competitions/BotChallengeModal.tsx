import React, { useState } from 'react';
import { X, Swords, Clock, Ghost, Trophy, Zap } from 'lucide-react';
import { DIFFICULTY_LEVELS, DifficultyLevel, BOT_CONFIG, PRE_BATTLE_TAUNTS, getRandomTaunt } from '../../constants/botPersonality';

interface BotChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartBattle: (difficulty: DifficultyLevel, durationMinutes: number) => void;
    userCoins: number;
}

const DURATION_OPTIONS = [
    { minutes: 15, label: '15 mín', description: 'Sprettur' },
    { minutes: 30, label: '30 mín', description: 'Stutt keppni' },
    { minutes: 60, label: '1 klst', description: 'Hefðbundin' },
    { minutes: 120, label: '2 klst', description: 'Maraþon' },
];

const BotChallengeModal: React.FC<BotChallengeModalProps> = ({
    isOpen,
    onClose,
    onStartBattle,
    userCoins,
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [taunt] = useState(() => getRandomTaunt(PRE_BATTLE_TAUNTS));

    if (!isOpen) return null;

    const handleStart = () => {
        onStartBattle(selectedDifficulty, selectedDuration);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-lg glass rounded-[32px] p-6 relative animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                    <X size={20} />
                </button>

                {/* Bot Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center text-3xl font-black text-white shadow-xl mb-3">
                        <Ghost size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight">{BOT_CONFIG.name}</h2>
                    <p className="text-sm text-purple-400 font-bold italic">"{taunt}"</p>
                </div>

                {/* Difficulty Selection */}
                <div className="mb-6">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Erfiðleikastig</p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDifficulty(key as DifficultyLevel)}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${selectedDifficulty === key
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{config.emoji}</span>
                                    <span className="font-black text-white">{config.name}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">{config.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Lengd</p>
                    <div className="flex gap-2">
                        {DURATION_OPTIONS.map((opt) => (
                            <button
                                key={opt.minutes}
                                onClick={() => setSelectedDuration(opt.minutes)}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all ${selectedDuration === opt.minutes
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Clock size={14} className="text-purple-400" />
                                    <span className="font-black text-white text-sm">{opt.label}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 text-center">{opt.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Preview */}
                <div className="glass p-4 rounded-xl mb-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-slate-400">Sigurshlutfall gegn Púka</span>
                        </div>
                        <span className="text-sm font-black text-white">45%</span>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Swords size={20} />
                    Byrja bardaga!
                </button>
            </div>
        </div>
    );
};

export default BotChallengeModal;
