//! # SQL Parser
//!
//! A SQL parser library that uses the sqlparser crate to parse SQL statements
//! and convert them to JSON representation.
//!
//! ## Example
//!
//! ```rust
//! use sql_parser_wasm::parse_sql;
//!
//! let sql = "SELECT * FROM users WHERE id = 1";
//! let dialect = "postgresql";
//! let result = parse_sql(dialect, sql);
//! assert!(result.is_ok());
//! ```

use sqlparser::dialect::{
    Dialect, GenericDialect, PostgreSqlDialect, MySqlDialect, SQLiteDialect,
    MsSqlDialect, SnowflakeDialect, RedshiftSqlDialect, BigQueryDialect,
    ClickHouseDialect, HiveDialect,
};
use sqlparser::parser::{Parser, ParserError};
use serde_json::to_value;

/// Parse a SQL statement using the specified dialect and return the AST as JSON
///
/// # Arguments
///
/// * `dialect` - The SQL dialect to use for parsing (e.g., "postgresql", "mysql", "sqlite", etc.)
/// * `sql` - The SQL statement to parse
///
/// # Returns
///
/// Returns `Ok(String)` containing the JSON representation of the parsed AST,
/// or `Err(String)` if parsing fails.
///
/// # Supported Dialects
///
/// - `"generic"` - Generic SQL dialect
/// - `"postgresql"` - PostgreSQL dialect
/// - `"mysql"` - MySQL dialect
/// - `"sqlite"` - SQLite dialect
/// - `"mssql"` - Microsoft SQL Server dialect
/// - `"snowflake"` - Snowflake dialect
/// - `"redshift"` - Amazon Redshift dialect
/// - `"bigquery"` - Google BigQuery dialect
/// - `"clickhouse"` - ClickHouse dialect
/// - `"hive"` - Apache Hive dialect
///
/// # Examples
///
/// ```
/// use sql_parser_wasm::parse_sql;
///
/// let result = parse_sql("postgresql", "SELECT * FROM users WHERE id = 1");
/// assert!(result.is_ok());
/// 
/// let json_ast = result.unwrap();
/// println!("Parsed AST: {}", json_ast);
/// ```
pub fn parse_sql(dialect: &str, sql: &str) -> Result<String, String> {
    // Get the appropriate dialect
    let dialect_impl: Box<dyn Dialect> = match dialect.to_lowercase().as_str() {
        "generic" => Box::new(GenericDialect {}),
        "postgresql" | "postgres" => Box::new(PostgreSqlDialect {}),
        "mysql" => Box::new(MySqlDialect {}),
        "sqlite" => Box::new(SQLiteDialect {}),
        "mssql" | "sqlserver" => Box::new(MsSqlDialect {}),
        "snowflake" => Box::new(SnowflakeDialect {}),
        "redshift" => Box::new(RedshiftSqlDialect {}),
        "bigquery" => Box::new(BigQueryDialect {}),
        "clickhouse" => Box::new(ClickHouseDialect {}),
        "hive" => Box::new(HiveDialect {}),
        _ => return Err(format!("Unsupported dialect: {}. Supported dialects are: generic, postgresql, mysql, sqlite, mssql, snowflake, redshift, bigquery, clickhouse, hive", dialect)),
    };

    // Parse the SQL
    let statements = Parser::parse_sql(&*dialect_impl, sql)
        .map_err(|e: ParserError| format!("Parse error: {}", e))?;

    // Convert to JSON
    let json_value = to_value(&statements)
        .map_err(|e| format!("JSON serialization error: {}", e))?;

    // Convert to pretty-printed JSON string
    serde_json::to_string_pretty(&json_value)
        .map_err(|e| format!("JSON string conversion error: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_select() {
        let result = parse_sql("postgresql", "SELECT * FROM users");
        assert!(result.is_ok());
        
        let json = result.unwrap();
        assert!(json.contains("Select"));
        assert!(json.contains("users"));
    }

    #[test]
    fn test_parse_select_with_where() {
        let result = parse_sql("postgresql", "SELECT id, name FROM users WHERE age > 18");
        assert!(result.is_ok());
        
        let json = result.unwrap();
        assert!(json.contains("Select"));
        assert!(json.contains("users"));
        assert!(json.contains("age"));
    }

    #[test]
    fn test_parse_insert_statement() {
        let result = parse_sql("mysql", "INSERT INTO users (name, age) VALUES ('John', 25)");
        assert!(result.is_ok());
        
        let json = result.unwrap();
        assert!(json.contains("Insert"));
        assert!(json.contains("users"));
        assert!(json.contains("John"));
    }

    #[test]
    fn test_parse_update_statement() {
        let result = parse_sql("sqlite", "UPDATE users SET age = 26 WHERE name = 'John'");
        assert!(result.is_ok());
        
        let json = result.unwrap();
        assert!(json.contains("Update"));
        assert!(json.contains("users"));
    }

    #[test]
    fn test_parse_delete_statement() {
        let result = parse_sql("generic", "DELETE FROM users WHERE age < 18");
        assert!(result.is_ok());
        
        let json = result.unwrap();
        assert!(json.contains("Delete"));
        assert!(json.contains("users"));
    }

    #[test]
    fn test_parse_invalid_sql() {
        let result = parse_sql("postgresql", "SELEC * FRO users");
        assert!(result.is_err());
        
        let error = result.unwrap_err();
        assert!(error.contains("Parse error"));
    }

    #[test]
    fn test_invalid_dialect() {
        let result = parse_sql("invalid_dialect", "SELECT * FROM users");
        assert!(result.is_err());
        
        let error = result.unwrap_err();
        assert!(error.contains("Unsupported dialect"));
    }

    #[test]
    fn test_dialect_case_insensitive() {
        let result1 = parse_sql("PostgreSQL", "SELECT * FROM users");
        let result2 = parse_sql("MYSQL", "SELECT * FROM users");
        
        assert!(result1.is_ok());
        assert!(result2.is_ok());
    }

    #[test]
    fn test_complex_query() {
        let sql = r#"
            SELECT u.id, u.name, p.title
            FROM users u
            JOIN posts p ON u.id = p.user_id
            WHERE u.age > 18 AND p.published = true
            ORDER BY u.name
            LIMIT 10
        "#;
        
        let result = parse_sql("postgresql", sql);
        assert!(result.is_ok());
        
        let json = result.unwrap();
        println!("Complex query JSON: {}", json);
        assert!(json.contains("Select"));
        // Note: The exact structure names may vary, so we test for presence of key elements
        assert!(json.contains("users"));
        assert!(json.contains("posts"));
        assert!(json.contains("published"));
    }
}
