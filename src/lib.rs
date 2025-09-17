//! # SQL Parser
//!
//! A SQL parser library with WASM and JavaScript bindings.
//!
//! This library provides functionality to parse SQL statements and convert them
//! into structured data that can be used for analysis, transformation, or execution.
//!
//! ## Features
//!
//! - Parse common SQL statements (SELECT, INSERT, UPDATE, DELETE, etc.)
//! - Support for WASM compilation for browser usage
//! - JavaScript bindings for easy integration
//!
//! ## Example
//!
//! ```rust
//! use sql_parser::parse_sql;
//!
//! let sql = "SELECT * FROM users WHERE id = 1";
//! let result = parse_sql(sql);
//! assert!(result.is_ok());
//! ```

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

/// Represents the result of parsing a SQL statement
#[derive(Debug, Clone, PartialEq)]
pub struct SqlStatement {
    /// The type of SQL statement (SELECT, INSERT, etc.)
    pub statement_type: StatementType,
    /// Raw SQL text that was parsed
    pub raw_sql: String,
}

/// Types of SQL statements supported by the parser
#[derive(Debug, Clone, PartialEq)]
pub enum StatementType {
    Select,
    Insert,
    Update,
    Delete,
    Create,
    Drop,
    Alter,
    Unknown,
}

/// Error type for SQL parsing operations
#[derive(Debug, Clone, PartialEq)]
pub struct SqlParseError {
    pub message: String,
    pub position: Option<usize>,
}

impl std::fmt::Display for SqlParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.position {
            Some(pos) => write!(f, "SQL parse error at position {}: {}", pos, self.message),
            None => write!(f, "SQL parse error: {}", self.message),
        }
    }
}

impl std::error::Error for SqlParseError {}

/// Parse a SQL statement string into a structured representation
///
/// # Arguments
///
/// * `sql` - A string slice containing the SQL statement to parse
///
/// # Returns
///
/// Returns `Ok(SqlStatement)` if parsing succeeds, or `Err(SqlParseError)` if parsing fails.
///
/// # Examples
///
/// ```
/// use sql_parser::parse_sql;
///
/// let result = parse_sql("SELECT * FROM users");
/// assert!(result.is_ok());
/// ```
pub fn parse_sql(sql: &str) -> Result<SqlStatement, SqlParseError> {
    let trimmed = sql.trim().to_uppercase();
    
    let statement_type = if trimmed.starts_with("SELECT") {
        StatementType::Select
    } else if trimmed.starts_with("INSERT") {
        StatementType::Insert
    } else if trimmed.starts_with("UPDATE") {
        StatementType::Update
    } else if trimmed.starts_with("DELETE") {
        StatementType::Delete
    } else if trimmed.starts_with("CREATE") {
        StatementType::Create
    } else if trimmed.starts_with("DROP") {
        StatementType::Drop
    } else if trimmed.starts_with("ALTER") {
        StatementType::Alter
    } else {
        StatementType::Unknown
    };

    if trimmed.is_empty() {
        return Err(SqlParseError {
            message: "Empty SQL statement".to_string(),
            position: None,
        });
    }

    Ok(SqlStatement {
        statement_type,
        raw_sql: sql.to_string(),
    })
}

/// WASM-compatible function for parsing SQL from JavaScript
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn parse_sql_wasm(sql: &str) -> Result<JsValue, JsValue> {
    match parse_sql(sql) {
        Ok(statement) => {
            let result = js_sys::Object::new();
            js_sys::Reflect::set(&result, &"statementType".into(), &format!("{:?}", statement.statement_type).into())?;
            js_sys::Reflect::set(&result, &"rawSql".into(), &statement.raw_sql.into())?;
            Ok(result.into())
        }
        Err(error) => Err(error.message.into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_select_statement() {
        let result = parse_sql("SELECT * FROM users");
        assert!(result.is_ok());
        
        let statement = result.unwrap();
        assert_eq!(statement.statement_type, StatementType::Select);
        assert_eq!(statement.raw_sql, "SELECT * FROM users");
    }

    #[test]
    fn test_parse_insert_statement() {
        let result = parse_sql("INSERT INTO users (name) VALUES ('John')");
        assert!(result.is_ok());
        
        let statement = result.unwrap();
        assert_eq!(statement.statement_type, StatementType::Insert);
    }

    #[test]
    fn test_parse_empty_statement() {
        let result = parse_sql("");
        assert!(result.is_err());
        
        let error = result.unwrap_err();
        assert_eq!(error.message, "Empty SQL statement");
    }

    #[test]
    fn test_parse_unknown_statement() {
        let result = parse_sql("EXPLAIN SELECT * FROM users");
        assert!(result.is_ok());
        
        let statement = result.unwrap();
        assert_eq!(statement.statement_type, StatementType::Unknown);
    }

    #[test]
    fn test_case_insensitive_parsing() {
        let result = parse_sql("select * from users");
        assert!(result.is_ok());
        
        let statement = result.unwrap();
        assert_eq!(statement.statement_type, StatementType::Select);
    }
}
