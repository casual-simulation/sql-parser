import { initSync, parse_sql, SQLVisitor, visit } from '../pkg/sql_parser_wasm';
import { readFile } from 'node:fs/promises';
import {jest} from '@jest/globals';

beforeAll(async () => {
    let wasmPath = new URL(import.meta.resolve('../pkg/sql_parser_wasm_bg.wasm')).pathname;
    if (process.platform === 'win32' && wasmPath.startsWith('/')) {
        wasmPath = wasmPath.slice(1);
    }
    const bytes = await readFile(wasmPath);
    initSync({
        module: bytes
    });
});

it('should be able to parse some SQL', () => {
    const result = parse_sql("generic", "SELECT * FROM users;");

    expect(result).toMatchSnapshot();
});

it('should be able to parse insert SQL', () => {
    const result = parse_sql("generic", "INSERT INTO users (id, name) VALUES (1, 'Alice'), (2, 'Bob');");

    expect(result).toMatchSnapshot();
});

it('should be able to parse update SQL', () => {
    const result = parse_sql("generic", "UPDATE users SET name = 'Charlie' WHERE id = 1;");

    expect(result).toMatchSnapshot();
});

it('should be able to parse delete SQL', () => {
    const result = parse_sql("generic", "DELETE FROM users WHERE id = 2;");

    expect(result).toMatchSnapshot();
});

it('should support parameterized queries', () => {
    const result = parse_sql("generic", "SELECT * FROM users WHERE id = ?;");

    expect(result).toMatchSnapshot();
});

it('should be able to parse joins', () => {
    const result = parse_sql("generic", "SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id;");
    expect(result).toMatchSnapshot();
});

it('should throw errors when parsing invalid SQL', () => {
    expect(() => parse_sql("generic", "SELEC * FROM users;")).toThrow("sql parser error: Expected: an SQL statement, found: SELEC at Line: 1, Column: 1");
});

describe('visitor', () => {
    let visitor;
    let pre_visit_query;
    let post_visit_query;
    let pre_visit_relation;
    let post_visit_relation;
    let pre_visit_table_factor;
    let post_visit_table_factor;
    let pre_visit_expr;
    let post_visit_expr;
    let pre_visit_statement;
    let post_visit_statement;
    let pre_visit_value;
    let post_visit_value;

    beforeEach(() => {
        pre_visit_query = jest.fn();
        post_visit_query = jest.fn();
        pre_visit_relation = jest.fn();
        post_visit_relation = jest.fn();
        pre_visit_table_factor = jest.fn();
        post_visit_table_factor = jest.fn();
        pre_visit_expr = jest.fn();
        post_visit_expr = jest.fn();
        pre_visit_statement = jest.fn();
        post_visit_statement = jest.fn();
        pre_visit_value = jest.fn();
        post_visit_value = jest.fn();

        visitor = new SQLVisitor({
            pre_visit_query,
            post_visit_query,
            pre_visit_relation,
            post_visit_relation,
            pre_visit_table_factor,
            post_visit_table_factor,
            pre_visit_expr,
            post_visit_expr,
            pre_visit_statement,
            post_visit_statement,
            pre_visit_value,
            post_visit_value,
        });
    });

    it('should call visitor methods when visiting a statement', () => {
        const result = parse_sql("generic", "SELECT * FROM users;");
        expect(result.length).toBe(1);
        const statement = result[0];

        visit(visitor, statement);

        expect(pre_visit_statement).toHaveBeenCalledTimes(1);
        expect(post_visit_statement).toHaveBeenCalledTimes(1);
        expect(pre_visit_query).toHaveBeenCalledTimes(1);
        expect(post_visit_query).toHaveBeenCalledTimes(1);
        expect(pre_visit_relation).toHaveBeenCalledTimes(1);
        expect(post_visit_relation).toHaveBeenCalledTimes(1);
        expect(pre_visit_table_factor).toHaveBeenCalledTimes(1);
        expect(post_visit_table_factor).toHaveBeenCalledTimes(1);
        expect(pre_visit_expr).toHaveBeenCalledTimes(0);
        expect(post_visit_expr).toHaveBeenCalledTimes(0);
    });

    it('should call the statement visitors', () => {
        const result = parse_sql("generic", "SELECT * FROM users;");
        expect(result.length).toBe(1);
        const statement = result[0];

        visit(visitor, statement);

        expect(pre_visit_statement).toHaveBeenCalledTimes(1);
        expect(post_visit_statement).toHaveBeenCalledTimes(1);
        expect(pre_visit_statement).toHaveBeenCalledWith(statement);
        expect(post_visit_statement).toHaveBeenCalledWith(statement);
    });

    it('should call the query visitors', () => {
        const result = parse_sql("generic", "SELECT * FROM users;");
        expect(result.length).toBe(1);

        const statement = result[0];
        
        visit(visitor, statement);

        expect(pre_visit_query).toHaveBeenCalledTimes(1);
        expect(post_visit_query).toHaveBeenCalledTimes(1);
        expect(pre_visit_query).toHaveBeenCalledWith(statement.Query);
        expect(post_visit_query).toHaveBeenCalledWith(statement.Query);
    });

    it('should call the table factor visitors', () => {
        const result = parse_sql("generic", "SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id;");
        expect(result.length).toBe(1);

        const statement = result[0];
        
        visit(visitor, statement);

        expect(pre_visit_table_factor).toHaveBeenCalledTimes(2);
        expect(post_visit_table_factor).toHaveBeenCalledTimes(2);
        expect(pre_visit_table_factor).toHaveBeenCalledWith({
            Table: {
                index_hints: [],
                partitions: [],
                with_hints: [],
                with_ordinality: false,
                name: [
                    {
                        Identifier: {
                            value: 'users',
                            span: expect.any(Object)
                        }
                    }
                ]
            }
        });
        expect(pre_visit_table_factor).toHaveBeenCalledWith({
            Table: {
                index_hints: [],
                partitions: [],
                with_hints: [],
                with_ordinality: false,
                name: [
                    {
                        Identifier: {
                            value: 'orders',
                            span: expect.any(Object)
                        }
                    }
                ]
            }
        });
        expect(post_visit_table_factor).toHaveBeenCalledWith({
            Table: {
                index_hints: [],
                partitions: [],
                with_hints: [],
                with_ordinality: false,
                name: [
                    {
                        Identifier: {
                            value: 'users',
                            span: expect.any(Object)
                        }
                    }
                ]
            }
        });
        expect(post_visit_table_factor).toHaveBeenCalledWith({
            Table: {
                index_hints: [],
                partitions: [],
                with_hints: [],
                with_ordinality: false,
                name: [
                    {
                        Identifier: {
                            value: 'orders',
                            span: expect.any(Object)
                        }
                    }
                ]
            }
        });
    });

    it('should call the relation visitors', () => {
        const result = parse_sql("generic", "SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id;");
        expect(result.length).toBe(1);

        const statement = result[0];
        
        visit(visitor, statement);

        expect(pre_visit_relation).toHaveBeenCalledTimes(2);
        expect(post_visit_relation).toHaveBeenCalledTimes(2);
        expect(pre_visit_relation).toHaveBeenCalledWith([{
            Identifier: {
                value: 'users',
                span: expect.any(Object)
            }
        }]);
        expect(pre_visit_relation).toHaveBeenCalledWith([{
            Identifier: {
                value: 'orders',
                span: expect.any(Object)
            }
        }]);
        expect(post_visit_relation).toHaveBeenCalledWith([{
            Identifier: {
                value: 'users',
                span: expect.any(Object)
            }
        }]);
        expect(post_visit_relation).toHaveBeenCalledWith([{
            Identifier: {
                value: 'orders',
                span: expect.any(Object)
            }
        }]);
    });

    it('should call the value visitors', () => {
        const result = parse_sql("generic", "INSERT INTO users (id, name) VALUES (1, 'Alice'), (2, 'Bob');");
        expect(result.length).toBe(1);

        const statement = result[0];

        visit(visitor, statement);

        expect(pre_visit_value).toHaveBeenCalledTimes(4);
        expect(post_visit_value).toHaveBeenCalledTimes(4);
        expect(pre_visit_value).toHaveBeenCalledWith({ Number: [ "1", false ] });
        expect(pre_visit_value).toHaveBeenCalledWith({ Number: [ "2", false ] });
        expect(pre_visit_value).toHaveBeenCalledWith({ SingleQuotedString: "Alice" });
        expect(pre_visit_value).toHaveBeenCalledWith({ SingleQuotedString: "Bob" });
    });

    it('should call the expr visitors', () => {
        const result = parse_sql("generic", "SELECT * FROM users WHERE id = 1 AND name = 'Alice';");
        expect(result.length).toBe(1);

        const statement = result[0];
        visit(visitor, statement);

        expect(pre_visit_expr).toHaveBeenCalledTimes(7);
        expect(post_visit_expr).toHaveBeenCalledTimes(7);
    });
});