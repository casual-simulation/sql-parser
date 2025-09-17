# sql-parser

A SQL Parser with WASM and JavaScript bindings

## Overview

This library provides functionality to parse SQL statements and convert them into structured data that can be used for analysis, transformation, or execution. It's designed to work both in native Rust environments and in web browsers via WebAssembly.

## Features

- Parse common SQL statements (SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER)
- Support for WebAssembly compilation for browser usage
- JavaScript bindings for easy integration in web applications
- Comprehensive error handling with position information
- Zero-copy parsing where possible
- Lightweight and fast

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
sql-parser = "0.1"
```

For WASM features:

```toml
[dependencies]
sql-parser = { version = "0.1", features = ["wasm"] }
```

## Usage

### Basic Rust Usage

```rust
use sql_parser::{parse_sql, StatementType};

fn main() {
    let sql = "SELECT * FROM users WHERE id = 1";
    
    match parse_sql(sql) {
        Ok(statement) => {
            println!("Statement type: {:?}", statement.statement_type);
            println!("Raw SQL: {}", statement.raw_sql);
        }
        Err(error) => {
            println!("Parse error: {}", error);
        }
    }
}
```

### Supported Statement Types

- `SELECT` - Data retrieval queries
- `INSERT` - Data insertion statements
- `UPDATE` - Data modification statements
- `DELETE` - Data deletion statements
- `CREATE` - Schema creation statements (tables, indexes, etc.)
- `DROP` - Schema deletion statements
- `ALTER` - Schema modification statements
- `Unknown` - Other statements not explicitly categorized

## Building

### Standard Build

```bash
# Build the library
cargo build

# Run tests
cargo test

# Build with optimizations
cargo build --release
```

### WASM Build

To build for WebAssembly:

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack

# Build for web
wasm-pack build --target web --features wasm

# Build for Node.js
wasm-pack build --target nodejs --features wasm
```

### Examples

Run the basic usage example:

```bash
cargo run --example basic_usage
```

## Development

### Running Tests

```bash
cargo test
```

### Documentation

Generate and view documentation:

```bash
cargo doc --open
```

### Linting

```bash
cargo clippy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Roadmap

- [ ] Full SQL grammar support
- [ ] Query optimization suggestions
- [ ] SQL formatting and pretty-printing
- [ ] Support for different SQL dialects (PostgreSQL, MySQL, SQLite, etc.)
- [ ] Advanced error recovery and suggestions
- [ ] TypeScript type definitions for WASM bindings
