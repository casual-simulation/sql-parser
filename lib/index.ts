import { parse_sql, format as format_sql, SQLVisitor as InternalSQLVisitor } from '../pkg/sql_parser_wasm';
export * from './types';
import initWasm, { InitInput, initSync } from '../pkg/sql_parser_wasm';
import type { Span, Location, Statement, Query, ObjectName, TableFactor, Expr, Value } from './types';

export interface SQLVisitorConfig {
    pre_visit_query?: (query: Query) => void;
    post_visit_query?: (query: Query) => void;
    
    pre_visit_relation?:(relation: ObjectName) => void;
    post_visit_relation?:(relation: ObjectName) => void;

    pre_visit_table_factor?: (table_factor: TableFactor) => void;
    post_visit_table_factor?: (table_factor: TableFactor) => void;

    pre_visit_expr?: (expr: Expr) => void;
    post_visit_expr?: (expr: Expr) => void;

    pre_visit_statement?: (statement: Statement) => void;
    post_visit_statement?: (statement: Statement) => void;

    pre_visit_value?: (value: Value) => void;
    post_visit_value?: (value: Value) => void;
}

export class SQLVisitor {
    private _internalVisitor: InternalSQLVisitor;
    
    constructor(config: SQLVisitorConfig) {
        this._internalVisitor = new InternalSQLVisitor(config);
    }

    visit(statement: Statement): void {
        this._internalVisitor.visit(statement);
    }
}

/**
 * Initializes the WASM module.
 */
export async function init(moduleOrPath?: InitInput | Promise<InitInput>) {
    if (typeof globalThis.process === 'object' && !moduleOrPath) {
        console.log('Running in Node.js environment, loading WASM from filesystem...');
        let wasmPath = new URL(import.meta.resolve('../pkg/sql_parser_wasm_bg.wasm')).pathname;
        // let wasmPath = require.resolve('../pkg/sql_parser_wasm_bg.wasm');
        if (process.platform === 'win32' && wasmPath.startsWith('/')) {
            wasmPath = wasmPath.slice(1);
        }
        const { readFile } = await import('node:fs/promises');
        const bytes = await readFile(wasmPath);
        return initSync({
            module: bytes
        });
    } else {
        return await initWasm(moduleOrPath);
    }
}


/**
 * Creates a new location object.
 * @param line The 1-based line number. 0 means unknown.
 * @param column The 1-based column number. 0 means unknown.
 * @returns A new location object.
 */
export function loc(line: number = 0, column: number = 0): Location {
    return { line, column };
}

/**
 * Creates a new span object.
 * @param start The start location (inclusive). Defaults to unknown location.
 * @param end The end location (exclusive). Defaults to unknown location.
 * @returns A new span object.
 */
export function span(start: Location = loc(), end: Location = loc()): Span {
    return { start, end };
}

/**
 * Parses the given SQL string into an array of statements.
 * @param sql The SQL string to parse.
 * @param dialect The SQL dialect to use. Defaults to 'generic'.
 */
export function parse(sql: string, dialect: string = 'generic'): Statement[] {
    return parse_sql(dialect, sql);
}

/**
 * Formats the given statement into a SQL string.
 * @param statement The statement to format.
 */
export function format(statement: Statement): string {
    return format_sql(statement);
}