//! Basic usage example for the SQL parser
//!
//! This example demonstrates how to use the sql-parser library to parse
//! various SQL statements and handle parsing results.

use sql_parser::{parse_sql, StatementType};

fn main() {
    println!("SQL Parser Basic Usage Example");
    println!("==============================\n");

    // Example SQL statements to parse
    let sql_statements = vec![
        "SELECT * FROM users WHERE id = 1",
        "INSERT INTO products (name, price) VALUES ('Widget', 19.99)",
        "UPDATE users SET email = 'new@example.com' WHERE id = 1",
        "DELETE FROM orders WHERE status = 'cancelled'",
        "CREATE TABLE customers (id INT, name VARCHAR(100))",
        "DROP TABLE temp_data",
        "ALTER TABLE users ADD COLUMN age INT",
        "EXPLAIN SELECT * FROM users",
        "",  // Empty statement to demonstrate error handling
    ];

    for (i, sql) in sql_statements.iter().enumerate() {
        println!("Example {}: {}", i + 1, if sql.is_empty() { "(empty statement)" } else { sql });
        
        match parse_sql(sql) {
            Ok(statement) => {
                let statement_type_str = match statement.statement_type {
                    StatementType::Select => "SELECT",
                    StatementType::Insert => "INSERT",
                    StatementType::Update => "UPDATE",
                    StatementType::Delete => "DELETE",
                    StatementType::Create => "CREATE",
                    StatementType::Drop => "DROP",
                    StatementType::Alter => "ALTER",
                    StatementType::Unknown => "UNKNOWN",
                };
                
                println!("  ✓ Parsed successfully!");
                println!("  Statement Type: {}", statement_type_str);
                println!("  Raw SQL: {}", statement.raw_sql);
            }
            Err(error) => {
                println!("  ✗ Parse error: {}", error);
            }
        }
        println!();
    }

    println!("Example completed!");
}