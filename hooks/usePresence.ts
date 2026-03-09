import { useState, useEffect } from 'react';
import { setUserOnline, subscribeToUsersStatuses } from '../services/presenceService';
import { User } from '../types';

interface UsePresenceReturn {
    userStatuses: Record<string, boolean>;
}

/**
 * Hook for managing user presence/online status
 */
export const usePresence = (
    currentUserId: string | undefined,
    allUsers: User[]
): UsePresenceReturn => {
    const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>({});

    // Set current user as online
    useEffect(() => {
        if (!currentUserId) return;

        const cleanup = setUserOnline(currentUserId);
        return cleanup;
    }, [currentUserId]);

    // Subscribe to all users' online statuses
    useEffect(() => {
        if (allUsers.length === 0) return;

        const userIds = allUsers.map(u => u.id || u.staffId);
        const validIds = [...new Set(userIds.filter(id => id))];

        const unsubscribe = subscribeToUsersStatuses(validIds, (statuses) => {
            setUserStatuses(statuses);
        });

        return () => unsubscribe();
    }, [allUsers]);

    return { userStatuses };
};

export default usePresence;
