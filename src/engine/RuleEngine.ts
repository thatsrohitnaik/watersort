import { Board, Tube, Color, Move } from '../types';
import { topColor, countTopGroup, canReceive, popGroup, pushGroup, isEmpty } from './TubeEngine';

export function isMoveValid(board: Board, source: number, dest: number): boolean;
export function isMoveValid(board: Board, move: Move): boolean;
export function isMoveValid(board: Board, arg2: number | Move, arg3?: number): boolean {
  let source: number;
  let dest: number;
  if (typeof arg2 === 'number') {
    source = arg2;
    dest = arg3!;
  } else {
    source = arg2.source;
    dest = arg2.destination;
  }
  if (source === dest) return false;
  const sourceTube = board.tubes[source];
  const destTube = board.tubes[dest];
  if (!sourceTube || !destTube) return false;
  if (isEmpty(sourceTube)) return false;
  const color = topColor(sourceTube);
  if (color === undefined) return false;
  if (!canReceive(destTube, color, board.capacity)) return false;
  return true;
}

export function getValidMoves(board: Board): Move[] {
  const moves: Move[] = [];
  for (let s = 0; s < board.tubes.length; s++) {
    if (isEmpty(board.tubes[s])) continue;
    const color = topColor(board.tubes[s]);
    if (color === undefined) continue;
    const amount = countTopGroup(board.tubes[s]);
    for (let d = 0; d < board.tubes.length; d++) {
      if (s === d) continue;
      if (canReceive(board.tubes[d], color, board.capacity)) {
        moves.push({ source: s, destination: d, amount });
      }
    }
  }
  return moves;
}

export function isSolved(board: Board): boolean {
  for (const tube of board.tubes) {
    if (isEmpty(tube)) continue;
    if (tube.length !== board.capacity) return false;
    const color = tube[0];
    for (const c of tube) {
      if (c !== color) return false;
    }
  }
  return true;
}

export function applyMove(board: Board, move: Move): Board {
  const newTubes = board.tubes.map(t => [...t]);
  const { tube: poppedTube, color, count } = popGroup(newTubes[move.source]);
  newTubes[move.source] = poppedTube;
  const amount = move.amount > 0 ? Math.min(move.amount, count) : count;
  newTubes[move.destination] = pushGroup(newTubes[move.destination], color, amount, board.capacity);
  return { tubes: newTubes, capacity: board.capacity };
}
