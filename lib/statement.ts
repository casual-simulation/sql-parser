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
    // with?:

    /**
     * SELECT or UNION / EXCEPT / INTERSECT
     */
    body: SetExpr;
}

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
} //Select | SetOperation | Values | Query | Insert | Update | Delete | CreateTable | CreateView | CreateIndex | AlterTable | Drop | Truncate | Explain | ShowColumns | ShowTables | UseStatement | Grant | Revoke | StartTransaction | Commit | Rollback | Prepare | Execute | Deallocate;



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
    lateral_views: any[];
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
    value_table_mode?: any;
    connect_by?: any;
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
export type WildcardAdditionalOptions = any; // TODO: Docs

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
        json_path?: any,
        sample?: any,
        index_hints: any[],
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
        columns: any[],
        alias?: TableAlias,
    },
    OpenJsonTable?: {
        json_expr: Expr,
        json_path?: Value,
        // TODO: Define proper type
        columns: any[],
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
        measures: any[],
        rows_per_match?: any,
        after_match_skip?: any,
        pattern: any,
        symbols: any[],
        alias?: TableAlias,
    },
    XmlTable?: {
        // TODO: Define proper types
        namespaces: any[],
        row_expression: Expr,
        passing: any,
        columns: any[],
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
    settings?: any;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableVersion.html
 */
export type TableVersion = any; // TODO:

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
    will_fill?: any;
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
    units: any;
    start_bound: any;
    end_bound?: any;
}

/**
 * What did this select look like?
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SelectFlavor.html
 */
export type SelectFlavor = 'Standard' | 'FromFirst' | 'FromFirstNoSelect';