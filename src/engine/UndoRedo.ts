import { Board } from '../types';
import { cloneBoard } from './Board';

class UndoRedoManager {
  private history: Board[] = [];
  private future: Board[] = [];

  pushState(board: Board): void {
    this.history.push(cloneBoard(board));
    this.future = [];
  }

  undo(): Board | null {
    if (this.history.length <= 1) return null;
    const current = this.history.pop()!;
    this.future.push(current);
    return this.history[this.history.length - 1];
  }

  redo(): Board | null {
    if (this.future.length === 0) return null;
    const next = this.future.pop()!;
    this.history.push(next);
    return next;
  }

  clearRedo(): void {
    this.future = [];
  }

  getHistoryLength(): number {
    return this.history.length;
  }
}

const undoRedoManager = new UndoRedoManager();

export function pushState(board: Board): void { undoRedoManager.pushState(board); }
export function undo(): Board | null { return undoRedoManager.undo(); }
export function redo(): Board | null { return undoRedoManager.redo(); }
export function clearRedo(): void { undoRedoManager.clearRedo(); }
export function getHistoryLength(): number { return undoRedoManager.getHistoryLength(); }
