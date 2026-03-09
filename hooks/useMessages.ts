import { useState, useEffect } from 'react';
import {
    subscribeToUserMessages,
    sendMessage,
    markConversationAsRead,
    sendQuickTaunt,
    sendMetricFlex,
    sendBattleChallenge,
    Message
} from '../services/messageService';

interface UseMessagesReturn {
    messages: Message[];
    loading: boolean;
    sendMessage: (toUserId: string, content: string, type?: 'text' | 'challenge' | 'metric' | 'reaction', metadata?: any) => Promise<void>;
    sendTaunt: (toUserId: string, tauntType: 'crushing' | 'cant_keep_up' | 'watch_learn' | 'too_easy' | 'come_on') => Promise<void>;
    sendMetricFlex: (toUserId: string, sales: number, hours: number) => Promise<void>;
    sendChallenge: (toUserId: string, challengeText: string, battleId?: string) => Promise<void>;
    markConversationRead: (otherUserId: string) => Promise<void>;
}

export const useMessages = (
    currentUserId: string,
    userName: string,
    userAvatar: string
): UseMessagesReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        console.log('📬 Subscribing to messages for user:', currentUserId);

        const unsubscribe = subscribeToUserMessages(currentUserId, (msgs) => {
            console.log('📨 Received messages:', msgs.length);
            setMessages(msgs);
            setLoading(false);
        });

        return () => {
            console.log('📪 Unsubscribing from messages');
            unsubscribe();
        };
    }, [currentUserId]);

    const handleSendMessage = async (
        toUserId: string,
        content: string,
        type: 'text' | 'challenge' | 'metric' | 'reaction' = 'text',
        metadata?: any
    ) => {
        try {
            await sendMessage(
                currentUserId,
                toUserId,
                userName,
                userAvatar,
                content,
                type,
                metadata
            );
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSendTaunt = async (
        toUserId: string,
        tauntType: 'crushing' | 'cant_keep_up' | 'watch_learn' | 'too_easy' | 'come_on'
    ) => {
        try {
            await sendQuickTaunt(currentUserId, toUserId, userName, userAvatar, tauntType);
        } catch (error) {
            console.error('Failed to send taunt:', error);
        }
    };

    const handleSendMetricFlex = async (
        toUserId: string,
        sales: number,
        hours: number
    ) => {
        try {
            await sendMetricFlex(currentUserId, toUserId, userName, userAvatar, sales, hours);
        } catch (error) {
            console.error('Failed to send metric flex:', error);
        }
    };

    const handleSendChallenge = async (
        toUserId: string,
        challengeText: string,
        battleId?: string
    ) => {
        try {
            await sendBattleChallenge(currentUserId, toUserId, userName, userAvatar, challengeText, battleId);
        } catch (error) {
            console.error('Failed to send challenge:', error);
        }
    };

    const handleMarkConversationRead = async (otherUserId: string) => {
        try {
            await markConversationAsRead(currentUserId, otherUserId, messages);
        } catch (error) {
            console.error('Failed to mark conversation as read:', error);
        }
    };

    return {
        messages,
        loading,
        sendMessage: handleSendMessage,
        sendTaunt: handleSendTaunt,
        sendMetricFlex: handleSendMetricFlex,
        sendChallenge: handleSendChallenge,
        markConversationRead: handleMarkConversationRead
    };
};
