import { useState, useEffect, useCallback } from 'react';

interface UseNotificationsReturn {
    permission: NotificationPermission | 'default';
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    showNotification: (title: string, options?: NotificationOptions) => void;
}

/**
 * Hook for managing browser notifications
 */
export const useNotifications = (): UseNotificationsReturn => {
    const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
    const isSupported = typeof window !== 'undefined' && 'Notification' in window;

    useEffect(() => {
        if (isSupported) {
            setPermission(Notification.permission);
        }
    }, [isSupported]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, [isSupported]);

    const showNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== 'granted') return;

        try {
            new Notification(title, {
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                ...options
            });
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }, [isSupported, permission]);

    return {
        permission,
        isSupported,
        requestPermission,
        showNotification
    };
};

export default useNotifications;
