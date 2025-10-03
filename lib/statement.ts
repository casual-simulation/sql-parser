import { DataType } from "./data-type";
import type { Expr, ExprWithAlias } from "./expr";
import { FunctionArg } from "./function";
import type { Ident, ObjectName } from "./ident";
import type { AttachedToken, Value } from "./token";

/**
 * The list of possible SQL statements.
 * 
 * Currently, only supports `Query` statements.
 * 
 * See https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Statement.html for more information.
 */
export type Statement = Query;

/**
 * A SQL query.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Query.html
 */
export interface Query {
    with?: With;

    /**
     * SELECT or UNION / EXCEPT / INTERSECT
     */
    body: SetExpr;

    /**
     * `ORDER BY` clause.
     */
    order_by?: OrderBy;

    /**
     * `LIMIT ... OFFSET ... | LIMIT <offset>, <limit>` clause.
     */
    limit_clause?: LimitClause,

    /**
     * `FETCH { FIRST | NEXT } <N> [ PERCENT ] { ROW | ROWS } | { ONLY | WITH TIES }`
     */
    fetch?: Fetch,

    /**
     * `FOR { UPDATE | SHARE } [ OF table_name ] [ SKIP LOCKED | NOWAIT ]`
     */
    locks: LockClause[],

    /**
     * `FOR XML { RAW | AUTO | EXPLICIT | PATH } [ , ELEMENTS ]`
     * `FOR JSON { AUTO | PATH } [ , INCLUDE_NULL_VALUES ]` (MSSQL-specific)
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ForClause.html
     */
    for_clause?: unknown,

    /**
     * [ClickHouse syntax](https://clickhouse.com/docs/sql-reference/statements/select#settings-in-select-query): `SELECT * FROM t SETTINGS key1 = value1, key2 = value2`
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Setting.html
     */
    settings?: unknown[],

    /**
     * `SELECT * FROM t FORMAT JSONCompact`
     * [ClickHouse](https://clickhouse.com/docs/en/sql-reference/statements/select/format) (ClickHouse-specific)
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FormatClause.html
     */
    format_clause?: unknown,

    /**
     * [Pipe Syntax](https://cloud.google.com/bigquery/docs/reference/standard-sql/pipe-syntax#pipe_syntax).
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.PipeOperator.html
     */
    pipe_operators: unknown[],
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.OrderBy.html
 */
export interface OrderBy {
    kind: OrderByKind;
    interpolate?: Interpolate;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OrderByKind.html
 */
export type OrderByKind = {
    /**
     * `ALL` syntax of [DuckDB](https://duckdb.org/docs/sql/query_syntax/orderby) and [ClickHouse](https://clickhouse.com/docs/en/sql-reference/statements/select/order-by).
     */
    All?: OrderByOptions;

    /**
     * Expressions.
     */
    Expressions?: OrderByExpr[];
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Interpolate.html
 */
export interface Interpolate {
    exprs?: InterpolateExpr[];
}

/**
 * ClickHouse `INTERPOLATE` clause for use in `ORDER BY` clause when using `WITH FILL` modifier.
 * Supported by [ClickHouse syntax](https://clickhouse.com/docs/en/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.InterpolateExpr.html
 */
export interface InterpolateExpr {
    column: Ident;
    expr?: Expr;
}


/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Fetch.html
 */
export interface Fetch {
    with_ties: boolean;
    percent: boolean;
    quantity?: Expr;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.LimitClause.html
 */
export type LimitClause = {
    /**
     * Standard SQL syntax

        `LIMIT <limit> [BY <expr>,<expr>,...] [OFFSET <offset>]`
     */
    LimitOffset?: {
        limit?: Expr,
        offset?: Offset,
        limit_by: Expr[],
    },

    /**
     * [MySQL-specific](https://dev.mysql.com/doc/refman/8.4/en/select.html) syntax; the order of expressions is reversed.
     */
    OffsetCommaLimit?: {
        offset: Expr,
        limit: Expr,
    },
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Offset.html
 */
export interface Offset {
    value: Expr;
    rows: OffsetRows;
}

/**
 * Stores the keyword after `OFFSET <number>`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OffsetRows.html
 */
export type OffsetRows = 
    | 'None'
    | 'Row'
    | 'Rows';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.LockClause.html
 */
export interface LockClause {
    lock_type: LockType;
    of?: ObjectName;
    nonblock?: NonBlock;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.LockType.html
 */
export type LockType = 'Share' | 'Update';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.NonBlock.html
 */
export type NonBlock = 'Nowait' | 'SkipLocked';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.With.html
 */
export interface With {
    /**
     * Token for the “WITH” keyword
     */
    with_token: AttachedToken;
    recursive: boolean;
    cte_tables: Cte[];
}

/**
 * A single CTE (used after `WITH`): `<alias> [(col1, col2, ...)] AS <materialized> ( <query> )` The names in the column list before AS, when specified, replace the names of the columns returned by the query. The parser does not validate that the number of columns in the query matches the number of columns in the query.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Cte.html
 */
export interface Cte {
    alias: TableAlias;
    query: Query;
    from?: Ident;
    materialized?: CteAsMaterialized;

    /**
     * Token for closing parenthesis.
     */
    closing_paren_token: AttachedToken;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CteAsMaterialized.html
 */
export type CteAsMaterialized = 
    | 'Materialized'
    | 'NotMaterialized';

/**
 * A node in a tree, representing a "query body" expression.
 * Roughly:
 * ```
 * SELECT ... [ {UNION|EXCEPT|INTERSECT} SELECT ...]
 * ```
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SetExpr.html
 */
export interface SetExpr {
    /**
     * The `SELECT` statement.
     */
    Select?: Select;

    /**
     * Parenthesized SELECT subquery, which may include more set operations in its body and an optional ORDER BY / LIMIT.
     */
    Query?: Query;

    /**
     * UNION/EXCEPT/INTERSECT of two queries
     */
    SetOperation?: {
        op: SetOperator;
        set_quantifier: SetQuantifier;
        left: SetExpr;
        right: SetExpr;
    };

    Values?: Values;

    Insert?: Statement;
    Update?: Statement;
    Delete?: Statement;
    Merge?: Statement;
    Table?: Table;
} //Select | SetOperation | Values | Query | Insert | Update | Delete | CreateTable | CreateView | CreateIndex | AlterTable | Drop | Truncate | Explain | ShowColumns | ShowTables | UseStatement | Grant | Revoke | StartTransaction | Commit | Rollback | Prepare | Execute | Deallocate;

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SetOperator.html
 */
export type SetOperator = 
    | 'Union'
    | 'Except'
    | 'Intersect'
    | 'Minus';

/**
 * A quantifier for SetOperator.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SetQuantifier.html
 */
export type SetQuantifier =
    | 'All'
    | 'Distinct'
    | 'ByName'
    | 'AllByName'
    | 'DistinctByName'
    | 'None';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Values.html
 */
export interface Values {
    /**
     * The list of rows to insert.
     */
    rows: Row[];
}

/**
 * A single row of values to insert.
 */
export interface Row {
    /**
     * Was there an explicit ROWs keyword (MySQL)? https://dev.mysql.com/doc/refman/8.0/en/values.html
     */
    explicit_row: boolean;
    rows: Expr[][];
}

/**
 * A [TABLE command](https://www.postgresql.org/docs/current/sql-select.html#SQL-TABLE).
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Table.html
 */
export interface Table {
    table_name?: string;
    schema_name?: string;
}

/**
 * A select statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Select.html
 */
export interface Select {
    select_token: AttachedToken;
    distinct?: Distinct;
    top?: Top;
    top_before_distinct: boolean;
    projection: SelectItem[];
    exclude?: ExcludeSelectItem;
    into?: SelectInto;
    from: TableWithJoins[];
    // TODO: Define proper type
    lateral_views: unknown[];
    prewhere?: Expr;
    selection?: Expr;
    group_by: GroupByExpr;
    cluster_by: Expr[];
    distribute_by: Expr[];
    sort_by: OrderByExpr[];
    having?: Expr;
    named_window: NamedWindowDefinition[];
    qualify?: Expr;
    window_before_qualify: boolean;

    // TODO: Define proper type
    value_table_mode?: unknown;
    connect_by?: unknown;
    flavor: SelectFlavor;
}

/**
 * A DISTINCT clause.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Distinct.html
 */
export type Distinct = 'Distinct' | {
    On: Expr[];
};

/**
 * A TOP clause.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Top.html
 */
export interface Top {
    with_ties: boolean;
    percent: boolean;
    quantity?: TopQuantity;
}

/**
 * A quantity in a TOP clause.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TopQuantity.html
 */
export type TopQuantity = {
    Expr?: Expr;
    Constant?: number;
}

/**
 * One item of the comma-separated list following `SELECT`.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SelectItem.html
 */
export type SelectItem = {
    /**
     * Any epxression, not followed by `[AS] alias`
     */
    UnnamedExpr?: Expr;

    /**
     * An expression, followed by `[AS] alias`
     */
    ExprWithAlias?: {
        expr: Expr;
        alias: Ident;
    };

    /**
     * An expression, followed by a wildcard expansion. e.g. `alias.*`, `STRUCT<STRING>('foo').*`
     */
    QualifiedWildcard?: [SelectItemQualifiedWildcardKind, WildcardAdditionalOptions];

    /**
     * An unqualified `*`.
     */
    Wildcard?: WildcardAdditionalOptions;
}

/**
 * Represents an expression behind a wildcard expansion in a projection. `SELECT T.* FROM T;`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SelectItemQualifiedWildcardKind.html
 */
export type SelectItemQualifiedWildcardKind = {
    ObjectName?: ObjectName;
    Expr?: Expr;
}

/**
 * Additional options for wildcards, e.g. Snowflake `EXCLUDE`/`RENAME` and BigQuery `EXCEPT`.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.WildcardAdditionalOptions.html
 */
export type WildcardAdditionalOptions = unknown; // TODO: Docs

/**
 * Snowflake `EXCLUDE` information.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ExcludeSelectItem.html
 */
export type ExcludeSelectItem = {
    Single?: Ident;
    Multiple?: Ident[];
}

/**
 * `INTO` clause information.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.SelectInto.html
 */
export interface SelectInto {
    temporary: boolean;
    unlogged: boolean;
    table: boolean;
    name: ObjectName;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TableWithJoins.html
 */
export interface TableWithJoins {
    relation: TableFactor;
    joins: Join[];
}

/**
 * A table name or a parenthesized subquery with an optional alias
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableFactor.html
 */
export type TableFactor = {
    Table?: {
        name: ObjectName,
        alias?: TableAlias,
        args?: TableFunctionArgs,
        with_hints: Expr[],
        version?: TableVersion,
        with_ordinality: boolean,
        partitions: Ident[],
        json_path?: unknown,
        sample?: unknown,
        index_hints: unknown[],
    },
    Derived?: {
        lateral: boolean,
        subquery: Query,
        alias?: TableAlias,
    },
    TableFunction?: {
        expr: Expr,
        alias?: TableAlias,
    },
    Function?: {
        lateral: boolean,
        name: ObjectName,
        args: FunctionArg[],
        alias?: TableAlias,
    },
    UNNEST?: {
        alias?: TableAlias,
        array_exprs: Expr[],
        with_offset: boolean,
        with_offset_alias?: Ident,
        with_ordinality: boolean,
    },
    JsonTable?: {
        json_expr: Expr,
        json_path: Value,
        // TODO: Define proper type
        columns: unknown[],
        alias?: TableAlias,
    },
    OpenJsonTable?: {
        json_expr: Expr,
        json_path?: Value,
        // TODO: Define proper type
        columns: unknown[],
        alias?: TableAlias,
    },
    NestedJoin?: {
        table_with_joins: TableWithJoins,
        alias?: TableAlias,
    },
    Pivot?: {
        table: TableFactor,
        aggregate_functions: ExprWithAlias[],
        value_column: Expr[],
        value_source: PivotValueSource,
        default_on_null?: Expr,
        alias?: TableAlias,
    },
    Unpivot?: {
        table: TableFactor,
        value: Expr,
        name: Ident,
        columns: ExprWithAlias[],
        null_inclusion?: NullInclusion,
        alias?: TableAlias,
    },
    MatchRecognize?: {
        // TODO: Define proper types
        table: TableFactor,
        partition_by: Expr[],
        order_by: OrderByExpr[],
        measures: unknown[],
        rows_per_match?: unknown,
        after_match_skip?: unknown,
        pattern: unknown,
        symbols: unknown[],
        alias?: TableAlias,
    },
    XmlTable?: {
        // TODO: Define proper types
        namespaces: unknown[],
        row_expression: Expr,
        passing: unknown,
        columns: unknown[],
        alias?: TableAlias,
    },
    SemanticView?: {
        name: ObjectName,
        dimensions: Expr[],
        metrics: Expr[],
        facts: Expr[],
        where_clause?: Expr,
        alias?: TableAlias,
    },
};

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TableAlias.html
 */
export interface TableAlias {
    name: Ident;
    columns: TableAliasColumnDef[];
}

/**
 * SQL column definition in a table expression alias. Most of the time, the data type is not specified. But some table-valued functions do require specifying the data type.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TableAliasColumnDef.html
 */
export interface TableAliasColumnDef {
    name: Ident;
    data_type?: DataType;
}

/**
 * Arguments to a table-valued function.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TableFunctionArgs.html
 */
export interface TableFunctionArgs {
    args: FunctionArg[];
    settings?: unknown;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableVersion.html
 */
export type TableVersion = unknown; // TODO:

/**
 * The source of values in a PIVOT operation.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.PivotValueSource.html
 */
export type PivotValueSource = {
    List?: ExprWithAlias[];
    Any?: OrderByExpr[];
    Subquery?: Query;
}

/**
 * Specifies Include / Exclude NULL within UNPIVOT command. 
 * For example `UNPIVOT (column1 FOR new_column IN (col3, col4, col5, col6))`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.NullInclusion.html
 */
export type NullInclusion = 'IncludeNulls' | 'ExcludeNulls';

/**
 * An ORDER BY expression.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.OrderByExpr.html
 */
export interface OrderByExpr {
    expr: Expr;
    options: OrderByOptions;

    // TODO: Define proper type
    will_fill?: unknown;
}

/**
 * Options for ORDER BY expressions.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.OrderByOptions.html
 */
export interface OrderByOptions {
    /**
     * Optional `ASC` or `DESC`.
     */
    asc?: boolean;

    /**
     * Optional `NULLS FIRST` or `NULLS LAST`.
     */
    nulls_first?: boolean;
}

/**
 * A JOIN clause.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Join.html
 */
export interface Join {
    relation: TableFactor;
    global: boolean;
    join_operator: JoinOperator;
}

/**
 * A join operator.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.JoinOperator.html
 */
export type JoinOperator = 'CrossApply' | 'OuterApply' | {
    Join?: JoinConstraint,
    Inner?: JoinConstraint,
    Left?: JoinConstraint,
    LeftOuter?: JoinConstraint,
    Right?: JoinConstraint,
    RightOuter?: JoinConstraint,
    FullOuter?: JoinConstraint,
    CrossJoin?: JoinConstraint,
    Semi?: JoinConstraint,
    LeftSemi?: JoinConstraint,
    RightSemi?: JoinConstraint,
    Anti?: JoinConstraint,
    LeftAnti?: JoinConstraint,
    RightAnti?: JoinConstraint,
    AsOf?: {
        match_condition: Expr,
        constraint: JoinConstraint,
    },
    StraightJoin?: JoinConstraint,
}

/**
 * A constraint for a JOIN clause.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.JoinConstraint.html
 */
export type JoinConstraint = 'Natural' | 'None' | {
    On?: Expr;
    Using?: ObjectName[];
}

/**
 * A `GROUP BY` expression.
 * 
 * see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.GroupByExpr.html
 */
export type GroupByExpr = {
    All?: GroupByWithModifier[];
    Expressions?: [Expr[], GroupByWithModifier[]];
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.GroupByWithModifier.html
 */
export type GroupByWithModifier = 'Rollup' | 'Cube' | 'Totals' | {
    GroupingSets: Expr;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.NamedWindowDefinition.html
 */
export type NamedWindowDefinition = [Ident, NamedWindowExpr];

/**
 * An expression used in a named window declaration.
 * 
 * `WINDOW mywindow AS [named_window_expr]`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.NamedWindowExpr.html
 */
export type NamedWindowExpr = {
    NamedWindow?: Ident;
    WindowSpec?: WindowSpec;
};

/**
 * A window specification (i.e. `OVER ([window_name] PARTITION BY .. ORDER BY .. etc.)`)
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.WindowSpec.html
 */
export interface WindowSpec {
    window_name?: Ident,
    partition_by: Expr[],
    order_by: OrderByExpr[],
    window_frame?: WindowFrame,
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.WindowFrame.html
 */
export interface WindowFrame {
    // TODO: Define proper types
    units: unknown;
    start_bound: unknown;
    end_bound?: unknown;
}

/**
 * What did this select look like?
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SelectFlavor.html
 */
export type SelectFlavor = 'Standard' | 'FromFirst' | 'FromFirstNoSelect';