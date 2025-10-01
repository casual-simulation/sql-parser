import { DataType } from "./data-type";
import type { Keyword } from "./keyword";
import type { Span } from "./span";

/**
 * A simple SQL token without associated data.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/enum.Token.html
 */
export type SimpleToken = 
    | 'EOF'
    | 'Comma'
    | 'DoubleEq'
    | 'Eq'
    | 'Neq'
    | 'Lt'
    | 'Gt'
    | 'LtEq'
    | 'GtEq'
    | 'Spaceship'
    | 'Plus'
    | 'Minus'
    | 'Mul'
    | 'Div'
    | 'DuckIntDiv'
    | 'Mod'
    | 'StringConcat'
    | 'LParen'
    | 'RParen'
    | 'Period'
    | 'Colon'
    | 'DoubleColon'
    | 'Assignment'
    | 'SemiColon'
    | 'Backslash'
    | 'LBracket'
    | 'RBracket'
    | 'Ampersand'
    | 'Pipe'
    | 'Caret'
    | 'LBrace'
    | 'RBrace'
    | 'RArrow'
    | 'Sharp'
    | 'DoubleSharp'
    | 'Tilde'
    | 'TildeAsterisk'
    | 'ExclamationMarkTilde'
    | 'ExclamationMarkTildeAsterisk'
    | 'DoubleTilde'
    | 'DoubleTildeAsterisk'
    | 'ExclamationMarkDoubleTilde'
    | 'ExclamationMarkDoubleTildeAsterisk'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'Overlap'
    | 'ExclamationMark'
    | 'DoubleExclamationMark'
    | 'AtSign'
    | 'CaretAt'
    | 'PGSquareRoot'
    | 'PGCubeRoot'
    | 'Arrow'
    | 'LongArrow'
    | 'HashArrow'
    | 'AtDashAt'
    | 'QuestionMarkDash'
    | 'AmpersandLeftAngleBracket'
    | 'AmpersandRightAngleBracket'
    | 'AmpersandLeftAngleBracketVerticalBar'
    | 'VerticalBarAmpersandRightAngleBracket'
    | 'TwoWayArrow'
    | 'LeftAngleBracketCaret'
    | 'RightAngleBracketCaret'
    | 'QuestionMarkSharp'
    | 'QuestionMarkDashVerticalBar'
    | 'QuestionMarkDoubleVerticalBar'
    | 'TildeEqual'
    | 'ShiftLeftVerticalBar'
    | 'VerticalBarShiftRight'
    | 'VerticalBarRightAngleBracket'
    | 'HashLongArrow'
    | 'AtArrow'
    | 'ArrowAt'
    | 'HashMinus'
    | 'AtQuestion'
    | 'AtAt'
    | 'Question'
    | 'QuestionAnd'
    | 'QuestionPipe';
    

/**
 * A SQL token, which can be a simple token or a more complex token with associated data.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/enum.Token.html
 */
export type Token = SimpleToken | {
    /**
     * A keyword or optionally quoted identifier.
     */
    Word?: Word;

    /**
     * An unsigned numeric literal.
     */
    Number?: [string, boolean];

    /**
     * A character that could not be tokenized.
     */
    Char?: string;

    /**
     * Single quoted string. i.e. 'string'
     */
    SingleQuotedString?: string;

    /**
     * A double quoted string. i.e. "string"
     */
    DoubleQuotedString?: string;

    /**
     * A triple single quoted string. i.e. '''string'''
     */
    TripleSingleQuotedString?: string;

    /**
     * A triple double quoted string. i.e. """string"""
     */
    TripleDoubleQuotedString?: string;

    /**
     * A dollar quoted string. i.e. $$string$$ or $tag$string$tag$
     */
    DollarQuotedString?: DollarQuotedString;

    /**
     * Byte string literal: i.e: b’string’ or B’string’ (note that some backends, such as PostgreSQL, may treat this syntax as a bit string literal instead, i.e: b’10010101’)
     */
    SingleQuotedByteStringLiteral?: string;

    /**
     * Byte string literal: i.e: b“string“ or B“string“
     */
    DoubleQuotedByteStringLiteral?: string;

    /**
     * Triple single quoted literal with byte string prefix. Example B'''abc''' BigQuery
     */
    TripleSingleQuotedByteStringLiteral?: string;
    
    /**
     * Triple double quoted literal with byte string prefix. Example B"""abc""" BigQuery
     */
    TripleDoubleQuotedByteStringLiteral?: string;

    /**
     * Single quoted literal with raw string prefix. Example R'abc' BigQuery
     */
    SingleQuotedRawStringLiteral?: string;

    /**
     * Double quoted literal with raw string prefix. Example R"abc" BigQuery
     */
    DoubleQuotedRawStringLiteral?: string;

    /**
     * Triple single quoted literal with raw string prefix. Example R'''abc''' BigQuery
     */
    TripleSingleQuotedRawStringLiteral?: string;

    /**
     * Triple double quoted literal with raw string prefix. Example R"""abc""" BigQuery
     */
    TripleDoubleQuotedRawStringLiteral?: string;

    /**
     * “National” string literal: i.e: N’string’
     */
    NationalStringLiteral?: string;

    /**
     * “escaped” string literal, which are an extension to the SQL standard: i.e: e’first \n second’ or E ‘first \n second’
     */
    EscapedStringLiteral?: string;

    /**
     * Unicode string literal: i.e: U&‘first \000A second’
     */
    UnicodeStringLiteral?: string;

    /**
     * Hexadecimal string literal: i.e.: X’deadbeef’
     */
    HexStringLiteral?: string;

    /**
     * Whitespace (space, tab, etc)
     */
    Whitespace?: Whitespace;

    /**
     * ? or $ , a prepared statement arg placeholder
     */
    Placeholder?: string;

    /**
     * Custom binary operator This is used to represent any custom binary operator that is not part of the SQL standard. PostgreSQL allows defining custom binary operators using CREATE OPERATOR.
     */
    CustomBinaryOperator?: string;
};

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.DollarQuotedString.html
 */
export interface DollarQuotedString {
    value: string;
    tag?: string;
}

/**
 * Represents whitespace in SQL, including spaces, newlines, tabs, and comments.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/enum.Whitespace.html
 */
export type Whitespace = 'Space' | 'Newline' | 'Tab' | {
    SingleLineComment?: string;
    MultiLineComment?: string;
}

/**
 * A SQL keyword (like SELECT) or an optionally quoted SQL identifier.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/struct.Word.html
 */
export interface Word {
    /**
     * The value of the token, without the enclosing quotes (if any) and with escape sequences (if any) processed.
     */
    value: string;

    /**
     * If the word was not quoted and it matched a known SQL keyword, this field contains the corresponding `Keyword` enum value.
     */
    keyword: Keyword;

    /**
     * The kind of quotes used, if any.
     */
    quote_style?: string;
}

/**
 * A token with a span attached to it.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/tokenizer/struct.TokenWithSpan.html
 */
export interface TokenWithSpan {
    token: string;
    span: Span;
}

/**
 * A token with a span attached to it.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/helpers/attached_token/struct.AttachedToken.html
 */
export type AttachedToken = TokenWithSpan;

/**
 * Primitive SQL values such as number and string.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Value.html
 */
export type Value = 'Null' | {
     /**
     * An unsigned numeric literal.
     */
    Number?: [string, boolean];

    /**
     * A character that could not be tokenized.
     */
    Char?: string;

    /**
     * Single quoted string. i.e. 'string'
     */
    SingleQuotedString?: string;

    /**
     * A double quoted string. i.e. "string"
     */
    DoubleQuotedString?: string;

    /**
     * A triple single quoted string. i.e. '''string'''
     */
    TripleSingleQuotedString?: string;

    /**
     * A triple double quoted string. i.e. """string"""
     */
    TripleDoubleQuotedString?: string;

    /**
     * A dollar quoted string. i.e. $$string$$ or $tag$string$tag$
     */
    DollarQuotedString?: DollarQuotedString;

    /**
     * Byte string literal: i.e: b’string’ or B’string’ (note that some backends, such as PostgreSQL, may treat this syntax as a bit string literal instead, i.e: b’10010101’)
     */
    SingleQuotedByteStringLiteral?: string;

    /**
     * Byte string literal: i.e: b“string“ or B“string“
     */
    DoubleQuotedByteStringLiteral?: string;

    /**
     * Triple single quoted literal with byte string prefix. Example B'''abc''' BigQuery
     */
    TripleSingleQuotedByteStringLiteral?: string;
    
    /**
     * Triple double quoted literal with byte string prefix. Example B"""abc""" BigQuery
     */
    TripleDoubleQuotedByteStringLiteral?: string;

    /**
     * Single quoted literal with raw string prefix. Example R'abc' BigQuery
     */
    SingleQuotedRawStringLiteral?: string;

    /**
     * Double quoted literal with raw string prefix. Example R"abc" BigQuery
     */
    DoubleQuotedRawStringLiteral?: string;

    /**
     * Triple single quoted literal with raw string prefix. Example R'''abc''' BigQuery
     */
    TripleSingleQuotedRawStringLiteral?: string;

    /**
     * Triple double quoted literal with raw string prefix. Example R"""abc""" BigQuery
     */
    TripleDoubleQuotedRawStringLiteral?: string;

    /**
     * “National” string literal: i.e: N’string’
     */
    NationalStringLiteral?: string;

    /**
     * “escaped” string literal, which are an extension to the SQL standard: i.e: e’first \n second’ or E ‘first \n second’
     */
    EscapedStringLiteral?: string;

    /**
     * Unicode string literal: i.e: U&‘first \000A second’
     */
    UnicodeStringLiteral?: string;

    /**
     * Hexadecimal string literal: i.e.: X’deadbeef’
     */
    HexStringLiteral?: string;
    
    /**
     * Boolean value true or false.
     */
    Boolean?: boolean;

    /**
     * `?` or `$` Prepared statement arg placeholder
     */
    Placeholder?: string;
}

/**
 * Wraps a primitive SQL Value with its Span location.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ValueWithSpan.html
 */
export interface ValueWithSpan {
    value: Value;
    span: Span;
}

/**
 * A constant of form `<data_type> 'value'`.
 * This can represent ANSI SQL `DATE`, `TIME`, and `TIMESTAMP` literals (such as `DATE '2020-01-01'`), as well as constants of other types (a non-standard PostgreSQL extension).
 */
export interface TypedString {
    data_type: DataType;
    value: ValueWithSpan;
    uses_odbc_syntax: boolean;
}