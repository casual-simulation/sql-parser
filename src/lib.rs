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
//! let result = parse_sql(dialect.into(), sql.into());
//! assert!(result.is_ok());
//! ```

use sqlparser::dialect::{
    Dialect, GenericDialect, PostgreSqlDialect, MySqlDialect, SQLiteDialect,
    MsSqlDialect, SnowflakeDialect, RedshiftSqlDialect, BigQueryDialect,
    ClickHouseDialect, HiveDialect,
};
use sqlparser::parser::{Parser, ParserError};

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
use serde_wasm_bindgen;

/// WASM-compatible function for parsing SQL from JavaScript
/// 
/// This function provides the same functionality as `parse_sql` but returns
/// JavaScript-compatible values that can be used directly in web applications.
///
/// # Arguments
///
/// * `dialect` - The SQL dialect to use for parsing
/// * `sql` - The SQL statement to parse
///
/// # Returns
///
/// Returns `Ok(JsValue)` containing the parsed AST as a JavaScript object,
/// or `Err(JsValue)` containing the error message as a JavaScript string.
///
/// # Examples
///
/// ```javascript
/// import { parse_sql_wasm } from './pkg/sql_parser_wasm.js';
///
/// try {
///     const result = parse_sql_wasm("postgresql", "SELECT * FROM users");
///     console.log("Parsed AST:", result);
/// } catch (error) {
///     console.error("Parse error:", error);
/// }
/// ```
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn parse_sql(dialect: JsValue, sql: JsValue) -> Result<JsValue, JsValue> {
    let dialect = dialect.as_string().ok_or_else(|| JsValue::from_str("Dialect must be a string"))?;
    let sql = sql.as_string().ok_or_else(|| JsValue::from_str("SQL statement must be a string"))?;

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
        _ => return Err(JsValue::from_str("Unsupported dialect. Supported dialects are: generic, postgresql, mysql, sqlite, mssql, snowflake, redshift, bigquery, clickhouse, hive")),
    };

    // Parse the SQL
    let statements = Parser::parse_sql(&*dialect_impl, &sql)
        .map_err(|e: ParserError| format!("Parse error: {}", e))?;

    Ok(serde_wasm_bindgen::to_value(&statements)?)
}

/// Get a list of supported SQL dialects
/// 
/// Returns an array of supported dialect names that can be used with the parsing functions.
///
/// # Returns
///
/// Returns a JavaScript array containing all supported dialect names.
///
/// # Examples
///
/// ```javascript
/// import { get_supported_dialects } from './pkg/sql_parser_wasm.js';
///
/// const dialects = get_supported_dialects();
/// console.log("Supported dialects:", dialects);
/// ```
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn get_supported_dialects() -> js_sys::Array {
    let dialects = vec![
        "generic",
        "postgresql", 
        "postgres",
        "mysql",
        "sqlite",
        "mssql",
        "sqlserver",
        "snowflake",
        "redshift",
        "bigquery",
        "clickhouse",
        "hive",
    ];
    
    let js_array = js_sys::Array::new();
    for dialect in dialects {
        js_array.push(&JsValue::from_str(dialect));
    }
    js_array
}

// #[cfg(test)]
// mod tests {
//     use super::*;

    
// }

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_parse_simple_select() {
//         let result = parse_sql("postgresql", "SELECT * FROM users");
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         assert!(json.contains("Select"));
//         assert!(json.contains("users"));
//     }

//     #[test]
//     fn test_parse_select_with_where() {
//         let result = parse_sql("postgresql", "SELECT id, name FROM users WHERE age > 18");
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         assert!(json.contains("Select"));
//         assert!(json.contains("users"));
//         assert!(json.contains("age"));
//     }

//     #[test]
//     fn test_parse_insert_statement() {
//         let result = parse_sql("mysql", "INSERT INTO users (name, age) VALUES ('John', 25)");
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         assert!(json.contains("Insert"));
//         assert!(json.contains("users"));
//         assert!(json.contains("John"));
//     }

//     #[test]
//     fn test_parse_update_statement() {
//         let result = parse_sql("sqlite", "UPDATE users SET age = 26 WHERE name = 'John'");
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         assert!(json.contains("Update"));
//         assert!(json.contains("users"));
//     }

//     #[test]
//     fn test_parse_delete_statement() {
//         let result = parse_sql("generic", "DELETE FROM users WHERE age < 18");
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         assert!(json.contains("Delete"));
//         assert!(json.contains("users"));
//     }

//     #[test]
//     fn test_parse_invalid_sql() {
//         let result = parse_sql("postgresql", "SELEC * FRO users");
//         assert!(result.is_err());
        
//         let error = result.unwrap_err();
//         assert!(error.contains("Parse error"));
//     }

//     #[test]
//     fn test_invalid_dialect() {
//         let result = parse_sql("invalid_dialect", "SELECT * FROM users");
//         assert!(result.is_err());
        
//         let error = result.unwrap_err();
//         assert!(error.contains("Unsupported dialect"));
//     }

//     #[test]
//     fn test_dialect_case_insensitive() {
//         let result1 = parse_sql("PostgreSQL", "SELECT * FROM users");
//         let result2 = parse_sql("MYSQL", "SELECT * FROM users");
        
//         assert!(result1.is_ok());
//         assert!(result2.is_ok());
//     }

//     #[test]
//     fn test_complex_query() {
//         let sql = r#"
//             SELECT u.id, u.name, p.title
//             FROM users u
//             JOIN posts p ON u.id = p.user_id
//             WHERE u.age > 18 AND p.published = true
//             ORDER BY u.name
//             LIMIT 10
//         "#;
        
//         let result = parse_sql("postgresql", sql);
//         assert!(result.is_ok());
        
//         let json = result.unwrap();
//         println!("Complex query JSON: {}", json);
//         assert!(json.contains("Select"));
//         // Note: The exact structure names may vary, so we test for presence of key elements
//         assert!(json.contains("users"));
//         assert!(json.contains("posts"));
//         assert!(json.contains("published"));
//     }

//     #[test]
//     fn test_json_conversion_for_wasm() {
//         // Test that our JSON conversion works correctly for WASM compatibility
//         let result = parse_sql("postgresql", "SELECT id, name FROM users WHERE active = true");
//         assert!(result.is_ok());

//         let json_string = result.unwrap();
        
//         // Parse back to ensure it's valid JSON
//         let parsed: serde_json::Value = serde_json::from_str(&json_string).unwrap();
        
//         // Should be an array
//         assert!(parsed.is_array());
        
//         // Should contain our expected elements
//         let json_text = serde_json::to_string(&parsed).unwrap();
//         assert!(json_text.contains("Select"));
//         assert!(json_text.contains("users"));
//         assert!(json_text.contains("active"));
//     }

//     #[test]
//     fn test_supported_dialects_coverage() {
//         // Test that all our supported dialects actually work
//         let test_sql = "SELECT 1 as test_column";
//         let dialects = vec![
//             "generic", "postgresql", "postgres", "mysql", "sqlite", 
//             "mssql", "sqlserver", "snowflake", "redshift", "bigquery", 
//             "clickhouse", "hive"
//         ];

//         for dialect in dialects {
//             let result = parse_sql(dialect, test_sql);
//             assert!(result.is_ok(), "Dialect '{}' should work", dialect);
            
//             let json = result.unwrap();
//             assert!(json.contains("Select"), "Result for dialect '{}' should contain Select", dialect);
//         }
//     }
// }
