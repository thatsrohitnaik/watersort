import { Board, Move } from '../types';
import { PriorityQueue } from './PriorityQueue';
import { getValidMoves, applyMove, isSolved } from '../engine/RuleEngine';
import { canonicalKey } from './Serializer';
import { heuristic } from './Heuristics';

interface AStarState {
  board: Board;
  g: number;
  h: number;
  f: number;
  parent: AStarState | null;
  move: Move | null;
}

export function solve(board: Board): Move[] | null {
  const startH = heuristic(board);
  const start: AStarState = { board, g: 0, h: startH, f: startH, parent: null, move: null };
  const pq = new PriorityQueue<AStarState>((a, b) => a.f - b.f);
  pq.push(start);
  const visited = new Map<string, number>();
  visited.set(canonicalKey(board), 0);

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    if (isSolved(current.board)) return reconstructPath(current);

    const moves = getValidMoves(current.board);
    for (const move of moves) {
      const newBoard = applyMove(current.board, move);
      const key = canonicalKey(newBoard);
      const g = current.g + 1;
      if (visited.has(key) && visited.get(key)! <= g) continue;
      visited.set(key, g);
      const h = heuristic(newBoard);
      pq.push({ board: newBoard, g, h, f: g + h, parent: current, move });
    }
  }
  return null;
}

function reconstructPath(state: AStarState): Move[] {
  const moves: Move[] = [];
  let current: AStarState | null = state;
  while (current?.parent) {
    if (current.move) moves.unshift(current.move);
    current = current.parent;
  }
  return moves;
}
