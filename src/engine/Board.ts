import { Board, Color, Tube } from '../types';

export function createBoard(tubes: Color[][], capacity: number = 4): Board {
  const tubeArray: Tube[] = tubes.map(tube => [...tube]);
  return { tubes: tubeArray, capacity };
}

export function cloneBoard(board: Board): Board {
  return {
    tubes: board.tubes.map(tube => [...tube]),
    capacity: board.capacity,
  };
}

export function createEmptyBoard(numTubes: number, capacity: number = 4): Board {
  const tubes: Tube[] = [];
  for (let i = 0; i < numTubes; i++) {
    tubes.push([]);
  }
  return { tubes, capacity };
}
