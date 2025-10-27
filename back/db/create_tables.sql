USE myapp;

-- 顧客テーブル
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INTEGER NOT NULL,
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
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ユーザーテーブル（既存）
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO `users`(`username`, `email`, `password_hash`) VALUES ('test', 'test@example.com', "$2b$12$h31F9WIG.ewlvo0VlAiwXeyHONzLQZq0EoIlii4yMMh14dF7fD3Uq");

-- 取引履歴テーブル
CREATE TABLE IF NOT EXISTS `deals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INTEGER NOT NULL,
  `title` VARCHAR(100) NOT NULL,           -- 取引タイトル
  `amount` DECIMAL(12,2),                  -- 金額
  `status` VARCHAR(50),                    -- 状況（提案中, 成約, 失注など）
  `closed_at` DATE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  CONSTRAINT `fk_deals_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- コンタクト履歴テーブル（電話・メール・面談など）
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INTEGER NOT NULL,
  `contact_type` VARCHAR(50),              -- 種別（電話, メール, ミーティング）
  `contact_date` DATETIME,                 -- 日付
  `note` TEXT,                             -- 内容
  PRIMARY KEY (`id`),
  KEY `idx_contact_customer_id` (`customer_id`),
  CONSTRAINT `fk_contacts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- メモテーブル
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `user_id` INTEGER NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_note_customer_id` (`customer_id`),
  CONSTRAINT `fk_notes_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- タグテーブル
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 顧客とタグの多対多リレーション
CREATE TABLE IF NOT EXISTS `customer_tags` (
  `customer_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`customer_id`, `tag_id`),
  CONSTRAINT `fk_customer_tags_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- トレンド検索ログテーブル
CREATE TABLE IF NOT EXISTS `trend_search_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `search_query` TEXT NOT NULL,
  `search_type` VARCHAR(50) DEFAULT 'basic',
  
  -- 検索結果データ
  `result_summary` TEXT,
  `keywords` TEXT,                         -- JSON形式で保存
  `insights` TEXT,                         -- JSON形式で保存
  `sources_used` TEXT,                     -- JSON形式で保存
  `confidence_score` FLOAT DEFAULT 0.0,
  
  -- メタデータ
  `search_duration` FLOAT,                 -- 検索にかかった時間（秒）
  `tokens_used` INT DEFAULT 0,
  `retry_count` INT DEFAULT 0,
  `success` BOOLEAN DEFAULT TRUE,
  `error_message` TEXT,
  
  -- タイムスタンプ
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 検索期間
  `search_period_start` DATE,
  `search_period_end` DATE,
  
  PRIMARY KEY (`id`),
  KEY `idx_trend_search_log_user_id` (`user_id`),
  KEY `idx_trend_search_log_created_at` (`created_at`),
  KEY `idx_trend_search_log_search_type` (`search_type`),
  KEY `idx_trend_search_log_success` (`success`),
  KEY `idx_trend_search_log_period` (`search_period_start`, `search_period_end`),
  CONSTRAINT `fk_trend_search_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
