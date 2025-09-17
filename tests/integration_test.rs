//! Integration tests for the SQL parser library
//!
//! These tests verify the public API and ensure the library works
//! correctly when used as an external dependency.

use sql_parser::{parse_sql, SqlParseError, StatementType};

#[test]
fn test_public_api_basic_usage() {
    // Test that all public types are accessible and work correctly
    let sql = "SELECT name, email FROM users WHERE active = true";
    let result = parse_sql(sql);
    
    assert!(result.is_ok());
    let statement = result.unwrap();
    
    assert_eq!(statement.statement_type, StatementType::Select);
    assert_eq!(statement.raw_sql, sql);
}

#[test]
fn test_error_handling() {
    // Test error handling
    let result = parse_sql("");
    assert!(result.is_err());
    
    let error = result.unwrap_err();
    assert_eq!(error.message, "Empty SQL statement");
    assert_eq!(error.position, None);
}

#[test]
fn test_all_statement_types() {
    let test_cases = vec![
        ("SELECT 1", StatementType::Select),
        ("INSERT INTO t VALUES (1)", StatementType::Insert),
        ("UPDATE t SET x = 1", StatementType::Update),
        ("DELETE FROM t", StatementType::Delete),
        ("CREATE TABLE t (id INT)", StatementType::Create),
        ("DROP TABLE t", StatementType::Drop),
        ("ALTER TABLE t ADD COLUMN x INT", StatementType::Alter),
        ("SHOW TABLES", StatementType::Unknown),
    ];

    for (sql, expected_type) in test_cases {
        let result = parse_sql(sql);
        assert!(result.is_ok(), "Failed to parse: {}", sql);
        
        let statement = result.unwrap();
        assert_eq!(statement.statement_type, expected_type, "Wrong type for: {}", sql);
        assert_eq!(statement.raw_sql, sql);
    }
}

#[test]
fn test_error_display() {
    let error = SqlParseError {
        message: "Test error".to_string(),
        position: Some(5),
    };
    
    let display_str = format!("{}", error);
    assert!(display_str.contains("Test error"));
    assert!(display_str.contains("position 5"));
    
    let error_without_pos = SqlParseError {
        message: "Test error".to_string(),
        position: None,
    };
    
    let display_str = format!("{}", error_without_pos);
    assert_eq!(display_str, "SQL parse error: Test error");
}

#[test]
fn test_statement_types_debug() {
    // Ensure all statement types implement Debug correctly
    let types = vec![
        StatementType::Select,
        StatementType::Insert,
        StatementType::Update,
        StatementType::Delete,
        StatementType::Create,
        StatementType::Drop,
        StatementType::Alter,
        StatementType::Unknown,
    ];

    for statement_type in types {
        let debug_str = format!("{:?}", statement_type);
        assert!(!debug_str.is_empty());
    }
}