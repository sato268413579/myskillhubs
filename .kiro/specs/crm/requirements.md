# CRM（顧客管理）- Requirements Document

## 1. 機能概要

### 1.1 位置づけ
MySkillHubs内のPoC機能の一つとして、顧客情報、取引履歴、コンタクトログを一元管理する機能を提供します。

### 1.2 主要技術
- **フロントエンド**: React + TypeScript
- **バックエンド**: Flask (Python) + SQLAlchemy
- **データベース**: MySQL
- **エンドポイント**: `/service/crm`
- **状態**: 稼働中

## 2. 現在の実装状況

### 2.1 実装済み機能

#### 2.1.1 顧客管理
- 顧客の作成・編集・削除
- 基本情報管理（名前、メール、会社、部署、役職、電話、住所）
- メモ・タグ機能

#### 2.1.2 取引管理
- 取引の追加
- 取引情報（タイトル、金額、ステータス）
- 取引履歴の表示

#### 2.1.3 コンタクトログ
- コンタクト記録の追加
- コンタクト種別（call, email, meeting, note）
- コンタクト履歴の表示

### 2.2 技術スタック
- **フロントエンド**: React Hooks, Tailwind CSS
- **バックエンド**: Flask, SQLAlchemy
- **データベース**: MySQL
- **API**: REST API

### 2.3 データモデル

```python
Customer:
  - id, name, email, company, department, title
  - phone, mobile, address, note
  - tags (JSON array)
  - created_at, updated_at

Deal:
  - id, customer_id, title, amount, status
  - created_at

ContactLog:
  - id, customer_id, contact_type, note
  - contact_date, created_at
```

## 3. 機能要件

### 3.1 顧客管理
**User Story:** As a 営業担当者, I want 顧客情報を管理したい, so that 営業活動を効率化できる

#### Acceptance Criteria
1. WHEN ユーザーが顧客を作成する THEN 顧客一覧に追加される
2. WHEN ユーザーが顧客情報を編集する THEN 変更が保存される
3. WHEN ユーザーがタグを追加する THEN 顧客にタグが関連付けられる
4. WHEN ユーザーが顧客を削除する THEN 関連する取引・コンタクトログも削除される

### 3.2 取引管理
**User Story:** As a 営業担当者, I want 取引を記録したい, so that 売上を追跡できる

#### Acceptance Criteria
1. WHEN ユーザーが取引を追加する THEN 顧客の取引履歴に表示される
2. WHEN ユーザーが取引ステータスを変更する THEN 変更が保存される
3. WHEN ユーザーが取引金額を入力する THEN 合計金額が計算される

### 3.3 コンタクトログ
**User Story:** As a 営業担当者, I want コンタクト履歴を記録したい, so that 顧客とのやり取りを追跡できる

#### Acceptance Criteria
1. WHEN ユーザーがコンタクトを記録する THEN コンタクト履歴に追加される
2. WHEN ユーザーがコンタクト種別を選択する THEN 適切なアイコンが表示される
3. WHEN ユーザーがメモを追加する THEN コンタクト詳細に保存される

### 3.4 拡張機能（将来実装）
- 顧客検索・フィルタリング機能
- 取引パイプライン管理
- レポート・ダッシュボード
- メール統合
- カレンダー統合
- ファイル添付機能

## 4. 非機能要件

### 4.1 パフォーマンス
- 顧客一覧の表示: 500ms以内
- 顧客詳細の表示: 300ms以内
- データ更新: 200ms以内

### 4.2 データ整合性
- 外部キー制約による参照整合性
- トランザクション管理

### 4.3 ユーザビリティ
- 直感的なフォーム入力
- リアルタイムバリデーション
- レスポンシブデザイン

## 5. 制約事項
- 現在は単一ユーザー向け（マルチテナント未対応）
- ファイル添付機能は未実装
- メール・カレンダー統合は未実装
