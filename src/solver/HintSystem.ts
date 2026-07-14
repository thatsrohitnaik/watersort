import { Board, Move } from '../types';
import { solve } from './AStar';

const solutionCache = new Map<number, Move[]>();

export function getHint(board: Board, levelId: number): { source: number; destination: number } | null {
  if (!solutionCache.has(levelId)) {
    const solution = solve(board);
    if (!solution) return null;
    solutionCache.set(levelId, solution);
  }
  const solution = solutionCache.get(levelId)!;
  return { source: solution[0].source, destination: solution[0].destination };
}

export function getFullSolution(board: Board, levelId: number): Move[] | null {
  if (!solutionCache.has(levelId)) {
    const solution = solve(board);
    if (!solution) return null;
    solutionCache.set(levelId, solution);
  }
  return solutionCache.get(levelId) || null;
}

export function clearCache(): void {
  solutionCache.clear();
}
