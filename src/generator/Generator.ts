import { Board, LevelData, Move } from '../types';
import { createBoard } from '../engine/Board';
import { getValidMoves, applyMove, isSolved } from '../engine/RuleEngine';
import { solve } from '../solver/AStar';

let levelIdCounter = 1;

const COLOR_CODES = ['R', 'B', 'G', 'Y', 'P', 'O', 'C', 'I'];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateMixedBoard(colors: number, capacity: number, emptyTubes: number): Board {
  const segments: string[] = [];
  for (let c = 0; c < colors; c++) {
    const color = COLOR_CODES[c % COLOR_CODES.length];
    for (let i = 0; i < capacity; i++) segments.push(color);
  }

  const shuffled = shuffleArray(segments);
  const tubes: string[][] = [];
  for (let t = 0; t < colors; t++) {
    const tube: string[] = [];
    for (let s = 0; s < capacity; s++) {
      tube.push(shuffled[t * capacity + s]);
    }
    tubes.push(tube);
  }
  for (let e = 0; e < emptyTubes; e++) tubes.push([]);

  return createBoard(tubes as any, capacity);
}

export async function generateLevel(
  difficultyTarget?: number,
  colorCount?: number
): Promise<LevelData> {
  const colors = colorCount || 5;
  const capacity = 4;
  const emptyTubes = 2;
  const targetDiff = difficultyTarget || 50;

  for (let attempt = 0; attempt < 30; attempt++) {
    const board = generateMixedBoard(colors, capacity, emptyTubes);

    if (isSolved(board)) continue;

    const solution = solve(board);
    if (!solution || solution.length === 0) continue;

    const diff = Math.min(
      Math.round(solution.length * 2 + getValidMoves(board).length * 2),
      100
    );
    if (Math.abs(diff - targetDiff) > 35) continue;

    const id = levelIdCounter++;
    return {
      id,
      world: 1,
      level: id,
      colors,
      tubes: board.tubes.map(t => [...t]),
      capacity,
      difficulty: diff,
      shuffleMoves: 0,
      optimalMoves: solution.length,
      board: board.tubes.map(t => t.map(c => c as string)),
      solution,
    };
  }

  const id = levelIdCounter++;
  const fallback = generateMixedBoard(colors, capacity, emptyTubes);
  const fallbackSolution = solve(fallback);
  return {
    id, world: 1, level: id, colors,
    tubes: fallback.tubes.map(t => t.map(c => c as string)),
    capacity: 4, difficulty: 30,
    shuffleMoves: 0,
    optimalMoves: fallbackSolution ? fallbackSolution.length : 0,
    board: fallback.tubes.map(t => t.map(c => c as string)),
    solution: fallbackSolution || [],
  };
}
