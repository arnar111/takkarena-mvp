import { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types';

interface QueuedSale {
    id: string;
    sale: Omit<Sale, 'id'>;
    queuedAt: string;
    synced: boolean;
}

interface UseOfflineQueueReturn {
    isOnline: boolean;
    pendingCount: number;
    queueSale: (sale: Omit<Sale, 'id'>) => void;
    syncQueue: (saveFn: (sale: Omit<Sale, 'id'>) => Promise<void>) => Promise<number>;
    clearQueue: () => void;
}

const QUEUE_KEY = 'takk_offline_sales_queue';

/**
 * Hook for managing offline sales queue
 * Queues sales when offline and syncs when back online
 */
export const useOfflineQueue = (): UseOfflineQueueReturn => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queue, setQueue] = useState<QueuedSale[]>(() => {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Persist queue to localStorage
    useEffect(() => {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }, [queue]);

    const queueSale = useCallback((sale: Omit<Sale, 'id'>) => {
        const queuedSale: QueuedSale = {
            id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sale,
            queuedAt: new Date().toISOString(),
            synced: false
        };

        setQueue(prev => [...prev, queuedSale]);
    }, []);

    const syncQueue = useCallback(async (saveFn: (sale: Omit<Sale, 'id'>) => Promise<void>): Promise<number> => {
        if (!isOnline || queue.length === 0) return 0;

        let syncedCount = 0;
        const failedItems: QueuedSale[] = [];

        for (const item of queue) {
            if (item.synced) continue;

            try {
                await saveFn(item.sale);
                syncedCount++;
            } catch (err) {
                console.error('Failed to sync sale:', err);
                failedItems.push(item);
            }
        }

        // Remove synced items, keep failed ones
        setQueue(failedItems);

        return syncedCount;
    }, [isOnline, queue]);

    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem(QUEUE_KEY);
    }, []);

    const pendingCount = queue.filter(q => !q.synced).length;

    return {
        isOnline,
        pendingCount,
        queueSale,
        syncQueue,
        clearQueue
    };
};

export default useOfflineQueue;
