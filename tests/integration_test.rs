//! Integration tests for the SQL parser library
//!
//! These tests verify the public API and ensure the library works
//! correctly when used as an external dependency.

use sql_parser_wasm::parse_sql;

#[test]
fn test_parse_sql_basic_functionality() {
    // Test basic SELECT statement
    let result = parse_sql("postgresql", "SELECT name, email FROM users WHERE active = true");
    assert!(result.is_ok());
    
    let json = result.unwrap();
    assert!(json.contains("Select"));
    assert!(json.contains("users"));
    assert!(json.contains("active"));
}

#[test]
fn test_different_dialects() {
    let sql = "SELECT * FROM users";
    
    let dialects = vec![
        "postgresql", "mysql", "sqlite", "generic", 
        "mssql", "snowflake", "bigquery", "clickhouse"
    ];
    
    for dialect in dialects {
        let result = parse_sql(dialect, sql);
        assert!(result.is_ok(), "Failed to parse with dialect: {}", dialect);
        
        let json = result.unwrap();
        assert!(json.contains("Select"));
        assert!(json.contains("users"));
    }
}

#[test]
fn test_complex_query_parsing() {
    let complex_sql = r#"
        SELECT u.id, u.name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.active = true AND u.created_at > '2023-01-01'
        GROUP BY u.id, u.name
        HAVING COUNT(o.id) > 5
        ORDER BY order_count DESC
        LIMIT 10
    "#;
    
    let result = parse_sql("postgresql", complex_sql);
    assert!(result.is_ok());
    
    let json = result.unwrap();
    assert!(json.contains("Select"));
    // Note: The exact field names in the AST may differ, so we check for key elements
    assert!(json.contains("users"));
    assert!(json.contains("orders"));
    assert!(json.contains("active"));
}

#[test]
fn test_different_statement_types() {
    let test_cases = vec![
        ("SELECT * FROM users", "Select"),
        ("INSERT INTO users (name) VALUES ('John')", "Insert"),
        ("UPDATE users SET name = 'Jane' WHERE id = 1", "Update"),
        ("DELETE FROM users WHERE inactive = true", "Delete"),
        ("CREATE TABLE products (id INT, name VARCHAR(100))", "CreateTable"),
        ("DROP TABLE temp_table", "Drop"),
        ("ALTER TABLE users ADD COLUMN age INT", "AlterTable"),
    ];

    for (sql, expected_type) in test_cases {
        let result = parse_sql("postgresql", sql);
        assert!(result.is_ok(), "Failed to parse: {}", sql);
        
        let json = result.unwrap();
        assert!(json.contains(expected_type), "Expected '{}' in JSON for SQL: {}", expected_type, sql);
    }
}

#[test]
fn test_error_handling() {
    // Test invalid SQL
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
    assert!(error.contains("invalid_dialect"));
}

#[test]
fn test_case_insensitive_dialect() {
    let test_cases = vec![
        "PostgreSQL", "MYSQL", "SQLite", "GENERIC"
    ];
    
    for dialect in test_cases {
        let result = parse_sql(dialect, "SELECT * FROM users");
        assert!(result.is_ok(), "Failed with dialect: {}", dialect);
    }
}

#[test]
fn test_json_structure() {
    let result = parse_sql("postgresql", "SELECT id, name FROM users WHERE active = true");
    assert!(result.is_ok());
    
    let json = result.unwrap();
    
    // Verify it's valid JSON
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
    
    // Should be an array of statements
    assert!(parsed.is_array());
    
    // Should have at least one statement
    let statements = parsed.as_array().unwrap();
    assert!(!statements.is_empty());
}

#[test]
fn test_empty_sql() {
    let result = parse_sql("postgresql", "");
    assert!(result.is_ok()); // sqlparser handles empty strings gracefully
    
    let json = result.unwrap();
    let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
    
    // Should be an empty array
    assert!(parsed.is_array());
    let statements = parsed.as_array().unwrap();
    assert!(statements.is_empty());
}