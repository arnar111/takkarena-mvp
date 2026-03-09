import { useState, useEffect, useMemo, useCallback } from 'react';
import { Battle, Sale } from '../types';
import {
    subscribeBattles,
    createBattle as createBattleService,
    deleteBattle,
    updateBattleStatus
} from '../services/battleService';

interface BattleInvite {
    id: string;
    sender: string;
    type: string;
    time: string;
    read: boolean;
}

interface BattleCallbacks {
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
    onConfirm?: (message: string) => Promise<boolean>;
}

interface UseBattlesReturn {
    battles: Battle[];
    invites: BattleInvite[];
    activeBattle: Battle | null;
    createBattle: (battle: Battle) => Promise<void>;
    cancelBattle: (battleId: string) => Promise<void>;
    acceptInvite: (battleId: string) => Promise<void>;
    declineInvite: (battleId: string) => Promise<void>;
    getActiveBattleWithLiveScores: (allSales: Sale[]) => Battle | null;
}

/**
 * Hook for managing battles, invites, and battle operations
 * Now accepts callbacks for toast notifications instead of using alert()
 */
export const useBattles = (
    userId: string | undefined,
    callbacks?: BattleCallbacks
): UseBattlesReturn => {
    const [battles, setBattles] = useState<Battle[]>([]);

    const { onError, onSuccess, onConfirm } = callbacks || {};

    // Subscribe to battles
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeBattles((fetchedBattles) => {
            setBattles(fetchedBattles);
        });

        return () => unsubscribe();
    }, [userId]);

    // Calculate pending invites
    const invites = useMemo((): BattleInvite[] => {
        if (!userId) return [];

        return battles
            .filter(b =>
                b.status === 'pending' &&
                b.participants.some(p => p.userId === userId && p.userId !== b.createdBy)
            )
            .map(b => ({
                id: b.id,
                sender: b.participants.find(p => p.userId === b.createdBy)?.name || 'Unknown',
                type: 'battle',
                time: b.createdAt,
                read: false
            }));
    }, [battles, userId]);

    // Find active battle for current user (must be active status AND not ended by time)
    const activeBattle = useMemo((): Battle | null => {
        if (!userId) return null;
        const now = new Date();

        return battles.find(b =>
            b.status === 'active' &&
            b.participants.some(p => p.userId === userId) &&
            new Date(b.endTime) > now // Battle end time must be in the future
        ) || null;
    }, [battles, userId]);

    // Get active battle with live calculated scores
    const getActiveBattleWithLiveScores = useCallback((allSales: Sale[]): Battle | null => {
        if (!activeBattle) return null;

        return {
            ...activeBattle,
            participants: activeBattle.participants.map(p => {
                const participantSales = allSales.filter(s =>
                    s.userId === p.userId &&
                    new Date(s.timestamp) >= new Date(activeBattle.startTime) &&
                    new Date(s.timestamp) <= new Date(activeBattle.endTime)
                );
                const total = participantSales.reduce((sum, sale) => sum + sale.amount, 0);
                return { ...p, currentSales: total };
            })
        };
    }, [activeBattle]);

    // Battle CRUD operations
    const createBattle = useCallback(async (newBattle: Battle): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...battleData } = newBattle;
        try {
            await createBattleService(battleData);
            onSuccess?.('Áskorun send!');
        } catch (e) {
            console.error('Error creating battle:', e);
            onError?.('Gat ekki sent áskorun.');
        }
    }, [onError, onSuccess]);

    const cancelBattle = useCallback(async (battleId: string): Promise<void> => {
        const confirmed = onConfirm
            ? await onConfirm('Ertu viss um að þú viljir hætta við?')
            : confirm('Ertu viss um að þú viljir hætta við?');

        if (!confirmed) return;

        try {
            await deleteBattle(battleId);
            onSuccess?.('Áskorun afturkölluð');
        } catch (e) {
            console.error('Error cancelling battle:', e);
            onError?.('Villa við að hætta við áskorun');
        }
    }, [onConfirm, onError, onSuccess]);

    const acceptInvite = useCallback(async (battleId: string): Promise<void> => {
        try {
            await updateBattleStatus(battleId, 'active');
            onSuccess?.('Áskorun samþykkt! Bardagi hafinn!');
        } catch (e) {
            console.error('Error accepting battle:', e);
            onError?.('Villa við að samþykkja áskorun');
        }
    }, [onError, onSuccess]);

    const declineInvite = useCallback(async (battleId: string): Promise<void> => {
        const confirmed = onConfirm
            ? await onConfirm('Hafna áskorun?')
            : confirm('Hafna áskorun?');

        if (!confirmed) return;

        try {
            await deleteBattle(battleId);
            onSuccess?.('Áskorun hafnað');
        } catch (e) {
            console.error('Error declining battle:', e);
            onError?.('Villa við að hafna áskorun');
        }
    }, [onConfirm, onError, onSuccess]);

    return {
        battles,
        invites,
        activeBattle,
        createBattle,
        cancelBattle,
        acceptInvite,
        declineInvite,
        getActiveBattleWithLiveScores
    };
};

export default useBattles;
