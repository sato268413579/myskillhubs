# MySkillHubs - 全体要件定義書

## 1. プロジェクト概要

### 1.1 MySkillHubsとは

MySkillHubsは、複数のPoC（Proof of Concept）機能を統合した個人開発アプリケーションです。各PoC機能は独立して動作し、共通の認証基盤とバックエンドAPIを共有します。

### 1.2 プロジェクトの目的

- 各種技術の実験・検証
- 実用的な機能のプロトタイプ開発
- 個人スキルの向上と実績作り

## 2. システムアーキテクチャ

### 2.1 技術スタック

```
MySkillHubs (個人開発PoC統合アプリ)
├── フロントエンド: React 19.1.1 + TypeScript 4.9.5
├── バックエンド: Flask (Python) + Flask-Login
├── データベース: MySQL (SQLAlchemy)
└── 認証: Flask-Login + セッション管理
```

### 2.2 ディレクトリ構造

```
myskillhubs/
├── front/                    # フロントエンド
│   ├── src/
│   │   ├── pages/           # 各機能のページ
│   │   │   ├── Home.tsx
│   │   │   ├── Service.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   ├── CRM.tsx
│   │   │   ├── TrendSearch.tsx
│   │   │   └── 3DUXPractice.tsx
│   │   ├── components/      # 共通コンポーネント
│   │   ├── services/        # API通信
│   │   └── config/          # 設定
│   └── package.json
├── back/                     # バックエンド
│   ├── app.py               # メインアプリケーション
│   ├── feature/             # 各機能のルート
│   │   ├── login/
│   │   ├── crm/
│   │   ├── trendSearch/
│   │   ├── three3duxPractice/
│   │   ├── sessionSync/
│   │   └── electronCapture/
│   └── config/              # 設定
└── .kiro/                    # Kiro設定・仕様
    └── specs/               # 各機能の要件定義書
        ├── myskillhubs-overview/
        ├── task-manager/
        ├── crm/
        ├── ai-search/
        └── interactive-webrtc-workspace/
```

## 3. 実装済みPoC機能一覧

| 機能名 | 説明 | 主要技術 | エンドポイント | 要件定義書 | 状態 |
|--------|------|----------|----------------|------------|------|
| **タスク管理ツール** | シンプルなTodo管理 | React, Flask | `/service/tasks` | [task-manager](../task-manager/requirements.md) | 稼働中 |
| **CRM（顧客管理）** | 顧客情報、取引履歴、コンタクトログの管理 | React, Flask, MySQL | `/service/crm` | [crm](../crm/requirements.md) | 稼働中 |
| **AI情報収集** | 2段階AI分析によるトレンド調査 | React, Flask, AI API | `/service/aiSearch` | [ai-search](../ai-search/requirements.md) | 稼働中 |
| **工事工程管理** | 工事プロジェクトの工程をガントチャートで管理 | React, Flask, MySQL | `/service/construction-schedule` | [construction-schedule](../construction-schedule/requirements.md) | 開発中 |
| **2D WebRTCウィンドウマネージャー** | タブキャプチャとウィンドウ管理 | React, WebRTC, Flask | `/service/3d` | [interactive-webrtc-workspace](../interactive-webrtc-workspace/requirements.md) | 稼働中（拡張予定） |

## 4. 共通基盤

### 4.1 認証・セッション管理

#### 4.1.1 Flask-Login
- ユーザー認証
- セッション管理
- ログイン状態の維持

#### 4.1.2 セッション管理
- Cookieベースのセッション
- セッション有効期限管理
- セキュアCookie設定

#### 4.1.3 CORS設定
```python
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
```

### 4.2 データベース

#### 4.2.1 MySQL
- 顧客データ（CRM）
- タスクデータ（将来実装）
- ユーザーデータ

#### 4.2.2 SQLAlchemy
- ORM
- マイグレーション管理
- トランザクション管理

#### 4.2.3 In-Memory Storage
- セッション同期データ（一時的）
- Electronキャプチャセッション

### 4.3 API構造

```
/api
├── /login/*                 # 認証（共通）
│   ├── POST /login
│   ├── POST /logout
│   └── GET /check-auth
├── /crm/*                   # CRM機能
│   ├── GET /customers
│   ├── POST /customers/create
│   ├── GET /customers/<id>
│   ├── PUT /customers/<id>
│   ├── DELETE /customers/<id>
│   ├── POST /customers/<id>/deals
│   └── POST /customers/<id>/contacts
├── /trendSearch/*           # AI情報収集
│   └── GET /search?trend=<keyword>
├── /construction-schedule/* # 工事工程管理
│   ├── GET /projects
│   ├── POST /projects
│   ├── GET /projects/<id>
│   ├── PUT /projects/<id>
│   ├── DELETE /projects/<id>
│   ├── GET /projects/<id>/milestones
│   ├── POST /milestones
│   ├── GET /milestones/<id>
│   ├── PUT /milestones/<id>
│   ├── DELETE /milestones/<id>
│   └── GET /milestones/<id>/history
├── /service/3d/*            # 2D WebRTCウィンドウマネージャー
│   ├── POST /start-electron-capture
│   ├── POST /send-interaction
│   ├── POST /stop-capture/<session_id>
│   ├── GET /sessions
│   ├── GET /test
│   └── GET /check-electron
└── /sync-session/*          # セッション同期（共通）
    ├── POST /<app_id>
    ├── GET /status/<app_id>
    ├── DELETE /revoke/<app_id>
    └── GET/POST /webapp-proxy/<app_id>
```

## 5. 共通要件

### 5.1 認証・認可
- すべてのAPI（一部を除く）でFlask-Login認証が必要
- セッションベースの認証
- HTTPS推奨（本番環境）

### 5.2 エラーハンドリング
- 統一されたエラーレスポンス形式
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### 5.3 CORS
- `http://localhost:3000`からのアクセス許可
- Credentials付きリクエスト対応

### 5.4 ログ
- アクセスログ
- エラーログ
- 操作ログ（一部機能）

## 6. 非機能要件

### 6.1 パフォーマンス
- API応答時間: 500ms以内（通常）
- ページロード時間: 3秒以内
- 同時接続数: 10ユーザー（開発環境）

### 6.2 セキュリティ
- HTTPS通信（本番環境）
- セッション管理
- CORS制限
- SQLインジェクション対策（SQLAlchemy使用）
- XSS対策（React自動エスケープ）

### 6.3 互換性
- **ブラウザ**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **OS**: Windows 10+, macOS 11+, Ubuntu 20.04+

### 6.4 可用性
- 開発環境: ベストエフォート
- 本番環境: 未定

## 7. 開発環境

### 7.1 必要なソフトウェア
- Node.js 16+
- Python 3.8+
- MySQL 8.0+
- npm/yarn

### 7.2 セットアップ手順

#### フロントエンド
```bash
cd front
npm install
npm start
```

#### バックエンド
```bash
cd back
pip install -r requirements.txt
python app.py
```

#### データベース
```bash
mysql -u root -p
CREATE DATABASE myapp;
```

## 8. 今後の展開

### 8.1 短期目標（1-3ヶ月）
- 2D WebRTCウィンドウマネージャーの機能拡張
- タスク管理ツールのデータベース永続化
- CRMの検索・フィルタリング機能

### 8.2 中期目標（3-6ヶ月）
- 新しいPoC機能の追加
- モバイル対応
- パフォーマンス最適化

### 8.3 長期目標（6ヶ月以上）
- 本番環境へのデプロイ
- マルチテナント対応
- エンタープライズ機能の追加

## 9. 制約事項

### 9.1 技術的制約
- 個人開発プロジェクトのため、リソースが限定的
- 各機能はPoCレベルの実装
- 本番環境での運用は未定

### 9.2 リソース制約
- 開発者: 1名
- 予算: 個人負担
- 時間: 業務外の時間

### 9.3 スコープ制約
- エンタープライズグレードの機能は対象外
- 大規模なユーザー数は想定していない
- 各機能は実験的・学習目的

## 10. 参考資料

### 10.1 各機能の要件定義書
- [タスク管理ツール](../task-manager/requirements.md)
- [CRM（顧客管理）](../crm/requirements.md)
- [AI情報収集](../ai-search/requirements.md)
- [工事工程管理](../construction-schedule/requirements.md)
- [2D WebRTCウィンドウマネージャー](../interactive-webrtc-workspace/requirements.md)

### 10.2 技術ドキュメント
- [README_2D_WEBRTC.md](../../../README_2D_WEBRTC.md)
- [README_3DUX.md](../../../README_3DUX.md)
- [ELECTRON_SETUP.md](../../../ELECTRON_SETUP.md)
