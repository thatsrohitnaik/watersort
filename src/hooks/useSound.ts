import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

let tapSound: Audio.Sound | null = null;
let pourSound: Audio.Sound | null = null;
let winSound: Audio.Sound | null = null;
let invalidSound: Audio.Sound | null = null;
let loadAttempted = false;

async function ensureLoaded() {
  if (loadAttempted) return;
  loadAttempted = true;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    tapSound = (await Audio.Sound.createAsync(require('../../assets/sounds/tap.wav'))).sound;
    pourSound = (await Audio.Sound.createAsync(require('../../assets/sounds/pour.wav'))).sound;
    winSound = (await Audio.Sound.createAsync(require('../../assets/sounds/win.wav'))).sound;
    invalidSound = (await Audio.Sound.createAsync(require('../../assets/sounds/invalid.wav'))).sound;
  } catch {
    // Sound loading failed, playback will be silently skipped
  }
}

async function playSound(sound: Audio.Sound | null) {
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Silently skip playback errors
  }
}

export function useSound() {
  const soundEnabled = useGameStore((s) => s.settings.soundEnabled);
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      ensureLoaded();
    }
  }, []);

  const playTap = useCallback(() => {
    if (soundEnabled) playSound(tapSound);
  }, [soundEnabled]);

  const playPour = useCallback(() => {
    if (soundEnabled) playSound(pourSound);
  }, [soundEnabled]);

  const playInvalid = useCallback(() => {
    if (soundEnabled) playSound(invalidSound);
  }, [soundEnabled]);

  const playWin = useCallback(() => {
    if (soundEnabled) {
      ensureLoaded();
      playSound(winSound);
    }
  }, [soundEnabled]);

  const playMenuMusic = useCallback(() => {
    // Background music - future enhancement
  }, []);

  const playGameMusic = useCallback(() => {
    // Background music - future enhancement
  }, []);

  const stopMusic = useCallback(() => {
    // Background music - future enhancement
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
