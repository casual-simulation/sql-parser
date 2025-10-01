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
//! 

use core::ops::ControlFlow;

use sqlparser::dialect::{
    Dialect, GenericDialect, PostgreSqlDialect, MySqlDialect, SQLiteDialect,
    MsSqlDialect, SnowflakeDialect, RedshiftSqlDialect, BigQueryDialect,
    ClickHouseDialect, HiveDialect
};
use sqlparser::parser::{Parser, ParserError};
use sqlparser::ast::{Statement, Query, ObjectName, TableFactor, Expr, Value, Visitor, Visit};

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


#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub struct SQLVisitor {
    pre_visit_query: js_sys::Function,
    post_visit_query: js_sys::Function,

    pre_visit_relation: js_sys::Function,
    post_visit_relation: js_sys::Function,

    pre_visit_table_factor: js_sys::Function,
    post_visit_table_factor: js_sys::Function,

    pre_visit_expr: js_sys::Function,
    post_visit_expr: js_sys::Function,

    pre_visit_statement: js_sys::Function,
    post_visit_statement: js_sys::Function,
    
    pre_visit_value: js_sys::Function,
    post_visit_value: js_sys::Function,
}

fn get_function(config: &js_sys::Object, name: &str) -> js_sys::Function {
    let func = js_sys::Reflect::get(config, &JsValue::from_str(name)).unwrap_or(JsValue::UNDEFINED);
    func.unchecked_into()
}

#[wasm_bindgen]
impl SQLVisitor {

    #[wasm_bindgen(constructor)]
    pub fn create_visitor(config: js_sys::Object) -> SQLVisitor {
        SQLVisitor {
            pre_visit_query: get_function(&config, "pre_visit_query"),
            post_visit_query: get_function(&config, "post_visit_query"),
            pre_visit_relation: get_function(&config, "pre_visit_relation"),
            post_visit_relation: get_function(&config, "post_visit_relation"),
            pre_visit_table_factor: get_function(&config, "pre_visit_table_factor"),
            post_visit_table_factor: get_function(&config, "post_visit_table_factor"),
            pre_visit_expr: get_function(&config, "pre_visit_expr"),
            post_visit_expr: get_function(&config, "post_visit_expr"),
            pre_visit_statement: get_function(&config, "pre_visit_statement"),
            post_visit_statement: get_function(&config, "post_visit_statement"),
            pre_visit_value: get_function(&config, "pre_visit_value"),
            post_visit_value: get_function(&config, "post_visit_value")
        }
    }

    #[wasm_bindgen]
    pub fn visit(&mut self, statement: &JsValue) {
        let statement: Statement = serde_wasm_bindgen::from_value(statement.clone()).unwrap();
        let _ = statement.visit(self);
    }

    fn call(func: &js_sys::Function, value: &JsValue) -> ControlFlow<<SQLVisitor as Visitor>::Break> {
        if func.is_undefined() || func.is_null() {
            return ControlFlow::Continue(());
        }
        let res = func.call1(&JsValue::NULL, value).unwrap();
        SQLVisitor::break_or_continue(res)
    }

    fn break_or_continue(res: JsValue) -> ControlFlow<<SQLVisitor as Visitor>::Break> {
        if res.is_undefined() || res.is_null() || res.as_bool() == Some(true) {
            ControlFlow::Continue(())
        } else {
            ControlFlow::Break(res)
        }
    }
}

impl Visitor for SQLVisitor {
    type Break = JsValue;

    // Provided methods
    fn pre_visit_query(&mut self, _query: &Query) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.pre_visit_query, &serde_wasm_bindgen::to_value(_query).unwrap())
    }

    fn post_visit_query(&mut self, _query: &Query) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.post_visit_query, &serde_wasm_bindgen::to_value(_query).unwrap())
    }

    fn pre_visit_relation(
        &mut self,
        _relation: &ObjectName,
    ) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.pre_visit_relation, &serde_wasm_bindgen::to_value(_relation).unwrap())
    }
    fn post_visit_relation(
        &mut self,
        _relation: &ObjectName,
    ) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.post_visit_relation, &serde_wasm_bindgen::to_value(_relation).unwrap())
    }
    fn pre_visit_table_factor(
        &mut self,
        _table_factor: &TableFactor,
    ) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.pre_visit_table_factor, &serde_wasm_bindgen::to_value(_table_factor).unwrap())
    }
    fn post_visit_table_factor(
        &mut self,
        _table_factor: &TableFactor,
    ) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.post_visit_table_factor, &serde_wasm_bindgen::to_value(_table_factor).unwrap())
    }
    fn pre_visit_expr(&mut self, _expr: &Expr) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.pre_visit_expr, &serde_wasm_bindgen::to_value(_expr).unwrap())
     }
    fn post_visit_expr(&mut self, _expr: &Expr) -> ControlFlow<Self::Break> {
        SQLVisitor::call(&self.post_visit_expr, &serde_wasm_bindgen::to_value(_expr).unwrap())
    }

    fn pre_visit_statement(
        &mut self,
        _statement: &Statement,
    ) -> ControlFlow<Self::Break> { 
        SQLVisitor::call(&self.pre_visit_statement, &serde_wasm_bindgen::to_value(_statement).unwrap())
    }

    fn post_visit_statement(
        &mut self,
        _statement: &Statement,
    ) -> ControlFlow<Self::Break> { 
        SQLVisitor::call(&self.post_visit_statement, &serde_wasm_bindgen::to_value(_statement).unwrap())
    }

    fn pre_visit_value(&mut self, _value: &Value) -> ControlFlow<Self::Break> { 
        SQLVisitor::call(&self.pre_visit_value, &serde_wasm_bindgen::to_value(_value).unwrap())
    }

    fn post_visit_value(&mut self, _value: &Value) -> ControlFlow<Self::Break> { 
        SQLVisitor::call(&self.post_visit_value, &serde_wasm_bindgen::to_value(_value).unwrap())
    }
}

#[wasm_bindgen]
pub fn visit(visitor: &mut SQLVisitor, statement: &JsValue) {
    let statement: Statement = serde_wasm_bindgen::from_value(statement.clone()).unwrap();
    let _ = statement.visit(visitor);
}