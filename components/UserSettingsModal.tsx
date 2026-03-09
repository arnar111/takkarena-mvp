import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, Loader2, User as UserIcon, Check } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { User } from '../types';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdated?: (updatedFields: Partial<User>) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [displayName, setDisplayName] = useState(user.displayName || user.name || '');
  const [nickname, setNickname] = useState(user.nickname || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when user changes
  useEffect(() => {
    setDisplayName(user.displayName || user.name || '');
    setNickname(user.nickname || '');
    setAvatarPreview(user.avatar || null);
    setAvatarFile(null);
    setSaved(false);
    setError(null);
  }, [user]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Vinsamlegast veldu mynd (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Mynd má ekki vera stærri en 5MB');
      return;
    }

    setError(null);
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updates: Partial<User> = {};

      // Upload avatar if changed
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${user.staffId}`);
        await uploadBytes(storageRef, avatarFile);
        const downloadURL = await getDownloadURL(storageRef);
        updates.avatar = downloadURL;
      }

      // Update display name if changed
      if (displayName.trim() && displayName !== user.name && displayName !== user.displayName) {
        updates.displayName = displayName.trim();
        updates.name = displayName.trim();
      }

      // Update nickname
      if (nickname !== (user.nickname || '')) {
        updates.nickname = nickname.trim();
      }

      if (Object.keys(updates).length > 0) {
        // Update Firestore user doc
        await updateDoc(doc(db, 'users', user.id), updates);
        onUserUpdated?.(updates);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      console.error('Error saving user settings:', err);
      setError(err.message || 'Villa við að vista stillingar');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const initials = (user.displayName || user.name || 'U').substring(0, 2).toUpperCase();

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

        {/* Close button */}
        <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
          <X size={20} className="text-white/70" />
        </button>

        {/* Header */}
        <div className="relative pt-8 pb-4 px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <UserIcon size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Notandastillingar</h2>
          <p className="text-sm text-slate-400">Breyttu prófílnum þínum</p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black border-4 border-indigo-500/50 shadow-lg">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              Velja mynd
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Nafn
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nafnið þitt"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm font-bold"
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Gælunafn
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="t.d. Sölukóngurinn"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm font-bold"
            />
            <p className="text-[10px] text-slate-600 mt-1 ml-1">Sýnist á stigatöflu og í keppnum</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-indigo-500/30'
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Vista...
              </>
            ) : saved ? (
              <>
                <Check size={18} />
                Vistað!
              </>
            ) : (
              <>
                <Save size={18} />
                Vista breytingar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;
