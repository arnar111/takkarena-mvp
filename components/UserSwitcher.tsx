import React, { useState } from 'react';
import { User } from '../types';
import { UserCog, ChevronDown, X, Eye } from 'lucide-react';

interface UserSwitcherProps {
    currentUser: User;
    allUsers: User[];
    impersonatedUser: User | null;
    onSwitchUser: (user: User | null) => void;
}

/**
 * Admin-only component for switching between users without logging out
 * Only visible to admin users (staffId 570)
 */
const UserSwitcher: React.FC<UserSwitcherProps> = ({
    currentUser,
    allUsers,
    impersonatedUser,
    onSwitchUser
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Only show for admin (staffId 570)
    if (String(currentUser.staffId) !== '570') {
        return null;
    }

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.staffId.includes(search)
    );

    const handleSelect = (user: User) => {
        onSwitchUser(user.staffId === currentUser.staffId ? null : user);
        setIsOpen(false);
        setSearch('');
    };

    const handleClearImpersonation = () => {
        onSwitchUser(null);
    };

    return (
        <div className="relative">
            {/* Impersonation Banner */}
            {impersonatedUser && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-black py-1 px-4 flex items-center justify-center gap-2 text-xs font-bold">
                    <Eye className="w-4 h-4" />
                    <span>Impersonating: {impersonatedUser.name} ({impersonatedUser.staffId})</span>
                    <button
                        onClick={handleClearImpersonation}
                        className="ml-2 p-1 hover:bg-black/10 rounded"
                        aria-label="Stop impersonating"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Switcher Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all
          ${impersonatedUser ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 hover:bg-white/10 text-slate-400'}
        `}
                aria-label="Switch user"
                aria-expanded={isOpen}
            >
                <UserCog className="w-4 h-4" />
                <span className="text-xs font-medium hidden md:block">Switch User</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[90]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-72 glass rounded-2xl shadow-2xl z-[95] overflow-hidden">
                        <div className="p-3 border-b border-white/10">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {/* Reset to self option */}
                            {impersonatedUser && (
                                <button
                                    onClick={() => handleSelect(currentUser)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                        ME
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Back to {currentUser.name}</p>
                                        <p className="text-xs text-slate-500">Stop impersonating</p>
                                    </div>
                                </button>
                            )}

                            {filteredUsers.map(user => (
                                <button
                                    key={user.staffId}
                                    onClick={() => handleSelect(user)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors
                    ${impersonatedUser?.staffId === user.staffId ? 'bg-amber-500/10' : ''}
                    ${user.staffId === currentUser.staffId ? 'bg-indigo-500/10' : ''}
                  `}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${user.role === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-slate-300'}
                  `}>
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-medium text-white">{user.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {user.staffId} • {user.role} • {user.team}
                                        </p>
                                    </div>
                                    {user.staffId === currentUser.staffId && (
                                        <span className="text-xs text-indigo-400">(You)</span>
                                    )}
                                    {impersonatedUser?.staffId === user.staffId && (
                                        <span className="text-xs text-amber-400">(Active)</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserSwitcher;
