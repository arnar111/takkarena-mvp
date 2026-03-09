import { useState, useEffect } from 'react';
import { User } from '../types';

interface UseAdminCheckReturn {
    isAdmin: boolean;
    isManager: boolean;
    loading: boolean;
}

// Admin staff IDs - in production, this should be stored in Firestore or Firebase Auth custom claims
const ADMIN_STAFF_IDS = ['570'];

/**
 * Hook for centralized admin and manager role checking
 * Replaces hardcoded staffId checks throughout the app
 */
export const useAdminCheck = (user: User | null): UseAdminCheckReturn => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsAdmin(false);
            setIsManager(false);
            setLoading(false);
            return;
        }

        // Check admin status
        const adminStatus = ADMIN_STAFF_IDS.includes(String(user.staffId));
        setIsAdmin(adminStatus);

        // Check manager status
        const managerStatus = user.role === 'manager';
        setIsManager(managerStatus);

        setLoading(false);
    }, [user]);

    return { isAdmin, isManager, loading };
};

export default useAdminCheck;
