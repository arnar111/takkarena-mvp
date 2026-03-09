import { useState, useEffect, useCallback, useRef } from 'react';

type SoundType = 'sale' | 'battle_invite' | 'streak' | 'challenge_complete' | 'coin';

interface UseSoundsReturn {
    playSound: (type: SoundType) => void;
    setVolume: (volume: number) => void;
    volume: number;
    isMuted: boolean;
    toggleMute: () => void;
}

const SOUND_URLS: Record<SoundType, string> = {
    sale: '/sounds/sale.mp3',
    battle_invite: '/sounds/battle_invite.mp3',
    streak: '/sounds/streak.mp3',
    challenge_complete: '/sounds/challenge_complete.mp3',
    coin: '/sounds/coin.mp3'
};

const VOLUME_KEY = 'takk_sound_volume';
const MUTED_KEY = 'takk_sound_muted';

/**
 * Hook for playing notification sounds with volume control
 */
export const useSounds = (): UseSoundsReturn => {
    const [volume, setVolumeState] = useState(() => {
        const stored = localStorage.getItem(VOLUME_KEY);
        return stored ? parseFloat(stored) : 0.5;
    });

    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem(MUTED_KEY) === 'true';
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Preload audio element
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
    }, []);

    const playSound = useCallback((type: SoundType) => {
        if (isMuted || !audioRef.current) return;

        try {
            const audio = audioRef.current;
            audio.src = SOUND_URLS[type];
            audio.volume = volume;
            audio.currentTime = 0;

            // Play with user interaction check
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    // Autoplay was prevented - this is normal before user interaction
                    console.log('Sound playback prevented:', err.message);
                });
            }
        } catch (err) {
            console.log('Error playing sound:', err);
        }
    }, [isMuted, volume]);

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        localStorage.setItem(VOLUME_KEY, clampedVolume.toString());
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            localStorage.setItem(MUTED_KEY, newMuted.toString());
            return newMuted;
        });
    }, []);

    return {
        playSound,
        setVolume,
        volume,
        isMuted,
        toggleMute
    };
};

export default useSounds;
