import { useCallback } from 'react';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useGameStore } from '../store/gameStore';

export function useHaptics() {
  const hapticsEnabled = useGameStore((s) => s.settings.hapticsEnabled);

  const light = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  const medium = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Medium);
    }
  }, [hapticsEnabled]);

  const heavy = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Heavy);
    }
  }, [hapticsEnabled]);

  return { light, medium, heavy };
}
