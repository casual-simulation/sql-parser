import type { Expr } from "./expr";
import type { Ident, ObjectName } from "./ident";
import type { AttachedToken } from "./token";

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
    lateral_views: LateralView[];
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
    value_table_mode?: ValueTableMode;
    connect_by?: ConnectBy;
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