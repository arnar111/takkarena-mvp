import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { Shift } from '../types';

export interface ShiftQueryOptions {
    limitCount?: number;
}

/**
 * Subscribe to shifts for a specific user with pagination
 */
export const subscribeShifts = (
    userId: string,
    callback: (shifts: Shift[]) => void,
    options: ShiftQueryOptions = {}
): (() => void) => {
    const { limitCount = 50 } = options;

    const q = query(
        collection(db, 'shifts'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const shifts = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Shift));
        callback(shifts);
    }, (error) => {
        console.error('❌ Error fetching shifts:', error);
    });

    return unsubscribe;
};

/**
 * Add a new shift
 */
export const addShift = async (shift: Omit<Shift, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'shifts'), shift);
    return docRef.id;
};

/**
 * Update an existing shift
 */
export const updateShift = async (id: string, data: Partial<Shift>): Promise<void> => {
    await updateDoc(doc(db, 'shifts', id), data);
};

/**
 * Delete a shift
 */
export const deleteShift = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'shifts', id));
};

export default {
    subscribeShifts,
    addShift,
    updateShift,
    deleteShift
};
