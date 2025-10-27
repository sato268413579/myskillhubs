# 3D UX Practice - Webアプリミラー・ナビゲーションハブ

## 概要

3DUXPractice.tsxは、Webアプリを「そのまま」表示するのではなく「ミラー or サブUI」として扱う3D空間ナビゲーション・ハブです。

## 主な機能

### 1. ミラー・サブUIとしての表示
- Webアプリの簡易ビュー（iframe風のプレビューカード）を3D空間に配置
- 実際のWebアプリは通常ブラウザで開く役割分担

### 2. セッション同期機能
- 認証や本操作は裏で通常ブラウザと同期
- ログイン済みセッションを3D空間のプレビューに反映
- バックエンドAPIを通じてセッション状態を管理

### 3. ナビゲーション・ハブ機能
- 3D空間でのWebアプリ管理・ナビゲーション
- 実処理は通常Webブラウザで実行
- クイックアクション（ダッシュボード、設定など）

## 技術仕様

### フロントエンド
- **React + TypeScript**
- **@react-three/fiber**: 3D描画
- **@react-three/drei**: 3D UI コンポーネント
- **Three.js**: 3D エンジン

### バックエンド
- **Flask**: APIサーバー
- **Flask-Login**: セッション管理
- **セッション同期API**: `/api/sync-session/<app_id>`

## 使用方法

### 1. 基本的な使用
```tsx
import Menu3D from './3DUXPractice';

const App = () => {
  const initialMenus = [
    {
      name: "ウェルカム",
      content: <div>Hello 3D World!</div>,
      x: 0, y: 0, z: 0,
      width: 400, height: 300
    }
  ];

  return <Menu3D menus={initialMenus} />;
};
```

### 2. Webアプリの追加
- 左上のパネルから対応Webアプリを選択
- Gmail、GitHub、Notion、Slackなどをサポート
- 各アプリのプレビューカードが3D空間に配置される

### 3. 3D操作
- **ドラッグ**: XY平面移動
- **Ctrl+ドラッグ**: 奥行き移動（Z軸）
- **Shift+ドラッグ**: Y軸回転
- **↻ボタン**: 90度回転
- **右下角**: リサイズ

### 4. セッション同期
- 「セッション同期」ボタンでWebアプリとの認証状態を同期
- 同期済みアプリは緑色のインジケーターで表示
- 「ブラウザで開く」で実際のWebアプリにアクセス

## API仕様

### セッション同期API

#### POST /api/sync-session/<app_id>
Webアプリとのセッション同期を実行

**レスポンス:**
```json
{
  "success": true,
  "message": "Gmailのセッション同期が完了しました",
  "session_info": {
    "app_id": "gmail",
    "app_name": "Gmail",
    "authenticated": true,
    "synced_at": "2024-01-15T10:30:00",
    "expires_at": 1705401000
  }
}
```

#### GET /api/session-status/<app_id>
セッション状態を取得

#### DELETE /api/revoke-session/<app_id>
セッションを無効化

#### GET/POST /api/webapp-proxy/<app_id>
Webアプリへのプロキシリクエスト

## 対応Webアプリ

| アプリ | ID | 説明 |
|--------|----|----- |
| Gmail | `gmail` | Googleメールサービス |
| GitHub | `github` | コード管理プラットフォーム |
| Notion | `notion` | オールインワン・ワークスペース |
| Slack | `slack` | チームコミュニケーション |

## セキュリティ考慮事項

1. **セッション管理**: Flask-Loginによる認証必須
2. **CORS設定**: 適切なオリジン制限
3. **トークン暗号化**: アクセストークンの安全な保存
4. **セッション有効期限**: 24時間の自動期限切れ

## 拡張可能性

### 新しいWebアプリの追加
1. `sampleWebApps`配列に新しいアプリ定義を追加
2. バックエンドの`supported_apps`に認証設定を追加
3. プロキシAPI用のモックレスポンスを定義

### カスタムコンテンツ
- `webApp`プロパティを持たないメニューアイテムは従来通りのカスタムコンテンツとして表示
- React コンポーネントを自由に配置可能

## 今後の改善点

1. **OAuth2フロー**: 実際のOAuth2認証実装
2. **リアルタイム同期**: WebSocketによるセッション状態の即座反映
3. **プラグインシステム**: サードパーティWebアプリの簡単追加
4. **パフォーマンス最適化**: 大量のWebアプリ表示時の最適化
5. **モバイル対応**: タッチ操作への対応

## トラブルシューティング

### セッション同期が失敗する場合
1. バックエンドサーバーが起動しているか確認
2. CORS設定が正しいか確認
3. ブラウザの開発者ツールでネットワークエラーを確認

### 3D操作が効かない場合
1. ウィンドウのリサイズ中でないか確認
2. ブラウザがWebGLをサポートしているか確認
3. Three.jsのコンソールエラーを確認