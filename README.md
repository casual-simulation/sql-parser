# SQL Parser

A Rust library that uses the `sqlparser` crate to parse SQL statements and convert them to JSON representation.

## Features

- Parse SQL statements using various SQL dialects
- Convert parsed Abstract Syntax Tree (AST) to JSON
- Support for 10+ SQL dialects including PostgreSQL, MySQL, SQLite, BigQuery, and more
- Comprehensive error handling

## Usage

```rust
use sql_parser_wasm::parse_sql;

fn main() {
    let sql = "SELECT id, name FROM users WHERE active = true";
    let dialect = "postgresql";
    
    match parse_sql(dialect, sql) {
        Ok(json_ast) => {
            println!("Parsed AST: {}", json_ast);
        }
        Err(error) => {
            eprintln!("Parse error: {}", error);
        }
    }
}
```

## Supported Dialects

- `generic` - Generic SQL dialect
- `postgresql` / `postgres` - PostgreSQL
- `mysql` - MySQL
- `sqlite` - SQLite
- `mssql` / `sqlserver` - Microsoft SQL Server
- `snowflake` - Snowflake
- `redshift` - Amazon Redshift
- `bigquery` - Google BigQuery
- `clickhouse` - ClickHouse
- `hive` - Apache Hive

## API

### `parse_sql(dialect: &str, sql: &str) -> Result<String, String>`

Parses a SQL statement using the specified dialect and returns the AST as a pretty-printed JSON string.

**Parameters:**
- `dialect` - The SQL dialect to use for parsing
- `sql` - The SQL statement to parse

**Returns:**
- `Ok(String)` - JSON representation of the parsed AST
- `Err(String)` - Error message if parsing fails

## Examples

### Basic SELECT
```rust
let result = parse_sql("postgresql", "SELECT * FROM users");
// Returns JSON representation of the SELECT statement AST
```

### Complex Query
```rust
let sql = r#"
    SELECT u.name, COUNT(o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.active = true
    GROUP BY u.name
    HAVING COUNT(o.id) > 5
    ORDER BY order_count DESC
    LIMIT 10
"#;

let result = parse_sql("mysql", sql);
// Returns detailed JSON AST including joins, aggregations, etc.
```

### Error Handling
```rust
// Invalid SQL
let result = parse_sql("postgresql", "SELEC * FRO users");
assert!(result.is_err());

// Invalid dialect
let result = parse_sql("invalid", "SELECT * FROM users");
assert!(result.is_err());
```

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

### WebAssembly (WASM) Support

This library also supports WebAssembly for use in web browsers and Node.js environments.

### Building for WASM

```bash
# Install wasm-pack if not already installed
cargo install wasm-pack

# Build for web
wasm-pack build --target web --features wasm --out-dir pkg

# Or use the provided build scripts
./build-wasm.sh        # Linux/macOS
build-wasm.bat         # Windows
```

### JavaScript API

The WASM build provides three main functions:

#### `parse_sql_wasm(dialect, sql)`
Returns the parsed AST as a JavaScript object:

```javascript
import init, { parse_sql_wasm } from './pkg/sql_parser_wasm.js';

await init();

try {
    const ast = parse_sql_wasm("postgresql", "SELECT * FROM users");
    console.log("Parsed AST:", ast);
} catch (error) {
    console.error("Parse error:", error);
}
```

#### `parse_sql_json(dialect, sql)`
Returns the parsed AST as a JSON string:

```javascript
import { parse_sql_json } from './pkg/sql_parser_wasm.js';

try {
    const jsonString = parse_sql_json("postgresql", "SELECT * FROM users");
    const ast = JSON.parse(jsonString);
    console.log("Parsed AST:", ast);
} catch (error) {
    console.error("Parse error:", error);
}
```

#### `get_supported_dialects()`
Returns an array of supported dialect names:

```javascript
import { get_supported_dialects } from './pkg/sql_parser_wasm.js';

const dialects = get_supported_dialects();
console.log("Supported dialects:", dialects);
// Output: ["generic", "postgresql", "mysql", "sqlite", ...]
```

### Web Example

See `examples/wasm_example.html` for a complete web-based example that demonstrates all WASM functionality.

To run the example:

1. Build the WASM package: `wasm-pack build --target web --features wasm`
2. Serve the project directory with an HTTP server
3. Open `examples/wasm_example.html` in your browser

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## Running Tests

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
