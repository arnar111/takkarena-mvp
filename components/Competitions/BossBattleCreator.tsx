import React, { useState, useMemo } from 'react';
import { Crown, X, Users, Target, Trophy, DollarSign, Shield, Zap, Clock, ChevronRight, Lock, Check } from 'lucide-react';
import { BossBattle, User } from '../../types';
import {
    BOSS_TIERS,
    BATTLE_TYPES,
    SALESMAN_ROLES,
    TEAMS,
    BossTier,
    BattleType,
    SalesmanRole,
    TeamId,
    calculateBossTarget,
    isTierUnlocked
} from '../../constants/bossBattle';

interface BossBattleCreatorProps {
    userCoins: number;
    onClose: () => void;
    onCreate: (boss: Partial<BossBattle>) => void;
    isManager?: boolean;
    currentUserId: string;
    allUsers?: User[];
    defeatedTiers?: BossTier[];
}

const DURATION_OPTIONS = [
    { value: 60, label: '1 klst', description: 'Sprettur' },
    { value: 120, label: '2 klst', description: 'Stutt' },
    { value: 240, label: '4 klst', description: 'Hefðbundin' },
    { value: 480, label: '8 klst', description: 'Dagskeppni' },
];

const BossBattleCreator: React.FC<BossBattleCreatorProps> = ({
    userCoins,
    onClose,
    onCreate,
    isManager = false,
    currentUserId,
    allUsers = [],
    defeatedTiers = [],
}) => {
    // State
    const [step, setStep] = useState(1); // 1: Tier, 2: Type, 3: Team, 4: Roles, 5: Confirm
    const [selectedTier, setSelectedTier] = useState<BossTier>('bronze');
    const [selectedType, setSelectedType] = useState<BattleType>('target');
    const [selectedTeam, setSelectedTeam] = useState<TeamId | 'custom'>('custom');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUserId]);
    const [roleAssignments, setRoleAssignments] = useState<Record<string, SalesmanRole>>({});
    const [duration, setDuration] = useState(240);
    const [bossName, setBossName] = useState('');

    // Filter users by team
    const teamMembers = useMemo(() => {
        if (selectedTeam === 'custom') return allUsers;
        // Compare lowercase team IDs
        const teamMap: Record<string, string> = {
            'Hringurinn': 'hringurinn',
            'Verið': 'verid',
            'Götuteymið': 'gotuteymi'
        };
        return allUsers.filter(u => teamMap[u.team] === selectedTeam);
    }, [allUsers, selectedTeam]);

    // Calculate target
    const target = calculateBossTarget(selectedType, selectedTier);
    const tierConfig = BOSS_TIERS[selectedTier];
    const typeConfig = BATTLE_TYPES[selectedType];

    // Toggle participant
    const toggleParticipant = (userId: string) => {
        if (userId === currentUserId && !isManager) return; // Can't remove self if not manager
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Select whole team
    const selectWholeTeam = () => {
        const teamUserIds = teamMembers.map(u => u.staffId);
        setSelectedParticipants([...new Set([...teamUserIds, isManager ? '' : currentUserId].filter(Boolean))]);
    };

    // Assign role
    const assignRole = (userId: string, role: SalesmanRole) => {
        setRoleAssignments(prev => ({ ...prev, [userId]: role }));
    };

    // Handle create
    const handleCreate = () => {
        const boss: Partial<BossBattle> = {
            id: `boss-${Date.now()}`,
            name: bossName || `${tierConfig.emoji} ${tierConfig.name} Boss`,
            tier: selectedTier,
            battleType: selectedType,
            targetValue: target,
            currentDamage: 0,
            participants: selectedParticipants, // string[] of userIds
            abilities: [],
            powerUps: [],
            duration,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + duration * 60 * 1000).toISOString(),
            status: 'active',
            createdBy: currentUserId,
            isManagerCreated: isManager,
        };

        onCreate(boss);
        onClose();
    };

    // Render step content
    const renderStepContent = () => {
        switch (step) {
            case 1: // Tier Selection
                return (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 mb-4">Veldu erfiðleikastig bossins</p>
                        {Object.entries(BOSS_TIERS).map(([key, tier]) => {
                            const isUnlocked = isTierUnlocked(key as BossTier, defeatedTiers);
                            const isSelected = selectedTier === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => isUnlocked && setSelectedTier(key as BossTier)}
                                    disabled={!isUnlocked}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : isUnlocked
                                            ? 'border-white/10 bg-white/5 hover:border-white/20'
                                            : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{tier.emoji}</span>
                                            <div>
                                                <p className="font-black text-white">{tier.name}</p>
                                                <p className="text-[10px] text-slate-500">{tier.description}</p>
                                            </div>
                                        </div>
                                        {!isUnlocked ? (
                                            <Lock size={16} className="text-slate-600" />
                                        ) : isSelected ? (
                                            <Check size={16} className="text-purple-400" />
                                        ) : null}
                                    </div>
                                    <div className="flex gap-4 mt-3 text-[10px]">
                                        <span className="text-slate-400">Markmið: <span className="text-white font-bold">{tier.targetMultiplier}x</span></span>
                                        <span className="text-slate-400">Verðlaun: <span className="text-emerald-400 font-bold">{tier.rewardMultiplier}x</span></span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                );

            case 2: // Battle Type
                return (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 mb-4">Veldu tegund bardaga</p>
                        {Object.entries(BATTLE_TYPES).map(([key, type]) => {
                            const isSelected = selectedType === key;
                            const actualTarget = calculateBossTarget(key as BattleType, selectedTier);

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(key as BattleType)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{type.emoji}</span>
                                        <div className="flex-1">
                                            <p className="font-black text-white">{type.name}</p>
                                            <p className="text-[10px] text-slate-500">{type.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">
                                                {type.id === 'sales_count' ? actualTarget : new Intl.NumberFormat('is-IS').format(actualTarget)}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                {type.id === 'sales_count' ? 'sölur' : 'kr'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                );

            case 3: // Team Selection
                return (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400 mb-4">Veldu þátttakendur</p>

                        {/* Quick team select */}
                        <div className="flex gap-2 mb-4">
                            {Object.entries(TEAMS).map(([key, team]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedTeam(key as TeamId);
                                        selectWholeTeam();
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${selectedTeam === key
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                        }`}
                                >
                                    {team.emoji} {team.name}
                                </button>
                            ))}
                        </div>

                        {/* Participant list */}
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {teamMembers.map(user => {
                                const isSelected = selectedParticipants.includes(user.staffId);
                                const isSelf = user.staffId === currentUserId;

                                return (
                                    <button
                                        key={user.staffId}
                                        onClick={() => toggleParticipant(user.staffId)}
                                        disabled={isSelf && !isManager}
                                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${isSelected
                                            ? 'bg-emerald-500/20 border border-emerald-500/50'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                                {user.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white text-sm">{user.name}</span>
                                            {isSelf && <span className="text-[9px] text-slate-500">(þú)</span>}
                                        </div>
                                        {isSelected && <Check size={16} className="text-emerald-400" />}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-[10px] text-slate-500 text-center">
                            {selectedParticipants.length} þátttakendur valdir
                        </p>
                    </div>
                );

            case 4: // Role Assignment
                return (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400 mb-4">Úthlutaðu hlutverkum (valfrjálst)</p>

                        {selectedParticipants.map(userId => {
                            const user = allUsers.find(u => u.staffId === userId);
                            const assignedRole = roleAssignments[userId];

                            return (
                                <div key={userId} className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                            {user?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-white text-sm">{user?.name}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(SALESMAN_ROLES).map(([key, role]) => (
                                            <button
                                                key={key}
                                                onClick={() => assignRole(userId, key as SalesmanRole)}
                                                className={`p-2 rounded-lg text-left transition-all ${assignedRole === key
                                                    ? 'bg-purple-500/30 border border-purple-500/50'
                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-sm">{role.emoji}</span>
                                                <p className="text-[10px] font-bold text-white">{role.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            case 5: // Confirm
                return (
                    <div className="space-y-4">
                        {/* Boss Name */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">Nafn bossins (valfrjálst)</label>
                            <input
                                type="text"
                                value={bossName}
                                onChange={(e) => setBossName(e.target.value)}
                                placeholder={`${tierConfig.emoji} ${tierConfig.name} Boss`}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">Lengd</label>
                            <div className="grid grid-cols-2 gap-2">
                                {DURATION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDuration(opt.value)}
                                        className={`p-3 rounded-xl transition-all ${duration === opt.value
                                            ? 'bg-purple-500/30 border border-purple-500/50'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <p className="font-black text-white">{opt.label}</p>
                                        <p className="text-[10px] text-slate-500">{opt.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-rose-500/10 border border-purple-500/30">
                            <h4 className="text-sm font-black text-white mb-3">Samantekt</h4>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Boss</span>
                                    <span className="text-white font-bold">{tierConfig.emoji} {tierConfig.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tegund</span>
                                    <span className="text-white font-bold">{typeConfig.emoji} {typeConfig.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Markmið</span>
                                    <span className="text-white font-bold">
                                        {selectedType === 'sales_count' ? target : new Intl.NumberFormat('is-IS').format(target)}
                                        {selectedType === 'sales_count' ? ' sölur' : ' kr'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Þátttakendur</span>
                                    <span className="text-white font-bold">{selectedParticipants.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Lengd</span>
                                    <span className="text-white font-bold">{duration / 60} klst</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-[#0a0e1a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-rose-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center">
                                <Crown size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Boss Battle</h2>
                                <p className="text-xs text-slate-400">Skref {step} af 5</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/10 flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all"
                        >
                            Til baka
                        </button>
                    )}
                    {step < 5 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-black transition-all flex items-center justify-center gap-2"
                        >
                            Áfram <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 rounded-xl text-white font-black transition-all flex items-center justify-center gap-2"
                        >
                            <Crown size={16} /> Hefja bardaga!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BossBattleCreator;
