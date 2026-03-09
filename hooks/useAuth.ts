import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { User } from '../types';
import { getUserByStaffId, getUserByEmail } from '../services/userService';

const IMPERSONATION_KEY = 'takk_impersonated_user';
const ADMIN_STAFF_IDS = ['570'];

interface UseAuthReturn {
    user: User | null;
    realUser: User | null; // The actual logged-in user (for admin checks)
    impersonatedUser: User | null;
    loading: boolean;
    isImpersonating: boolean;
    logout: () => Promise<void>;
    switchUser: (targetUser: User | null) => void;
}

/**
 * Hook for managing authentication state with impersonation support
 * Admin users (staffId 570) can impersonate other users without logging out
 */
export const useAuth = (): UseAuthReturn => {
    const [realUser, setRealUser] = useState<User | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load impersonated user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(IMPERSONATION_KEY);
        if (stored) {
            try {
                setImpersonatedUser(JSON.parse(stored));
            } catch (e) {
                localStorage.removeItem(IMPERSONATION_KEY);
            }
        }
    }, []);

    // Firebase auth listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const storedStaffId = localStorage.getItem('takk_last_staff_id');
                    const adminEmail = 'arnar.kjartansson@takk.co';

                    // Special case: admin without stored staff ID
                    if (firebaseUser.email?.toLowerCase() === adminEmail && !storedStaffId) {
                        setLoading(false);
                        return;
                    }

                    let userData: User | null = null;

                    // Try to get user by stored staff ID first, then by email
                    if (storedStaffId) {
                        userData = await getUserByStaffId(storedStaffId);
                    } else if (firebaseUser.email) {
                        userData = await getUserByEmail(firebaseUser.email);
                    }

                    if (userData) {
                        setRealUser(userData);
                        if (!storedStaffId) {
                            localStorage.setItem('takk_last_staff_id', userData.staffId);
                        }
                    } else if (storedStaffId === '570') {
                        // Fallback for admin
                        setRealUser({
                            id: 'admin-manual',
                            name: 'Addi',
                            staffId: '570',
                            role: 'manager',
                            team: 'Götuteymið'
                        });
                    } else {
                        console.error('User not found');
                        auth.signOut();
                        setRealUser(null);
                    }
                } catch (err) {
                    console.error('Error fetching user:', err);
                    setRealUser(null);
                }
            } else {
                setRealUser(null);
                setImpersonatedUser(null);
                localStorage.removeItem(IMPERSONATION_KEY);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Admin-only function to switch to another user
    const switchUser = useCallback((targetUser: User | null) => {
        if (!realUser || !ADMIN_STAFF_IDS.includes(String(realUser.staffId))) {
            console.warn('Only admins can switch users');
            return;
        }

        if (targetUser && targetUser.staffId !== realUser.staffId) {
            setImpersonatedUser(targetUser);
            localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(targetUser));
        } else {
            setImpersonatedUser(null);
            localStorage.removeItem(IMPERSONATION_KEY);
        }
    }, [realUser]);

    const logout = async (): Promise<void> => {
        await auth.signOut();
        localStorage.removeItem('takk_last_staff_id');
        localStorage.removeItem(IMPERSONATION_KEY);
        setRealUser(null);
        setImpersonatedUser(null);
    };

    // The "user" is the impersonated user if set, otherwise the real user
    const user = impersonatedUser || realUser;
    const isImpersonating = !!impersonatedUser;

    return {
        user,
        realUser,
        impersonatedUser,
        loading,
        isImpersonating,
        logout,
        switchUser
    };
};

export default useAuth;
