-- Read-only checks for adopting an existing WarrantyVault schema.
-- Every result set must be empty before baselining version 1.

WITH expected_tables (table_name) AS (
    SELECT 'users' UNION ALL SELECT 'products' UNION ALL SELECT 'repairs' UNION ALL SELECT 'notifications'
)
SELECT expected_tables.table_name AS missing_table
FROM expected_tables
LEFT JOIN information_schema.tables actual
    ON actual.table_schema = DATABASE() AND actual.table_name = expected_tables.table_name
WHERE actual.table_name IS NULL;

WITH expected_columns (table_name, column_name, data_type) AS (
    SELECT 'users', 'id', 'bigint' UNION ALL SELECT 'users', 'full_name', 'varchar' UNION ALL SELECT 'users', 'email', 'varchar' UNION ALL SELECT 'users', 'password', 'varchar' UNION ALL SELECT 'users', 'role', 'varchar' UNION ALL SELECT 'users', 'created_at', 'datetime' UNION ALL SELECT 'users', 'updated_at', 'datetime' UNION ALL
    SELECT 'products', 'id', 'bigint' UNION ALL SELECT 'products', 'user_id', 'bigint' UNION ALL SELECT 'products', 'name', 'varchar' UNION ALL SELECT 'products', 'brand', 'varchar' UNION ALL SELECT 'products', 'category', 'varchar' UNION ALL SELECT 'products', 'model_number', 'varchar' UNION ALL SELECT 'products', 'serial_number', 'varchar' UNION ALL SELECT 'products', 'purchase_price', 'decimal' UNION ALL SELECT 'products', 'purchase_date', 'date' UNION ALL SELECT 'products', 'warranty_duration_months', 'int' UNION ALL SELECT 'products', 'warranty_start_date', 'date' UNION ALL SELECT 'products', 'warranty_expiry_date', 'date' UNION ALL SELECT 'products', 'description', 'varchar' UNION ALL SELECT 'products', 'receipt_file_name', 'varchar' UNION ALL SELECT 'products', 'receipt_original_name', 'varchar' UNION ALL SELECT 'products', 'receipt_content_type', 'varchar' UNION ALL SELECT 'products', 'created_at', 'datetime' UNION ALL SELECT 'products', 'updated_at', 'datetime' UNION ALL
    SELECT 'repairs', 'id', 'bigint' UNION ALL SELECT 'repairs', 'product_id', 'bigint' UNION ALL SELECT 'repairs', 'user_id', 'bigint' UNION ALL SELECT 'repairs', 'issue_title', 'varchar' UNION ALL SELECT 'repairs', 'issue_description', 'varchar' UNION ALL SELECT 'repairs', 'request_date', 'date' UNION ALL SELECT 'repairs', 'service_center_name', 'varchar' UNION ALL SELECT 'repairs', 'service_center_contact', 'varchar' UNION ALL SELECT 'repairs', 'status', 'varchar' UNION ALL SELECT 'repairs', 'cost', 'decimal' UNION ALL SELECT 'repairs', 'warranty_claim', 'tinyint' UNION ALL SELECT 'repairs', 'completion_date', 'date' UNION ALL SELECT 'repairs', 'notes', 'varchar' UNION ALL SELECT 'repairs', 'created_at', 'datetime' UNION ALL SELECT 'repairs', 'updated_at', 'datetime' UNION ALL
    SELECT 'notifications', 'id', 'bigint' UNION ALL SELECT 'notifications', 'user_id', 'bigint' UNION ALL SELECT 'notifications', 'product_id', 'bigint' UNION ALL SELECT 'notifications', 'title', 'varchar' UNION ALL SELECT 'notifications', 'message', 'varchar' UNION ALL SELECT 'notifications', 'type', 'varchar' UNION ALL SELECT 'notifications', 'is_read', 'tinyint' UNION ALL SELECT 'notifications', 'reminder_window_days', 'int' UNION ALL SELECT 'notifications', 'created_at', 'datetime'
)
SELECT expected_columns.table_name, expected_columns.column_name, expected_columns.data_type AS expected_type,
       actual.data_type AS actual_type
FROM expected_columns
LEFT JOIN information_schema.columns actual
    ON actual.table_schema = DATABASE()
   AND actual.table_name = expected_columns.table_name
   AND actual.column_name = expected_columns.column_name
WHERE actual.column_name IS NULL OR actual.data_type <> expected_columns.data_type;

WITH expected_keys (table_name, column_name, constraint_type) AS (
    SELECT 'users', 'id', 'PRIMARY KEY' UNION ALL SELECT 'users', 'email', 'UNIQUE' UNION ALL
    SELECT 'products', 'id', 'PRIMARY KEY' UNION ALL SELECT 'repairs', 'id', 'PRIMARY KEY' UNION ALL
    SELECT 'notifications', 'id', 'PRIMARY KEY'
)
SELECT expected_keys.table_name, expected_keys.column_name, expected_keys.constraint_type AS missing_key
FROM expected_keys
LEFT JOIN information_schema.table_constraints actual_constraint
    ON actual_constraint.constraint_schema = DATABASE()
   AND actual_constraint.table_name = expected_keys.table_name
   AND actual_constraint.constraint_type = expected_keys.constraint_type
LEFT JOIN information_schema.key_column_usage actual_column
    ON actual_column.constraint_schema = actual_constraint.constraint_schema
   AND actual_column.table_name = actual_constraint.table_name
   AND actual_column.constraint_name = actual_constraint.constraint_name
   AND actual_column.column_name = expected_keys.column_name
WHERE actual_column.constraint_name IS NULL;

WITH expected_foreign_keys (table_name, column_name, referenced_table_name, referenced_column_name, delete_rule) AS (
    SELECT 'products', 'user_id', 'users', 'id', 'CASCADE' UNION ALL
    SELECT 'repairs', 'product_id', 'products', 'id', 'CASCADE' UNION ALL
    SELECT 'repairs', 'user_id', 'users', 'id', 'CASCADE' UNION ALL
    SELECT 'notifications', 'user_id', 'users', 'id', 'CASCADE' UNION ALL
    SELECT 'notifications', 'product_id', 'products', 'id', 'SET NULL'
)
SELECT expected_foreign_keys.table_name, expected_foreign_keys.column_name AS missing_or_incompatible_foreign_key
FROM expected_foreign_keys
LEFT JOIN information_schema.key_column_usage actual_column
    ON actual_column.constraint_schema = DATABASE()
   AND actual_column.table_name = expected_foreign_keys.table_name
   AND actual_column.column_name = expected_foreign_keys.column_name
   AND actual_column.referenced_table_name = expected_foreign_keys.referenced_table_name
   AND actual_column.referenced_column_name = expected_foreign_keys.referenced_column_name
LEFT JOIN information_schema.referential_constraints actual_rule
    ON actual_rule.constraint_schema = actual_column.constraint_schema
   AND actual_rule.constraint_name = actual_column.constraint_name
WHERE actual_column.constraint_name IS NULL OR actual_rule.delete_rule <> expected_foreign_keys.delete_rule;

WITH expected_indexes (table_name, index_name) AS (
    SELECT 'users', 'idx_user_email' UNION ALL
    SELECT 'products', 'idx_product_user' UNION ALL SELECT 'products', 'idx_product_expiry' UNION ALL SELECT 'products', 'idx_product_category' UNION ALL
    SELECT 'repairs', 'idx_repair_product' UNION ALL SELECT 'repairs', 'idx_repair_user' UNION ALL SELECT 'repairs', 'idx_repair_status' UNION ALL SELECT 'repairs', 'idx_repair_request_date' UNION ALL
    SELECT 'notifications', 'idx_notification_user' UNION ALL SELECT 'notifications', 'idx_notification_read' UNION ALL SELECT 'notifications', 'idx_notification_user_prod_window'
)
SELECT expected_indexes.table_name, expected_indexes.index_name AS missing_index
FROM expected_indexes
LEFT JOIN information_schema.statistics actual
    ON actual.table_schema = DATABASE()
   AND actual.table_name = expected_indexes.table_name
   AND actual.index_name = expected_indexes.index_name
WHERE actual.index_name IS NULL;
