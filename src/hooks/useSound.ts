import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useGameStore } from '../store/gameStore';

export function useSound() {
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);

  const tapPlayer = useAudioPlayer(require('../../assets/sounds/tap.wav'));
  const pourPlayer = useAudioPlayer(require('../../assets/sounds/pour.wav'));
  const winPlayer = useAudioPlayer(require('../../assets/sounds/win.wav'));
  const invalidPlayer = useAudioPlayer(require('../../assets/sounds/invalid.wav'));

  const playTap = useCallback(() => {
    if (soundEnabled) {
      tapPlayer.seekTo(0);
      tapPlayer.play();
    }
  }, [soundEnabled, tapPlayer]);

  const playPour = useCallback(() => {
    if (soundEnabled) {
      pourPlayer.seekTo(0);
      pourPlayer.play();
    }
  }, [soundEnabled, pourPlayer]);

  const playInvalid = useCallback(() => {
    if (soundEnabled) {
      invalidPlayer.seekTo(0);
      invalidPlayer.play();
    }
  }, [soundEnabled, invalidPlayer]);

  const playWin = useCallback(() => {
    if (soundEnabled) {
      winPlayer.seekTo(0);
      winPlayer.play();
    }
  }, [soundEnabled, winPlayer]);

  const playMenuMusic = useCallback(() => {}, []);
  const playGameMusic = useCallback(() => {}, []);
  const stopMusic = useCallback(() => {}, []);

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
