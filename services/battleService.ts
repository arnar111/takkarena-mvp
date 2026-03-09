import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Battle, BattleStatus } from '../types';

/**
 * Subscribe to all battles
 */
export const subscribeBattles = (
    callback: (battles: Battle[]) => void
): (() => void) => {
    const q = query(collection(db, 'battles'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const battles = snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id
        } as Battle));
        callback(battles);
    }, (error) => {
        console.error('❌ Error fetching battles:', error);
    });

    return unsubscribe;
};

/**
 * Subscribe to active/pending battles only (performance optimization)
 */
export const subscribeActiveBattles = (
    callback: (battles: Battle[]) => void
): (() => void) => {
    const q = query(
        collection(db, 'battles'),
        where('status', 'in', ['pending', 'active'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const battles = snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id
        } as Battle));
        callback(battles);
    }, (error) => {
        console.error('❌ Error fetching active battles:', error);
    });

    return unsubscribe;
};

/**
 * Create a new battle
 */
export const createBattle = async (battle: Omit<Battle, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'battles'), battle);
    return docRef.id;
};

/**
 * Update battle status
 */
export const updateBattleStatus = async (id: string, status: BattleStatus): Promise<void> => {
    await updateDoc(doc(db, 'battles', id), { status });
};

/**
 * Delete a battle
 */
export const deleteBattle = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'battles', id));
};

export default {
    subscribeBattles,
    subscribeActiveBattles,
    createBattle,
    updateBattleStatus,
    deleteBattle
};
