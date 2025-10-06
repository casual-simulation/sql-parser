import { NullTreatment } from "./data-type";
import type { Expr } from "./expr";
import type { Ident, ObjectName } from "./ident";
import { OrderByExpr, Query } from "./statement";
import { Value } from "./token";

/**
 * A function call
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Function.html
 */
export interface SQLFunction {
    name: ObjectName,
    uses_odbc_syntax: boolean,
    parameters: FunctionArguments,
    args: FunctionArguments,
    filter?: Expr,
    null_treatment?: NullTreatment,
    over?: WindowType,
    within_group: OrderByExpr[],
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.WindowType.html
 */
export type WindowType = {
    WindowSpec?: WindowSpec;
    NamedWindow?: Ident;
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
 * 
Specifies the data processed by a window function, e.g. `RANGE UNBOUNDED PRECEDING` or `ROWS BETWEEN 5 PRECEDING AND CURRENT ROW`.

Note: The parser does not validate the specified bounds; the caller should reject invalid bounds like `ROWS UNBOUNDED FOLLOWING` before execution.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.WindowFrame.html
 */
export interface WindowFrame {
    units: WindowFrameUnits;
    start_bound: WindowFrameBound;
    end_bound?: WindowFrameBound;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.WindowFrameUnits.html
 */
export type WindowFrameUnits = 'Rows' | 'Range' | 'Groups';

/**
 * Specifies WindowFrame’s `start_bound` and `end_bound`.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.WindowFrameBound.html
 */
export type WindowFrameBound = 'CurrentRow' | {
    /**
     * `<N> PRECEDING` or `UNBOUNDED PRECEDING`
     */
    Preceding?: Expr | undefined;

    /**
     * `<N> FOLLOWING` or `UNBOUNDED FOLLOWING`
     */
    Following?: Expr | undefined;
}

/**
 * The arguments passed to a function call.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FunctionArguments.html
 */
export type FunctionArguments = 'None' | {
    /**
     * On some dialects, a subquery can be passed without surrounding parentheses if it’s the sole argument to the function.
     */
    Subquery?: Query;

    /**
     * A normal function argument list, including any clauses within it such as `DISTINCT` or `ORDER BY`.
     */
    List?: FunctionArgumentList;
}

/**
 * This represents everything inside the parentheses when calling a function.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.FunctionArgumentList.html
 */
export interface FunctionArgumentList {
    /**
     * `[ ALL | DISTINCT ]`
     */
    duplicate_treatment?: DuplicateTreatment,

    /**
     * The function arguments.
     */
    args: FunctionArg[],

    /**
     * Additional clauses specified within the argument list.
     */
    clauses: FunctionArgumentClause[],
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DuplicateTreatment.html
 */
export type DuplicateTreatment = 
    | 'Distinct'
    | 'All';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FunctionArgumentClause.html
 */
export type FunctionArgumentClause = {
    /**
     * Indicates how NULLs should be handled in the calculation, e.g. in `FIRST_VALUE` on BigQuery.
     * 
     * Syntax:
     * `{ IGNORE | RESPECT } NULLS ]`
     */
    IgnoreOrRespectNulls?: NullTreatment;

    /**
     * Specifies the the ordering for some ordered set aggregates, e.g. `ARRAY_AGG` on BigQuery.
     */
    OrderBy?: OrderByExpr[];

    /**
     * Specifies a limit for the `ARRAY_AGG` and `ARRAY_CONCAT_AGG` functions on BigQuery.
     */
    Limit?: Expr;

    /**
     * Specifies the behavior on overflow of the LISTAGG function.
     * 
     * @see https://trino.io/docs/current/functions/aggregate.html
     */
    OnOverflow?: unknown;

    /**
     * Specifies a minimum or maximum bound on the input to ANY_VALUE on BigQuery.
     */
    Having?: unknown;

    /**
     * The `SEPARATOR` clause to the `GROUP_CONCAT` function in MySQL.
     */
    Separator?: Value;

    /**
     * The `ON NULL` clause for some JSON functions.
     */
    JsonNullClause?: unknown; // TODO: Define proper type

    /**
     * The `RETURNING` clause for some JSON functions in PostgreSQL
     */
    JsonReturningClause?: unknown; // TODO: Define proper type
}

/**
 * A function argument.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FunctionArg.html
 */
export type FunctionArg = {
    Named?: {
        name: Ident;
        arg: FunctionArgExpr;
        operator: FunctionArgOperator;
    };

    ExprNamed?: {
        name: Expr;
        arg: FunctionArgExpr;
        operator: FunctionArgOperator;
    };

    Unnamed?: FunctionArgExpr;
};

/**
 * A function argument expression.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FunctionArgExpr.html
 */
export type FunctionArgExpr = 'Wildcard' | {
    Expr?: Expr;

    /**
     * Qualified wildcard, e.g. `alias.*` or `schema.table.*`.
     */
    QualifiedWildcard?: ObjectName;
};

/**
 * Operator used to separate function arguments
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FunctionArgOperator.html
 */
export type FunctionArgOperator = 
    | 'Equals'
    | 'RightArrow'
    | 'Assignment'
    | 'Colon'
    | 'Value';