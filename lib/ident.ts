import type { FunctionArg } from "./function";
import type { Span } from "./span";

/**
 * A name of a table, view, custom type, etc., possibly multi-part, i.e. `db.schema.obj`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ObjectName.html
 */
export type ObjectName = ObjectNamePart[];

/**
 * A single part of an ObjectName
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ObjectNamePart.html
 */
export type ObjectNamePart = {
    Identifier?: Ident;
    Function?: ObjectNamePartFunction;
};

/**
 * An identifier, decomposed into its value or character data and the quote style.
 */
export interface Ident {
    value: string;
    quote_style?: string;
    span: Span;
}

/**
 * An object name part that consists of a function that dynamically constructs identifiers.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ObjectNamePartFunction.html
 */
export interface ObjectNamePartFunction {
    name: Ident;
    args: FunctionArg[];
}


export type Value = {
    Number: [String, boolean];
    SingleQuotedString(String),
    DollarQuotedString(DollarQuotedString),
    TripleSingleQuotedString(String),
    TripleDoubleQuotedString(String),
    EscapedStringLiteral(String),
    UnicodeStringLiteral(String),
    SingleQuotedByteStringLiteral(String),
    DoubleQuotedByteStringLiteral(String),
    TripleSingleQuotedByteStringLiteral(String),
    TripleDoubleQuotedByteStringLiteral(String),
    SingleQuotedRawStringLiteral(String),
    DoubleQuotedRawStringLiteral(String),
    TripleSingleQuotedRawStringLiteral(String),
    TripleDoubleQuotedRawStringLiteral(String),
    NationalStringLiteral(String),
    HexStringLiteral(String),
    DoubleQuotedString(String),
    Boolean(bool),
    Null,
    Placeholder(String),
}
