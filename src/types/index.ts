export enum Color {
  Red = 'R',
  Blue = 'B',
  Green = 'G',
  Yellow = 'Y',
  Purple = 'P',
  Orange = 'O',
  Cyan = 'C',
  Pink = 'I',
}

export type Tube = Color[];

export interface Board {
  tubes: Tube[];
  capacity: number;
}

export interface Move {
  source: number;
  destination: number;
  amount: number;
}

export interface LevelData {
  id: number;
  world: number;
  level: number;
  colors: number;
  tubes: string[][];
  capacity: number;
  difficulty: number;
  shuffleMoves: number;
  optimalMoves: number;
  board: string[][];
  solution: Move[];
}

export type GamePhase =
  | 'Idle'
  | 'SelectingSource'
  | 'SelectingDestination'
  | 'Validating'
  | 'Animating'
  | 'Updating'
  | 'CheckWin'
  | 'Victory';

export interface SaveData {
  currentLevel: number;
  board: string[][];
  capacity: number;
  moveHistory: Move[];
  elapsedTime: number;
  hintsUsed: number;
}

export interface GameSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: ThemeName;
}

export type ThemeName = 'Classic' | 'Neon' | 'Dark' | 'Candy';
