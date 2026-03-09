import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Nudge {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    message: string;
    createdAt: string;
    read: boolean;
}

// Send a motivational nudge
export const sendNudge = async (
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    message: string
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'nudges'), {
        fromUserId,
        fromUserName,
        toUserId,
        message,
        createdAt: new Date().toISOString(),
        read: false
    });
    return docRef.id;
};

// Subscribe to nudges for a user
export const subscribeNudges = (
    userId: string,
    callback: (nudges: Nudge[]) => void
): (() => void) => {
    const q = query(
        collection(db, 'nudges'),
        where('toUserId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const nudges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Nudge));
        callback(nudges);
    });
};

// Performance tracking functions
export interface PerformanceSnapshot {
    userId: string;
    date: string;
    dailySales: number;
    salesCount: number;
    avgPerSale: number;
    goalProgress: number;
    streakMax: number;
}

export const savePerformanceSnapshot = async (
    snapshot: Omit<PerformanceSnapshot, 'date'>
): Promise<void> => {
    await addDoc(collection(db, 'performance_snapshots'), {
        ...snapshot,
        date: new Date().toISOString().split('T')[0]
    });
};

// Get performance trend for a user
export const subscribePerformanceTrend = (
    userId: string,
    days: number,
    callback: (snapshots: PerformanceSnapshot[]) => void
): (() => void) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
        collection(db, 'performance_snapshots'),
        where('userId', '==', userId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const snapshots = snapshot.docs.map(doc => ({
            ...doc.data()
        } as PerformanceSnapshot));
        callback(snapshots);
    });
};
