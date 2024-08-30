type EachContext<T> = {
  prevIndex: number | undefined;
  nextIndex: number | undefined;
  prev: T | undefined;
  next: T | undefined;
  breakFn: () => void;
  continueFn: () => void;
  list: List<T>;
  isFirst: boolean;
  isLast: boolean;
};

type EachCallback<T, R> = (value: T, index: number, context: EachContext<T>) => R;

type EachOptions = {
  reverse?: boolean;
  step?: number;
};

type SortDirection = 'asc' | 'desc';
type SortMethod = 'merge' | 'quick' | 'bubble' | 'insertion' | 'selection' | 'heap' | 'radix';

class List<T> {
  private items: T[];

  public static create<T>(initialItems?: T[] | Set<T>): List<T>;
  public static create<T>(...initialItems: T[]): List<T>;
  public static create<T>(...initialItems: T[] | [T[] | Set<T>] | []): List<T> {
    if (initialItems.length === 1) {
      const firstArg = initialItems[0];
      
      if (Array.isArray(firstArg)) {
        return new List([...firstArg]);
      }

      if (firstArg instanceof Set) {
        return new List(Array.from(firstArg));
      }

      return new List([firstArg as T]);
    }

    return new List(initialItems as T[]);
  }

  constructor(initialItems?: T[] | Set<T>);
  constructor(...initialItems: T[]);
  constructor(...initialItems: T[] | [T[] | Set<T>] | []) {
    if (initialItems.length === 1) {
      const firstArg = initialItems[0];
      if (Array.isArray(firstArg)) {
        this.items = [...firstArg];
      } else if (firstArg instanceof Set) {
        this.items = Array.from(firstArg);
      } else {
        this.items = [firstArg as T];
      }
    } else {
      this.items = initialItems as T[];
    }
  }

  push(...elements: T[]): number {
    return this.items.push(...elements);
  }

  insert(element: T, index: number): void {
    this.items.splice(index, 0, element);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  remove(index: number): T | undefined {
    return this.items.splice(index, 1)[0];
  }

  shift(): T | undefined {
    return this.items.shift();
  }

  unshift(...elements: T[]): number {
    return this.items.unshift(...elements);
  }

  get length(): number {
    return this.items.length;
  }

  // Get the first element
  get first(): T | undefined {
    return this.items[0];
  }

  // Get the last element
  get last(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // Get a random element
  get random(): T | undefined {
    return this.items[Math.floor(Math.random() * this.items.length)];
  }

  // Get unique elements
  get unique(): List<T> {
    return new List([...new Set(this.items)]);
  }

  // Get the sum of all elements (if they are numbers)
  get sum(): number {
    return this.items.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
  }

  // Get the average of all elements (if they are numbers)
  get average(): number {
    return this.sum / this.length;
  }

  // Get the median of all elements (if they are numbers)
  get median(): number {
    const sorted = [...this.items].sort((a, b) =>
      typeof a === 'number' && typeof b === 'number' ? a - b : 0
    );
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? (sorted[mid] as number)
      : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
  }

  get mode(): T | undefined {
    const counts = new Map<T, number>();
    let maxCount = 0;
    let modeValue: T | undefined;

    for (const item of this.items) {
      const count = (counts.get(item) || 0) + 1;
      counts.set(item, count);
      if (count > maxCount) {
        maxCount = count;
        modeValue = item;
      }
    }

    return modeValue;
  }

  // Get the range (difference between max and min) for numeric lists
  get range(): number {
    if (this.length === 0 || !this.items.every((item) => typeof item === 'number')) {
      return NaN;
    }
    const numbers = this.items as number[];
    return Math.max(...numbers) - Math.min(...numbers);
  }

  // Get the cumulative sum of the list
  get cumulativeSum(): List<number> {
    let sum = 0;
    return new List(this.items.map((item) => (sum += typeof item === 'number' ? item : 0)));
  }

  // Check if the list is sorted in ascending order
  get isSorted(): boolean {
    for (let i = 1; i < this.items.length; i++) {
      if (this.items[i] < this.items[i - 1]) return false;
    }
    return true;
  }

  isEmpty(predicate?: (value: T) => boolean): boolean {
    if (predicate) {
      return this.items.every((item) => !predicate(item));
    }
    return this.items.length === 0;
  }

  at(index: number | ((length: number) => number)): T | undefined {
    if (typeof index === 'function') {
      index = index(this.length);
    }
    return this.items.at(index);
  }

  join(separator: string, options?: { trailing?: boolean; starting?: boolean }): string {
    let result = this.items.join(separator);
    if (options?.starting) result = separator + result;
    if (options?.trailing) result += separator;
    return result;
  }

  slice(start?: number, end?: number): List<T> {
    return new List(this.items.slice(start, end));
  }

  concat(...lists: List<T>[]): List<T> {
    return new List(this.items.concat(...lists.map((list) => list.items)));
  }

  clone(): List<T> {
    return this.slice();
  }

  [Symbol.toStringTag] = 'List';

  toString(): string {
    return `[${this.items.join(', ')}]`;
  }

  // Custom inspection function for Node.js
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }

  // For browsers and other environments
  toJSON(): T[] {
    return this.items;
  }

  toArray(): T[] {
    return this.items.slice();
  }

  toSet(): Set<T> {
    return new Set(this.items.slice());
  }

  each(callback: EachCallback<T, void>, options: EachOptions = {}): void {
    const { reverse = false, step = 1 } = options;
    const length = this.items.length;
    let breakLoop = false;
    let continueLoop = false;

    const iterate = (i: number) => {
      if (breakLoop) return;
      if (continueLoop) {
        continueLoop = false;
        return;
      }

      const value = this.items[i];
      const prevIndex = reverse ? i + step : i - step;
      const nextIndex = reverse ? i - step : i + step;

      const context = {
        prevIndex: prevIndex >= 0 && prevIndex < length ? prevIndex : undefined,
        nextIndex: nextIndex >= 0 && nextIndex < length ? nextIndex : undefined,
        prev: this.items[prevIndex],
        next: this.items[nextIndex],
        breakFn: () => {
          breakLoop = true;
        },
        continueFn: () => {
          continueLoop = true;
        },
        list: this,
        isFirst: reverse ? i === length - 1 : i === 0,
        isLast: reverse ? i === 0 : i === length - 1,
      };

      callback(value, i, context);
    };

    if (reverse) {
      for (let i = length - 1; i >= 0; i -= step) {
        iterate(i);
      }
    } else {
      for (let i = 0; i < length; i += step) {
        iterate(i);
      }
    }
  }

  map<U>(callback: EachCallback<T, U>, options: EachOptions = {}): List<U> {
    const result: U[] = [];
    this.each((value, index, context) => {
      result.push(callback(value, index, context));
    }, options);
    return new List(result);
  }

  filter(predicate: EachCallback<T, boolean>, options: EachOptions = {}): List<T> {
    const result: T[] = [];
    this.each((value, index, context) => {
      if (predicate(value, index, context)) {
        result.push(value);
      }
    }, options);
    return new List(result);
  }

  find(predicate: EachCallback<T, boolean>, options: EachOptions = {}): T | undefined {
    let result: T | undefined;
    this.each((value, index, context) => {
      if (predicate(value, index, context)) {
        result = value;
        context.breakFn();
      }
    }, options);
    return result;
  }

  findIndex(predicate: EachCallback<T, boolean>, options: EachOptions = {}): number {
    let result = -1;
    this.each((value, index, context) => {
      if (predicate(value, index, context)) {
        result = index;
        context.breakFn();
      }
    }, options);
    return result;
  }

  every(predicate: EachCallback<T, boolean>, options: EachOptions = {}): boolean {
    let result = true;
    this.each((value, index, context) => {
      if (!predicate(value, index, context)) {
        result = false;
        context.breakFn();
      }
    }, options);
    return result;
  }

  some(predicate: EachCallback<T, boolean>, options: EachOptions = {}): boolean {
    let result = false;
    this.each((value, index, context) => {
      if (predicate(value, index, context)) {
        result = true;
        context.breakFn();
      }
    }, options);
    return result;
  }

  reduce<U>(
    callback: (accumulator: U, value: T, index: number, context: EachContext<T>) => U,
    initialValue: U,
    options: EachOptions = {}
  ): U {
    let accumulator = initialValue;
    this.each((value, index, context) => {
      accumulator = callback(accumulator, value, index, context);
    }, options);
    return accumulator;
  }

  flat(depth: number = 1): List<T extends (infer U)[] ? U : T> {
    const flattened: any[] = [];
    const flatten = (arr: any[], currentDepth: number) => {
      for (const item of arr) {
        if (Array.isArray(item) && currentDepth > 0) {
          flatten(item, currentDepth - 1);
        } else {
          flattened.push(item);
        }
      }
    };
    flatten(this.items, depth);
    return new List(flattened);
  }

  fill(value: T, start?: number, end?: number): List<T> {
    this.items.fill(value, start, end);
    return this;
  }

  indexOf(searchElement: T, fromIndex?: number): number {
    return this.items.indexOf(searchElement, fromIndex);
  }

  lastIndexOf(searchElement: T, fromIndex?: number): number {
    return this.items.lastIndexOf(searchElement, fromIndex);
  }

  keys(): number[] {
    return this.items.map((_, index) => index);
  }

  entries(): [number, T][] {
    return this.items.map((value, index) => [index, value]);
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.items;
  }

  // Implement Iterable interface
  public *values(): IterableIterator<T> {
    yield* this.items;
  }

  reverse(): List<T> {
    this.items.reverse();
    return this;
  }

  // Implementing these methods using our `each` method for consistency
  indexOfWithEach(searchElement: T, fromIndex: number = 0): number {
    let foundIndex = -1;
    this.each((value, index, context) => {
      if (index >= fromIndex && value === searchElement) {
        foundIndex = index;
        context.breakFn();
      }
    });
    return foundIndex;
  }

  lastIndexOfWithEach(searchElement: T, fromIndex: number = this.length - 1): number {
    let foundIndex = -1;
    this.each(
      (value, index, context) => {
        if (index <= fromIndex && value === searchElement) {
          foundIndex = index;
        }
      },
      { reverse: true }
    );
    return foundIndex;
  }

  reverseWithEach(): List<T> {
    const reversed: T[] = [];
    this.each((value) => {
      reversed.unshift(value);
    });
    this.items = reversed;
    return this;
  }

  sort(
    directionOrCompare?: SortDirection | ((a: T, b: T) => number),
    method?: SortMethod
  ): List<T> {
    let compareFunction: (a: T, b: T) => number;
    let direction: SortDirection = 'asc';
    let sortMethod: SortMethod | undefined = method;

    if (typeof directionOrCompare === 'function') {
      compareFunction = directionOrCompare;
    } else {
      direction = directionOrCompare || 'asc';
      compareFunction = this.getDefaultCompare(direction);
    }

    switch (sortMethod) {
      case 'merge':
        this.items = this.mergeSort(this.items, compareFunction);
        break;
      case 'quick':
        this.quickSort(0, this.items.length - 1, compareFunction);
        break;
      case 'bubble':
        this.bubbleSort(compareFunction);
        break;
      case 'insertion':
        this.insertionSort(compareFunction);
        break;
      case 'selection':
        this.selectionSort(compareFunction);
        break;
      case 'heap':
        this.heapSort(compareFunction);
        break;
      case 'radix':
        if (this.isRadixSortable()) {
          this.radixSort(direction);
        } else {
          console.warn(
            'Radix sort is only applicable for lists of positive integers. Falling back to quicksort.'
          );
          this.quickSort(0, this.items.length - 1, compareFunction);
        }
        break;
      default:
        this.items.sort(compareFunction);
    }

    return this;
  }

  private getDefaultCompare(direction: SortDirection = 'asc'): (a: T, b: T) => number {
    return (a: T, b: T) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return direction === 'asc' ? a - b : b - a;
      }
      if (a < b) return direction === 'asc' ? -1 : 1;
      if (a > b) return direction === 'asc' ? 1 : -1;
      return 0;
    };
  }

  private mergeSort(arr: T[], compare: (a: T, b: T) => number): T[] {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    return this.merge(this.mergeSort(left, compare), this.mergeSort(right, compare), compare);
  }

  private merge(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
    let result: T[] = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (compare(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }

  private quickSort(low: number, high: number, compare: (a: T, b: T) => number): void {
    if (low < high) {
      const pivotIndex = this.sortPartition(low, high, compare);
      this.quickSort(low, pivotIndex - 1, compare);
      this.quickSort(pivotIndex + 1, high, compare);
    }
  }

  private sortPartition(low: number, high: number, compare: (a: T, b: T) => number): number {
    const pivot = this.items[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (compare(this.items[j], pivot) <= 0) {
        i++;
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
      }
    }

    [this.items[i + 1], this.items[high]] = [this.items[high], this.items[i + 1]];
    return i + 1;
  }

  private bubbleSort(compare: (a: T, b: T) => number): void {
    const n = this.items.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (compare(this.items[j], this.items[j + 1]) > 0) {
          [this.items[j], this.items[j + 1]] = [this.items[j + 1], this.items[j]];
        }
      }
    }
  }

  private insertionSort(compare: (a: T, b: T) => number): void {
    const n = this.items.length;
    for (let i = 1; i < n; i++) {
      const key = this.items[i];
      let j = i - 1;
      while (j >= 0 && compare(this.items[j], key) > 0) {
        this.items[j + 1] = this.items[j];
        j--;
      }
      this.items[j + 1] = key;
    }
  }

  private selectionSort(compare: (a: T, b: T) => number): void {
    const n = this.items.length;
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < n; j++) {
        if (compare(this.items[j], this.items[minIndex]) < 0) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        [this.items[i], this.items[minIndex]] = [this.items[minIndex], this.items[i]];
      }
    }
  }

  private heapSort(compare: (a: T, b: T) => number): void {
    const n = this.items.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(n, i, compare);
    }

    for (let i = n - 1; i > 0; i--) {
      [this.items[0], this.items[i]] = [this.items[i], this.items[0]];
      this.heapify(i, 0, compare);
    }
  }

  private heapify(n: number, i: number, compare: (a: T, b: T) => number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && compare(this.items[left], this.items[largest]) > 0) {
      largest = left;
    }

    if (right < n && compare(this.items[right], this.items[largest]) > 0) {
      largest = right;
    }

    if (largest !== i) {
      [this.items[i], this.items[largest]] = [this.items[largest], this.items[i]];
      this.heapify(n, largest, compare);
    }
  }

  private isRadixSortable(): boolean {
    return this.items.every(
      (item) => typeof item === 'number' && item >= 0 && Number.isInteger(item)
    );
  }

  private radixSort(direction: SortDirection): void {
    if (!this.isRadixSortable()) {
      throw new Error('Radix sort is only applicable for lists of positive integers.');
    }

    const max = Math.max(...(this.items as number[]));
    const maxDigits = Math.floor(Math.log10(max)) + 1;

    for (let digit = 0; digit < maxDigits; digit++) {
      const buckets: number[][] = Array.from({ length: 10 }, () => []);

      for (const item of this.items) {
        const digitValue = Math.floor(((item as number) / Math.pow(10, digit)) % 10);
        buckets[digitValue].push(item as number);
      }

      this.items =
        direction === 'asc' ? (buckets.flat() as T[]) : (buckets.reverse().flat() as T[]);
    }
  }

  // Shuffle the list
  shuffle(): List<T> {
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
    return this;
  }

  // Chunk the list into smaller lists of a given size
  chunk(size: number): List<List<T>> {
    const chunks: List<T>[] = [];
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(new List(this.items.slice(i, i + size)));
    }
    return new List(chunks);
  }

  // Rotate the list by a given number of positions
  rotate(k: number): List<T> {
    if (this.length === 0) return this;
    k = k % this.length;
    if (k < 0) k += this.length;
    this.items = [...this.items.slice(-k), ...this.items.slice(0, -k)];
    return this;
  }

  // Interleave this list with another list
  interleave(other: List<T>): List<T> {
    const result: T[] = [];
    const maxLength = Math.max(this.length, other.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < this.length) result.push(this.items[i]);
      if (i < other.length) result.push(other.items[i]);
    }
    return new List(result);
  }

  // Group elements by a key generated from a callback
  groupBy<K>(keyFn: (item: T) => K): Map<K, List<T>> {
    const groups = new Map<K, List<T>>();
    for (const item of this.items) {
      const key = keyFn(item);
      if (!groups.has(key)) {
        groups.set(key, new List<T>());
      }
      groups.get(key)!.push(item);
    }
    return groups;
  }

  // Partition the list into two lists based on a predicate
  partition(predicate: (item: T) => boolean): [List<T>, List<T>] {
    const trueList: T[] = [];
    const falseList: T[] = [];
    this.items.forEach((item) => (predicate(item) ? trueList.push(item) : falseList.push(item)));
    return [new List(trueList), new List(falseList)];
  }

  // Zip this list with another list
  zip<U>(other: List<U>): List<[T, U]> {
    const result: [T, U][] = [];
    const minLength = Math.min(this.length, other.length);
    for (let i = 0; i < minLength; i++) {
      result.push([this.items[i], other.items[i]]);
    }
    return new List(result);
  }

  // Combine adjacent elements using a reducer function
  adjacentReduce<U>(reducer: (prev: T, curr: T) => U): List<U> {
    const result: U[] = [];
    for (let i = 1; i < this.items.length; i++) {
      result.push(reducer(this.items[i - 1], this.items[i]));
    }
    return new List(result);
  }

  // Get all permutations of the list
  permutations(): List<List<T>> {
    if (this.length === 0) return new List([new List()]);
    const result: List<T>[] = [];
    for (let i = 0; i < this.length; i++) {
      const rest = new List([...this.items.slice(0, i), ...this.items.slice(i + 1)]);
      const perms = rest.permutations();
      for (const perm of perms) {
        result.push(new List([this.items[i], ...perm]));
      }
    }
    return new List(result);
  }

  // Generate a sliding window of the list
  slidingWindow(windowSize: number): List<List<T>> {
    if (windowSize > this.length) return new List();
    const result: List<T>[] = [];
    for (let i = 0; i <= this.length - windowSize; i++) {
      result.push(new List(this.items.slice(i, i + windowSize)));
    }
    return new List(result);
  }

  // Memoize a function that operates on list elements
  memoize<U>(fn: (item: T) => U): (item: T) => U {
    const cache = new Map<T, U>();
    return (item: T) => {
      if (cache.has(item)) return cache.get(item)!;
      const result = fn(item);
      cache.set(item, result);
      return result;
    };
  }

  // Get the dot product of this list with another (assuming numeric lists)
  dotProduct(other: List<number>): number {
    if (this.length !== other.length || !this.items.every((item) => typeof item === 'number')) {
      throw new Error('Lists must have the same length and contain only numbers');
    }
    return this.items.reduce(
      (sum, value, index) => sum + (value as number) * other.items[index],
      0
    );
  }

  // Flatten a nested list structure
  flatten(depth: number = Infinity): List<T extends any[] ? T[number] : T> {
    const flattened: any[] = [];
    const flatten = (arr: any[], currentDepth: number) => {
      for (const item of arr) {
        if (Array.isArray(item) && currentDepth > 0) {
          flatten(item, currentDepth - 1);
        } else {
          flattened.push(item);
        }
      }
    };
    flatten(this.items, depth);
    return new List(flattened);
  }

  // Create a new list with elements repeated n times
  repeat(n: number): List<T> {
    return new List(Array(n).fill(this.items).flat());
  }

  // Apply a function to each element n times
  iterate<U>(n: number, fn: (item: T | U) => U): List<U> {
    let result = this.items as (T | U)[];
    for (let i = 0; i < n; i++) {
      result = result.map(fn);
    }
    return new List(result as U[]);
  }

  // Get all sublists of the list
  sublists(): List<List<T>> {
    const result: List<T>[] = [new List()];
    for (let i = 0; i < this.items.length; i++) {
      for (let j = i; j < this.items.length; j++) {
        result.push(new List(this.items.slice(i, j + 1)));
      }
    }
    return new List(result);
  }

  // Perform a left fold (reduce) operation
  foldLeft<U>(initial: U, fn: (acc: U, item: T) => U): U {
    let result = initial;
    for (const item of this.items) {
      result = fn(result, item);
    }
    return result;
  }

  // Perform a right fold (reduce) operation
  foldRight<U>(initial: U, fn: (item: T, acc: U) => U): U {
    let result = initial;
    for (let i = this.items.length - 1; i >= 0; i--) {
      result = fn(this.items[i], result);
    }
    return result;
  }

  // Generate all combinations of k elements
  combinations(k: number): List<List<T>> {
    const combine = (start: number, current: T[]): void => {
      if (current.length === k) {
        result.push(new List(current));
        return;
      }
      for (let i = start; i < this.items.length; i++) {
        combine(i + 1, [...current, this.items[i]]);
      }
    };

    const result: List<T>[] = [];
    combine(0, []);
    return new List(result);
  }

  // Divide the list into lists of size n, with an optional fill value for the last list
  divideInto(n: number, fill?: T): List<List<T>> {
    const result: List<T>[] = [];
    for (let i = 0; i < this.items.length; i += n) {
      const chunk = this.items.slice(i, i + n);
      if (fill !== undefined && chunk.length < n) {
        chunk.push(...Array(n - chunk.length).fill(fill));
      }
      result.push(new List(chunk));
    }
    return new List(result);
  }

  // Apply a sliding function to the list
  slidingApply<U>(windowSize: number, fn: (window: List<T>) => U): List<U> {
    const result: U[] = [];
    for (let i = 0; i <= this.items.length - windowSize; i++) {
      result.push(fn(new List(this.items.slice(i, i + windowSize))));
    }
    return new List(result);
  }

  // Create a histogram of the list elements
  histogram(bins: number = 10): Map<string, number> {
    if (!this.items.every((item) => typeof item === 'number')) {
      throw new Error('Histogram is only applicable for numeric lists');
    }
    const numbers = this.items as number[];
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const binSize = (max - min) / bins;
    const histogram = new Map<string, number>();

    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const key = `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`;
      histogram.set(key, 0);
    }

    for (const num of numbers) {
      const binIndex = Math.min(Math.floor((num - min) / binSize), bins - 1);
      const binStart = min + binIndex * binSize;
      const binEnd = binStart + binSize;
      const key = `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`;
      histogram.set(key, (histogram.get(key) || 0) + 1);
    }

    return histogram;
  }
}

export default List;
