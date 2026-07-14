import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LevelData } from '../types';
import { generateLevel } from '../generator/Generator';

interface LevelStore {
  levels: LevelData[];
  unlockedLevel: number;
  worlds: number;

  addLevel: (level: LevelData) => void;
  setLevels: (levels: LevelData[]) => void;
  getLevel: (id: number) => LevelData | undefined;
  getLevelByIndex: (index: number) => LevelData | undefined;
  unlockNextLevel: () => void;
  isLevelUnlocked: (id: number) => boolean;
  ensureLevelExists: (levelNum: number) => Promise<LevelData>;
  generateNextLevel: () => Promise<LevelData>;
  generateLevels: (count: number) => Promise<void>;
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
}

export const useLevelStore = create<LevelStore>((set, get) => ({
  levels: [],
  unlockedLevel: 1,
  worlds: 1,

  addLevel: (level) => set((state) => ({ levels: [...state.levels, level] })),

  setLevels: (levels) => set({ levels }),

  getLevel: (id) => get().levels.find((l) => l.id === id),

  getLevelByIndex: (index) => get().levels[index],

  unlockNextLevel: () =>
    set((state) => ({
      unlockedLevel: Math.max(state.unlockedLevel, state.unlockedLevel + 1),
    })),

  isLevelUnlocked: (id) => id <= get().unlockedLevel,

  ensureLevelExists: async (levelNum: number) => {
    const existing = get().levels.find((l) => l.id === levelNum);
    if (existing) return existing;
    const level = await generateLevel();
    level.id = levelNum;
    level.level = levelNum;
    set((state) => {
      const updated = [...state.levels];
      const idx = updated.findIndex((l) => l.id === levelNum);
      if (idx >= 0) return { levels: updated };
      updated.push(level);
      return { levels: updated };
    });
    return level;
  },

  generateNextLevel: async () => {
    const level = await generateLevel();
    set((state) => ({ levels: [...state.levels, level] }));
    return level;
  },

  generateLevels: async (count: number) => {
    const existing = get().levels.length;
    const needed = count - existing;
    if (needed <= 0) return;
    const newLevels: LevelData[] = [];
    for (let i = 0; i < needed; i++) {
      const level = await generateLevel();
      newLevels.push(level);
    }
    set((state) => ({ levels: [...state.levels, ...newLevels] }));
  },

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem('water_sort_progress');
      if (data) {
        const { unlockedLevel, worlds, levels } = JSON.parse(data);
        set({
          unlockedLevel: unlockedLevel || 1,
          worlds: worlds || 1,
          levels: levels || [],
        });
      }
    } catch {
      // ignore
    }
  },

  saveProgress: async () => {
    const { unlockedLevel, worlds, levels } = get();
    await AsyncStorage.setItem(
      'water_sort_progress',
      JSON.stringify({ unlockedLevel, worlds, levels })
    );
  },
}));
