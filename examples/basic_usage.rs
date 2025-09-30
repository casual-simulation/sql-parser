//! Basic usage example for the SQL parser
//!
//! This example demonstrates how to use the sql-parser library to parse
//! various SQL statements using different dialects and convert them to JSON.

use sql_parser_wasm::parse_sql;

fn main() {
    println!("SQL Parser Basic Usage Example");
    println!("==============================\n");

    // Example SQL statements with different dialects
    let examples = vec![
        ("postgresql", "SELECT * FROM users WHERE id = 1"),
        ("mysql", "INSERT INTO products (name, price) VALUES ('Widget', 19.99)"),
        ("sqlite", "UPDATE users SET email = 'new@example.com' WHERE id = 1"),
        ("generic", "DELETE FROM orders WHERE status = 'cancelled'"),
        ("mssql", "SELECT TOP 10 * FROM customers ORDER BY created_at DESC"),
        ("bigquery", "SELECT COUNT(*) as total FROM `project.dataset.table`"),
        ("snowflake", "CREATE OR REPLACE TABLE temp_data AS SELECT * FROM source_table"),
        (
            "postgresql", 
            "SELECT u.name, COUNT(o.id) as order_count 
             FROM users u 
             LEFT JOIN orders o ON u.id = o.user_id 
             WHERE u.active = true 
             GROUP BY u.name 
             HAVING COUNT(o.id) > 5 
             ORDER BY order_count DESC"
        ),
    ];

    for (i, (dialect, sql)) in examples.iter().enumerate() {
        println!("Example {}: Parsing with {} dialect", i + 1, dialect);
        println!("SQL: {}", sql);
        
        match parse_sql(dialect, sql) {
            Ok(json_ast) => {
                println!("✓ Parsed successfully!");
                println!("JSON AST (first 200 chars):");
                let preview = if json_ast.len() > 200 {
                    format!("{}...", &json_ast[..200])
                } else {
                    json_ast.clone()
                };
                println!("{}", preview);
            }
            Err(error) => {
                println!("✗ Parse error: {}", error);
            }
        }
        println!("{}", "─".repeat(60));
    }

    // Demonstrate error handling
    println!("\nError Handling Examples:");
    println!("========================\n");

    // Invalid SQL
    println!("Example: Invalid SQL");
    match parse_sql("postgresql", "SELEC * FRO users") {
        Ok(_) => println!("Unexpected success!"),
        Err(error) => println!("✓ Expected error: {}", error),
    }

    // Invalid dialect
    println!("\nExample: Invalid dialect");
    match parse_sql("invalid_dialect", "SELECT * FROM users") {
        Ok(_) => println!("Unexpected success!"),
        Err(error) => println!("✓ Expected error: {}", error),
    }

    println!("\nExample completed!");
}