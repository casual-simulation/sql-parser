import { ColumnDef, ColumnOption, CommentDef, DataType, GeneratedAs, NullsDistinctOption, SqlOption } from "./data-type";
import type { Expr, ExprWithAlias, OneOrManyWithParens } from "./expr";
import { FunctionArg, SQLFunction } from "./function";
import type { Ident, ObjectName, ObjectType } from "./ident";
import type { AttachedToken, Value, ValueWithSpan } from "./token";

/**
 * The list of possible SQL statements.
 * 
 * Currently, only supports `Query`, `Insert`, `Update`, and `Delete` statements.
 * 
 * See https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Statement.html for more information.
 */
export type Statement = {
    Query?: Query;
    Insert?: Insert;
    Update?: Update;
    Delete?: Delete;


    Analyze?: unknown;
    Set?: unknown;
    Truncate?: {
        table_names: TruncateTableTarget,
        partitions?: Expr[],
        table: boolean,
        identity?: TruncateIdentityOption,
        cascade?: CascadeOption,
        on_cluster?: Ident,
    };
    Msck?: unknown;
    Install?: unknown;
    Load?: unknown
    Directory?: unknown;
    Case?: unknown;
    If?: unknown;
    While?: unknown;
    Raise?: unknown;
    Call?: unknown;
    Copy?: unknown;
    CopyIntoSnowflake?: unknown;
    Open?: unknown;
    Close?: unknown;
    CreateView?: unknown;
    CreateTable?: CreateTable;
    CreateVirtualTable?: unknown;
    CreateIndex?: CreateIndex;
    CreateRole?: unknown;
    CreateSecret?: unknown;
    CreateServer?: unknown;
    CreatePolicy?: unknown;
    CreateConnector?: unknown;
    AlterTable?: {
        name: ObjectName,
        if_exists: boolean,
        only: boolean,
        operations: AlterTableOperation[],
        location?: unknown,
        on_cluster?: Ident,
        iceberg: boolean,
        end_token: AttachedToken,
    };
    AlterSchema?: unknown;
    AlterIndex?: unknown;
    AlterView?: unknown;
    AlterType?: unknown;
    AlterRole?: unknown;
    AlterPolicy?: unknown;
    AlterConnector?: unknown;
    AlterSession?: unknown;
    AttachDatabase?: unknown;
    AttachDuckDBDatabase?: unknown;
    DetachDuckDBDatabase?: unknown;
    Drop?: {
        object_type: ObjectType,
        if_exists: boolean,
        names: ObjectName[],
        cascade: boolean,
        restrict: boolean,
        purge: boolean,
        temporary: boolean,
        table?: ObjectName,
    };
    DropFunction?: unknown;
    DropDomain?: unknown;
    DropProcedure?: unknown;
    DropSecret?: unknown;
    DropPolicy?: unknown;
    DropConnector?: unknown;
    Declare?: unknown;
    CreateExtension?: unknown;
    DropExtension?: unknown;
    Fetch?: unknown;
    Flush?: unknown;
    Discard?: unknown;
    ShowFunctions?: unknown;
    ShowVariable?: unknown;
    ShowStatus?: unknown;
    ShowVariables?: unknown;
    ShowCreate?: unknown;
    ShowColumns?: unknown;
    ShowDatabases?: unknown;
    ShowSchemas?: unknown;
    ShowCharset?: unknown;
    ShowObjects?: unknown;
    ShowTables?: unknown;
    ShowViews?: unknown;
    ShowCollation?: unknown;
    Use?: unknown;
    StartTransaction?: {
        modes: TransactionMode[],
        begin: boolean,
        transaction?: BeginTransactionKind,
        modifier?: TransactionModifier,
        statements: Statement[],
        exception?: unknown[],
        has_end_keyword: boolean,
    };
    Comment?: unknown;
    Commit?: {
        chain: boolean,
        end: boolean,
        modifier?: TransactionModifier,
    };
    Rollback?: {
        chain: boolean,
        savepoint?: Ident,
    };
    CreateSchema?: unknown;
    CreateDatabase?: unknown;
    CreateFunction?: unknown;
    CreateTrigger?: unknown;
    DropTrigger?: unknown;
    CreateProcedure?: unknown;
    CreateMacro?: unknown;
    CreateStage?: unknown;
    Assert?: unknown;
    Grant?: unknown;
    Deny?: unknown;
    Revoke?: unknown;
    Deallocate?: unknown;
    Execute?: unknown;
    Prepare?: unknown;
    Kill?: unknown;
    ExplainTable?: unknown;
    Explain?: unknown;
    Savepoint?: unknown;
    ReleaseSavepoint?: unknown;
    Merge?: unknown;
    Cache?: unknown;
    UNCache?: unknown;
    CreateSequence?: unknown;
    CreateDomain?: unknown;
    CreateType?: unknown;
    Pragma?: unknown;
    LockTables?: unknown;
    UnlockTables?: unknown;
    Unload?: unknown;
    OptimizeTable?: unknown;
    LISTEN?: unknown;
    UNLISTEN?: unknown;
    NOTIFY?: unknown;
    LoadData?: unknown;
    RenameTable?: unknown;
    List?: unknown;
    Remove?: unknown;
    RaisError?: unknown;
    Print?: unknown;
    Return?: unknown;
    ExportData?: unknown;
    CreateUser?: unknown;
    Vacuum?: unknown;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TransactionMode.html
 */
export type TransactionMode = {
    AccessMode?: TransactionAccessMode,
    IsolationLevel?: TransactionIsolationLevel,
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TransactionAccessMode.html
 */
export type TransactionAccessMode = 
    | 'ReadOnly'
    | 'ReadWrite';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TransactionIsolationLevel.html
 */
export type TransactionIsolationLevel =
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable'
    | 'Snapshot';

/**
 * Transaction started with `[ TRANSACTION | WORK ]`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.BeginTransactionKind.html
 */
export type BeginTransactionKind =
    | 'Transaction'
    | 'Work';

/**
 * Modifier for the transaction in the `BEGIN` syntax.
 * 
 * SQLite: https://sqlite.org/lang_transaction.html
 * MS-SQL: https://learn.microsoft.com/en-us/sql/t-sql/language-elements/try-catch-transact-sql
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TransactionModifier.html
 */
export type TransactionModifier = 
    | 'Deferred'
    | 'Immediate'
    | 'Exclusive'
    | 'Try'
    | 'Catch';

/**
 * A SQL `CREATE INDEX` statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.CreateIndex.html
 */
export interface CreateIndex {
    name?: ObjectName,
    table_name: ObjectName,
    using?: IndexType,
    columns: IndexColumn[],
    unique: boolean,
    concurrently: boolean,
    if_not_exists: boolean,
    include: Ident[],
    nulls_distinct?: boolean,
    with: Expr[],
    predicate?: Expr,
    index_options: IndexOption[],
    alter_options: AlterTableOperation[],
}

/**
 * An `ALTER TABLE` operation
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AlterTableOperation.html
 */
export type AlterTableOperation =
    | 'DisableRowLevelSecurity'
    | 'EnableRowLevelSecurity'
    | 'DropClusteringKey'
    | 'SuspendRecluster'
    | 'ResumeRecluster' | {
        AddConstraint?: {
            constraint: TableConstraint,
            not_valid: boolean,
        },
        AddColumn?: {
            column_keyword: boolean,
            if_not_exists: boolean,
            column_def: ColumnDef,
            column_position?: MySQLColumnPosition,
        },
        AddProjection?: {
            if_not_exists: boolean,
            name: Ident,
            select: unknown, // TODO: Define proper type
        },
        DropProjection?: {
            if_exists: boolean,
            name: Ident,
        },
        MaterializeProjection?: {
            if_exists: boolean,
            name: Ident,
            partition?: Ident,
        },
        ClearProjection?: {
            if_exists: boolean,
            name: Ident,
            partition?: Ident,
        },
        DisableRule?: {
            name: Ident,
        },
        DisableTrigger?: {
            name: Ident,
        },
        DropConstraint?: {
            if_exists: boolean,
            name: Ident,
            drop_behavior?: DropBehavior,
        },
        DropColumn?: {
            has_column_keyword: boolean,
            column_names: Ident[],
            if_exists: boolean,
            drop_behavior?: DropBehavior,
        },
        AttachPartition?: {
            partition: unknown,
        },
        DetachPartition?: {
            partition: unknown,
        },
        FreezePartition?: {
            partition: unknown,
            with_name?: Ident,
        },
        UnfreezePartition?: {
            partition: unknown,
            with_name?: Ident,
        },
        DropPrimaryKey?: {
            drop_behavior?: DropBehavior,
        },
        DropForeignKey?: {
            name: Ident,
            drop_behavior?: DropBehavior,
        },
        DropIndex?: {
            name: Ident,
        },
        EnableAlwaysRule?: {
            name: Ident,
        },
        EnableAlwaysTrigger?: {
            name: Ident,
        },
        EnableReplicaRule?: {
            name: Ident,
        },
        EnableReplicaTrigger?: {
            name: Ident,
        },
        EnableRule?: {
            name: Ident,
        },
        EnableTrigger?: {
            name: Ident,
        },
        RenamePartitions?: {
            old_partitions: Expr[],
            new_partitions: Expr[],
        },
        ReplicaIdentity?: {
            identity: ReplicaIdentity,
        },
        AddPartitions?: {
            if_not_exists: boolean,
            new_partitions: unknown[],
        },
        DropPartitions?: {
            partitions: Expr[],
            if_exists: boolean,
        },
        RenameColumn?: {
            old_column_name: Ident,
            new_column_name: Ident,
        },
        RenameTable?: {
            table_name: RenameTableNameKind,
        },
        ChangeColumn?: {
            old_name: Ident,
            new_name: Ident,
            data_type: DataType,
            options: ColumnOption[],
            column_position?: MySQLColumnPosition,
        },
        ModifyColumn?: {
            col_name: Ident,
            data_type: DataType,
            options: ColumnOption[],
            column_position?: MySQLColumnPosition,
        },
        RenameConstraint?: {
            old_name: Ident,
            new_name: Ident,
        },
        AlterColumn?: {
            column_name: Ident,
            op: AlterColumnOperation,
        },
        SwapWith?: {
            table_name: ObjectName,
        },
        SetTblProperties?: {
            table_properties: SqlOption[],
        },
        OwnerTo?: {
            new_owner: Owner,
        },
        ClusterBy?: {
            exprs: Expr[],
        },
        Algorithm?: {
            equals: boolean,
            algorithm: AlterTableAlgorithm,
        },
        Lock?: {
            equals: boolean,
            lock: AlterTableLock,
        },
        AutoIncrement?: {
            equals: boolean,
            value: ValueWithSpan,
        },
        ValidateConstraint?: {
            name: Ident,
        },
        SetOptionsParens?: {
            options: SqlOption[],
        },
    }

/**
 * [MySQL](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html) ALTER TABLE lock.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AlterTableLock.html
 */
export type AlterTableLock =
    | 'Default'
    | 'None'
    | 'Shared'
    | 'Exclusive';

/**
 * [MySQL](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html) ALTER TABLE algorithm.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AlterTableAlgorithm.html
 */
export type AlterTableAlgorithm = 
    | 'Default'
    | 'Instant'
    | 'Inplace'
    | 'Copy';

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Owner.html
 */
export type Owner = 
    | 'CurrentRole'
    | 'CurrentUser'
    | 'SessionUser'
    | {
    Ident: Ident
};

/**
 * MySQL `ALTER TABLE` only `[FIRST | AFTER column_name]`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.MySQLColumnPosition.html
 */
export type MySQLColumnPosition =
    | 'First'
    | { After: Ident }

/**
 * `<drop behavior> ::= CASCADE | RESTRICT`
 * Used in DROP statements.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DropBehavior.html
 */
export type DropBehavior =
    | 'Restrict'
    | 'Cascade';

/**
 * ALTER TABLE operation `REPLICA IDENTITY` values See [Postgres ALTER TABLE docs](https://www.postgresql.org/docs/current/sql-altertable.html).
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ReplicaIdentity.html
 */
export type ReplicaIdentity =
    | 'None'
    | 'Full'
    | 'Default'
    | { Index: Ident }

/**
 * RenameTableNameKind is the kind used in an `ALTER TABLE _ RENAME` statement.
 * 
 * Note: [MySQL](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html) is the only database that supports the AS keyword for this operation.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.RenameTableNameKind.html
 */
export type RenameTableNameKind = {
    As?: ObjectName;
    To?: ObjectName;
}

/**
 * An `ALTER COLUMN` operation.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AlterColumnOperation.html
 */
export type AlterColumnOperation =
    | 'SetNotNull'
    | 'DropNotNull'
    | 'DropDefault'
    | {
    SetDefault?: {
        value: Expr,
    },
    SetDataType?: {
    data_type: DataType,
        using?: Expr,
        had_set: boolean,
    },
    AddGenerated?: {
        generated_as?: GeneratedAs,
        sequence_options?: SequenceOptions[],
    },
}

/**
 * ```sql
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
 * SQL `CREATE TABLE` statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.CreateTable.html
 */
export interface CreateTable {
    or_replace: boolean,
    temporary: boolean,
    external: boolean,
    dynamic: boolean,
    global?: boolean,
    if_not_exists: boolean,
    transient: boolean,
    volatile: boolean,
    iceberg: boolean,
    name: ObjectName,
    columns: ColumnDef[],
    constraints: TableConstraint[],
    hive_distribution: unknown, // TODO: Define proper type
    hive_formats?: unknown, // TODO: Define proper type
    table_options: CreateTableOptions,
    file_format?: FileFormat,
    location?: String,
    query?: Query,
    without_rowid: boolean,
    like?: CreateTableLikeKind,
    clone?: ObjectName,
    version?: TableVersion,
    comment?: CommentDef,
    on_commit?: OnCommit,
    on_cluster?: Ident,
    primary_key?: Expr,
    order_by?: OneOrManyWithParens<Expr>,
    partition_by?: Expr,
    cluster_by?: WrappedCollection<Expr[]>,
    clustered_by?: unknown,
    inherits?: ObjectName[],
    strict: boolean,
    copy_grants: boolean,
    enable_schema_evolution?: boolean,
    change_tracking?: boolean,
    data_retention_time_in_days?: number,
    max_data_extension_time_in_days?: number,
    default_ddl_collation?: String,
    with_aggregation_policy?: ObjectName,
    with_row_access_policy?: unknown,
    with_tags?: unknown[],
    external_volume?: String,
    base_location?: String,
    catalog?: String,
    catalog_sync?: String,
    storage_serialization_policy?: unknown,
    target_lag?: String,
    warehouse?: Ident,
    refresh_mode?: unknown,
    initialize?: unknown,
    require_user: boolean,
}

/**
 * Helper to indicate if a collection should be wrapped by a symbol in the display form.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.WrappedCollection.html
 */
export type WrappedCollection<T> = {
    /**
     * Print the collection without wrapping symbols, as `item, item, item`.
     */
    NoWrapping?: T;

    /**
     * Wraps the collection in Parentheses, as `(item, item, item)`.
     */
    Parenthesis?: T;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OnCommit.html
 */
export type OnCommit =
    | 'DeleteRows'
    | 'PreserveRows'
    | 'Drop';

/**
 * Specifies how to create a new table based on an existing table’s schema. 
 * ```sql
 * CREATE TABLE new LIKE old …
 * ```
 */
export type CreateTableLikeKind = {
    /**
     * ```sql
     * CREATE TABLE new (LIKE old …)
     * ```
     * Redshift
     */
    Parenthesized?: CreateTableLike,

    /**
     * ```sql
     *  CREATE TABLE new LIKE old …
     * ```
     */
    Plain?: CreateTableLike,
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.CreateTableLike.html
 */
export interface CreateTableLike {
    name: ObjectName;
    defaults?: unknown; // TODO: Define proper type
}

/**
 * Sql options of a `CREATE TABLE` statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CreateTableOptions.html
 */
export type CreateTableOptions = 'None' | {
    /**
     * Options specified using the `WITH` keyword. e.g. `WITH (description = "123")`
     * 
     * @see https://www.postgresql.org/docs/current/sql-createtable.html
     * 
     * MSSQL supports more specific options that’s not only key-value pairs.
     * 
     * `WITH ( DISTRIBUTION = ROUND_ROBIN, CLUSTERED INDEX (column_a DESC, column_b) )`
     * 
     * @see https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-azure-sql-data-warehouse?view=aps-pdw-2016-au7#syntax
     */
    With?: SqlOption[],

    /**
     * Options specified using the `OPTIONS` keyword. e.g. `OPTIONS(description = "123")`
     * 
     * @see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language#table_option_list
     */
    Options?: SqlOption[],

    /**
     * Plain options, options which are not part on any declerative statement e.g. `WITH`/`OPTIONS`/…
     * 
     * @see https://dev.mysql.com/doc/refman/8.4/en/create-table.html
     */
    Plain?: SqlOption[],
    TableProperties?: SqlOption[],
};

/**
 * A table-level constraint, specified in a `CREATE TABLE` or an `ALTER TABLE ADD <constraint>` statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableConstraint.html
 */
export interface TableConstraint {
    Unique?: {
        name?: Ident,
        index_name?: Ident,
        index_type_display: KeyOrIndexDisplay,
        index_type?: IndexType,
        columns: IndexColumn[],
        index_options: IndexOption[],
        characteristics?: ConstraintCharacteristics,
        nulls_distinct: NullsDistinctOption,
    },
    PrimaryKey?: {
        name?: Ident,
        index_name?: Ident,
        index_type?: IndexType,
        columns: IndexColumn[],
        index_options: IndexOption[],
        characteristics?: ConstraintCharacteristics,
    },
    ForeignKey?: {
        name?: Ident,
        index_name?: Ident,
        columns: Ident[],
        foreign_table: ObjectName,
        referred_columns: Ident[],
        on_delete?: ReferentialAction,
        on_update?: ReferentialAction,
        characteristics?: ConstraintCharacteristics,
    },
    Check?: {
        name?: Ident,
        expr: Expr,
        enforced?: boolean,
    },
    Index?: {
        display_as_key: boolean,
        name?: Ident,
        index_type?: IndexType,
        columns: IndexColumn[],
        index_options: IndexOption[],
    },
    FulltextOrSpatial?: {
        fulltext: boolean,
        index_type_display: KeyOrIndexDisplay,
        opt_index_name?: Ident,
        columns: IndexColumn[],
    },
}

/**
 * External table’s available file format
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FileFormat.html
 */
export type FileFormat =
    | 'TEXTFILE'
    | 'SEQUENCEFILE'
    | 'ORC'
    | 'PARQUET'
    | 'AVRO'
    | 'RCFILE'
    | 'JSONFILE';

/**
 * `<constraint_characteristics> = [ DEFERRABLE | NOT DEFERRABLE ] [ INITIALLY DEFERRED | INITIALLY IMMEDIATE ] [ ENFORCED | NOT ENFORCED ]`
 * 
 * Used in UNIQUE and foreign key constraints. The individual settings may occur in any order.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.ConstraintCharacteristics.html
 */
export interface ConstraintCharacteristics {
    /**
     * `[ DEFERRABLE | NOT DEFERRABLE ]`
     */
    deferrable?: boolean,

    /**
     * `[ INITIALLY DEFERRED | INITIALLY IMMEDIATE ]`
     */
    initially?: DeferrableInitial,

    /**
     * `[ ENFORCED | NOT ENFORCED ]`
     */
    enforced?: boolean,
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.DeferrableInitial.html
 */
export type DeferrableInitial = 'Immediate' | 'Deferred';

/**
 * `<referential_action> = { RESTRICT | CASCADE | SET NULL | NO ACTION | SET DEFAULT }`
 * 
 * Used in foreign key constraints in ON UPDATE and ON DELETE options.
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
 * Representation whether a definition can can contains the KEY or INDEX keywords with the same meaning.
 * 
 * This enum initially is directed to `FULLTEXT`,`SPATIAL`, and `UNIQUE` indexes on create table statements of MySQL [(1)].
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.KeyOrIndexDisplay.html
 */
export type KeyOrIndexDisplay =
    | 'None'
    | 'Key'
    | 'Index';

/**
 * Indexing method used by that index.
 * 
 * This structure isn’t present on ANSI, but is found at least in MySQL `CREATE TABLE`, MySQL `CREATE INDEX`, and Postgresql `CREATE INDEX` statements.
 */
export type IndexType =
    | 'BTree'
    | 'Hash'
    | 'GIN'
    | 'GiST'
    | 'SPGiST'
    | 'BRIN'
    | 'Bloom'
    | {
        /**
         * Users may define their own index types, which would not be covered by the above variants.
         */
        Custom: Ident
    };

/**
 * Index column type.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.IndexColumn.html
 */
export interface IndexColumn {
    column: OrderByExpr;
    operator_class?: Ident;
}

/**
 * MySQL index option, used in `CREATE TABLE`, `CREATE INDEX`, and `ALTER TABLE`.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.IndexOption.html
 */
export type IndexOption = {
    /**
     * `USING { BTREE | HASH }`: Index type to use for the index.
     * Note that we permissively parse non-MySQL index types, like `GIN`.
     */
    Using?: IndexType;

    /**
     * `COMMENT 'string'`: Specifies a comment for the index.
     */
    Comment?: string;
}


/**
 * Target of a `TRUNCATE TABLE` command.
 * Note this is its own struct because `visit_relation` requires an `ObjectName` (not a `ObjectName[]`)
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.TruncateTableTarget.html
 */
export interface TruncateTableTarget {
    /**
     * name of the table being truncated
     */
    name: ObjectName;

    /**
     * Postgres-specific option [ TRUNCATE TABLE ONLY ] https://www.postgresql.org/docs/current/sql-truncate.html
     */
    only: boolean;
}

/**
 * PostgreSQL identity option for TRUNCATE table [ RESTART IDENTITY | CONTINUE IDENTITY ]
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TruncateIdentityOption.html
 */
export type TruncateIdentityOption =
    | 'Restart'
    | 'Continue';

/**
 * Cascade/restrict option for Postgres TRUNCATE table, MySQL GRANT/REVOKE, etc. [ CASCADE | RESTRICT ]
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.CascadeOption.html
 */
export type CascadeOption =
    | 'Cascade'
    | 'Restrict';


/**
 * A SQL Delete statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Delete.html
 */
export interface Delete {
    /**
     * Multi tables delete are supported in mysql
     */
    tables: ObjectName[],

    /**
     * FROM
     */
    from: FromTable,

    /**
     * USING (Snowflake, Postgres, MySQL)
     */
    using?: TableWithJoins[],

    /**
     * WHERE
     */
    selection?: Expr,

    /**
     * RETURNING
     */
    returning?: SelectItem[],

    /**
     * ORDER BY (MySQL)
     */
    order_by: OrderByExpr[],

    /**
     * LIMIT (MySQL)
     */
    limit?: Expr,
}

/**
 * A FROM clause within a DELETE statement.
 * `[FROM] table`
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.FromTable.html
 */
export type FromTable = {
    /**
     * An explicit `FROM` keyword was specified.
     */
    WithFromKeyword?: TableWithJoins[];

    /**
     * BigQuery: `FROM` keyword was omitted. https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax#delete_statement
     */
    WithoutKeyword?: TableWithJoins[];
}

/**
 * A SQL Update statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.Statement.html#variant.Update
 */
export interface Update {
    table: TableWithJoins;
    assignments: Assignment[];
    from?: UpdateTableFromKind;
    selection?: Expr;
    returning?: SelectItem[];
    or?: SqliteOnConflict;
    limit?: Expr;
}

/**
 * The `FROM` clause of an `UPDATE TABLE` statement
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.UpdateTableFromKind.html
 */
export type UpdateTableFromKind = {
    /**
     * Update Statement where the ‘FROM’ clause is before the ‘SET’ keyword (Supported by Snowflake)
     * For Example: `UPDATE FROM t1 SET t1.name='aaa'`
     */
    BeforeSet?: TableWithJoins[];

    /**
     * Update Statement where the ‘FROM’ clause is after the ‘SET’ keyword (Which is the standard way)
     * For Example: `UPDATE SET t1.name='aaa' FROM t1`
     */
    AfterSet?: TableWithJoins[];
}

/**
 * A SQL Insert statement.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Insert.html
 */
export interface Insert {
    /**
     * Only for Sqlite.
     */
    or?: SqliteOnConflict,

    /**
     * Only for mysql.
     */
    ignore: boolean,

    /**
     * INTO - optional keyword.
     */
    into: boolean,

    /**
     * TABLE
     */
    table: TableObject,

    /**
     * table_name as foo (for PostgreSQL)
     */
    table_alias?: Ident,

    /**
     * COLUMNS
     */
    columns: Ident[],

    /**
     * Overwrite (Hive)
     */
    overwrite: boolean,

    /**
     * A SQL query that specifies what to insert
     */
    source?: Query,

    /**
     * MySQL `INSERT INTO ... SET` See: https://dev.mysql.com/doc/refman/8.4/en/insert.html
     */
    assignments: Assignment[],

    /**
     * partitioned insert (Hive)
     */
    partitioned?: Expr[],

    /**
     * Columns defined after PARTITION
     */
    after_columns: Ident[],

    /**
     * whether the insert has the table keyword (Hive)
     */
    has_table_keyword: boolean,

    on?: OnInsert,

    /**
     * RETURNING
     */
    returning?: SelectItem[],

    /**
     * Only for mysql
     */
    replace_into: boolean,

    /**
     * Only for mysql
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.MysqlInsertPriority.html
     */
    priority?: unknown;

    /**
     * Only for mysql
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.InsertAliases.html
     */
    insert_alias?: unknown,

    /**
     * Settings used for ClickHouse.
     * ClickHouse syntax: `INSERT INTO tbl SETTINGS format_template_resultset = '/some/path/resultset.format'`
     * [ClickHouse INSERT INTO](https://clickhouse.com/docs/en/sql-reference/statements/insert-into)
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Setting.html
     */
    settings?: unknown[],

    /**
     * Format for `INSERT` statement when not using standard SQL format. Can be e.g. `CSV`, `JSON`, `JSONAsString`, `LineAsString` and more.
     * 
     * ClickHouse syntax: `INSERT INTO tbl FORMAT JSONEachRow {"foo": 1, "bar": 2}, {"foo": 3}`
     * 
     * [ClickHouse formats JSON insert](https://clickhouse.com/docs/en/interfaces/formats#json-inserting-data)
     * 
     * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.InputFormatClause.html
     */
    format_clause?: unknown,
}

/**
 * Sqlite specific syntax
 * 
 * See [Sqlite documentation](https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SqliteOnConflict.html) for more details.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.SqliteOnConflict.html
 */
export type SqliteOnConflict =
    | 'Rollback'
    | 'Abort'
    | 'Fail'
    | 'Ignore'
    | 'Replace';

/**
 * Represents the referenced table in an `INSERT INTO` statement
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.TableObject.html
 */
export type TableObject = {
    /**
     * Table specified by name. Example:
     * `INSERT INTO my_table`
     */
    TableName?: ObjectName;

    /**
     * Table specified as a function. Example:
     * `INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)`
     */
    TableFunction?: SQLFunction;
}

/**
 * Non exhaustive list of options.
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OnInsert.html
 */
export type OnInsert = {
    /**
     * ON DUPLICATE KEY UPDATE (MySQL when the key already exists, then execute an update instead)
     */
    DuplicateKeyUpdate?: Assignment[];

    /**
     * ON CONFLICT is a PostgreSQL and Sqlite extension
     */
    OnConflict?: OnConflict;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.OnConflict.html
 */
export interface OnConflict {
    conflict_target?: ConflictTarget;
    action: OnConflictAction;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.ConflictTarget.html
 */
export type ConflictTarget = {
    Columns?: Ident[];
    OnConstraint?: ObjectName;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.OnConflictAction.html
 */
export type OnConflictAction = 'DoNothing' | {
    DoUpdate?: DoUpdate;
}

/**
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.DoUpdate.html
 */
export interface DoUpdate {
    /**
     * Column assignments
     */
    assignments: Assignment[];

    /**
     * WHERE
     */
    selection?: Expr;
}

/**
 * SQL assignment `foo = expr` as used in SQLUpdate
 * 
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/struct.Assignment.html
 */
export interface Assignment {
    target: AssignmentTarget;
    value: Expr;
}

/**
 * Left-hand side of an assignment in an UPDATE statement, e.g. `foo` in `foo = 5` (ColumnName assignment) or `(a, b)` in `(a, b) = (1, 2)` (Tuple assignment).
 * @see https://docs.rs/sqlparser/latest/sqlparser/ast/enum.AssignmentTarget.html
 */
export type AssignmentTarget = {
    ColumnName?: ObjectName;
    Tuple?: ObjectName[];
}

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