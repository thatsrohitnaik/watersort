import { Board, Tube, Color } from '../types';

export function heuristic(board: Board): number {
  let score = 0;
  for (const tube of board.tubes) {
    if (tube.length === 0) continue;
    score += colorBreaks(tube) * 2;
  }
  score += fragmentedColors(board) * 3;
  score += lockedTubes(board) * 4;
  score += misplacedColors(board) * 1;
  return score;
}

function colorBreaks(tube: Tube): number {
  if (tube.length <= 1) return 0;
  let breaks = 0;
  for (let i = 1; i < tube.length; i++) {
    if (tube[i] !== tube[i - 1]) breaks++;
  }
  return breaks;
}

function fragmentedColors(board: Board): number {
  const colorCounts = new Map<string, number[]>();
  for (let t = 0; t < board.tubes.length; t++) {
    for (const c of board.tubes[t]) {
      if (!colorCounts.has(c)) colorCounts.set(c, []);
      colorCounts.get(c)!.push(t);
    }
  }
  let fragments = 0;
  for (const [, tubes] of colorCounts) {
    const uniqueTubes = new Set(tubes);
    fragments += uniqueTubes.size - 1;
  }
  return Math.max(0, fragments);
}

function lockedTubes(board: Board): number {
  let locked = 0;
  for (const tube of board.tubes) {
    if (tube.length === 0 || tube.length === board.capacity) continue;
    const top = tube[tube.length - 1];
    for (let i = tube.length - 2; i >= 0; i--) {
      if (tube[i] !== top) { locked++; break; }
    }
  }
  return locked;
}

function misplacedColors(board: Board): number {
  let misplaced = 0;
  for (const tube of board.tubes) {
    if (tube.length === 0) continue;
    const firstColor = tube[0];
    for (const c of tube) {
      if (c !== firstColor) misplaced++;
    }
  }
  return misplaced;
}
