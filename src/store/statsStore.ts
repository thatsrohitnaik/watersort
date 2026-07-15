import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerStats, calculateStars } from '../types';

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalMoves: 0,
  totalTime: 0,
  bestStreak: 0,
  currentStreak: 0,
  highestLevel: 0,
  bestStars: {},
};

interface StatsStore extends PlayerStats {
  loaded: boolean;
  recordWin: (levelId: number, movesUsed: number, optimalMoves: number, time: number) => void;
  recordLoss: () => void;
  loadStats: () => Promise<void>;
  saveStats: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  ...defaultStats,
  loaded: false,

  recordWin: (levelId, movesUsed, optimalMoves, time) => {
    const stars = calculateStars(movesUsed, optimalMoves);
    const prevBest = get().bestStars[levelId] || 0;
    set((s) => ({
      gamesPlayed: s.gamesPlayed + 1,
      gamesWon: s.gamesWon + 1,
      totalMoves: s.totalMoves + movesUsed,
      totalTime: s.totalTime + time,
      currentStreak: s.currentStreak + 1,
      bestStreak: Math.max(s.bestStreak, s.currentStreak + 1),
      highestLevel: Math.max(s.highestLevel, levelId),
      bestStars: { ...s.bestStars, [levelId]: Math.max(prevBest, stars) },
    }));
    get().saveStats();
  },

  recordLoss: () => {
    set((s) => ({
      gamesPlayed: s.gamesPlayed + 1,
      currentStreak: 0,
    }));
    get().saveStats();
  },

  loadStats: async () => {
    try {
      const data = await AsyncStorage.getItem('water_sort_stats');
      if (data) {
        const parsed = JSON.parse(data);
        set({ ...parsed, loaded: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ loaded: true });
  },

  saveStats: async () => {
    const { loaded, ...stats } = get();
    await AsyncStorage.setItem('water_sort_stats', JSON.stringify(stats));
  },
}));
