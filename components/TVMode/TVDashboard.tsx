import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, Maximize2, Minimize2, Settings, Play, Pause, 
  Trophy, Swords, BarChart3, Sparkles, Clock, QrCode,
  Lock, Unlock, ChevronLeft, ChevronRight
} from 'lucide-react';
import useTVMode, { TVView } from '../../hooks/useTVMode';
import TVLeaderboard from './TVLeaderboard';
import TVBattles from './TVBattles';
import TVStats from './TVStats';
import TVCelebration from './TVCelebration';

interface TVDashboardProps {
  users: any[];
  sales: any[];
  battles: any[];
  onClose: () => void;
}

const TVDashboard: React.FC<TVDashboardProps> = ({ users, sales, battles, onClose }) => {
  const {
    config,
    currentView,
    currentCelebration,
    showingCelebration,
    isPaused,
    setIsPaused,
    enterFullscreen,
    exitFullscreen,
    setView,
    setRotationInterval,
    toggleKioskMode,
  } = useTVMode();

  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [exitPassword, setExitPassword] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide controls after 5 seconds of no mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 5000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 5000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const handleExit = async () => {
    if (config.kioskMode) {
      setShowExitDialog(true);
    } else {
      await exitFullscreen();
      onClose();
    }
  };

  const handleExitConfirm = async () => {
    const success = await exitFullscreen(exitPassword);
    if (success) {
      onClose();
    } else {
      setExitPassword('');
    }
  };

  const viewIcons: Record<TVView, React.ReactNode> = {
    leaderboard: <Trophy className="w-5 h-5" />,
    battles: <Swords className="w-5 h-5" />,
    stats: <BarChart3 className="w-5 h-5" />,
    achievements: <Sparkles className="w-5 h-5" />,
    celebrations: <Sparkles className="w-5 h-5" />,
  };

  const viewLabels: Record<TVView, string> = {
    leaderboard: 'Stigatafla',
    battles: 'Bardagar',
    stats: 'Tölfræði',
    achievements: 'Afrek',
    celebrations: 'Fagnaður',
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-purple-950/30" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-40"
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-8 h-8 text-indigo-400" />
                  <span className="text-2xl font-bold text-white">TakkArena</span>
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    TV MODE
                  </span>
                </div>
              </div>

              {/* Clock */}
              {config.showClock && (
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-mono font-semibold">
                    {currentTime.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isPaused ? 'Halda áfram' : 'Gera hlé'}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Stillingar"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <button
                  onClick={() => config.isFullscreen ? handleExit() : enterFullscreen()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={config.isFullscreen ? 'Hætta fullskjá' : 'Fullskjár'}
                >
                  {config.isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleExit}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
                >
                  Hætta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Navigation Dots */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-0 right-0 flex justify-center z-40"
          >
            <div className="flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
              <button
                onClick={() => setView(config.views[(config.currentViewIndex - 1 + config.views.length) % config.views.length])}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {config.views.map((view, index) => (
                <button
                  key={view}
                  onClick={() => setView(view)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    index === config.currentViewIndex
                      ? 'bg-indigo-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {viewIcons[view]}
                  <span className="text-sm font-medium">{viewLabels[view]}</span>
                </button>
              ))}

              <button
                onClick={() => setView(config.views[(config.currentViewIndex + 1) % config.views.length])}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative h-full pt-20 pb-20 px-8">
        <AnimatePresence mode="wait">
          {showingCelebration && currentCelebration ? (
            <TVCelebration celebration={currentCelebration} />
          ) : (
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full"
            >
              {currentView === 'leaderboard' && (
                <TVLeaderboard users={users} sales={sales} />
              )}
              {currentView === 'battles' && (
                <TVBattles battles={battles} users={users} />
              )}
              {currentView === 'stats' && (
                <TVStats users={users} sales={sales} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 w-80 bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl z-50"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">TV Stillingar</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Snúningstími (sekúndur)
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={config.rotationInterval}
                  onChange={(e) => setRotationInterval(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-white">{config.rotationInterval}s</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Kiosk Mode</span>
                <button
                  onClick={() => toggleKioskMode(!config.kioskMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    config.kioskMode 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {config.kioskMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <QrCode className="w-4 h-4" />
                  <span>QR tengill (bráðum)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Dialog for Kiosk Mode */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-zinc-900 rounded-xl p-6 w-80 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Slá inn lykilorð</h3>
              <input
                type="password"
                value={exitPassword}
                onChange={(e) => setExitPassword(e.target.value)}
                placeholder="Lykilorð..."
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                >
                  Hætta við
                </button>
                <button
                  onClick={handleExitConfirm}
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Staðfesta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TVDashboard;
