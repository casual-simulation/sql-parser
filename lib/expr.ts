import type { Ident, ObjectName } from "./ident";
import type { AttachedToken, Value } from "./token";
import type { Query } from "./statement";

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
    Cast?: {
        kind: CastKind,
        expr: Expr,
        data_type: DataType,
        format?: CastFormat,
    },
    AtTimeZone?: {
        timestamp: Expr,
        time_zone: Expr,
    },
    Extract?: {
        field: DateTimeField,
        syntax: ExtractSyntax,
        expr: Expr,
    },
    Ceil?: {
        expr: Expr,
        field: CeilFloorKind,
    },
    Floor?: {
        expr: Expr,
        field: CeilFloorKind,
    },
    Position?: {
        expr: Expr,
        in: Expr,
    },
    Substring?: {
        expr: Expr,
        substring_from?: Expr,
        substring_for?: Expr,
        special: boolean,
        shorthand: boolean,
    },
    Trim?: {
        expr: Expr,
        trim_where?: TrimWhereField,
        trim_what?: Expr,
        trim_characters?: Vec<Expr>,
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
    Map?: Map,
    Array?: Array,
    Interval?: Interval,
    MatchAgainst?: {
        columns: ObjectName[],
        match_value: Value,
        opt_search_modifier?: SearchModifier,
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
 * SQL data types.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DataType.html
 */
export type DataType = {
    Table(Option<Vec<ColumnDef>>),
    NamedTable {
        name: ObjectName,
        columns: Vec<ColumnDef>,
    },
    Character(Option<CharacterLength>),
    Char(Option<CharacterLength>),
    CharacterVarying(Option<CharacterLength>),
    CharVarying(Option<CharacterLength>),
    Varchar(Option<CharacterLength>),
    Nvarchar(Option<CharacterLength>),
    Uuid,
    CharacterLargeObject(Option<u64>),
    CharLargeObject(Option<u64>),
    Clob(Option<u64>),
    Binary(Option<u64>),
    Varbinary(Option<BinaryLength>),
    Blob(Option<u64>),
    TinyBlob,
    MediumBlob,
    LongBlob,
    Bytes(Option<u64>),
    Numeric(ExactNumberInfo),
    Decimal(ExactNumberInfo),
    DecimalUnsigned(ExactNumberInfo),
    BigNumeric(ExactNumberInfo),
    BigDecimal(ExactNumberInfo),
    Dec(ExactNumberInfo),
    DecUnsigned(ExactNumberInfo),
    Float(ExactNumberInfo),
    FloatUnsigned(ExactNumberInfo),
    TinyInt(Option<u64>),
    TinyIntUnsigned(Option<u64>),
    UTinyInt,
    Int2(Option<u64>),
    Int2Unsigned(Option<u64>),
    SmallInt(Option<u64>),
    SmallIntUnsigned(Option<u64>),
    USmallInt,
    MediumInt(Option<u64>),
    MediumIntUnsigned(Option<u64>),
    Int(Option<u64>),
    Int4(Option<u64>),
    Int8(Option<u64>),
    Int16,
    Int32,
    Int64,
    Int128,
    Int256,
    Integer(Option<u64>),
    IntUnsigned(Option<u64>),
    Int4Unsigned(Option<u64>),
    IntegerUnsigned(Option<u64>),
    HugeInt,
    UHugeInt,
    UInt8,
    UInt16,
    UInt32,
    UInt64,
    UInt128,
    UInt256,
    BigInt(Option<u64>),
    BigIntUnsigned(Option<u64>),
    UBigInt,
    Int8Unsigned(Option<u64>),
    Signed,
    SignedInteger,
    Unsigned,
    UnsignedInteger,
    Float4,
    Float32,
    Float64,
    Real,
    RealUnsigned,
    Float8,
    Double(ExactNumberInfo),
    DoubleUnsigned(ExactNumberInfo),
    DoublePrecision,
    DoublePrecisionUnsigned,
    Bool,
    Boolean,
    Date,
    Date32,
    Time(Option<u64>, TimezoneInfo),
    Datetime(Option<u64>),
    Datetime64(u64, Option<String>),
    Timestamp(Option<u64>, TimezoneInfo),
    TimestampNtz,
    Interval {
        fields: Option<IntervalFields>,
        precision: Option<u64>,
    },
    JSON,
    JSONB,
    Regclass,
    Text,
    TinyText,
    MediumText,
    LongText,
    String(Option<u64>),
    FixedString(u64),
    Bytea,
    Bit(Option<u64>),
    BitVarying(Option<u64>),
    VarBit(Option<u64>),
    Custom(ObjectName, Vec<String>),
    Array(ArrayElemTypeDef),
    Map(Box<DataType>, Box<DataType>),
    Tuple(Vec<StructField>),
    Nested(Vec<ColumnDef>),
    Enum(Vec<EnumMember>, Option<u8>),
    Set(Vec<String>),
    Struct(Vec<StructField>, StructBracketKind),
    Union(Vec<UnionField>),
    Nullable(Box<DataType>),
    LowCardinality(Box<DataType>),
    Unspecified,
    Trigger,
    AnyType,
    GeometricType(GeometricTypeKind),
    TsVector,
    TsQuery,
};