import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PROJECTS } from '../constants';

/**
 * Fake Sales Generator for Mock Battle Participants
 * Creates real sales records in Firebase for testing battles
 */

const MOCK_USERS = ['ghost', 'ghost2', 'ghost3', '1', '2', '3', '4', '5', '6'];

// Helper: Get projects from Firestore or fallback to constants
async function getProjectsList(): Promise<string[]> {
    try {
        const snapshot = await getDocs(collection(db, 'projects'));
        if (!snapshot.empty) {
            return snapshot.docs.map(doc => doc.data().name as string).filter(Boolean);
        }
    } catch (e) {
        console.warn('Failed to fetch projects from Firestore, using constants');
    }
    return [...PROJECTS];
}

interface SaleConfig {
    userId: string;
    targetAmount: number;
    startTime: Date;
    endTime: Date;
}

/**
 * Generate sales for a specific user within a time range
 */
export async function generateMockSales(config: SaleConfig): Promise<void> {
    const { userId, targetAmount, startTime, endTime } = config;
    const projectsList = await getProjectsList();

    // Generate 3-8 individual sales that add up to target
    const numSales = 3 + Math.floor(Math.random() * 6);
    let remaining = targetAmount;
    const sales = [];

    for (let i = 0; i < numSales; i++) {
        const isLast = i === numSales - 1;
        let amount: number;

        if (isLast) {
            amount = remaining;
        } else {
            // Random amount between 500 and remaining/2, rounded to nearest 500
            const max = Math.min(remaining * 0.6, 5000);
            amount = Math.round((500 + Math.random() * max) / 500) * 500;
        }

        // Random timestamp within the battle timeframe
        const timestamp = new Date(
            startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime())
        );

        remaining -= amount;

        sales.push({
            userId,
            amount,
            timestamp: timestamp.toISOString(),
            date: timestamp.toISOString().split('T')[0],
            project: projectsList[Math.floor(Math.random() * projectsList.length)],
            saleType: Math.random() > 0.7 ? 'upgrade' : 'new'
        });
    }

    // Sort by timestamp
    sales.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Add to Firebase
    for (const sale of sales) {
        try {
            await addDoc(collection(db, 'sales'), sale);
        } catch (error) {
            console.error('Error creating mock sale:', error);
        }
    }
}

/**
 * Clear all mock sales from the database
 */
export async function clearMockSales(): Promise<void> {
    for (const userId of MOCK_USERS) {
        const q = query(collection(db, 'sales'), where('userId', '==', userId));
        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
        }
    }
}

/**
 * Initialize mock sales for all active battles
 */
export async function initializeBattleSales(battles: any[]): Promise<void> {
    // Clear existing mock sales first
    await clearMockSales();

    const now = Date.now();

    for (const battle of battles) {
        if (battle.status !== 'active') continue;

        const startTime = new Date(battle.startTime);
        const endTime = new Date(battle.endTime);

        // Only generate sales for battles that have started
        if (startTime.getTime() > now) continue;

        // Use current time as effective end for progress calculation
        const effectiveEnd = new Date(Math.min(now, endTime.getTime()));

        for (const participant of battle.participants) {
            // Skip if participant already has currentSales defined (use that as target)
            const targetSales = participant.currentSales || 0;

            if (targetSales > 0 && MOCK_USERS.includes(participant.userId)) {
                await generateMockSales({
                    userId: participant.userId,
                    targetAmount: targetSales,
                    startTime,
                    endTime: effectiveEnd
                });
            }
        }
    }
}

/**
 * Add incremental sales to keep battles "live"
 */
export async function addIncrementalSales(userId: string, amount: number): Promise<void> {
    if (!MOCK_USERS.includes(userId)) return;
    const projectsList = await getProjectsList();

    try {
        await addDoc(collection(db, 'sales'), {
            userId,
            amount,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            project: projectsList[Math.floor(Math.random() * projectsList.length)],
            saleType: Math.random() > 0.7 ? 'upgrade' : 'new'
        });
    } catch (error) {
        console.error('Error adding incremental sale:', error);
    }
}
