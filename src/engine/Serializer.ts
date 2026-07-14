import { Board, SaveData } from '../types';

export function serializeBoard(board: Board): string[][] {
  return board.tubes.map(tube => tube.map(c => c.toString()));
}

export function deserializeBoard(tubesData: string[][], capacity: number): Board {
  return { tubes: tubesData.map(t => t.map(c => c as any)), capacity };
}

export function serializeSave(saveData: SaveData): string {
  return JSON.stringify(saveData);
}

export function deserializeSave(data: string): SaveData {
  return JSON.parse(data) as SaveData;
}
