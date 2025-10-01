import type { Ident, ObjectName } from "./ident";
import type { AttachedToken, Token, TypedString, Value, ValueWithSpan } from "./token";
import type { Query } from "./statement";
import type { Keyword } from "./keyword";
import type { DataType, StructField } from "./data-type";

/**
 * An SQL expression of any type.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Expr.html
 */
export type Expr = {
    /**
     * Identifier e.g. table name or column name
     */
    Identifier?: Ident;

    /**
     * Multi-part identifier, e.g. `table_alias.column` or `schema.table.col`
     */
    CompoundIdentifier?: Ident[];

    /**
     * Multi-part expression access.

        This structure represents an access chain in structured / nested types such as maps, arrays, and lists:

        - Array
            - A 1-dim array a[1] will be represented like: CompoundFieldAccess(Ident('a'), vec![Subscript(1)]
            - A 2-dim array a[1][2] will be represented like: CompoundFieldAccess(Ident('a'), vec![Subscript(1), Subscript(2)]
        - Map or Struct (Bracket-style)
            - A map a['field1'] will be represented like: CompoundFieldAccess(Ident('a'), vec![Subscript('field')]
            - A 2-dim map a['field1']['field2'] will be represented like: CompoundFieldAccess(Ident('a'), vec![Subscript('field1'), Subscript('field2')]
        - Struct (Dot-style) (only effect when the chain contains both subscript and expr)
            - A struct access a[field1].field2 will be represented like: CompoundFieldAccess(Ident('a'), vec![Subscript('field1'), Ident('field2')]
        - If a struct access likes a.field1.field2, it will be represented by CompoundIdentifier([a, field1, field2])
     */
    CompoundFieldAccess?: {
        root: Expr;
        access_chain: AccessExpr[];
    };

    JsonAccess?: {
        value: Expr;
        path: any;
    };

    /**
     * `IS FALSE` operator.
     */
    IsFalse?: Expr;

    /**
     * `IS NOT FALSE` operator.
     */
    IsNotFalse?: Expr;

    /**
     * `IS TRUE` operator.
     */
    IsTrue?: Expr;

    /**
     * `IS NOT TRUE` operator.
     */
    IsNotTrue?: Expr;

    /**
     * `IS NULL` operator.
     */
    IsNull?: Expr;

    /**
     * `IS NOT NULL` operator.
     */
    IsNotNull?: Expr;

    /**
     * `IS UNKNOWN` operator.
     */
    IsUnknown?: Expr;

    /**
     * `IS NOT UNKNOWN` operator.
     */
    IsNotUnknown?: Expr;

    /**
     * `IS DISTINCT FROM` operator.
     */
    IsDistinctFrom?: [Expr, Expr];

    /**
     * `IS NOT DISTINCT FROM` operator.
     */
    IsNotDistinctFrom?: [Expr, Expr],

    /**
     * `<expr> IS [ NOT ] [ form ] NORMALIZED`
     */
    IsNormalized?: {
        expr: Expr,
        form?: NormalizationForm,
        negated: boolean,
    };

    /**
     * `[ NOT ] IN (val1, val2, ...)`
     */
    InList?: {
        expr: Expr,
        list: Expr[],
        negated: boolean,
    };

    /**
     * `[ NOT ] IN (SELECT ...)`
     */
    InSubquery?: {
        expr: Expr,
        subquery: Expr,
        negated: boolean,
    };

    /**
     * `[ NOT ] IN UNNEST(array_expression)`
     */
    InUnnest?: {
        expr: Expr,
        array_expr: Expr,
        negated: boolean,
    };

    /**
     * `<expr> [ NOT ] BETWEEN <low> AND <high>`
     */
    Between?: {
        expr: Expr,
        negated: boolean,
        low: Expr,
        high: Expr,
    },

    /**
     * Binary operation e.g. `1 + 1` or `foo > bar`.
     */
    BinaryOp?: {
        left: Expr,
        op: BinaryOperator,
        right: Expr,
    },

    /**
     * `[NOT] LIKE <pattern> [ESCAPE <escape_character>]`
     */
    Like?: {
        negated: boolean,
        any: boolean,
        expr: Expr,
        pattern: Expr,
        escape_char: Value | undefined,
    },

    /**
     * `ILIKE` (case-insensitive `LIKE`)
     */
    ILike?: {
        negated: boolean,
        any: boolean,
        expr: Expr,
        pattern: Expr,
        escape_char: Value | undefined,
    },

    /**
     * `SIMILAR TO` regex.
     */
    SimilarTo?: {
        negated: boolean,
        expr: Expr,
        pattern: Expr,
        escape_char: Value | undefined,
    },

    /**
     * MySQL: `RLIKE` regex or `REGEXP` regex
     */
    RLike?: {
        negated: boolean,
        expr: Expr,
        pattern: Expr,
        regexp: boolean,
    },

    /**
     * `ANY` operation e.g. `foo > ANY(bar)`, comparison operator is one of `[=, >, <, =>, =<, !=]`
     */
    AnyOp?: {
        left: Expr,
        compare_op: BinaryOperator,
        right: Expr,
        is_some: boolean,
    },

    /**
     * `ALL` operation e.g. `foo > ALL(bar)`, comparison operator is one of `[=, >, <, =>, =<, !=]`
     */
    AllOp?: {
        left: Expr,
        compare_op: BinaryOperator,
        right: Expr,
    },

    /**
     * Unary operation e.g. `NOT foo`
     */
    UnaryOp?: {
        op: UnaryOperator,
        expr: Expr,
    },

    /**
     * `CONVERT` a value to a different data type or character encoding. e.g. `CONVERT(foo USING utf8mb4)`
     */
    Convert?: {
        is_try: boolean,
        expr: Expr,
        data_type?: DataType,
        charset?: ObjectName,
        target_before_value: boolean,
        styles: Expr[],
    },

    /**
     * `CAST` an expression to a different data type e.g. `CAST(foo AS VARCHAR(123))`
     */
    Cast?: {
        kind: CastKind,
        expr: Expr,
        data_type: DataType,
        format?: CastFormat,
    },

    /**
     * AT a timestamp to a different timezone e.g. `FROM_UNIXTIME(0) AT TIME ZONE 'UTC-06:00'`
     */
    AtTimeZone?: {
        timestamp: Expr,
        time_zone: Expr,
    },

    /**
     * Extract a field from a timestamp e.g. `EXTRACT(MONTH FROM foo)` Or `EXTRACT(MONTH, foo)`
     * 
     * ```EXTRACT(DateTimeField FROM <expr>) | EXTRACT(DateTimeField, <expr>)```
     */
    Extract?: {
        field: DateTimeField,
        syntax: ExtractSyntax,
        expr: Expr,
    },

    /**
     * ```CEIL( <input_expr> [, <scale_expr> ] )```
     */
    Ceil?: {
        expr: Expr,
        field: CeilFloorKind,
    },

    /**
     * ```FLOOR( <input_expr> [, <scale_expr> ] )```
     */
    Floor?: {
        expr: Expr,
        field: CeilFloorKind,
    },

    /**
     * ```POSITION(<expr> in <expr>)```
     */
    Position?: {
        expr: Expr,
        in: Expr,
    },
    /**
     * ```SUBSTRING(<expr>, <expr>, <expr>)```
     */
    Substring?: {
        expr: Expr,
        substring_from?: Expr,
        substring_for?: Expr,
        special: boolean,
        shorthand: boolean,
    },
    /**
     * ```
     * TRIM([BOTH | LEADING | TRAILING] [<expr> FROM] <expr>)
     * TRIM(<expr>)
     * TRIM(<expr>, [, characters]) -- only Snowflake or Bigquery
     * ```
     */
    Trim?: {
        expr: Expr,
        trim_where?: TrimWhereField,
        trim_what?: Expr,
        trim_characters?: Expr[],
    },
    Overlay?: {
        expr: Expr,
        overlay_what: Expr,
        overlay_from: Expr,
        overlay_for?: Expr,
    },
    Collate?: {
        expr: Expr,
        collation: ObjectName,
    },
    Nested?: Expr,
    Value?: ValueWithSpan,
    Prefixed?: {
        prefix: Ident,
        value: Expr,
    },
    TypedString?: TypedString,
    Function?: Function,
    Case?: {
        case_token: AttachedToken,
        end_token: AttachedToken,
        operand?: Expr,
        conditions: CaseWhen[],
        else_result?: Expr,
    },
    Exists?: {
        subquery: Query,
        negated: boolean,
    },
    Subquery?: Query,
    GroupingSets?: Expr[][],
    Cube?: Expr[][],
    Rollup?: Expr[][],
    Tuple?: Expr[],
    Struct?: {
        values: Expr[],
        fields: StructField[],
    },
    Named?: {
        expr: Expr,
        name: Ident,
    },
    Dictionary?: DictionaryField[],
    Map?: any,
    Array?: ArrayExpr,
    Interval?: Interval,
    MatchAgainst?: {
        columns: ObjectName[],
        match_value: Value,
        opt_search_modifier?: any,
    },
    Wildcard?: AttachedToken,
    QualifiedWildcard?: [ObjectName, AttachedToken],
    OuterJoin?: Expr,
    Prior?: Expr,
    Lambda?: LambdaFunction,
    MemberOf?: MemberOf,
};

/**
 * An element of a `Expr::CompoundFieldAccess`. It can be an expression or a subscript.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AccessExpr.html
 */
export type AccessExpr = {
    /**
     * Accesses a field using dot notation, e.g. foo.bar.baz.
     */
    Dot?: Expr;

    /**
     * Accesses a field or array element using bracket notation, e.g. `foo['bar']`.
     */
    Subscript?: Subscript;
}

/**
 * The contents inside the `[` and `]` in a subscript expression.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Subscript.html
 */
export type Subscript = {
    /**
     * Accesses the element of the array at the given index.
     */
    Index?: {
        index: Expr;
    },

    /**
     * Accesses a slice of an array on PostgreSQL, e.g.
     * 
     * ```
     * => select (array[1,2,3,4,5,6])[2:5];
-----------
{2,3,4,5}
     * ```
     *
     * The lower and/or upper bound can be omitted to slice from the start or end of the array respectively.
     * Also supports an optional “stride” as the last element (this is not supported by postgres), e.g.
     * 
     * ```
     * => select (array[1,2,3,4,5,6])[1:6:2];
-----------
{1,3,5}
     * ```
     */
    Slice?: {
        lower_bound?: Expr;
        upper_bound?: Expr;
        stride?: Expr;
    },
}

/**
 * The Unicode Standard defines four normalization forms, which are intended to eliminate certain distinctions between visually or functionally identical characters.
 * 
 * See [Unicode Normalization Forms](https://unicode.org/reports/tr15/) for details.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.NormalizationForm.html
 */
export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 * Binary operators
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.BinaryOperator.html
 */
export type BinaryOperator =
    | 'Plus'
    | 'Minus'
    | 'Multiply'
    | 'Divide'
    | 'Modulo'
    | 'StringConcat'
    | 'Gt'
    | 'Lt'
    | 'GtEq'
    | 'LtEq'
    | 'Spaceship'
    | 'Eq'
    | 'NotEq'
    | 'And'
    | 'Or'
    | 'Xor'
    | 'BitwiseOr'
    | 'BitwiseAnd'
    | 'BitwiseXor'
    | 'DuckIntegerDivide'
    | 'MyIntegerDivide'
    | 'Match'
    | 'Regexp'
    | 'Custom(String)'
    | 'PGBitwiseXor'
    | 'PGBitwiseShiftLeft'
    | 'PGBitwiseShiftRight'
    | 'PGExp'
    | 'PGOverlap'
    | 'PGRegexMatch'
    | 'PGRegexIMatch'
    | 'PGRegexNotMatch'
    | 'PGRegexNotIMatch'
    | 'PGLikeMatch'
    | 'PGILikeMatch'
    | 'PGNotLikeMatch'
    | 'PGNotILikeMatch'
    | 'PGStartsWith'
    | 'Arrow'
    | 'LongArrow'
    | 'HashArrow'
    | 'HashLongArrow'
    | 'AtAt'
    | 'AtArrow'
    | 'ArrowAt'
    | 'HashMinus'
    | 'AtQuestion'
    | 'Question'
    | 'QuestionAnd'
    | 'QuestionPipe'
    | 'PGCustomBinaryOperator(Vec<String>)'
    | 'Overlaps'
    | 'DoubleHash'
    | 'LtDashGt'
    | 'AndLt'
    | 'AndGt'
    | 'LtLtPipe'
    | 'PipeGtGt'
    | 'AndLtPipe'
    | 'PipeAndGt'
    | 'LtCaret'
    | 'GtCaret'
    | 'QuestionHash'
    | 'QuestionDash'
    | 'QuestionDashPipe'
    | 'QuestionDoublePipe'
    | 'At'
    | 'TildeEq'
    | 'Assignment';

/**
 * Unary operators.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.UnaryOperator.html
 */
export type UnaryOperator = 
    | 'Plus'
    | 'Minus'
    | 'Not'
    | 'PGBitwiseNot'
    | 'PGSquareRoot'
    | 'PGCubeRoot'
    | 'PGPostfixFactorial'
    | 'PGPrefixFactorial'
    | 'PGAbs'
    | 'BangNot'
    | 'Hash'
    | 'AtDashAt'
    | 'DoubleAt'
    | 'QuestionDash'
    | 'QuestionPipe';

/**
 * The syntax used for in a cast expression.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CastKind.html
 */
export type CastKind = 
    | 'Cast'
    | 'TryCast'
    | 'SafeCast'
    | 'DoubleColon';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CastFormat.html
 */
export type CastFormat = {
    Value?: Value;
    ValueAtTimeZone?: [Value, Value];
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DateTimeField.html
 */
export type DateTimeField = any; // TODO:

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ExtractSyntax.html
 */
export type ExtractSyntax = 'From' | 'Comma';

/**
 * The syntax used in a `CEIL` or `FLOOR` expression.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CeilFloorKind.html
 */
export type CeilFloorKind = {
    DateTimeField?: DateTimeField;
    Scale?: Value;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TrimWhereField.html
 */
export type TrimWhereField = 'Both' | 'Leading' | 'Trailing';

/**
 * A WHEN clause in a CASE expression containing both the condition and its corresponding result
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.CaseWhen.html
 */
export interface CaseWhen {
    condition: Expr;
    result: Expr;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.DictionaryField.html
 */
export type DictionaryField = any; // TODO:

/**
 * Represents an Array Expression, either `ARRAY[..]`, or `[..]`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Array.html
 */
export interface ArrayExpr {
    elem: Expr[];
    named: boolean;
}

/**
 * Represents an INTERVAL expression, roughly in the following format: `INTERVAL '<value>' [ <leading_field> [ (<leading_precision>) ] ] [ TO <last_field> [ (<fractional_seconds_precision>) ] ]`, e.g. `INTERVAL '123:45.67' MINUTE(3) TO SECOND(2)`.

  The parser does not validate the <value>, nor does it ensure that the <leading_field> units >= the units in <last_field>, so the user will have to reject intervals like HOUR TO YEAR.

  @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Interval.html
 */
export interface Interval {
    value: Expr;
    leading_field?: DateTimeField;
    leading_precision?: number;
    last_field?: DateTimeField;
    fractional_seconds_precision?: number;
}

/**
 * A lambda function.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.LambdaFunction.html
 */
export interface LambdaFunction {
    params: OneOrManyWithParens<Ident>;
    body: Expr;
}

/**
 * Encapsulates the common pattern in SQL where either one unparenthesized item such as an identifier or expression is permitted, or multiple of the same item in a parenthesized list. For accessing items regardless of the form, OneOrManyWithParens implements Deref<Target = [T]> and IntoIterator, so you can call slice methods on it and iterate over items.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OneOrManyWithParens.html
 */
export type OneOrManyWithParens<T> = {
    One?: T;
    Many?: T[];
}

/**
 * Checks membership of a value in a JSON array.
 * 
 * `<value> MEMBER OF(<array>)`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.MemberOf.html
 */
export interface MemberOf {
    value: Expr;
    array: Expr;
}
