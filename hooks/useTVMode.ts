import { useState, useEffect, useCallback } from 'react';

export interface TVModeConfig {
  rotationInterval: number; // seconds between view changes
  views: TVView[];
  currentViewIndex: number;
  isFullscreen: boolean;
  showClock: boolean;
  celebrationQueue: TVCelebration[];
  kioskMode: boolean; // requires password to exit
}

export type TVView = 'leaderboard' | 'battles' | 'achievements' | 'stats' | 'celebrations';

export interface TVCelebration {
  id: string;
  type: 'sale' | 'goal' | 'battle_win' | 'achievement' | 'streak' | 'personal_best';
  userId: string;
  userName: string;
  message: string;
  amount?: number;
  timestamp: string;
  displayed: boolean;
}

const DEFAULT_CONFIG: TVModeConfig = {
  rotationInterval: 15, // 15 seconds per view
  views: ['leaderboard', 'battles', 'stats'],
  currentViewIndex: 0,
  isFullscreen: false,
  showClock: true,
  celebrationQueue: [],
  kioskMode: false,
};

export function useTVMode() {
  const [config, setConfig] = useState<TVModeConfig>(DEFAULT_CONFIG);
  const [isPaused, setIsPaused] = useState(false);
  const [showingCelebration, setShowingCelebration] = useState(false);

  // Auto-rotate views
  useEffect(() => {
    if (isPaused || showingCelebration || config.views.length <= 1) return;

    const interval = setInterval(() => {
      setConfig(prev => ({
        ...prev,
        currentViewIndex: (prev.currentViewIndex + 1) % prev.views.length
      }));
    }, config.rotationInterval * 1000);

    return () => clearInterval(interval);
  }, [config.rotationInterval, config.views.length, isPaused, showingCelebration]);

  // Handle celebration queue
  useEffect(() => {
    const unshownCelebration = config.celebrationQueue.find(c => !c.displayed);
    if (unshownCelebration && !showingCelebration) {
      setShowingCelebration(true);
      
      // Auto-dismiss celebration after 5 seconds
      const timerId = setTimeout(() => {
        setConfig(prev => ({
          ...prev,
          celebrationQueue: prev.celebrationQueue.map(c =>
            c.id === unshownCelebration.id ? { ...c, displayed: true } : c
          )
        }));
        setShowingCelebration(false);
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [config.celebrationQueue, showingCelebration]);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setConfig(prev => ({ ...prev, isFullscreen: true }));
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async (password?: string) => {
    const kioskPassword = import.meta.env.VITE_KIOSK_PASSWORD || 'takk2026';
    if (config.kioskMode && password !== kioskPassword) {
      return false;
    }
    
    try {
      await document.exitFullscreen();
      setConfig(prev => ({ ...prev, isFullscreen: false }));
      return true;
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
      return false;
    }
  }, [config.kioskMode]);

  const addCelebration = useCallback((celebration: Omit<TVCelebration, 'id' | 'displayed' | 'timestamp'>) => {
    const newCelebration: TVCelebration = {
      ...celebration,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      displayed: false,
    };
    
    setConfig(prev => ({
      ...prev,
      celebrationQueue: [...prev.celebrationQueue, newCelebration]
    }));
  }, []);

  const setView = useCallback((view: TVView) => {
    const index = config.views.indexOf(view);
    if (index !== -1) {
      setConfig(prev => ({ ...prev, currentViewIndex: index }));
    }
  }, [config.views]);

  const setRotationInterval = useCallback((seconds: number) => {
    setConfig(prev => ({ ...prev, rotationInterval: Math.max(5, seconds) }));
  }, []);

  const toggleKioskMode = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, kioskMode: enabled }));
  }, []);

  const currentView = config.views[config.currentViewIndex];
  const currentCelebration = config.celebrationQueue.find(c => !c.displayed);

  return {
    config,
    currentView,
    currentCelebration,
    showingCelebration,
    isPaused,
    setIsPaused,
    enterFullscreen,
    exitFullscreen,
    addCelebration,
    setView,
    setRotationInterval,
    toggleKioskMode,
  };
}

export default useTVMode;
