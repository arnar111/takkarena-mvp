import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
    or,
    and,
    limit,
    limitToLast
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Message {
    id?: string;
    fromUserId: string;
    toUserId: string;
    fromUserName: string;
    fromUserAvatar: string;
    content: string;
    timestamp: Timestamp | Date;
    read: boolean;
    type?: 'text' | 'challenge' | 'metric' | 'reaction' | 'image';
    metadata?: any;
}

/**
 * Send a message to another user
 */
export const sendMessage = async (
    fromUserId: string,
    toUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    content: string,
    type: 'text' | 'challenge' | 'metric' | 'reaction' | 'image' = 'text',
    metadata?: any
): Promise<string> => {
    try {
        const messageData = {
            fromUserId,
            toUserId,
            fromUserName,
            fromUserAvatar,
            content,
            timestamp: serverTimestamp(),
            read: false,
            type,
            metadata: metadata || null
        };

        const docRef = await addDoc(collection(db, 'messages'), messageData);
        console.log('✉️ Message sent:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error sending message:', error);
        throw error;
    }
};

/**
 * Subscribe to messages for a specific user (both sent and received)
 */
export const subscribeToUserMessages = (
    userId: string,
    callback: (messages: Message[]) => void
): (() => void) => {
    const messagesRef = collection(db, 'messages');

    // Query for messages where user is either sender or receiver
    const q = query(
        messagesRef,
        or(
            where('fromUserId', '==', userId),
            where('toUserId', '==', userId)
        ),
        orderBy('timestamp', 'asc'),
        limitToLast(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            } as Message);
        });
        callback(messages);
    }, (error) => {
        console.error('❌ Error fetching messages:', error);
    });

    return unsubscribe;
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, {
            read: true
        });
    } catch (error) {
        console.error('❌ Error marking message as read:', error);
        throw error;
    }
};

/**
 * Mark all messages in a conversation as read
 */
export const markConversationAsRead = async (
    currentUserId: string,
    otherUserId: string,
    messages: Message[]
): Promise<void> => {
    try {
        const unreadMessages = messages.filter(
            m => m.toUserId === currentUserId && m.fromUserId === otherUserId && !m.read
        );

        const updatePromises = unreadMessages.map(msg => {
            if (msg.id) {
                return markMessageAsRead(msg.id);
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error('❌ Error marking conversation as read:', error);
        throw error;
    }
};

/**
 * Send a quick taunt message
 */
export const sendQuickTaunt = async (
    fromUserId: string,
    toUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    tauntType: 'crushing' | 'cant_keep_up' | 'watch_learn' | 'too_easy' | 'come_on'
): Promise<string> => {
    const taunts = {
        crushing: "I'm crushing you! 💪",
        cant_keep_up: "Can't keep up? 😏",
        watch_learn: "Watch and learn! 👀",
        too_easy: "Too easy! 🎯",
        come_on: "Come on, step it up! 🔥"
    };

    return sendMessage(
        fromUserId,
        toUserId,
        fromUserName,
        fromUserAvatar,
        taunts[tauntType],
        'text'
    );
};

/**
 * Send a metric flex message
 */
export const sendMetricFlex = async (
    fromUserId: string,
    toUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    sales: number,
    hours: number
): Promise<string> => {
    const content = `Just hit ${sales.toLocaleString('is-IS')} kr in ${hours} hours! 💪`;

    return sendMessage(
        fromUserId,
        toUserId,
        fromUserName,
        fromUserAvatar,
        content,
        'metric',
        { sales, hours }
    );
};

/**
 * Send a battle challenge via message
 */
export const sendBattleChallenge = async (
    fromUserId: string,
    toUserId: string,
    fromUserName: string,
    fromUserAvatar: string,
    challengeText: string,
    battleId?: string
): Promise<string> => {
    return sendMessage(
        fromUserId,
        toUserId,
        fromUserName,
        fromUserAvatar,
        challengeText,
        'challenge',
        { battleId, accepted: undefined }
    );
};

export default {
    sendMessage,
    subscribeToUserMessages,
    markMessageAsRead,
    markConversationAsRead,
    sendQuickTaunt,
    sendMetricFlex,
    sendBattleChallenge
};
