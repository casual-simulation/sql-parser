use wasm_bindgen_test::*;
use sql_parser_wasm::{ parse_sql };

#[wasm_bindgen_test]
fn test_parse_simple_select() {
    let result = parse_sql("postgresql".into(), "SELECT * FROM users".into());
    assert!(result.is_ok());

    let ast = result.unwrap();
    assert!(ast.is_array());

    let statements = js_sys::Array::from(&ast);
    
    let len = statements.length();
    assert_eq!(len, 1);

    let first_statement = statements.get(0);
    assert!(first_statement.is_object());

    let query = js_sys::Reflect::get(&first_statement, &"Query".into()).unwrap();

    assert!(query.is_object());

    let body = js_sys::Reflect::get(&query, &"body".into()).unwrap();
    let select = js_sys::Reflect::get(&body, &"Select".into()).unwrap();

    assert!(select.is_object());

    let from = js_sys::Reflect::get(&select, &"from".into()).unwrap();

    assert!(from.is_array());

    let from_array = js_sys::Array::from(&from);

    assert_eq!(from_array.length(), 1);

    let table_with_joins = from_array.get(0);
    assert!(table_with_joins.is_object());

    let relation = js_sys::Reflect::get(&table_with_joins, &"relation".into()).unwrap();
    assert!(relation.is_object());

    let table = js_sys::Reflect::get(&relation, &"Table".into()).unwrap();

    assert!(table.is_object());

    let name = js_sys::Reflect::get(&table, &"name".into()).unwrap();
    assert!(name.is_array());

    let name_array = js_sys::Array::from(&name);

    assert_eq!(name_array.length(), 1);

    let first_ident = name_array.get(0);
    assert!(first_ident.is_object());

    // keys of first_ident should include "value"
    let first_ident = js_sys::Object::from(first_ident);

    let ident = js_sys::Reflect::get(&first_ident, &"Identifier".into()).unwrap();
    // let keys = js_sys::Object::keys(&first_ident);
    // web_sys::console::log_1(&keys);

    let value = js_sys::Reflect::get(&ident, &"value".into()).unwrap();
    assert_eq!(value.as_string().unwrap(), "users");
}
