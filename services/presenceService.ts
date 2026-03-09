import {
    ref as dbRef,
    onDisconnect,
    set,
    serverTimestamp,
    onValue,
    get,
    Database
} from 'firebase/database';
import { getDatabase } from 'firebase/database';
import app from '../firebase';

const rtdb: Database = getDatabase(app);

/**
 * Set user as online and handle disconnect
 */
export const setUserOnline = (userId: string): (() => void) => {
    const userStatusRef = dbRef(rtdb, `status/${userId}`);

    // Set user as online
    set(userStatusRef, {
        state: 'online',
        lastChanged: serverTimestamp()
    });

    // Set up disconnect handler
    onDisconnect(userStatusRef).set({
        state: 'offline',
        lastChanged: serverTimestamp()
    });

    // Return cleanup function
    return () => {
        set(userStatusRef, {
            state: 'offline',
            lastChanged: serverTimestamp()
        });
    };
};

/**
 * Subscribe to a user's online status
 */
export const subscribeToUserStatus = (
    userId: string,
    callback: (isOnline: boolean, lastChanged?: number) => void
): (() => void) => {
    const userStatusRef = dbRef(rtdb, `status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            callback(data.state === 'online', data.lastChanged);
        } else {
            callback(false);
        }
    });

    return unsubscribe;
};

/**
 * Get user status once
 */
export const getUserStatus = async (userId: string): Promise<{ isOnline: boolean; lastChanged?: number }> => {
    const userStatusRef = dbRef(rtdb, `status/${userId}`);
    const snapshot = await get(userStatusRef);
    const data = snapshot.val();

    if (data) {
        return {
            isOnline: data.state === 'online',
            lastChanged: data.lastChanged
        };
    }

    return { isOnline: false };
};

/**
 * Subscribe to multiple users' statuses
 */
export const subscribeToUsersStatuses = (
    userIds: string[],
    callback: (statuses: Record<string, boolean>) => void
): (() => void) => {
    const statuses: Record<string, boolean> = {};
    const unsubscribers: (() => void)[] = [];

    userIds.forEach(userId => {
        const unsub = subscribeToUserStatus(userId, (isOnline) => {
            statuses[userId] = isOnline;
            callback({ ...statuses });
        });
        unsubscribers.push(unsub);
    });

    // Return cleanup function that unsubscribes all
    return () => {
        unsubscribers.forEach(unsub => unsub());
    };
};

/**
 * Set user typing status
 */
export const setTypingStatus = (userId: string, isTyping: boolean): void => {
    const typingRef = dbRef(rtdb, `typing/${userId}`);
    if (isTyping) {
        set(typingRef, true);
        onDisconnect(typingRef).remove();
    } else {
        set(typingRef, null);
    }
};

/**
 * Subscribe to a specific user's typing status
 */
export const subscribeToTypingStatus = (
    userId: string,
    callback: (isTyping: boolean) => void
): (() => void) => {
    const typingRef = dbRef(rtdb, `typing/${userId}`);
    return onValue(typingRef, (snapshot) => {
        callback(!!snapshot.val());
    });
};

export default {
    setUserOnline,
    subscribeToUserStatus,
    getUserStatus,
    subscribeToUsersStatuses,
    setTypingStatus,
    subscribeToTypingStatus
};
