/**
 * A span in the source code, defined by start and end locations.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/struct.Span.html
 */
export interface Span {
    /**
     * The start location (inclusive).
     */
    start: Location;

    /**
     * The end location (exclusive).
     */
    end: Location;
}

/**
 * A location in the source code, defined by line and column numbers.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/struct.Location.html
 */
export interface Location {
    /**
     * 1-based line number
     * 
     * 0 means the location is unknown (e.g., for generated code).
     */
    line: number;

    /**
     * 1-based column number
     * 
     * 0 means the location is unknown (e.g., for generated code).
     */
    column: number;
}