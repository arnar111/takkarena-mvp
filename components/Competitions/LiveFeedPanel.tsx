import React from 'react';
import { Trophy, TrendingUp, Users, Award, Zap, Star } from 'lucide-react';
import { Notification } from '../../types';

interface LiveFeedPanelProps {
    notifications: Notification[];
    onNotificationClick?: (notification: Notification) => void;
}

const LiveFeedPanel: React.FC<LiveFeedPanelProps> = ({ notifications, onNotificationClick }) => {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'battle_ending':
                return <Zap size={16} className="text-amber-400" />;
            case 'comeback_possible':
                return <TrendingUp size={16} className="text-indigo-400" />;
            case 'achievement_close':
                return <Star size={16} className="text-purple-400" />;
            case 'challenge_invite':
                return <Users size={16} className="text-blue-400" />;
            case 'battle_result':
                return <Trophy size={16} className="text-amber-400" />;
            default:
                return <Award size={16} className="text-slate-400" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'battle_ending':
                return 'border-amber-500/30 bg-amber-500/5';
            case 'comeback_possible':
                return 'border-indigo-500/30 bg-indigo-500/5';
            case 'achievement_close':
                return 'border-purple-500/30 bg-purple-500/5';
            case 'challenge_invite':
                return 'border-blue-500/30 bg-blue-500/5';
            case 'battle_result':
                return 'border-green-500/30 bg-green-500/5';
            default:
                return 'border-white/10';
        }
    };

    const getTimeAgo = (timestamp: string): string => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (notifications.length === 0) {
        return (
            <div className="glass rounded-2xl p-8 text-center">
                <Trophy className="mx-auto mb-3 text-slate-600" size={48} />
                <p className="text-slate-500">No recent activity</p>
                <p className="text-xs text-slate-600 mt-1">Battle notifications will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.slice(0, 10).map(notification => (
                <button
                    key={notification.id}
                    onClick={() => onNotificationClick?.(notification)}
                    className={`w-full glass rounded-xl p-4 border-2 transition-all hover:scale-[1.02] text-left ${getNotificationColor(notification.type)
                        } ${notification.read ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/5 rounded-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="font-bold text-white text-sm">{notification.title}</div>
                                <div className="text-xs text-slate-500 whitespace-nowrap">
                                    {getTimeAgo(notification.createdAt)}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">
                                {notification.message}
                            </p>
                            {!notification.read && (
                                <div className="mt-2">
                                    <span className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-bold">
                                        NEW
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default LiveFeedPanel;
