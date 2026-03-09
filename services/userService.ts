import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Goals, WageSettings } from '../types';

export interface UserConfig {
    goals?: Goals;
    wageSettings?: WageSettings;
    requireOFCheck?: boolean;
    autoPausesEnabled?: boolean;
    coachPersonality?: string;
}

/**
 * Subscribe to all users
 */
export const subscribeUsers = (
    callback: (users: User[]) => void
): (() => void) => {
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
        callback(users);
    }, (error) => {
        console.error('❌ Error fetching users:', error);
    });

    return unsubscribe;
};

/**
 * Get user by staff ID
 */
export const getUserByStaffId = async (staffId: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('staffId', '==', staffId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docData = snapshot.docs[0];
    return { ...docData.data(), id: docData.id } as User;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docData = snapshot.docs[0];
    return { ...docData.data(), id: docData.id } as User;
};

/**
 * Subscribe to user config
 */
export const subscribeUserConfig = (
    staffId: string,
    callback: (config: UserConfig) => void
): (() => void) => {
    const configRef = doc(db, 'user_configs', staffId);

    const unsubscribe = onSnapshot(configRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as UserConfig);
        } else {
            callback({});
        }
    });

    return unsubscribe;
};

/**
 * Update user config
 */
export const updateUserConfig = async (
    staffId: string,
    config: Partial<UserConfig>
): Promise<void> => {
    await setDoc(doc(db, 'user_configs', staffId), config, { merge: true });
};

export default {
    subscribeUsers,
    getUserByStaffId,
    getUserByEmail,
    subscribeUserConfig,
    updateUserConfig
};
