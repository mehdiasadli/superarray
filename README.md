# @mehdiasadov/superarray

An enhanced List implementation with advanced array-like functionality.

## Installation

```bash
npm install @mehdiasadov/superarray
```

## Usage

```typescript
import { List } from '@mehdiasadov/superarray';

const list = new List([1, 2, 3, 4, 5]);
console.log(list.sum);  // 15
```

## API Reference

### Constructor

- `new List<T>(initialItems?: T[] | Set<T>)`: Create a new List
- `new List<T>(...initialItems: T[])`: Create a new List from individual items

### Properties

- `length: number`: Number of elements in the List
- `first: T | undefined`: First element of the List
- `last: T | undefined`: Last element of the List
- `random: T | undefined`: Random element from the List
- `unique: List<T>`: New List with unique elements
- `sum: number`: Sum of all elements (for numeric Lists)
- `average: number`: Average of all elements (for numeric Lists)
- `median: number`: Median of all elements (for numeric Lists)
- `mode: T | undefined`: Mode (most frequent element) of the List
- `range: number`: Range (difference between max and min) for numeric Lists
- `cumulativeSum: List<number>`: Cumulative sum of the List
- `isSorted: boolean`: Check if the List is sorted in ascending order

### Methods

- `push(...elements: T[]): number`: Add elements to the end of the List
- `insert(element: T, index: number): void`: Insert an element at a specific index
- `pop(): T | undefined`: Remove and return the last element
- `remove(index: number): T | undefined`: Remove and return element at specific index
- `shift(): T | undefined`: Remove and return the first element
- `unshift(...elements: T[]): number`: Add elements to the beginning of the List
- `at(index: number | ((length: number) => number)): T | undefined`: Get element at index
- `join(separator: string, options?: { trailing?: boolean; starting?: boolean }): string`: Join elements into a string
- `slice(start?: number, end?: number): List<T>`: Extract a section of the List
- `concat(...lists: List<T>[]): List<T>`: Concatenate Lists
- `clone(): List<T>`: Create a shallow copy of the List
- `toArray(): T[]`: Convert List to array
- `toSet(): Set<T>`: Convert List to Set
- `each(callback: EachCallback<T, void>, options?: EachOptions): void`: Iterate over elements
- `map<U>(callback: EachCallback<T, U>, options?: EachOptions): List<U>`: Create a new List with results of callback
- `filter(predicate: EachCallback<T, boolean>, options?: EachOptions): List<T>`: Filter elements
- `find(predicate: EachCallback<T, boolean>, options?: EachOptions): T | undefined`: Find an element
- `findIndex(predicate: EachCallback<T, boolean>, options?: EachOptions): number`: Find index of an element
- `every(predicate: EachCallback<T, boolean>, options?: EachOptions): boolean`: Test if all elements pass the test
- `some(predicate: EachCallback<T, boolean>, options?: EachOptions): boolean`: Test if any element passes the test
- `reduce<U>(callback: (acc: U, value: T, index: number, context: EachContext<T>) => U, initialValue: U, options?: EachOptions): U`: Reduce the List to a single value
- `sort(directionOrCompare?: SortDirection | ((a: T, b: T) => number), method?: SortMethod): List<T>`: Sort the List
- `shuffle(): List<T>`: Randomly shuffle the List
- `chunk(size: number): List<List<T>>`: Split the List into chunks
- `rotate(k: number): List<T>`: Rotate the List by k positions
- `interleave(other: List<T>): List<T>`: Interleave with another List
- `groupBy<K>(keyFn: (item: T) => K): Map<K, List<T>>`: Group elements by a key function
- `partition(predicate: (item: T) => boolean): [List<T>, List<T>]`: Split the List based on a predicate
- `zip<U>(other: List<U>): List<[T, U]>`: Combine corresponding elements from two Lists
- `adjacentReduce<U>(reducer: (prev: T, curr: T) => U): List<U>`: Combine adjacent elements
- `permutations(): List<List<T>>`: Generate all permutations of the List
- `slidingWindow(windowSize: number): List<List<T>>`: Generate sliding windows of the List
- `combinations(k: number): List<List<T>>`: Generate all combinations of k elements
- `divideInto(n: number, fill?: T): List<List<T>>`: Divide the List into n sublists
- `histogram(bins: number = 10): Map<string, number>`: Create a histogram of the List elements

For detailed usage examples of each method, please refer to the source code or the detailed API documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.