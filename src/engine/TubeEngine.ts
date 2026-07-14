import { Tube, Color } from '../types';

export function topColor(tube: Tube): Color | undefined {
  if (tube.length === 0) return undefined;
  return tube[tube.length - 1];
}

export function countTopGroup(tube: Tube): number {
  if (tube.length === 0) return 0;
  const top = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] !== top) break;
    count++;
  }
  return count;
}

export function emptySlots(tube: Tube, capacity: number): number {
  return Math.max(0, capacity - tube.length);
}

export function isFull(tube: Tube, capacity: number): boolean {
  return tube.length >= capacity;
}

export function isEmpty(tube: Tube): boolean {
  return tube.length === 0;
}

export function canReceive(tube: Tube, color: Color, capacity: number): boolean {
  if (isFull(tube, capacity)) return false;
  if (isEmpty(tube)) return true;
  return topColor(tube) === color;
}

export function pushGroup(tube: Tube, color: Color, count: number, capacity: number): Tube {
  const slots = emptySlots(tube, capacity);
  const actualCount = Math.min(count, slots);
  const newTube = [...tube];
  for (let i = 0; i < actualCount; i++) {
    newTube.push(color);
  }
  return newTube;
}

export function popGroup(tube: Tube): { tube: Tube; color: Color; count: number } {
  const color = topColor(tube);
  if (color === undefined) return { tube: [...tube], color: undefined as unknown as Color, count: 0 };
  const count = countTopGroup(tube);
  const newTube = tube.slice(0, tube.length - count);
  return { tube: newTube, color, count };
}
