import { Notification, Battle, Badge } from '../types';

/**
 * Notification Engine - Smart triggers for user engagement
 */

export const NOTIFICATION_TRIGGERS = {
    battle_ending_soon: (battle: Battle, userId: string): Notification | null => {
        const now = new Date();
        const endTime = new Date(battle.endTime);
        const timeRemaining = endTime.getTime() - now.getTime();
        const oneHour = 60 * 60 * 1000;

        // Only trigger if less than 1 hour remaining
        if (timeRemaining > oneHour || timeRemaining < 0) return null;

        // Check if user is behind
        const user = battle.participants.find(p => p.userId === userId);
        const opponent = battle.participants.find(p => p.userId !== userId);

        if (!user || !opponent) return null;

        const userSales = user.adjustedSales || user.currentSales;
        const opponentSales = opponent.adjustedSales || opponent.currentSales;

        if (userSales >= opponentSales) return null; // User is winning or tied

        const deficit = opponentSales - userSales;

        return {
            id: `battle_ending_${battle.id}_${Date.now()}`,
            userId,
            type: 'battle_ending',
            title: '⚠️ Bardagi endar bráðum!',
            message: `Þú ert ${deficit.toLocaleString()} kr á eftir! Aðeins ${Math.round(timeRemaining / 60000)} mínútur eftir.`,
            actionUrl: `/competitions?battle=${battle.id}`,
            read: false,
            createdAt: new Date().toISOString(),
            metadata: { battleId: battle.id, deficit }
        };
    },

    comeback_possible: (battle: Battle, userId: string): Notification | null => {
        const user = battle.participants.find(p => p.userId === userId);
        const opponent = battle.participants.find(p => p.userId !== userId);

        if (!user || !opponent) return null;

        const userSales = user.adjustedSales || user.currentSales;
        const opponentSales = opponent.adjustedSales || opponent.currentSales;
        const deficit = opponentSales - userSales;

        // Check if user is behind but comeback is realistic (< 20% gap)
        if (deficit <= 0 || deficit > battle.targetValue * 0.2) return null;

        const now = new Date();
        const endTime = new Date(battle.endTime);
        const timeRemaining = endTime.getTime() - now.getTime();
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (hoursRemaining < 0.5) return null; // Too little time

        return {
            id: `comeback_${battle.id}_${Date.now()}`,
            userId,
            type: 'comeback_possible',
            title: '💪 Comeback mögulegur!',
            message: `Þú getur enn unnið! Aðeins ${deficit.toLocaleString()} kr á eftir með ${hoursRemaining.toFixed(1)} klst eftir.`,
            actionUrl: `/competitions?battle=${battle.id}`,
            read: false,
            createdAt: new Date().toISOString(),
            metadata: { battleId: battle.id, deficit }
        };
    },

    achievement_close: (badge: Badge, progress: number, userId: string): Notification | null => {
        // Only trigger if 90-99% complete (not 100% as that's earned)
        if (progress < 90 || progress >= 100) return null;

        return {
            id: `achievement_${badge.id}_${Date.now()}`,
            userId,
            type: 'achievement_close',
            title: '🏆 Næstum því!',
            message: `${Math.round(progress)}% til "${badge.name}" merkisins!`,
            actionUrl: '/competitions?tab=badges',
            read: false,
            createdAt: new Date().toISOString(),
            metadata: { badgeId: badge.id, progress }
        };
    }
};

export function checkNotifications(
    userId: string,
    battles: Battle[],
    badges: Badge[],
    userStats: any
): Notification[] {
    const notifications: Notification[] = [];

    // Check active battles
    battles
        .filter(b => b.status === 'active' && b.participants.some(p => p.userId === userId))
        .forEach(battle => {
            // Battle ending soon
            const endingNotif = NOTIFICATION_TRIGGERS.battle_ending_soon(battle, userId);
            if (endingNotif) notifications.push(endingNotif);

            // Comeback possible
            const comebackNotif = NOTIFICATION_TRIGGERS.comeback_possible(battle, userId);
            if (comebackNotif) notifications.push(comebackNotif);
        });

    // Check badge progress
    badges.forEach(badge => {
        const progress = badge.progress || 0;
        const notif = NOTIFICATION_TRIGGERS.achievement_close(badge, progress, userId);
        if (notif) notifications.push(notif);
    });

    return notifications;
}
