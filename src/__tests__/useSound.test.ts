import { useGameStore } from '../store/gameStore';

beforeEach(() => {
  useGameStore.setState(useGameStore.getInitialState());
});

it('sound is respected by store toggle', () => {
  const getSound = () => useGameStore.getState().settings.soundEnabled;
  expect(getSound()).toBe(true);
  useGameStore.getState().setSettings({ soundEnabled: false });
  expect(getSound()).toBe(false);
});

