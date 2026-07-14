import { Board, LevelData, Color } from '../types';
import { createBoard } from '../engine/Board';
import { isSolved } from '../engine/RuleEngine';
import { solve } from '../solver/AStar';
import { analyzeDifficulty } from '../solver/Difficulty';
import { SeededRNG } from '../utils/rng';

const COLOR_CODES: Color[] = [Color.Red, Color.Blue, Color.Green, Color.Yellow, Color.Purple, Color.Orange, Color.Cyan, Color.Pink];
let globalSeed = Date.now();
const DEFAULT_SEED = 42;

function createSolvedBoard(colors: number, capacity: number, emptyTubes: number): Board {
  const tubes: Color[][] = [];
  for (let c = 0; c < colors; c++) {
    const color = COLOR_CODES[c % COLOR_CODES.length];
    const tube: Color[] = [];
    for (let i = 0; i < capacity; i++) tube.push(color);
    tubes.push(tube);
  }
  for (let e = 0; e < emptyTubes; e++) tubes.push([]);
  return createBoard(tubes as any, capacity);
}

function reversePour(board: Board, rng: SeededRNG): Board | null {
  const capacity = board.capacity;
  const sources: number[] = [];
  for (let i = 0; i < board.tubes.length; i++) {
    if (board.tubes[i].length > 0) sources.push(i);
  }
  if (sources.length === 0) return null;

  const srcIdx = sources[rng.nextInt(0, sources.length - 1)];
  const source = board.tubes[srcIdx];
  const topColor = source[source.length - 1];
  let groupStart = source.length - 1;
  while (groupStart > 0 && source[groupStart - 1] === topColor) groupStart--;
  const groupSize = source.length - groupStart;
  const pourCount = rng.nextInt(1, Math.min(groupSize, capacity - 1));

  const dests: number[] = [];
  for (let i = 0; i < board.tubes.length; i++) {
    if (i === srcIdx) continue;
    if (board.tubes[i].length + pourCount > capacity) continue;
    if (board.tubes[i].length === 0) { dests.push(i); continue; }
    const otherTop = board.tubes[i][board.tubes[i].length - 1];
    if (otherTop !== topColor) dests.push(i);
  }

  const preferMatch = rng.next() < 0.3;
  const matchDests: number[] = [];
  if (preferMatch) {
    for (const d of dests) {
      if (board.tubes[d].length > 0 && board.tubes[d][board.tubes[d].length - 1] === topColor) {
        matchDests.push(d);
      }
    }
  }
  const candidates = matchDests.length > 0 ? matchDests : dests;
  if (candidates.length === 0) return null;

  const destIdx = candidates[rng.nextInt(0, candidates.length - 1)];

  const newTubes = board.tubes.map(t => [...t]);
  const moved: Color[] = [];
  for (let p = 0; p < pourCount; p++) moved.push(newTubes[srcIdx].pop()!);
  newTubes[destIdx].push(...moved);

  return createBoard(newTubes as any, board.capacity);
}

export function generateLevelSync(
  difficultyTarget?: number,
  colorCount?: number,
  seed?: number
): LevelData | null {
  const colors = colorCount || 5;
  const capacity = 4;
  const emptyTubes = 2;
  const targetDiff = difficultyTarget || 50;
  const rng = new SeededRNG(seed ?? ++globalSeed);

  for (let attempt = 0; attempt < 20; attempt++) {
    const solved = createSolvedBoard(colors, capacity, emptyTubes);
    let board = createBoard(solved.tubes.map(t => [...t]) as any, capacity);

    const iterations = 20 + Math.floor(targetDiff / 3) + rng.nextInt(0, 10);
    for (let i = 0; i < iterations; i++) {
      const next = reversePour(board, rng);
      if (next) board = next;
    }

    if (isSolved(board)) continue;

    const hasEmpty = board.tubes.some(t => t.length === 0);
    if (!hasEmpty) continue;

    const counts = new Map<string, number>();
    for (const tube of board.tubes) {
      for (const c of tube) {
        counts.set(c, (counts.get(c) || 0) + 1);
      }
    }
    if (counts.size !== colors) continue;
    let allValid = true;
    for (const [, count] of counts) {
      if (count !== capacity) { allValid = false; break; }
    }
    if (!allValid) continue;

    const solution = solve(board);
    if (!solution || solution.length === 0) continue;

    const diff = analyzeDifficulty(board, solution, solution.length);
    if (Math.abs(diff - targetDiff) > 35) continue;

    const id = nextLevelId();
    return {
      id, world: 1, level: id, colors,
      tubes: board.tubes.map(t => [...t]),
      capacity, difficulty: diff, shuffleMoves: iterations,
      optimalMoves: solution.length,
      board: board.tubes.map(t => t.map(c => c as string)),
      solution,
    };
  }

  const fallback = generateFallback(colors, capacity, emptyTubes, rng);
  if (fallback) return fallback;

  const solved = createSolvedBoard(colors, capacity, emptyTubes);
  const id = nextLevelId();
  return {
    id, world: 1, level: id, colors,
    tubes: solved.tubes.map(t => t.map(c => c as string)),
    capacity: 4, difficulty: 25, shuffleMoves: 0, optimalMoves: 0,
    board: solved.tubes.map(t => t.map(c => c as string)),
    solution: [],
  };
}

function generateFallback(
  colors: number, capacity: number, emptyTubes: number,
  rng: SeededRNG
): LevelData | null {
  const segments: Color[] = [];
  for (let c = 0; c < colors; c++) {
    const color = COLOR_CODES[c % COLOR_CODES.length];
    for (let i = 0; i < capacity; i++) segments.push(color);
  }
  const shuffled = rng.shuffle(segments);
  const tubes: Color[][] = [];
  for (let t = 0; t < colors; t++) {
    const tube: Color[] = [];
    for (let s = 0; s < capacity; s++) tube.push(shuffled[t * capacity + s]);
    tubes.push(tube);
  }
  for (let e = 0; e < emptyTubes; e++) tubes.push([]);

  const board = createBoard(tubes as any, capacity);
  if (isSolved(board)) return null;

  const solution = solve(board);
  if (!solution || solution.length === 0) return null;

  const diff = analyzeDifficulty(board, solution, solution.length);
  const id = nextLevelId();
  return {
    id, world: 1, level: id, colors,
    tubes: board.tubes.map(t => [...t]),
    capacity, difficulty: diff, shuffleMoves: 0,
    optimalMoves: solution.length,
    board: board.tubes.map(t => t.map(c => c as string)),
    solution,
  };
}

let levelIdCounter = 1;
function nextLevelId(): number {
  return levelIdCounter++;
}

export async function generateLevel(
  difficultyTarget?: number,
  colorCount?: number
): Promise<LevelData> {
  const result = generateLevelSync(difficultyTarget, colorCount);
  if (result) return result;

  const colors = colorCount || 5;
  const capacity = 4;
  const emptyTubes = 2;
  const solved = createSolvedBoard(colors, capacity, emptyTubes);
  const id = nextLevelId();
  return {
    id, world: 1, level: id, colors,
    tubes: solved.tubes.map(t => t.map(c => c as string)),
    capacity: 4, difficulty: 25, shuffleMoves: 0, optimalMoves: 0,
    board: solved.tubes.map(t => t.map(c => c as string)),
    solution: [],
  };
}
