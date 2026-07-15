import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createRef, RefObject } from 'react';
import { Board, Color, GamePhase, GameSettings, LevelData, Move, SaveData } from '../types';
import { isMoveValid, isSolved, applyMove } from '../engine/RuleEngine';
import { pushState, undo as undoEngine, redo as redoEngine, clearRedo } from '../engine/UndoRedo';
import { serializeBoard, deserializeBoard, serializeSave, deserializeSave } from '../engine/Serializer';
import { createBoard, cloneBoard } from '../engine/Board';
import * as TubeEngine from '../engine/TubeEngine';

interface GameStore {
  board: Board | null;
  initialBoard: Board | null;
  moveHistory: Move[];
  selectedTube: number | null;
  level: number;
  optimalMoves: number;
  moves: number;
  timer: number;
  settings: GameSettings;
  gamePhase: GamePhase;
  hintsUsed: number;
  isPaused: boolean;
  isVictory: boolean;
  tubeRefs: RefObject<any>[];

  setBoard: (board: Board) => void;
  initLevel: (levelData: LevelData) => void;
  selectTube: (index: number) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  restart: () => void;
  startTimer: () => void;
  tickTimer: () => void;
  setSettings: (settings: Partial<GameSettings>) => void;
  setGamePhase: (phase: GamePhase) => void;
  setPaused: (paused: boolean) => void;
  setVictory: (victory: boolean) => void;
  incrementHints: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
}

const defaultSettings: GameSettings = {
  hapticsEnabled: true,
  soundEnabled: true,
  musicEnabled: true,
  theme: 'Classic',
};

export const useGameStore = create<GameStore>((set, get) => ({
  board: null,
  initialBoard: null,
  moveHistory: [],
  selectedTube: null,
  level: 1,
  optimalMoves: 0,
  moves: 0,
  timer: -1,
  settings: defaultSettings,
  gamePhase: 'Idle',
  hintsUsed: 0,
  isPaused: false,
  isVictory: false,
  tubeRefs: [],

  setBoard: (board) => set({ board }),

  initLevel: (levelData) => {
    const board: Board = {
      tubes: levelData.board.map(tube => tube.map(c => c as Color)),
      capacity: levelData.capacity,
    };
    clearRedo();
    set({
      board,
      initialBoard: cloneBoard(board),
      moveHistory: [],
      selectedTube: null,
      level: levelData.id,
      optimalMoves: levelData.optimalMoves,
      moves: 0,
      timer: -1,
      hintsUsed: 0,
      gamePhase: 'Idle',
      isPaused: false,
      isVictory: false,
      tubeRefs: board.tubes.map(() => createRef<any>()),
    });
  },

  selectTube: (index) => {
    const state = get();
    const tube = state.board?.tubes[index];
    if (!tube || !state.board) return;

    if (state.selectedTube === null) {
      if (TubeEngine.isEmpty(tube)) return;
      set({ selectedTube: index, gamePhase: 'SelectingSource' });
      return;
    }

    if (state.selectedTube === index) {
      set({ selectedTube: null, gamePhase: 'Idle' });
      return;
    }

    const source = state.selectedTube;
    const dest = index;
    const amount = TubeEngine.countTopGroup(state.board.tubes[source]);

    const move: Move = { source, destination: dest, amount };

    if (isMoveValid(state.board, move)) {
      set({ gamePhase: 'Animating', selectedTube: null });
      pushState(cloneBoard(state.board));
      const newBoard = applyMove(state.board, move);
      const won = isSolved(newBoard);
      set({
        board: newBoard,
        moveHistory: [...state.moveHistory, move],
        moves: state.moves + 1,
        gamePhase: won ? 'Victory' : 'Idle',
        isVictory: won,
      });
    } else {
      set({ selectedTube: null, gamePhase: 'Idle' });
    }
  },

  makeMove: (move) => {
    const state = get();
    if (!state.board) return;
    pushState(cloneBoard(state.board));
    const newBoard = applyMove(state.board, move);
    const won = isSolved(newBoard);
    set({
      board: newBoard,
      moveHistory: [...state.moveHistory, move],
      moves: state.moves + 1,
      selectedTube: null,
      gamePhase: won ? 'Victory' : 'Idle',
      isVictory: won,
    });
  },

  undo: () => {
    const prev = undoEngine();
    if (!prev) return;
    const state = get();
    set({
      board: prev,
      moveHistory: state.moveHistory.slice(0, -1),
      selectedTube: null,
      gamePhase: 'Idle',
    });
  },

  redo: () => {
    const next = redoEngine();
    if (!next) return;
    set({
      board: next,
      selectedTube: null,
      gamePhase: 'Idle',
    });
  },

  restart: () => {
    const state = get();
    if (!state.initialBoard) return;
    clearRedo();
    set({
      board: cloneBoard(state.initialBoard),
      moveHistory: [],
      selectedTube: null,
      moves: 0,
      timer: -1,
      hintsUsed: 0,
      gamePhase: 'Idle',
      isPaused: false,
      isVictory: false,
    });
  },

  startTimer: () => set({ timer: 0 }),

  tickTimer: () => set((state) => ({ timer: state.timer + 1 })),

  setSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  setGamePhase: (gamePhase) => set({ gamePhase }),

  setPaused: (isPaused) => set({ isPaused }),

  setVictory: (isVictory) => set({ isVictory }),

  incrementHints: () =>
    set((state) => ({ hintsUsed: state.hintsUsed + 1 })),

  saveGame: async () => {
    const state = get();
    if (!state.board) return;
    const saveData: SaveData = {
      currentLevel: state.level,
      board: serializeBoard(state.board),
      capacity: state.board.capacity,
      moveHistory: state.moveHistory,
      elapsedTime: state.timer,
      hintsUsed: state.hintsUsed,
    };
    await AsyncStorage.setItem('water_sort_save', serializeSave(saveData));
  },

  loadGame: async () => {
    const saved = await AsyncStorage.getItem('water_sort_save');
    if (!saved) return false;
    const saveData = deserializeSave(saved);
    const board = deserializeBoard(saveData.board, saveData.capacity);
    set({
      board,
      level: saveData.currentLevel,
      moveHistory: saveData.moveHistory,
      timer: saveData.elapsedTime,
      hintsUsed: saveData.hintsUsed,
      gamePhase: 'Idle',
      isVictory: false,
      selectedTube: null,
    });
    return true;
  },
}));
