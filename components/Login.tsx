import React, { useState } from 'react';
import { Building2, ShieldAlert, KeyRound, Loader2, LogIn } from 'lucide-react';
import { signInWithPopup, auth, microsoftProvider } from '../firebase.ts'; // Ensure .ts extension if needed
import { LOGO_URL } from '../constants.ts';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);
  
  // Admin "God Mode" State
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState('');

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;
      
      console.log("Logged in as:", user.email);

      // --- ADMIN CHECK ---
      if (user.email && user.email.toLowerCase() === 'arnar.kjartansson@takk.co') {
        // Stop the normal flow and show the admin popup
        setLoading(false);
        setShowAdminPopup(true);
        return;
      }

      // For everyone else, clear any previous manual overrides
      localStorage.removeItem('takk_last_staff_id');
      
      // The App.tsx auth listener will handle fetching the profile based on email/uid
    } catch (err: any) {
      console.error("Microsoft Login Error:", err);
      setError('Innskráning mistókst. Ertu viss um að þú sért með aðgang?');
      setLoading(false);
    }
  };

  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaffId.trim()) return;

    // Force the system to think we are this user
    localStorage.setItem('takk_last_staff_id', targetStaffId);
    
    // Reload to trigger App.tsx to fetch the new identity
    window.location.reload();
  };

  // --- ADMIN POPUP RENDER ---
  if (showAdminPopup) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl">
        <div className="glass p-8 rounded-[32px] border border-[#d4af37]/30 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-4 rounded-full bg-[#d4af37]/10 text-[#d4af37] mb-4">
                <ShieldAlert size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Stjórnandagátt</h3>
            <p className="text-xs text-[#d4af37] font-bold uppercase tracking-widest mt-2">Veldu notanda til að skoða</p>
          </div>
          
          <form onSubmit={handleAdminOverride} className="space-y-4">
            <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    value={targetStaffId}
                    onChange={(e) => setTargetStaffId(e.target.value)}
                    placeholder="Staff ID (t.d. 123)"
                    className="w-full bg-black/40 border border-[#d4af37]/30 text-[#d4af37] placeholder:text-slate-600 font-black text-center text-xl rounded-2xl py-4 pl-10 outline-none focus:ring-2 focus:ring-[#d4af37]"
                    autoFocus
                />
            </div>
            <button type="submit" className="w-full py-4 bg-[#d4af37] hover:bg-[#b5952f] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
                Opna Aðgang
            </button>
            <button type="button" onClick={() => window.location.reload()} className="w-full py-3 text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors">
                Hætta við (Skrá út)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- STANDARD LOGIN RENDER ---
  return (
    <div className="min-h-screen bg-[#01040f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            {!logoError ? (
              <img 
                src={LOGO_URL} 
                alt="TAKK" 
                className="h-24 w-auto relative invert brightness-[2] drop-shadow-2xl"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-5xl font-black italic tracking-tighter text-white relative">TAKK</span>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">WageTrack Pro</h2>
            <p className="text-slate-400 font-medium text-sm mt-2">Skráðu þig inn með Microsoft aðgangi</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-[40px] border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="space-y-6">
            
            {/* Microsoft Login Button Only */}
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white p-5 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-white/10 group shadow-xl"
            >
              {loading ? (
                  <Loader2 className="animate-spin text-indigo-400" />
              ) : (
                  <Building2 className="w-5 h-5 text-[#00A4EF]" />
              )}
              <span>Innskráning með Microsoft</span>
            </button>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <div className="text-center">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Aðeins fyrir starfsmenn Takk ehf.
                </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
