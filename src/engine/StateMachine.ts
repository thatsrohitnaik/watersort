import { GamePhase } from '../types';

const transitions: Record<GamePhase, Record<string, GamePhase>> = {
  Idle: { select: 'SelectingSource' },
  SelectingSource: { select: 'SelectingDestination' },
  SelectingDestination: { validate: 'Validating' },
  Validating: { animate: 'Animating' },
  Animating: { update: 'Updating' },
  Updating: { check: 'CheckWin' },
  CheckWin: { win: 'Victory', continue: 'Idle' },
  Victory: { continue: 'Idle' },
};

export function transition(current: GamePhase, action: string): GamePhase {
  const phaseTransitions = transitions[current];
  if (!phaseTransitions) return current;
  return phaseTransitions[action] ?? current;
}
