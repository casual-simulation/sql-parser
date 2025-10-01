export * from '../pkg/sql_parser_wasm';
export * from './types';
import initWasm, { InitInput, initSync } from '../pkg/sql_parser_wasm';
import type { Span, Location } from './types';

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