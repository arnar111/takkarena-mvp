import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Smile, Image, Zap } from 'lucide-react';
import { Message, markConversationAsRead } from '../services/messageService';
import { subscribeToUsersStatuses } from '../services/presenceService';

interface MessagesButtonProps {
    messages?: Message[];
    currentUserId: string;
    onSendMessage?: (toUserId: string, content: string, type?: 'text' | 'challenge' | 'metric' | 'reaction', metadata?: any) => void;
    allUsers?: { id: string; name: string; avatar: string; }[];
    userStatuses?: Record<string, boolean>;
    sales?: any[];
    shifts?: any[];
}

const MessagesButton: React.FC<MessagesButtonProps> = ({
    messages = [],
    currentUserId,
    onSendMessage,
    allUsers = []
}) => {
    const [showPanel, setShowPanel] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>({});

    const unreadCount = messages.filter(m => !m.read && m.fromUserId !== currentUserId).length;

    // Mark messages as read when conversation is open
    useEffect(() => {
        if (selectedConversation && messages.length > 0) {
            markConversationAsRead(currentUserId, selectedConversation, messages);
        }
    }, [selectedConversation, messages, currentUserId]);

    // Subscribe to user statuses
    useEffect(() => {
        if (allUsers.length === 0) return;

        const userIds = allUsers.map(u => u.id);
        const unsubscribe = subscribeToUsersStatuses(userIds, (statuses) => {
            setUserStatuses(statuses);
        });

        return () => unsubscribe();
    }, [allUsers]);

    // Debug logging
    useEffect(() => {
        console.log('💬 MessagesButton allUsers:', allUsers.length, allUsers);
    }, [allUsers]);

    // Helper to convert Firebase Timestamp to Date
    const toDate = (timestamp: any): Date => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        return new Date(timestamp);
    };

    // Group messages by conversation (other user)
    const conversations = messages.reduce((acc, msg) => {
        const otherUserId = msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId;
        if (!acc[otherUserId]) {
            acc[otherUserId] = {
                userId: otherUserId,
                userName: msg.fromUserName,
                userAvatar: msg.fromUserAvatar,
                messages: [],
                unreadCount: 0,
                lastMessage: msg
            };
        }
        acc[otherUserId].messages.push(msg);
        if (!msg.read && msg.fromUserId !== currentUserId) {
            acc[otherUserId].unreadCount++;
        }
        // Update last message if this one is newer
        const msgDate = toDate(msg.timestamp);
        const lastMsgDate = toDate(acc[otherUserId].lastMessage.timestamp);
        if (msgDate > lastMsgDate) {
            acc[otherUserId].lastMessage = msg;
        }
        return acc;
    }, {} as Record<string, any>);

    const conversationList = Object.values(conversations).sort((a: any, b: any) => {
        const aDate = toDate(a.lastMessage.timestamp).getTime();
        const bDate = toDate(b.lastMessage.timestamp).getTime();
        return bDate - aDate;
    });

    const handleSendMessage = () => {
        if (messageInput.trim() && selectedConversation && onSendMessage) {
            onSendMessage(selectedConversation, messageInput.trim());
            setMessageInput('');
        }
    };

    const renderMessageContent = (msg: Message) => {
        switch (msg.type) {
            case 'challenge':
                return (
                    <div className="bg-rose-500/20 border border-rose-500/50 p-3 rounded-xl">
                        <p className="text-xs font-bold text-rose-400 mb-1">⚔️ CHALLENGE</p>
                        <p className="text-sm text-white">{msg.content}</p>
                        {msg.metadata?.accepted === undefined && (
                            <div className="flex gap-2 mt-2">
                                <button className="px-3 py-1 bg-emerald-500 rounded-lg text-xs font-bold text-white">Accept</button>
                                <button className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-slate-400">Decline</button>
                            </div>
                        )}
                    </div>
                );
            case 'metric':
                return (
                    <div className="bg-indigo-500/20 border border-indigo-500/50 p-3 rounded-xl">
                        <p className="text-xs font-bold text-indigo-400 mb-1">📊 STATS FLEX</p>
                        <p className="text-sm text-white">{msg.content}</p>
                    </div>
                );
            case 'reaction':
                return <p className="text-2xl">{msg.content}</p>;
            default:
                return <p className="text-sm text-white">{msg.content}</p>;
        }
    };

    return (
        <div className="relative">
            {/* Messages Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-3 rounded-full hover:bg-white/10 transition-all"
            >
                <MessageCircle size={22} className="text-slate-400 hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-[#01040f]">
                        {unreadCount}
                    </div>
                )}
            </button>

            {/* Messages Panel */}
            {showPanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[150]"
                        onClick={() => setShowPanel(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-4 top-16 z-[160] w-[450px] max-w-[calc(100vw-2rem)] h-[600px] glass border border-white/10 rounded-[24px] shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200 flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <h3 className="text-lg font-black text-white">
                                {showUserPicker ? 'New Message' : selectedConversation ? conversations[selectedConversation]?.userName : 'Messages'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {showUserPicker && (
                                    <button
                                        onClick={() => setShowUserPicker(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                                    >
                                        <span className="text-sm">←</span>
                                    </button>
                                )}
                                {selectedConversation && !showUserPicker && (
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                                    >
                                        <span className="text-sm">←</span>
                                    </button>
                                )}
                                {!selectedConversation && !showUserPicker && (
                                    <button
                                        onClick={() => setShowUserPicker(true)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-all bg-indigo-500/20"
                                        title="New Message"
                                    >
                                        <span className="text-indigo-400 font-black text-lg">+</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowPanel(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all"
                                >
                                    <X size={18} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {showUserPicker ? (
                                /* User Picker */
                                <div className="p-2">
                                    <p className="text-xs text-slate-400 px-3 py-2">Select a user to message:</p>
                                    {allUsers
                                        .filter(u => u.id !== currentUserId)
                                        .sort((a, b) => {
                                            // Online users first
                                            const aOnline = userStatuses[a.id] || false;
                                            const bOnline = userStatuses[b.id] || false;
                                            if (aOnline && !bOnline) return -1;
                                            if (!aOnline && bOnline) return 1;
                                            return a.name.localeCompare(b.name);
                                        })
                                        .map((user) => {
                                            const isOnline = userStatuses[user.id] || false;
                                            return (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedConversation(user.id);
                                                        setShowUserPicker(false);
                                                    }}
                                                    className="w-full p-3 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                                                >
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white">
                                                            {user.avatar}
                                                        </div>
                                                        {/* Online status indicator */}
                                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-black text-white text-sm">{user.name}</p>
                                                        <p className="text-[10px] text-slate-500">{isOnline ? 'Online' : 'Offline'}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    {allUsers.filter(u => u.id !== currentUserId).length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-slate-400 text-sm">No users available</p>
                                        </div>
                                    )}
                                </div>
                            ) : !selectedConversation ? (
                                /* Conversation List */
                                <div className="p-2">
                                    {conversationList.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MessageCircle className="mx-auto mb-3 text-slate-600" size={48} />
                                            <p className="text-slate-400 text-sm">No messages yet</p>
                                        </div>
                                    ) : (
                                        conversationList.map((conv: any) => (
                                            <button
                                                key={conv.userId}
                                                onClick={() => setSelectedConversation(conv.userId)}
                                                className="w-full p-3 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3 relative"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white">
                                                    {conv.userAvatar}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-black text-white text-sm">{conv.userName}</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {toDate(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 truncate">{conv.lastMessage.content}</p>
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <div className="bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                                                        {conv.unreadCount}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : (
                                /* Conversation Messages */
                                <div className="p-4 space-y-3">
                                    {conversations[selectedConversation]?.messages.map((msg: Message) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] ${msg.fromUserId === currentUserId ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white'} p-3 rounded-2xl`}>
                                                {renderMessageContent(msg)}
                                                <p className="text-[10px] opacity-50 mt-1">
                                                    {toDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Input (only show when conversation selected) */}
                        {selectedConversation && (
                            <div className="p-3 border-t border-white/10 flex-shrink-0">
                                <div className="flex gap-2 mb-2">
                                    <button
                                        onClick={() => {
                                            const taunts = ["I'm crushing you! 💪", "Can't keep up? 😏", "Watch and learn! 👀", "Too easy! 🎯"];
                                            const taunt = taunts[Math.floor(Math.random() * taunts.length)];
                                            if (onSendMessage) {
                                                onSendMessage(selectedConversation, taunt, 'text');
                                            }
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                        title="Quick Taunt"
                                    >
                                        <Zap size={18} className="text-yellow-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onSendMessage) {
                                                onSendMessage(selectedConversation, "📊 Check out my stats!", 'metric');
                                            }
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                        title="Share Metric"
                                    >
                                        <Image size={18} className="text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reactions = ["🔥", "👏", "💪", "🎯", "⚡", "👀", "😎"];
                                            const reaction = reactions[Math.floor(Math.random() * reactions.length)];
                                            if (onSendMessage) {
                                                onSendMessage(selectedConversation, reaction, 'reaction');
                                            }
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                        title="Reaction"
                                    >
                                        <Smile size={18} className="text-emerald-400" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all"
                                    >
                                        <Send size={18} className="text-white" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MessagesButton;
