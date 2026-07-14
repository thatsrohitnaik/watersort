import { Board, Move } from '../types';
import { getValidMoves } from '../engine/RuleEngine';

function countColorBreaks(board: Board): number {
  let breaks = 0;
  for (const tube of board.tubes) {
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== tube[i - 1]) breaks++;
    }
  }
  return breaks;
}

function branchingFactor(board: Board): number {
  return getValidMoves(board).length;
}

function trapScore(board: Board): number {
  let traps = 0;
  for (const tube of board.tubes) {
    if (tube.length < 2) continue;
    const topColor = tube[tube.length - 1];
    for (let i = tube.length - 2; i >= 0; i--) {
      if (tube[i] !== topColor) {
        traps++;
        break;
      }
    }
  }
  return traps;
}

export function analyzeDifficulty(
  board: Board,
  solution: Move[],
  statesVisited: number
): number {
  const solutionLen = solution.length;
  const colorBreaks = countColorBreaks(board);
  const branching = branchingFactor(board);
  const traps = trapScore(board);

  const sLen = Math.min(solutionLen / 30, 1) * 35;
  const sVisited = Math.min(statesVisited / 1000, 1) * 20;
  const sBreaks = Math.min(colorBreaks / 16, 1) * 15;
  const sBranch = Math.min(branching / 20, 1) * 15;
  const sTraps = Math.min(traps / 6, 1) * 15;

  const total = sLen + sVisited + sBreaks + sBranch + sTraps;
  return Math.round(Math.min(total, 100));
}
