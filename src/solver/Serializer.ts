import { Board } from '../types';

export function canonicalKey(board: Board): string {
  const nonEmpty = board.tubes
    .filter(t => t.length > 0)
    .map(t => t.join(''));

  nonEmpty.sort();

  const emptyCount = board.tubes.filter(t => t.length === 0).length;
  return nonEmpty.join('|') + (emptyCount > 0 ? `|_${emptyCount}` : '');
}
