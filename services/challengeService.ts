import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'manager_assigned';
    target: number;
    progress: number;
    reward: number; // Takk Coins
    expiresAt: string;
    createdAt: string;
    assignedTo: string; // staffId
    assignedBy?: string; // For manager-assigned challenges
    status: 'active' | 'completed' | 'expired' | 'claimed';
    category: 'sales' | 'streak' | 'battle' | 'time' | 'custom';
}

// Default challenges that reset daily/weekly
export const DEFAULT_DAILY_CHALLENGES: Omit<Challenge, 'id' | 'progress' | 'createdAt' | 'assignedTo' | 'status'>[] = [
    {
        title: 'Morgunljómi',
        description: 'Seldu áður en 10:00',
        type: 'daily',
        target: 1,
        reward: 10,
        expiresAt: '', // Set at creation
        category: 'time'
    },
    {
        title: 'Hattabrögð',
        description: '3 sölur á sama tíma',
        type: 'daily',
        target: 3,
        reward: 25,
        expiresAt: '',
        category: 'streak'
    },
    {
        title: 'Markmiðsvís',
        description: 'Náðu dagsmarkmiði',
        type: 'daily',
        target: 1,
        reward: 50,
        expiresAt: '',
        category: 'sales'
    }
];

export const DEFAULT_WEEKLY_CHALLENGES: Omit<Challenge, 'id' | 'progress' | 'createdAt' | 'assignedTo' | 'status'>[] = [
    {
        title: 'Vikunnar kappi',
        description: 'Vindu 3 bardaga',
        type: 'weekly',
        target: 3,
        reward: 100,
        expiresAt: '',
        category: 'battle'
    },
    {
        title: 'Streak meistari',
        description: 'Náðu 5x streak 3 sinnum',
        type: 'weekly',
        target: 3,
        reward: 150,
        expiresAt: '',
        category: 'streak'
    }
];

// Subscribe to user's challenges
export const subscribeChallenges = (
    userId: string,
    callback: (challenges: Challenge[]) => void
): (() => void) => {
    const q = query(
        collection(db, 'challenges'),
        where('assignedTo', '==', userId),
        where('status', 'in', ['active', 'completed']),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Challenge));
        callback(challenges);
    });
};

// Create a new challenge (for managers)
export const createChallenge = async (challenge: Omit<Challenge, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'challenges'), {
        ...challenge,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
};

// Update challenge progress
export const updateChallengeProgress = async (
    challengeId: string,
    progress: number
): Promise<void> => {
    await updateDoc(doc(db, 'challenges', challengeId), { progress });
};

// Mark challenge as completed
export const completeChallenge = async (challengeId: string): Promise<void> => {
    await updateDoc(doc(db, 'challenges', challengeId), {
        status: 'completed',
        progress: 100
    });
};

// Claim challenge reward
export const claimChallengeReward = async (challengeId: string): Promise<void> => {
    await updateDoc(doc(db, 'challenges', challengeId), {
        status: 'claimed'
    });
};

// Assign challenge from manager
export const assignChallenge = async (
    managerId: string,
    userId: string,
    title: string,
    description: string,
    target: number,
    reward: number,
    expiresInDays: number = 1
): Promise<string> => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return createChallenge({
        title,
        description,
        type: 'manager_assigned',
        target,
        progress: 0,
        reward,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        assignedTo: userId,
        assignedBy: managerId,
        status: 'active',
        category: 'custom'
    });
};
