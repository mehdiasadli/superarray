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
console.log(list.average);  // 3
console.log(list.median);  // 3

const doubled = list.map(x => x * 2);
console.log(doubled.toArray());  // [2, 4, 6, 8, 10]

const evens = list.filter(x => x % 2 === 0);
console.log(evens.toArray());  // [2, 4]
```

## Features

- Enhanced array-like functionality
- Statistical operations (sum, average, median, etc.)
- Advanced manipulation methods (shuffle, chunk, rotate, etc.)
- Functional programming methods (map, filter, reduce, etc.)
- And much more!

## API Documentation

[Link to detailed API documentation]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.