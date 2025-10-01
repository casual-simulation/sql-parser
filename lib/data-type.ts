import type { Expr } from "./expr";
import type { ObjectName, Ident } from "./ident";
import type { Keyword } from "./keyword";
import type { Token } from "./token";

/**
 * Simple SQL data types.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DataType.html
 */
export type SimpleDataType = 
    | 'Uuid'
    | 'TinyBlob'
    | 'MediumBlob'
    | 'LongBlob'
    | 'UTinyInt'
    | 'USmallInt'
    | 'Int16'
    | 'Int32'
    | 'Int64'
    | 'Int128'
    | 'Int256'
    | 'HugeInt'
    | 'UHugeInt'
    | 'UInt8'
    | 'UInt16'
    | 'UInt32'
    | 'UInt64'
    | 'UInt128'
    | 'UInt256'
    | 'UBigInt'
    | 'Signed'
    | 'SignedInteger'
    | 'Unsigned'
    | 'UnsignedInteger'
    | 'Float4'
    | 'Float32'
    | 'Float64'
    | 'Real'
    | 'RealUnsigned'
    | 'Float8'
    | 'DoublePrecision'
    | 'DoublePrecisionUnsigned'
    | 'Bool'
    | 'Boolean'
    | 'Date'
    | 'Date32'
    | 'TimestampNtz'
    | 'JSON'
    | 'JSONB'
    | 'Regclass'
    | 'Text'
    | 'TinyText'
    | 'MediumText'
    | 'LongText'
    | 'Bytea'
    | 'Unspecified'
    | 'Trigger'
    | 'AnyType'
    | 'TsVector'
    | 'TsQuery';

/**
 * SQL data types.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DataType.html
 */
export type DataType = SimpleDataType | {
    Table?: ColumnDef[],
    NamedTable?: {
        name: ObjectName,
        columns: ColumnDef[],
    },
    Character?: CharacterLength,
    Char?: CharacterLength,
    CharacterVarying?: CharacterLength,
    CharVarying?: CharacterLength,
    Varchar?: CharacterLength,
    Nvarchar?: CharacterLength,
    CharacterLargeObject?: number,
    CharLargeObject?: number,
    Clob?: number,
    Binary?: number,
    Varbinary?: BinaryLength,
    Blob?: number,
    Bytes?: number,
    Numeric?: ExactNumberInfo,
    Decimal?: ExactNumberInfo,
    DecimalUnsigned?: ExactNumberInfo,
    BigNumeric?: ExactNumberInfo,
    BigDecimal?: ExactNumberInfo,
    Dec?: ExactNumberInfo,
    DecUnsigned?: ExactNumberInfo,
    Float?: ExactNumberInfo,
    FloatUnsigned?: ExactNumberInfo,
    TinyInt?: number,
    TinyIntUnsigned?: number,
    Int2?: number,
    Int2Unsigned?: number,
    SmallInt?: number,
    SmallIntUnsigned?: number,
    BigInt?: number,
    Double?: ExactNumberInfo,
    DoubleUnsigned?: ExactNumberInfo,
    MediumInt?: number,
    MediumIntUnsigned?: number,
    Int?: number,
    Int4?: number,
    Int8?: number,
    Integer?: number,
    IntUnsigned?: number,
    Int4Unsigned?: number,
    IntegerUnsigned?: number,
    BigIntUnsigned?: number,
    Int8Unsigned?: number,
    Time?: [number, TimezoneInfo],
    Datetime?: number,
    Datetime64?: [number, string],
    Timestamp?: [number, TimezoneInfo],
    Interval?: {
        fields?: IntervalFields,
        precision: number,
    },
    String?: number,
    FixedString?: number,
    Bit?: number,
    BitVarying?: number,
    VarBit?: number,
    Custom?: [ObjectName, string[]],
    Array?: ArrayElemTypeDef,
    Map?: [DataType, DataType],
    Tuple?: StructField[],
    Nested?: ColumnDef[],
    Enum?: [EnumMember[], number],
    Set?: string[],
    Struct?: [StructField[], StructBracketKind],
    Union?: UnionField[],
    Nullable?: DataType,
    LowCardinality?: DataType,
    GeometricType?: GeometricTypeKind,
};

/**
 * Information about [character length](https://jakewheat.github.io/sql-overview/sql-2016-foundation-grammar.html#character-length), including length and possibly unit.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CharacterLength.html
 */
export type CharacterLength = 'Max' | {
    IntegerLength?: {
        length: number;
        unit?: CharLengthUnits;
    },
};

/**
 * Possible units for characters, initially based on 2016 ANSI SQL Standard.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CharLengthUnits.html
 */
export type CharLengthUnits = 'Octets' | 'Characters';

/**
 * Additional information for `NUMERIC`, `DECIMAL`, and `DEC` data types following the 2016 SQL Standard.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ExactNumberInfo.html
 */
export type ExactNumberInfo = 'None' | {
    /**
     * Only precision information, e.g. `DECIMAL(10)`
     */
    Precision?: number,
    
    /**
     * Precision and scale information, e.g. `DECIMAL(10,2)`
     */
    PrecisionAndScale?: [number, number],
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.BinaryLength.html
 */
export type BinaryLength = 'Max' | {
    IntegerLength: {
        length: number;
    }
};

/**
 * Timestamp and Time data types information about TimeZone formatting.

This is more related to a display information than real differences between each variant. To guarantee compatibility with the input query we must maintain its exact information.

 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TimezoneInfo.html
 */
export type TimezoneInfo =
    | 'None'
    | 'WithTimeZone'
    | 'WithoutTimeZone'
    | 'Tz';

/**
 * Fields for Postgres `INTERVAL` type.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.IntervalFields.html
 */
export type IntervalFields =
    | 'Year'
    | 'Month'
    | 'Day'
    | 'Hour'
    | 'Minute'
    | 'Second'
    | 'YearToMonth'
    | 'DayToHour'
    | 'DayToMinute'
    | 'DayToSecond'
    | 'HourToMinute'
    | 'HourToSecond'
    | 'MinuteToSecond';

/**
 * 
Represents the data type of the elements in an array (if any) as well as the syntax used to declare the array.

For example: Bigquery/Hive use `ARRAY<INT>` whereas snowflake uses `ARRAY`.

@see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ArrayElemTypeDef.html
 */
export type ArrayElemTypeDef = 'None' | {
    AngleBracket?: DataType,
    SquareBracket: [DataType, number | undefined],
    Parenthesis: [DataType],
}

/**
 * A field definition within a struct
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.StructField.html
 */
export interface StructField {
    field_name?: Ident;
    field_type: DataType;
    options?: SqlOption[];
}

/**
 * Type of brackets used for `STRUCT` literals.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.StructBracketKind.html
 */
export type StructBracketKind = 'Parentheses' | 'AngleBrackets';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.EnumMember.html
 */
export type EnumMember = {
    Name?: string;
    NamedValue?: [string, Expr];
}

/**
 * A field definition within a union.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.UnionField.html
 */
export interface UnionField {
    field_name: Ident;
    field_type: DataType;
}

/**
 * Represents different types of geometric shapes which are commonly used in PostgreSQL/Redshift for spatial operations and geometry-related computations.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.GeometricTypeKind.html
 */
export type GeometricTypeKind =
    | 'Point'
    | 'Line'
    | 'LineSegment'
    | 'GeometricBox'
    | 'GeometricPath'
    | 'Polygon'
    | 'Circle'

/**
 * SQL column definition
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ColumnDef.html
 */
export interface ColumnDef {
    name: Ident;
    data_type: DataType;
    options: ColumnOptionDef[];
}

/**
 * An optionally-named ColumnOption: [ CONSTRAINT <name> ] <column-option>.

Note that implementations are substantially more permissive than the ANSI specification on what order column options can be presented in, and whether they are allowed to be named. The specification distinguishes between constraints (NOT NULL, UNIQUE, PRIMARY KEY, and CHECK), which can be named and can appear in any order, and other options (DEFAULT, GENERATED), which cannot be named and must appear in a fixed order. PostgreSQL, however, allows preceding any option with CONSTRAINT <name>, even those that are not really constraints, like NULL and DEFAULT. MSSQL is less permissive, allowing DEFAULT, UNIQUE, PRIMARY KEY and CHECK to be named, but not NULL or NOT NULL constraints (the last of which is in violation of the spec).

For maximum flexibility, we don’t distinguish between constraint and non-constraint options, lumping them all together under the umbrella of “column options,” and we allow any column option to be named.

@see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ColumnOptionDef.html
 */
export interface ColumnOptionDef {
    name?: Ident;
    option: ColumnOption;
}

/**
 * ColumnOptions are modifiers that follow a column definition in a `CREATE TABLE` statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ColumnOption.html
 */
export type ColumnOption = 'Null' | 'NotNull' | {
    Default?: Expr;
    Materialized?: Expr;
    Ephemeral?: Expr;
    Alias?: Expr;
    Unique?: {
        is_primary: boolean;
        characteristics?: any;
    };
    ForeignKey?: {
        foreign_table: ObjectName,
        referred_columns: Ident[],
        on_delete?: ReferentialAction,
        on_update?: ReferentialAction,
        characteristics?: ConstraintCharacteristics,
    },
    Check?: Expr,
    DialectSpecific?: Token[],
    CharacterSet?: ObjectName,
    Collation?: ObjectName,
    Comment?: string,
    OnUpdate?: Expr,
    Generated?: {
        generated_as: GeneratedAs,
        sequence_options?: SequenceOptions[],
        generation_expr?: Expr,
        generation_expr_mode?: GeneratedExpressionMode,
        generated_keyword: boolean,
    },
    Options?: SqlOption[],
    Identity?: IdentityPropertyKind,
    OnConflict?: Keyword,

    // TODO: Support
    // Policy?: ColumnPolicy,
    // Tags?: TagsColumnOption,
    // Srid?: Expr,
}

/**
 * ```
 * <constraint_characteristics> = [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ] [ ENFORCED | NOT ENFORCED ]
 * ```
 * Used in UNIQUE and foreign key constraints. The individual settings may occur in any order.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ConstraintCharacteristics.html
 */
export type ConstraintCharacteristics = any; // TODO: types

/**
 * ```
 * <referential_action> = { RESTRICT | CASCADE | SET NULL | NO ACTION | SET DEFAULT }
 * ```
 * Used in foreign key constraints in `ON UPDATE` and `ON DELETE` options.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ReferentialAction.html
 */
export type ReferentialAction = 
    | 'Restrict'
    | 'Cascade'
    | 'SetNull'
    | 'NoAction'
    | 'SetDefault';

/**
 * GeneratedAss are modifiers that follow a column option in a generated.
 * ‘ExpStored’ is used for a column generated from an expression and stored.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.GeneratedAs.html
 */
export type GeneratedAs =
    | 'Always'
    | 'ByDefault'
    | 'ExpStored';

/**
 * ```
 * [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue | NO MINVALUE ] [ MAXVALUE maxvalue | NO MAXVALUE ]
    [ START [ WITH ] start ] [ CACHE cache ] [ [ NO ] CYCLE ]
     ```
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SequenceOptions.html
 */
export type SequenceOptions = {
    IncrementBy?: [Expr, boolean],
    MinValue?: Expr,
    MaxValue?: Expr,
    StartWith?: [Expr, boolean],
    Cache?: Expr,
    Cycle?: boolean,
}

/**
 * GeneratedExpressionModes are modifiers that follow an expression in a generated.
 * No modifier is typically the same as Virtual.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.GeneratedExpressionMode.html
 */
export type GeneratedExpressionMode = 'Stored' | 'Virtual';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SqlOption.html
 */
export type SqlOption = {
    Clustered?: TableOptionsClustered,
    Ident?: Ident,
    KeyValue?: {
        key: Ident,
        value: Expr,
    },
    Partition?: {
        column_name: Ident,
        range_direction?: PartitionRangeDirection,
        for_values: Expr[],
    },
    Comment?: CommentDef,
    TableSpace?: TablespaceOption,
    NamedParenthesizedList?: NamedParenthesizedList,
};

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableOptionsClustered.html
 */
export type TableOptionsClustered = any; // TODO: types

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.PartitionRangeDirection.html
 */
export type PartitionRangeDirection = any;

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CommentDef.html
 */
export type CommentDef = any; // TODO: types

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TablespaceOption.html
 */
export type TablespaceOption = any; // TODO: types

/**
 * Key/Value, where the value is a (optionally named) list of identifiers
 * 
 * ```
 * UNION = (tbl_name[,tbl_name]...)
 * ENGINE = ReplicatedMergeTree('/table_name','{replica}', ver)
 * ENGINE = SummingMergeTree([columns])
 * ```
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.NamedParenthesizedList.html
 */
export interface NamedParenthesizedList {
    key: Ident;
    name?: Ident;
    values: Ident[];
}

/**
 * Identity is a column option for defining an identity or autoincrement column in a `CREATE TABLE` statement. Syntax
 * 
 * ```
 * { IDENTITY | AUTOINCREMENT } [ (seed , increment) | START num INCREMENT num ] [ ORDER | NOORDER ]
 * ```
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.IdentityPropertyKind.html
 */
export type IdentityPropertyKind = {
    Autoincrement?: IdentityProperty;
    Identity?: IdentityProperty;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.IdentityProperty.html
 */
export interface IdentityProperty {
    parameters?: IdentityPropertyFormatKind;
    order?: IdentityPropertyOrder;
}

/**
 * A format of parameters of identity column.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.IdentityPropertyFormatKind.html
 */
export type IdentityPropertyFormatKind = {
    FunctionCall?: IdentityParameters;
    StartAndIncrement?: IdentityParameters;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.IdentityParameters.html
 */
export interface IdentityParameters {
    seed: Expr;
    increment: Expr;
}

/**
 * The identity column option specifies how values are generated for the auto-incremented column, either in increasing or decreasing order. Syntax
 * 
 * ```
 * ORDER | NOORDER
 * ```
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.IdentityPropertyOrder.html
 */
export type IdentityPropertyOrder = 'Order' | 'NoOrder';