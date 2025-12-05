# 工事工程管理機能 - Requirements Document

## 1. 機能概要

### 1.1 位置づけ
MySkillHubs内のPoC機能の一つとして、工事プロジェクトの工程管理をガントチャート形式で提供します。新規顧客候補とのツールイメージすり合わせを目的としたプロトタイプです。

### 1.2 主要技術
- **フロントエンド**: React + TypeScript
- **バックエンド**: Flask (Python) + SQLAlchemy
- **データベース**: MySQL
- **UI**: ドラッグ&ドロップ対応ガントチャート
- **エンドポイント**: `/service/construction-schedule`
- **状態**: 開発予定

### 1.3 目的
新規顧客候補が希望する工事工程管理ツールのPoCを作成し、ツールのイメージをすり合わせる。

## 2. データモデル

### 2.1 テーブル設計

#### 2.1.1 projects（プロジェクト）
```sql
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'プロジェクト名',
    description TEXT COMMENT 'プロジェクト説明',
    client_name VARCHAR(255) COMMENT '顧客名',
    site_location VARCHAR(500) COMMENT '工事現場住所',
    start_date DATE COMMENT 'プロジェクト開始予定日',
    end_date DATE COMMENT 'プロジェクト終了予定日',
    status ENUM('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning' COMMENT 'ステータス',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工事プロジェクト';
```

#### 2.1.2 milestones（工程マイルストーン）
```sql
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
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_order (project_id, display_order),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程マイルストーン';
```

#### 2.1.3 milestone_dependencies（工程依存関係）
```sql
CREATE TABLE milestone_dependencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    predecessor_id INT NOT NULL COMMENT '先行工程ID',
    successor_id INT NOT NULL COMMENT '後続工程ID',
    dependency_type ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') 
        DEFAULT 'finish_to_start' COMMENT '依存関係タイプ',
    lag_days INT DEFAULT 0 COMMENT '遅延日数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (predecessor_id) REFERENCES milestones(id) ON DELETE CASCADE,
    FOREIGN KEY (successor_id) REFERENCES milestones(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dependency (predecessor_id, successor_id),
    INDEX idx_predecessor (predecessor_id),
    INDEX idx_successor (successor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程依存関係';
```

#### 2.1.4 milestone_history（工程変更履歴）
```sql
CREATE TABLE milestone_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT NOT NULL COMMENT 'マイルストーンID',
    field_name VARCHAR(100) NOT NULL COMMENT '変更フィールド名',
    old_value TEXT COMMENT '変更前の値',
    new_value TEXT COMMENT '変更後の値',
    changed_by VARCHAR(255) COMMENT '変更者',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    INDEX idx_milestone (milestone_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工程変更履歴';
```

### 2.2 データモデル図

```
projects (1) ----< (N) milestones
                        |
                        | (predecessor)
                        |
                        v
                  milestone_dependencies
                        |
                        | (successor)
                        |
                        v
                    milestones
                        |
                        |
                        v
                  milestone_history
```

### 2.3 サンプルデータ

```sql
-- プロジェクト例
INSERT INTO projects (name, description, client_name, site_location, start_date, end_date, status) VALUES
('新築マンション建設プロジェクト', '5階建てマンション新築工事', '株式会社ABC建設', '東京都渋谷区〇〇1-2-3', '2024-04-01', '2024-12-31', 'in_progress');

-- 工程例
INSERT INTO milestones (project_id, name, description, start_date, end_date, display_order, status, color) VALUES
(1, '基礎工事', '地盤調査・杭打ち・基礎コンクリート打設', '2024-04-01 08:00:00', '2024-05-15 17:00:00', 1, 'completed', '#10B981'),
(1, '躯体工事', '鉄筋組立・型枠設置・コンクリート打設', '2024-05-16 08:00:00', '2024-08-31 17:00:00', 2, 'in_progress', '#3B82F6'),
(1, '外装工事', '外壁タイル貼り・防水工事', '2024-09-01 08:00:00', '2024-10-31 17:00:00', 3, 'not_started', '#F59E0B'),
(1, '内装工事', '間仕切り・クロス貼り・床仕上げ', '2024-10-01 08:00:00', '2024-11-30 17:00:00', 4, 'not_started', '#8B5CF6'),
(1, '設備工事', '電気・給排水・空調設備設置', '2024-10-15 08:00:00', '2024-12-15 17:00:00', 5, 'not_started', '#EC4899'),
(1, '竣工検査', '最終検査・引き渡し準備', '2024-12-16 08:00:00', '2024-12-31 17:00:00', 6, 'not_started', '#6366F1');
```

## 3. 機能要件

### 3.1 プロジェクト管理

**User Story:** As a 工事管理者, I want プロジェクトを作成・管理したい, so that 複数の工事案件を整理できる

#### Acceptance Criteria
1. WHEN ユーザーがプロジェクトを作成する THEN プロジェクト一覧に追加される
2. WHEN ユーザーがプロジェクト名をクリックする THEN 工程ガントチャートが表示される
3. WHEN ユーザーがプロジェクト情報を編集する THEN 変更が保存される
4. WHEN ユーザーがプロジェクトを削除する THEN 関連する工程も削除される
5. WHEN ユーザーがプロジェクトステータスを変更する THEN ステータスが更新される

### 3.2 工程マイルストーン管理（ドラッグ&ドロップ）

**User Story:** As a 工事管理者, I want 工程をドラッグ&ドロップで調整したい, so that 直感的にスケジュールを変更できる

#### Acceptance Criteria
1. WHEN ユーザーが工程バーをドラッグする THEN リアルタイムでプレビューが表示される
2. WHEN ユーザーが工程バーをドロップする THEN 開始日時・終了日時がDBに更新される
3. WHEN ユーザーが工程バーの端をドラッグする THEN 期間が延長/短縮される
4. WHEN ユーザーが工程を移動する THEN 依存関係がある場合は警告が表示される
5. WHEN 更新が完了する THEN 変更履歴が記録される

#### 技術仕様
```typescript
// ドラッグ&ドロップイベント
interface DragEvent {
  milestoneId: number;
  newStartDate: Date;
  newEndDate: Date;
  dragType: 'move' | 'resize-start' | 'resize-end';
}

// API更新リクエスト
PUT /api/construction-schedule/milestones/{id}
{
  "start_date": "2024-05-01T08:00:00",
  "end_date": "2024-05-31T17:00:00"
}
```

### 3.3 ガントチャート表示

**User Story:** As a 工事管理者, I want ガントチャートで工程を可視化したい, so that 全体のスケジュールを把握できる

#### Acceptance Criteria
1. WHEN ユーザーがプロジェクトを開く THEN ガントチャートが表示される
2. WHEN ユーザーがタイムスケールを変更する THEN 日/週/月単位で表示が切り替わる
3. WHEN ユーザーが工程をクリックする THEN 詳細情報がポップアップ表示される
4. WHEN 工程が遅延している THEN 赤色でハイライト表示される
5. WHEN 工程が完了している THEN 緑色で表示される

### 3.4 工程の追加・編集・削除

**User Story:** As a 工事管理者, I want 工程を追加・編集・削除したい, so that プロジェクトの変更に対応できる

#### Acceptance Criteria
1. WHEN ユーザーが「工程追加」ボタンをクリックする THEN 工程作成フォームが表示される
2. WHEN ユーザーが工程情報を入力する THEN バリデーションが実行される
3. WHEN ユーザーが工程を保存する THEN ガントチャートに反映される
4. WHEN ユーザーが工程を編集する THEN 変更が保存され履歴が記録される
5. WHEN ユーザーが工程を削除する THEN 確認ダイアログが表示される

### 3.5 進捗管理

**User Story:** As a 工事管理者, I want 工程の進捗を記録したい, so that 実績を管理できる

#### Acceptance Criteria
1. WHEN ユーザーが進捗率を入力する THEN 工程バーに進捗が表示される
2. WHEN ユーザーがステータスを変更する THEN 色が変わる
3. WHEN 工程が完了する THEN 自動的に100%になる
4. WHEN 工程が遅延する THEN アラートが表示される

### 3.6 変更履歴

**User Story:** As a 工事管理者, I want 工程の変更履歴を確認したい, so that 誰がいつ変更したか追跡できる

#### Acceptance Criteria
1. WHEN ユーザーが履歴ボタンをクリックする THEN 変更履歴が表示される
2. WHEN 変更が行われる THEN 自動的に履歴が記録される
3. WHEN ユーザーが履歴を確認する THEN 変更前後の値が表示される

## 4. API仕様

### 4.1 プロジェクト管理API

```
GET    /api/construction-schedule/projects
       - プロジェクト一覧取得

POST   /api/construction-schedule/projects
       - プロジェクト作成
       Body: { name, description, client_name, site_location, start_date, end_date }

GET    /api/construction-schedule/projects/{id}
       - プロジェクト詳細取得

PUT    /api/construction-schedule/projects/{id}
       - プロジェクト更新

DELETE /api/construction-schedule/projects/{id}
       - プロジェクト削除
```

### 4.2 工程管理API

```
GET    /api/construction-schedule/projects/{project_id}/milestones
       - 工程一覧取得

POST   /api/construction-schedule/milestones
       - 工程作成
       Body: { project_id, name, description, start_date, end_date, assigned_to, color }

GET    /api/construction-schedule/milestones/{id}
       - 工程詳細取得

PUT    /api/construction-schedule/milestones/{id}
       - 工程更新（ドラッグ&ドロップ時も使用）
       Body: { start_date, end_date, progress_percentage, status, notes }

DELETE /api/construction-schedule/milestones/{id}
       - 工程削除

PUT    /api/construction-schedule/milestones/{id}/reorder
       - 表示順序変更
       Body: { display_order }
```

### 4.3 変更履歴API

```
GET    /api/construction-schedule/milestones/{id}/history
       - 工程変更履歴取得
```

## 5. UI/UX設計

### 5.1 画面構成

#### 5.1.1 プロジェクト一覧画面
```
┌─────────────────────────────────────────┐
│ 工事工程管理                    [+ 新規] │
├─────────────────────────────────────────┤
│ プロジェクト一覧                         │
│ ┌─────────────────────────────────────┐ │
│ │ 新築マンション建設プロジェクト       │ │
│ │ 顧客: 株式会社ABC建設               │ │
│ │ 期間: 2024/04/01 - 2024/12/31      │ │
│ │ ステータス: [進行中]    [詳細 >]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 5.1.2 ガントチャート画面
```
┌─────────────────────────────────────────────────────────────┐
│ ← プロジェクト一覧  新築マンション建設プロジェクト  [編集] │
├─────────────────────────────────────────────────────────────┤
│ 表示: [日] [週] [月]  今日: 2024/06/15                      │
├──────────────┬──────────────────────────────────────────────┤
│ 工程名       │ 4月  5月  6月  7月  8月  9月  10月 11月 12月│
├──────────────┼──────────────────────────────────────────────┤
│ 基礎工事     │ ████████░░░░                                 │
│ 躯体工事     │      ████████████████░░░░                    │
│ 外装工事     │                      ████████░░░░            │
│ 内装工事     │                        ████████░░░░          │
│ 設備工事     │                          ████████████░░░░    │
│ 竣工検査     │                                  ████░░░░    │
└──────────────┴──────────────────────────────────────────────┘
```

### 5.2 ドラッグ&ドロップ操作

#### 5.2.1 移動操作
- 工程バーをドラッグして左右に移動
- ドラッグ中はプレビュー表示
- ドロップ時にAPIで更新

#### 5.2.2 リサイズ操作
- 工程バーの左端/右端をドラッグして期間変更
- 最小期間: 1日

#### 5.2.3 視覚的フィードバック
- ドラッグ中: 半透明表示
- ドロップ可能: 緑色の枠線
- ドロップ不可: 赤色の枠線
- 保存中: ローディングスピナー

## 6. 非機能要件

### 6.1 パフォーマンス
- ガントチャート表示: 1秒以内
- ドラッグ&ドロップ応答: 100ms以内
- API更新: 500ms以内
- 100工程まで快適に動作

### 6.2 ユーザビリティ
- 直感的なドラッグ&ドロップ操作
- リアルタイムプレビュー
- 明確な視覚的フィードバック
- レスポンシブデザイン（タブレット対応）

### 6.3 データ整合性
- トランザクション管理
- 外部キー制約
- 変更履歴の自動記録
- 楽観的ロック（将来実装）

### 6.4 セキュリティ
- 認証必須（Flask-Login）
- SQLインジェクション対策
- XSS対策
- CSRF対策

## 7. 技術実装

### 7.1 フロントエンド技術候補

#### 7.1.1 ガントチャートライブラリ
- **dhtmlx-gantt**: 商用ライブラリ（有料）
- **frappe-gantt**: オープンソース、シンプル
- **react-gantt-chart**: React専用
- **カスタム実装**: SVG/Canvasで独自実装

**推奨**: frappe-gantt（シンプルで軽量、PoCに最適）

#### 7.1.2 ドラッグ&ドロップ
- **react-dnd**: React用ドラッグ&ドロップライブラリ
- **react-beautiful-dnd**: 美しいアニメーション
- **HTML5 Drag and Drop API**: ネイティブAPI

**推奨**: frappe-ganttの組み込み機能 + カスタム実装

### 7.2 バックエンド実装

#### 7.2.1 SQLAlchemyモデル
```python
# models/construction_schedule.py
from config.db import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    client_name = db.Column(db.String(255))
    site_location = db.Column(db.String(500))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.Enum('planning', 'in_progress', 'completed', 'on_hold'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    milestones = db.relationship('Milestone', backref='project', cascade='all, delete-orphan')

class Milestone(db.Model):
    __tablename__ = 'milestones'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    display_order = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum('not_started', 'in_progress', 'completed', 'delayed'))
    progress_percentage = db.Column(db.Integer, default=0)
    assigned_to = db.Column(db.String(255))
    color = db.Column(db.String(7), default='#3B82F6')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## 8. 開発スケジュール（PoC）

### Phase 1: 基本機能（1-2週間）
- [ ] データベーステーブル作成
- [ ] SQLAlchemyモデル実装
- [ ] バックエンドAPI実装（CRUD）
- [ ] プロジェクト一覧画面
- [ ] 基本的なガントチャート表示

### Phase 2: ドラッグ&ドロップ（1週間）
- [ ] frappe-gantt統合
- [ ] ドラッグ&ドロップ機能実装
- [ ] API連携（更新処理）
- [ ] リアルタイムプレビュー

### Phase 3: 詳細機能（1週間）
- [ ] 工程追加・編集・削除
- [ ] 進捗管理機能
- [ ] 変更履歴機能
- [ ] UI/UX改善

### Phase 4: テスト・調整（数日）
- [ ] 動作テスト
- [ ] 顧客フィードバック
- [ ] 調整・改善

## 9. 制約事項

### 9.1 PoCレベルの制約
- 複雑な依存関係管理は未実装
- マルチユーザー同時編集は未対応
- モバイル対応は限定的
- 印刷機能は未実装

### 9.2 技術的制約
- ブラウザ: Chrome/Edge推奨
- 画面サイズ: 1280px以上推奨
- 同時接続: 10ユーザー程度

## 10. 将来の拡張機能

### 10.1 高度な機能
- 工程依存関係の可視化
- クリティカルパス分析
- リソース管理（人員・機材）
- コスト管理
- ファイル添付機能
- 写真管理（工事進捗写真）

### 10.2 統合機能
- CRM機能との連携
- カレンダー統合
- 通知機能（メール・Slack）
- モバイルアプリ

### 10.3 レポート機能
- 進捗レポート自動生成
- 遅延分析レポート
- PDF/Excelエクスポート
- ダッシュボード
