import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Send, Zap, Image, Smile, X, Plus, Link } from 'lucide-react';
import { Message, markConversationAsRead } from '../services/messageService';
import { Sale, Shift } from '../types';

interface MessagesPageProps {
    messages: Message[];
    currentUserId: string;
    currentUserName: string;
    currentUserAvatar: string;
    allUsers: Array<{ id: string; staffId: string; name: string; avatar?: string }>;
    userStatuses: Record<string, boolean>;
    onSendMessage: (toUserId: string, content: string, type?: 'text' | 'challenge' | 'metric' | 'reaction' | 'image') => void;
    sales: Sale[];
    shifts: Shift[];
}

const EMOJI_LIST = [
    // Top row - Work related / Most used
    "🔥", "👏", "💪", "🎯", "⚡", "👀", "😎", "🚀",
    // Others
    "👍", "👋", "🎉", "💯", "🏆", "💰", "📈", "🤝", "⭐", "✅", "❌", "🤔", "😅", "🫡"
];

const TAUNTS = [
    "Ég er að rústa þér! 💪",
    "Geturðu ekki haldið í við mig? 😏",
    "Horfðu og lærðu! 👀",
    "Of auðvelt! 🎯"
];

const MessagesPage: React.FC<MessagesPageProps> = ({
    messages,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    allUsers,
    userStatuses,
    onSendMessage,
    sales,
    shifts
}) => {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper to convert Firebase Timestamp to Date
    const toDate = (timestamp: any): Date => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        return new Date(timestamp);
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedConversation]);

    // Mark messages as read when conversation is open
    useEffect(() => {
        if (selectedConversation && messages.length > 0) {
            markConversationAsRead(currentUserId, selectedConversation, messages);
        }
    }, [selectedConversation, messages, currentUserId]);

    // Auto-open user picker when searching
    useEffect(() => {
        if (searchQuery) {
            setShowUserPicker(true);
        }
    }, [searchQuery]);

    // Group messages by conversation
    const conversations = messages.reduce((acc, msg) => {
        const otherUserId = msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId;

        if (!acc[otherUserId]) {
            const otherUser = allUsers.find(u => (u.staffId || u.id) === otherUserId);

            // Try to find name from any message where they are the sender
            let computedName = otherUser?.name;
            let computedAvatar = otherUser?.avatar;

            if (!computedName) {
                // Look for any message from this user to get their details
                const messageFromOther = messages.find(m => m.fromUserId === otherUserId);
                if (messageFromOther) {
                    computedName = messageFromOther.fromUserName;
                    computedAvatar = messageFromOther.fromUserAvatar;
                } else {
                    // Fallback if we only have sent messages and user not in DB
                    // Check for specific system IDs if needed, otherwise use ID
                    computedName = otherUserId === '570' ? 'Stjórnandi' : `Notandi ${otherUserId}`;
                }
            }

            acc[otherUserId] = {
                userId: otherUserId,
                userName: computedName || 'Óþekktur notandi',
                userAvatar: computedAvatar || computedName?.substring(0, 2).toUpperCase() || '??',
                messages: [],
                unreadCount: 0,
                lastMessage: msg
            };
        }

        acc[otherUserId].messages.push(msg);

        if (!msg.read && msg.toUserId === currentUserId) {
            acc[otherUserId].unreadCount++;
        }

        const msgDate = toDate(msg.timestamp);
        const lastMsgDate = toDate(acc[otherUserId].lastMessage.timestamp);
        if (msgDate > lastMsgDate) {
            acc[otherUserId].lastMessage = msg;
        }
        return acc;
    }, {} as Record<string, any>);

    // Conversation list sorted by last message time
    const conversationList = Object.values(conversations).sort((a: any, b: any) => {
        const aDate = toDate(a.lastMessage.timestamp);
        const bDate = toDate(b.lastMessage.timestamp);
        return bDate.getTime() - aDate.getTime();
    });

    // Filter users for new message picker
    const filteredUsers = allUsers
        .filter(u => (u.staffId || u.id) !== currentUserId)
        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const aOnline = userStatuses[a.staffId] || false;
            const bOnline = userStatuses[b.staffId] || false;
            if (aOnline && !bOnline) return -1;
            if (!aOnline && bOnline) return 1;
            return a.name.localeCompare(b.name);
        });

    const [showStatsPicker, setShowStatsPicker] = useState(false);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversation) return;
        onSendMessage(selectedConversation, messageInput.trim());
        setMessageInput('');
    };

    const handleQuickAction = (type: 'taunt' | 'metric' | 'reaction' | 'image') => {
        if (!selectedConversation) return;

        if (type === 'taunt') {
            onSendMessage(selectedConversation, TAUNTS[Math.floor(Math.random() * TAUNTS.length)], 'text');
        } else if (type === 'metric') {
            setShowStatsPicker(!showStatsPicker);
        } else if (type === 'reaction') {
            setShowEmojiPicker(!showEmojiPicker);
        } else if (type === 'image') {
            const url = window.prompt("Sláðu inn slóð á mynd (URL):");
            if (url && url.trim()) {
                onSendMessage(selectedConversation, url.trim(), 'image');
            }
        }
    };

    const sendStat = (statType: 'daily' | 'total' | 'shifts' | 'avg') => {
        if (!selectedConversation) return;

        const safeSales = sales || [];
        const safeShifts = shifts || [];

        let msg = "";

        if (statType === 'daily') {
            // Calculate today's sales
            const today = new Date().toDateString();
            const todaySales = safeSales
                .filter(s => {
                    const ts = s.timestamp as any;
                    const date = ts?.toDate ? ts.toDate() : new Date(ts);
                    return date.toDateString() === today;
                })
                .reduce((sum, s) => sum + (s.amount || 0), 0);
            msg = `📅 Sala dagsins: ${todaySales.toLocaleString('is-IS')} kr 🔥`;
        } else if (statType === 'total') {
            const totalSales = safeSales.reduce((sum, s) => sum + (s.amount || 0), 0);
            msg = `💰 Heildarsala: ${totalSales.toLocaleString('is-IS')} kr 🚀`;
        } else if (statType === 'shifts') {
            msg = `🏗️ Unnar vaktir: ${safeShifts.length} 💪`;
        } else if (statType === 'avg') {
            const totalSales = safeSales.reduce((sum, s) => sum + (s.amount || 0), 0);
            const avg = safeShifts.length > 0 ? Math.round(totalSales / safeShifts.length) : 0;
            msg = `📈 Meðaltal á vakt: ${avg.toLocaleString('is-IS')} kr 🧠`;
        }

        onSendMessage(selectedConversation, msg, 'metric');
        setShowStatsPicker(false);
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Skilaboð</h2>
                        <p className="text-slate-400 font-bold text-sm">Rauntíma spjall</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 glass rounded-[32px] border border-white/10 overflow-hidden flex min-h-0">
                {/* Sidebar - Conversations List */}
                <div className="w-80 border-r border-white/10 flex flex-col">
                    {/* Search */}
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Leita að notendum..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowUserPicker(!showUserPicker)}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm rounded-xl transition-all"
                        >
                            <Plus size={18} />
                            Ný skilaboð
                        </button>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {showUserPicker ? (
                            <div className="p-2">
                                {filteredUsers.map(user => {
                                    const isOnline = userStatuses[user.staffId] || false;
                                    return (
                                        <button
                                            key={user.staffId}
                                            onClick={() => {
                                                setSelectedConversation(user.staffId);
                                                setShowUserPicker(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full p-3 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a] ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-white text-sm">{user.name}</p>
                                                <p className="text-[10px] text-slate-500">{isOnline ? 'Tengdur' : 'Ótengdur'}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : conversationList.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageSquare className="mx-auto text-slate-600 mb-3" size={48} />
                                <p className="text-slate-400 text-sm font-bold">Engin samtöl ennþá</p>
                                <p className="text-slate-600 text-xs">Byrjaðu nýtt samtal til að byrja!</p>
                            </div>
                        ) : (
                            conversationList.map((conv: any) => (
                                <button
                                    key={conv.userId}
                                    onClick={() => setSelectedConversation(conv.userId)}
                                    className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-all flex items-center gap-3 ${selectedConversation === conv.userId ? 'bg-white/10' : ''}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-white">
                                            {conv.userAvatar}
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="font-black text-white text-sm truncate">{conv.userName}</p>
                                        <p className="text-xs text-slate-400 truncate">{conv.lastMessage.content}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-white">
                                            {conversations[selectedConversation]?.userAvatar}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a] ${userStatuses[selectedConversation] ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white">{conversations[selectedConversation]?.userName}</p>
                                        <p className="text-[10px] text-slate-500">{userStatuses[selectedConversation] ? 'Tengdur' : 'Ótengdur'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedConversation(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                    <X size={18} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                                {conversations[selectedConversation]?.messages.map((msg: Message) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.fromUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.fromUserId === currentUserId ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white'} p-3 rounded-2xl`}>
                                            {msg.type === 'image' ? (
                                                <img src={msg.content} alt="Sent image" className="rounded-xl w-full max-h-60 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                            <p className="text-[10px] opacity-60 mt-1">
                                                {toDate(msg.timestamp).toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-white/10 relative">
                                {/* Stats Picker */}
                                {showStatsPicker && (
                                    <div className="absolute bottom-full left-16 mb-2 bg-[#000000]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 w-80 animate-in zoom-in-95 duration-200 z-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Deila Árangri</h3>
                                            <button onClick={() => setShowStatsPicker(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => sendStat('daily')} className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/30 p-4 rounded-2xl text-left transition-all group">
                                                <div className="text-xs text-emerald-300 font-bold mb-1 uppercase tracking-wider">Dagurinn</div>
                                                <div className="text-white font-black text-lg group-hover:scale-105 transition-transform">Í dag</div>
                                            </button>
                                            <button onClick={() => sendStat('total')} className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30 border border-indigo-500/30 p-4 rounded-2xl text-left transition-all group">
                                                <div className="text-xs text-indigo-300 font-bold mb-1 uppercase tracking-wider">Samtals</div>
                                                <div className="text-white font-black text-lg group-hover:scale-105 transition-transform">Tímabil</div>
                                            </button>
                                            <button onClick={() => sendStat('shifts')} className="bg-gradient-to-br from-orange-500/20 to-red-600/20 hover:from-orange-500/30 hover:to-red-600/30 border border-orange-500/30 p-4 rounded-2xl text-left transition-all group">
                                                <div className="text-xs text-orange-300 font-bold mb-1 uppercase tracking-wider">Fjöldi</div>
                                                <div className="text-white font-black text-lg group-hover:scale-105 transition-transform">Vaktir</div>
                                            </button>
                                            <button onClick={() => sendStat('avg')} className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 p-4 rounded-2xl text-left transition-all group">
                                                <div className="text-xs text-cyan-300 font-bold mb-1 uppercase tracking-wider">Meðaltal</div>
                                                <div className="text-white font-black text-lg group-hover:scale-105 transition-transform">Afköst</div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Emoji Picker */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-4 mb-2 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-4 w-72 animate-in slide-in-from-bottom-2 z-50">
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mest notað</span>
                                            <button onClick={() => setShowEmojiPicker(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                                        </div>
                                        <div className="grid grid-cols-8 gap-2">
                                            {EMOJI_LIST.map((emoji, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        onSendMessage(selectedConversation, emoji, 'reaction');
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className={`hover:bg-white/10 rounded-lg p-1 transition-all text-xl flex items-center justify-center ${index < 8 ? 'bg-white/5' : ''}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => handleQuickAction('taunt')}
                                        className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        title="Send Taunt"
                                    >
                                        <Zap size={14} />
                                        Hroki
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('metric')}
                                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        title="Deila Tölum"
                                    >
                                        <Image size={14} />
                                        Tölur
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('reaction')}
                                        className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        title="Viðbrögð"
                                    >
                                        <Smile size={14} />
                                        Viðbrögð
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('image')}
                                        className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        title="Senda Mynd"
                                    >
                                        <Link size={14} />
                                        Mynd
                                    </button>
                                </div>

                                {/* Message Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Skrifaðu skilaboð..."
                                        className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="mx-auto text-slate-600 mb-4" size={64} />
                                <p className="text-slate-400 font-bold text-lg">Veldu samtal</p>
                                <p className="text-slate-600 text-sm">Veldu notanda af listanum eða byrjaðu nýtt samtal</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
