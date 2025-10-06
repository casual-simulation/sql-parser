# SQL Parser

A JavaScript library that uses the [`sqlparser` Rust crate](https://docs.rs/sqlparser/latest/sqlparser/index.html) to parse and manipulate SQL statements.

## Features

- Parse SQL statements using various SQL dialects
- Support for 10+ SQL dialects including PostgreSQL, MySQL, SQLite, BigQuery, and more

## Usage

```js
import { init, parse } from '@casual-simulation/sql-parser'

await init();

const ast = parse('SELECT * FROM "users";');
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

### `init(): Promise<void>`

Initializes the library WASM module.

### `parse(sql: string, dialect: string = 'generic'): Statement[]`

Parses a SQL statement using the specified dialect and returns the AST as a pretty-printed JSON string.

**Parameters:**
- `sql` - The SQL statement(s) to parse
- `dialect` - The SQL dialect to use for parsing

**Returns:**
- `Statement[]` - The parsed statements
- `Error` - Throws an error if parsing failed.

### `format(statement: Statement): string`

Formats the given statement into a SQL string.

**Parameters:**
-   `statement` - The SQL statement for format.

### `SQLVisitor`

A class that is able to walk over a SQL tree and call the given functions for each kind of statement.

#### `visit(statement: Statement)`

Runs the visitor on the given statement.

## Examples

### Basic SELECT
```js
let result = parse("SELECT * FROM users", "postgresql");
// Returns JSON representation of the SELECT statement AST
```

### Complex Query
```js
let sql = `
    SELECT u.name, COUNT(o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.active = true
    GROUP BY u.name
    HAVING COUNT(o.id) > 5
    ORDER BY order_count DESC
    LIMIT 10
`;

let result = parse(sql, "mysql");
// Returns detailed JSON AST including joins, aggregations, etc.
```

## Building

```bash
# Build the library
pnpm build
```

## Testing

```bash
pnpm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
