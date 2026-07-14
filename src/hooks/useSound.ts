import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

export function useSound() {
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const musicEnabled = useGameStore((s) => s.settings.musicEnabled);

  const playTap = useCallback(() => {
    if (soundEnabled) {
      // TODO: implement with expo-av
    }
  }, [soundEnabled]);

  const playPour = useCallback(() => {
    if (soundEnabled) {
      // TODO: implement with expo-av
    }
  }, [soundEnabled]);

  const playInvalid = useCallback(() => {
    if (soundEnabled) {
      // TODO: implement with expo-av
    }
  }, [soundEnabled]);

  const playWin = useCallback(() => {
    if (soundEnabled) {
      // TODO: implement with expo-av
    }
  }, [soundEnabled]);

  const playMenuMusic = useCallback(() => {
    if (musicEnabled) {
      // TODO: implement with expo-av
    }
  }, [musicEnabled]);

  const playGameMusic = useCallback(() => {
    if (musicEnabled) {
      // TODO: implement with expo-av
    }
  }, [musicEnabled]);

  const stopMusic = useCallback(() => {
    // TODO: implement with expo-av
  }, []);

  return {
    playTap,
    playPour,
    playInvalid,
    playWin,
    playMenuMusic,
    playGameMusic,
    stopMusic,
  };
}
