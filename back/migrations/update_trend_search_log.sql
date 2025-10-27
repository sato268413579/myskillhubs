-- TrendSearchLogテーブルの更新用SQLスクリプト
-- 既存のテーブル名を修正し、新しいカラムを追加

-- 1. テーブル名を修正（typo修正）
ALTER TABLE trand_search_log RENAME TO trend_search_log;

-- 2. 新しいカラムを追加
ALTER TABLE trend_search_log 
ADD COLUMN search_query TEXT NOT NULL DEFAULT '',
ADD COLUMN search_type VARCHAR(50) DEFAULT 'basic',
ADD COLUMN result_summary TEXT,
ADD COLUMN keywords TEXT,
ADD COLUMN insights TEXT,
ADD COLUMN sources_used TEXT,
ADD COLUMN confidence_score FLOAT DEFAULT 0.0,
ADD COLUMN search_duration FLOAT,
ADD COLUMN tokens_used INTEGER DEFAULT 0,
ADD COLUMN retry_count INTEGER DEFAULT 0,
ADD COLUMN success BOOLEAN DEFAULT TRUE,
ADD COLUMN error_message TEXT,
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN search_period_start DATE,
ADD COLUMN search_period_end DATE;

-- 3. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX idx_trend_search_log_user_id ON trend_search_log(user_id);
CREATE INDEX idx_trend_search_log_created_at ON trend_search_log(created_at);
CREATE INDEX idx_trend_search_log_search_type ON trend_search_log(search_type);
CREATE INDEX idx_trend_search_log_success ON trend_search_log(success);

-- 4. user_idカラムにNOT NULL制約を追加
ALTER TABLE trend_search_log MODIFY COLUMN user_id INTEGER NOT NULL;