import type { Expr } from "./expr";
import type { Ident, ObjectName } from "./ident";

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