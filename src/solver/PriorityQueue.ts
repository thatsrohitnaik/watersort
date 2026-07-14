export class PriorityQueue<T> {
  private items: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    if (this.items.length === 1) return this.items.pop();
    const top = this.items[0];
    this.items[0] = this.items.pop()!;
    this.sinkDown(0);
    return top;
  }

  peek(): T | undefined { return this.items[0]; }
  size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.comparator(this.items[idx], this.items[parent]) >= 0) break;
      [this.items[idx], this.items[parent]] = [this.items[parent], this.items[idx]];
      idx = parent;
    }
  }

  private sinkDown(idx: number): void {
    const length = this.items.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < length && this.comparator(this.items[left], this.items[smallest]) < 0) smallest = left;
      if (right < length && this.comparator(this.items[right], this.items[smallest]) < 0) smallest = right;
      if (smallest === idx) break;
      [this.items[idx], this.items[smallest]] = [this.items[smallest], this.items[idx]];
      idx = smallest;
    }
  }
}
