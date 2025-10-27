# Electron自動キャプチャ機能のセットアップ

## 概要

Electronベースの自動キャプチャ機能により、ブラウザの制約を超えて複数のタブやウィンドウを同時にキャプチャできます。

## インストール手順

### 1. Electronのインストール

```bash
# グローバルインストール
npm install -g electron

# または、プロジェクトローカルにインストール
npm install --save-dev electron
```

### 2. 必要な依存関係

```bash
# WebSocketサーバー用
npm install ws

# 暗号化用
npm install crypto

# ネイティブ操作用（オプション）
npm install robotjs
```

### 3. package.jsonの設定

```json
{
  "main": "back/feature/electronCapture/electron_capture.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "electron . --dev"
  },
  "devDependencies": {
    "electron": "^latest"
  }
}
```

## 機能概要

### 🚀 Electron自動キャプチャの特徴

1. **複数同時キャプチャ**: 複数のタブ・ウィンドウを同時にキャプチャ
2. **操作転送**: クリック・スクロール・キー入力の転送
3. **セキュリティ**: 暗号化通信とトークン認証
4. **高品質**: ネイティブレベルの画質とパフォーマンス

### 🔒 セキュリティ機能

- **HMAC認証**: セキュアなトークンベース認証
- **暗号化通信**: 操作データの暗号化
- **セッション管理**: タイムアウト付きセッション
- **アクセス制御**: ユーザー別セッション分離

### 🎮 操作転送機能

- **クリック**: 座標ベースのクリック転送
- **スクロール**: マウスホイールイベント転送
- **キー入力**: キーボードイベント転送
- **テキスト入力**: フォーム入力の転送

## API エンドポイント

### POST /service/3d/start-electron-capture
Electronキャプチャセッションを開始

**リクエスト:**
```json
{
  "capture_type": "window",
  "target_urls": ["gmail.com", "github.com"],
  "quality": "high",
  "frame_rate": 30,
  "audio_enabled": true,
  "interaction_enabled": true,
  "security_level": "high"
}
```

**レスポンス:**
```json
{
  "success": true,
  "session_id": "uuid-string",
  "token": "secure-token",
  "websocket_url": "ws://localhost:8080/capture/session-id"
}
```

### POST /service/3d/send-interaction
操作イベントを送信

**リクエスト:**
```json
{
  "session_id": "uuid-string",
  "token": "secure-token",
  "type": "click",
  "data": {
    "x": 50,
    "y": 30,
    "button": 0
  }
}
```

### GET /service/3d/sessions
アクティブセッション一覧を取得

### POST /service/3d/stop-capture/<session_id>
キャプチャセッションを停止

## 使用方法

### 1. Electronキャプチャの開始

1. 「🚀 Electron自動キャプチャ」ボタンをクリック
2. 自動的に複数のタブ・ウィンドウがキャプチャ開始
3. 2Dウィンドウマネージャーに表示される

### 2. 操作転送の有効化

1. キャプチャウィンドウの「操作転送」チェックボックスを有効化
2. ビデオ画面をクリック・スクロールして操作転送
3. リアルタイムで元のタブに操作が反映される

### 3. セッション管理

- アクティブセッション数がヘルプパネルに表示
- 各ウィンドウで個別に停止可能
- セッション統計情報の確認

## トラブルシューティング

### Electronが見つからない場合

```bash
# Electronのインストール確認
electron --version

# パスの確認
which electron

# 再インストール
npm uninstall -g electron
npm install -g electron
```

### 権限エラーの場合

```bash
# macOS/Linux
sudo npm install -g electron

# Windows（管理者権限でコマンドプロンプト実行）
npm install -g electron
```

### WebSocketエラーの場合

- ポート8080が使用可能か確認
- ファイアウォール設定を確認
- セキュリティソフトの設定を確認

## 差別化機能

### 🎯 複数同時管理

- 最大10個のタブ・ウィンドウを同時キャプチャ
- 統一されたインターフェースで管理
- 個別の品質・フレームレート設定

### 👁️ 俯瞰ビュー

- 2Dカメラ機能による俯瞰表示
- ズーム・パン操作で全体把握
- ウィンドウ配置の最適化

### 🔗 タスク連動

- Webアプリとの連携機能
- セッション同期による統合管理
- ワークフロー自動化（将来実装予定）

## セキュリティ考慮事項

### 本番環境での設定

1. **SECRET_KEY**: 強力な秘密鍵を設定
2. **HTTPS**: SSL/TLS通信の有効化
3. **CORS**: 適切なオリジン制限
4. **認証**: 強力な認証システムの実装

### コンプライアンス対応

- データ暗号化の実装
- アクセスログの記録
- セッション監査機能
- データ保持ポリシーの設定

## パフォーマンス最適化

### 推奨設定

- **品質**: high（本番）/ medium（開発）
- **フレームレート**: 30fps（標準）/ 60fps（高品質）
- **音声**: 必要に応じて無効化
- **同時セッション数**: 最大5個を推奨

### リソース監視

- CPU使用率の監視
- メモリ使用量の確認
- ネットワーク帯域の管理
- ディスク容量の監視

この実装により、従来の画面共有ツールを超えた、業務効率化に特化した統合管理システムが実現できます。