export * from '../pkg/sql_parser_wasm';
import initWasm, { InitInput, initSync } from '../pkg/sql_parser_wasm';

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

export interface Span {
    start: Location;
    end: Location;
}

export interface Location {
    line: number;   // 1-based line number
    column: number;
}

export function loc(line: number = 0, column: number = 0): Location {
    return { line, column };
}

export function span(start: Location = loc(), end: Location = loc()): Span {
    return { start, end };
}