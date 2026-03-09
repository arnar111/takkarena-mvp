import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import LiveFeedPanel from './Competitions/LiveFeedPanel.tsx';
import BattleInvitePanel from './Competitions/BattleInvitePanel.tsx';

interface NotificationBellProps {
    feedNotifications?: any[];
    invites?: any[];
    onAcceptInvite?: (battleId: string) => void; // <--- ADDED
    onDeclineInvite?: (battleId: string) => void; // <--- ADDED
}

const NotificationBell: React.FC<NotificationBellProps> = ({
    feedNotifications = [],
    invites = [],
    onAcceptInvite,
    onDeclineInvite
}) => {
    const [showPanel, setShowPanel] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'feed' | 'invites'>('feed');

    const unreadCount = feedNotifications.filter(n => !n.read).length + invites.filter(i => !i.read).length;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-3 rounded-full hover:bg-white/10 transition-all"
            >
                <Bell size={22} className="text-slate-400 hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-[#01040f]">
                        {unreadCount}
                    </div>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[150]"
                        onClick={() => setShowPanel(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-4 top-16 z-[160] w-[400px] max-w-[calc(100vw-2rem)] glass border border-white/10 rounded-[24px] shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">Tilkynningar</h3>
                            <button
                                onClick={() => setShowPanel(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-2 p-3 border-b border-white/5">
                            <button
                                onClick={() => setActiveCategory('feed')}
                                className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeCategory === 'feed'
                                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                📰 Feed
                                {feedNotifications.filter(n => !n.read).length > 0 && (
                                    <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {feedNotifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveCategory('invites')}
                                className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs transition-all ${activeCategory === 'invites'
                                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                ✉️ Invites
                                {invites.filter(i => !i.read).length > 0 && (
                                    <span className="ml-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {invites.filter(i => !i.read).length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            {activeCategory === 'feed' && (
                                <LiveFeedPanel
                                    notifications={feedNotifications}
                                    onNotificationClick={(notif) => {
                                        if (notif.actionUrl) console.log('Navigate', notif.actionUrl);
                                    }}
                                />
                            )}
                            {activeCategory === 'invites' && (
                                <BattleInvitePanel
                                    invites={invites}
                                    onAccept={onAcceptInvite}   // <--- CONNECTED
                                    onDecline={onDeclineInvite} // <--- CONNECTED
                                    onCounter={(id) => console.log('Counter', id)}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
