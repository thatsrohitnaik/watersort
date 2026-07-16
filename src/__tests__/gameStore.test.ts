import { useGameStore } from '../store/gameStore';

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState());
});

it('soundEnabled defaults to true', () => {
  expect(useGameStore.getState().settings.soundEnabled).toBe(true);
});

it('setSettings toggles soundEnabled to false', () => {
  useGameStore.getState().setSettings({ soundEnabled: false });
  expect(useGameStore.getState().settings.soundEnabled).toBe(false);
});

it('setSettings toggles soundEnabled back to true', () => {
  useGameStore.getState().setSettings({ soundEnabled: false });
  useGameStore.getState().setSettings({ soundEnabled: true });
  expect(useGameStore.getState().settings.soundEnabled).toBe(true);
});

it('setSettings does not affect other settings', () => {
  useGameStore.getState().setSettings({ soundEnabled: false });
  const settings = useGameStore.getState().settings;
  expect(settings.musicEnabled).toBe(true);
  expect(settings.hapticsEnabled).toBe(true);
  expect(settings.theme).toBe('Classic');
});
