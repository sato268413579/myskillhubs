-- ============================================================================
-- MySkillHubs - 統合マイグレーションスクリプト（完全版）
-- ============================================================================
-- 全てのテーブルを削除してから再作成します（データは全て削除されます）
-- 実行方法: mysql -u root -p myapp < back/migrations/all_migrations.sql
-- または: docker exec -i db mysql -uroot -pexample myapp < back/migrations/all_migrations.sql
-- ============================================================================

USE myapp;

-- ============================================================================
-- 警告: 全てのデータが削除されます
-- ============================================================================
SELECT '⚠️  WARNING: All existing data will be deleted!' AS warning;

-- ============================================================================
-- 既存テーブルの削除（外部キー制約を考慮した順序）
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `milestone_history`;
DROP TABLE IF EXISTS `milestone_dependencies`;
DROP TABLE IF EXISTS `milestones`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `user_services`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `trend_search_log`;
DROP TABLE IF EXISTS `customer_tags`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `deals`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ All existing tables dropped' AS status;

-- ============================================================================
-- 0. 基本テーブルの作成（users, customers, deals, contacts, tags）
-- ============================================================================

-- 0-1. ユーザーテーブル
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー';

-- デフォルトユーザーを挿入
-- bcrypt ハッシュ化されたパスワード
INSERT INTO `users` (`id`, `username`, `password_hash`) VALUES 
(1, 'admin', '$2b$12$CSyWL.2y7JMcvePODtf3Z.ykt4nYCmp0ldLPJKhch8wMZFKqJsz5a'),  -- password: admin
(2, 'user1', '$2b$12$JknemjhAvPA.b.pPhf6jfupvQgzmUik3eHWky8iEWD4vdIguxEcuq'),  -- password: user1
(3, 'user2', '$2b$12$AKku1FXWjdK2O32r8f.NMOC4vqhNBaEQAqJO.WPSffCRqBmzA11Ly'),  -- password: user2
(4, 'Findy', '$2b$12$7ZUivXO8zCe74M/rUdpRKeRb57NzamGnS681WbBUMGNa2bVMgp3cq'),  -- password: Findy
(5, 'pocuser1', '$2b$12$hqBUERUMnw3zhqxoBalz1.gh7nFu9V0dqO0wu0HKoOAZhSn7jqZuG');  -- password: pocuser1

-- 0-2. 顧客テーブル
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `company` VARCHAR(120),
  `department` VARCHAR(120),
  `title` VARCHAR(120),
  `phone` VARCHAR(50),
  `mobile` VARCHAR(50),
  `address` VARCHAR(255),
  `note` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='顧客';

-- 0-3. 取引履歴テーブル
CREATE TABLE `deals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12,2),
  `status` VARCHAR(50),
  `closed_at` DATE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_deals_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='取引履歴';

-- 0-4. コンタクト履歴テーブル
CREATE TABLE `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `contact_type` VARCHAR(50),
  `contact_date` DATETIME,
  `note` TEXT,
  PRIMARY KEY (`id`),
  KEY `idx_contact_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_contacts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contacts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='コンタクト履歴';

-- 0-5. メモテーブル
CREATE TABLE `notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_note_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_notes_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='メモ';

-- 0-6. タグテーブル
CREATE TABLE `tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='タグ';

-- 0-7. 顧客とタグの多対多リレーション
CREATE TABLE `customer_tags` (
  `customer_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`customer_id`, `tag_id`),
  CONSTRAINT `fk_customer_tags_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='顧客タグ関連';

-- 0-8. トレンド検索ログテーブル
CREATE TABLE `trend_search_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `trend` VARCHAR(255) NOT NULL,
  `result` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trend_search_log_user_id` (`user_id`),
  KEY `idx_trend_search_log_created_at` (`created_at`),
  KEY `idx_trend_search_log_trend` (`trend`),
  CONSTRAINT `fk_trend_search_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='トレンド検索ログ';

SELECT '✅ Step 0: Base tables created (users, customers, deals, contacts, tags, trend_search_log)' AS status;

-- ============================================================================
-- 1. 工事工程管理機能のテーブル作成
-- ============================================================================

-- 1-1. プロジェクトテーブル
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ユーザーID',
    name VARCHAR(255) NOT NULL COMMENT 'プロジェクト名',
    description TEXT COMMENT 'プロジェクト説明',
    client_name VARCHAR(255) COMMENT '顧客名',
    site_location VARCHAR(500) COMMENT '工事現場住所',
    start_date DATE COMMENT 'プロジェクト開始予定日',
    end_date DATE COMMENT 'プロジェクト終了予定日',
    status ENUM('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning' COMMENT 'ステータス',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工事プロジェクト';

-- 1-2. 工程マイルストーンテーブル
CREATE TABLE milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL COMMENT 'プロジェクトID',
    name VARCHAR(255) NOT NULL COMMENT '工程名',
    description TEXT COMMENT '工程説明',
    start_date DATETIME NOT NULL COMMENT '開始日時',
    end_date DATETIME NOT NULL COMMENT '終了日時',
    display_order INT NOT NULL DEFAULT 0 COMMENT '表示順序',
    status ENUM('not_started', 'in_progress', 'completed', 'delayed') DEFAULT 'not_started' COMMENT 'ステータス',
    progress_percentage INT DEFAULT 0 COMMENT '進捗率（0-100）',
    assigned_to VARCHAR(255) COMMENT '担当者',
    color VARCHAR(7) DEFAULT '#3B82F6' COMMENT '表示色（HEX）',
    notes TEXT COMMENT '備考',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_milestones_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    INDEX idx_project_order (project_id, display_order),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status),
    CONSTRAINT chk_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程マイルストーン';

-- 1-3. 工程依存関係テーブル
CREATE TABLE milestone_dependencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    predecessor_id INT NOT NULL COMMENT '先行工程ID',
    successor_id INT NOT NULL COMMENT '後続工程ID',
    dependency_type ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') 
        DEFAULT 'finish_to_start' COMMENT '依存関係タイプ',
    lag_days INT DEFAULT 0 COMMENT '遅延日数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_milestone_dependencies_predecessor` FOREIGN KEY (`predecessor_id`) REFERENCES `milestones` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_milestone_dependencies_successor` FOREIGN KEY (`successor_id`) REFERENCES `milestones` (`id`) ON DELETE CASCADE,
    UNIQUE KEY unique_dependency (predecessor_id, successor_id),
    INDEX idx_predecessor (predecessor_id),
    INDEX idx_successor (successor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程依存関係';

-- 1-4. 工程変更履歴テーブル
CREATE TABLE milestone_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT NOT NULL COMMENT 'マイルストーンID',
    field_name VARCHAR(100) NOT NULL COMMENT '変更フィールド名',
    old_value TEXT COMMENT '変更前の値',
    new_value TEXT COMMENT '変更後の値',
    changed_by VARCHAR(255) COMMENT '変更者',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_milestone_history_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`) ON DELETE CASCADE,
    INDEX idx_milestone (milestone_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程変更履歴';

SELECT '✅ Step 1: Construction Schedule tables created' AS status;

-- ============================================================================
-- 2. プロジェクトテーブルにuser_idカラムを追加
-- ============================================================================

-- 2-1. user_idカラムを追加（カラムが存在しない場合のみ）
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'myapp' 
    AND TABLE_NAME = 'projects' 
    AND COLUMN_NAME = 'user_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE projects ADD COLUMN user_id INT COMMENT "ユーザーID" AFTER id',
    'SELECT "Column user_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2-2. 既存データに対してデフォルトユーザーIDを設定（最初のユーザーIDを使用）
UPDATE projects 
SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE user_id IS NULL;

-- 2-3. user_idをNOT NULLに変更
ALTER TABLE projects 
MODIFY COLUMN user_id INT NOT NULL COMMENT 'ユーザーID';

-- 2-4. 外部キー制約を追加（既に存在する場合はスキップ）
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'myapp' 
    AND TABLE_NAME = 'projects' 
    AND CONSTRAINT_NAME = 'fk_projects_user_id'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE projects ADD CONSTRAINT fk_projects_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2-5. インデックスを追加（既に存在する場合はスキップ）
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'myapp' 
    AND TABLE_NAME = 'projects' 
    AND INDEX_NAME = 'idx_user_id'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE projects ADD INDEX idx_user_id (user_id)',
    'SELECT "Index already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Step 2: user_id column added to projects table' AS status;

-- ============================================================================
-- 3. ユーザーサービス管理テーブルの作成
-- ============================================================================

-- 3-1. ユーザーサービステーブル
CREATE TABLE IF NOT EXISTS user_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ユーザーID',
    service_id VARCHAR(50) NOT NULL COMMENT 'サービスID',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '有効/無効',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_service (user_id, service_id),
    INDEX idx_user_id (user_id),
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ユーザーが利用可能なサービス';

-- 3-2. ユーザーロールテーブル（将来の拡張用）
CREATE TABLE IF NOT EXISTS user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ユーザーID',
    role ENUM('admin', 'manager', 'user', 'guest') DEFAULT 'user' COMMENT 'ロール',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id),
    INDEX idx_user_id_role (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ユーザーロール';

-- 3-3. 既存ユーザーにデフォルトロールを設定
INSERT INTO user_roles (user_id, role)
SELECT id, 'user' FROM users
WHERE id NOT IN (SELECT user_id FROM user_roles);

-- 3-4. 既存ユーザーに全サービスを有効化
INSERT INTO user_services (user_id, service_id, is_enabled)
SELECT u.id, 'tasks', TRUE FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_services WHERE user_id = u.id AND service_id = 'tasks');

INSERT INTO user_services (user_id, service_id, is_enabled)
SELECT u.id, 'crm', TRUE FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_services WHERE user_id = u.id AND service_id = 'crm');

INSERT INTO user_services (user_id, service_id, is_enabled)
SELECT u.id, 'aiSearch', TRUE FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_services WHERE user_id = u.id AND service_id = 'aiSearch');

INSERT INTO user_services (user_id, service_id, is_enabled)
SELECT u.id, 'construction-schedule', TRUE FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_services WHERE user_id = u.id AND service_id = 'construction-schedule');

INSERT INTO user_services (user_id, service_id, is_enabled)
SELECT u.id, '3d', TRUE FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_services WHERE user_id = u.id AND service_id = '3d');

SELECT '✅ Step 3: User services tables created' AS status;

-- ============================================================================
-- 4. TrendSearchLogテーブルの更新（スキップ - Step 0で作成済み）
-- ============================================================================

-- trend_search_logテーブルは既にStep 0で作成されているため、追加の更新は不要

SELECT '✅ Step 4: TrendSearchLog table already created in Step 0' AS status;

-- ============================================================================
-- 5. サンプルデータの挿入（プロジェクトと工程）
-- ============================================================================

-- 5-1. サンプルプロジェクトの挿入（既に存在しない場合のみ）
INSERT INTO projects (id, user_id, name, description, client_name, site_location, start_date, end_date, status) VALUES
(1, (SELECT id FROM users ORDER BY id LIMIT 1), '新築マンション建設プロジェクト', '5階建てマンション新築工事', '株式会社ABC建設', '東京都渋谷区〇〇1-2-3', '2024-04-01', '2024-12-31', 'in_progress'),
(2, (SELECT id FROM users ORDER BY id LIMIT 1), 'オフィスビル改修工事', '既存オフィスビルの内装改修', '株式会社XYZ不動産', '東京都港区△△2-3-4', '2024-06-01', '2024-09-30', 'planning');

-- 5-2. プロジェクト1の工程
INSERT INTO milestones (id, project_id, name, description, start_date, end_date, display_order, status, progress_percentage, color) VALUES
(1, 1, '基礎工事', '地盤調査・杭打ち・基礎コンクリート打設', '2024-04-01 08:00:00', '2024-05-15 17:00:00', 1, 'completed', 100, '#10B981'),
(2, 1, '躯体工事', '鉄筋組立・型枠設置・コンクリート打設', '2024-05-16 08:00:00', '2024-08-31 17:00:00', 2, 'in_progress', 60, '#3B82F6'),
(3, 1, '外装工事', '外壁タイル貼り・防水工事', '2024-09-01 08:00:00', '2024-10-31 17:00:00', 3, 'not_started', 0, '#F59E0B'),
(4, 1, '内装工事', '間仕切り・クロス貼り・床仕上げ', '2024-10-01 08:00:00', '2024-11-30 17:00:00', 4, 'not_started', 0, '#8B5CF6'),
(5, 1, '設備工事', '電気・給排水・空調設備設置', '2024-10-15 08:00:00', '2024-12-15 17:00:00', 5, 'not_started', 0, '#EC4899'),
(6, 1, '竣工検査', '最終検査・引き渡し準備', '2024-12-16 08:00:00', '2024-12-31 17:00:00', 6, 'not_started', 0, '#6366F1');

-- 5-3. プロジェクト2の工程
INSERT INTO milestones (id, project_id, name, description, start_date, end_date, display_order, status, color) VALUES
(7, 2, '既存設備撤去', '既存内装・設備の撤去', '2024-06-01 08:00:00', '2024-06-15 17:00:00', 1, 'not_started', '#EF4444'),
(8, 2, '内装工事', '新規内装工事', '2024-06-16 08:00:00', '2024-08-31 17:00:00', 2, 'not_started', '#3B82F6'),
(9, 2, '設備更新', '電気・空調設備更新', '2024-07-01 08:00:00', '2024-09-15 17:00:00', 3, 'not_started', '#F59E0B'),
(10, 2, '最終検査', '竣工検査・引き渡し', '2024-09-16 08:00:00', '2024-09-30 17:00:00', 4, 'not_started', '#10B981');

SELECT '✅ Step 5: Sample data inserted' AS status;

-- ============================================================================
-- 6. 完了メッセージとサマリー
-- ============================================================================

SELECT '
============================================================================
🎉 全てのマイグレーションが完了しました！
============================================================================
' AS message;

-- テーブル一覧
SELECT 'テーブル一覧:' AS info;
SHOW TABLES;

-- 各テーブルのレコード数
SELECT '
データサマリー:
' AS info;
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'user_services', COUNT(*) FROM user_services
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;

SELECT '
============================================================================
✅ マイグレーション完了
============================================================================
' AS final_message;
