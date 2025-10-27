# 3D UX Practice - トラブルシューティングガイド

## 問題: Gmailセッション同期が404エラーで失敗する

### 症状
- デベロッパーツールのネットワークタブで以下のエラーが表示される：
  ```
  Request URL: http://localhost:3000/api/sync-session/gmail
  Request Method: POST
  Status Code: 404 Not Found
  ```

### 原因
1. **プロキシ設定の不備**: ReactアプリからFlaskサーバーへのAPIリクエストが正しくプロキシされていない
2. **バックエンドサーバーが起動していない**: Flask開発サーバーが起動していない
3. **CORS設定の問題**: クロスオリジンリクエストが拒否されている

### 解決方法

#### 1. プロキシ設定の確認
`front/package.json`に以下の設定が追加されていることを確認：
```json
{
  "proxy": "http://localhost:5000"
}
```

#### 2. バックエンドサーバーの起動
```bash
cd back
python app.py
```

サーバーが正常に起動すると以下のメッセージが表示されます：
```
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5000
* Running on http://[::1]:5000
```

#### 3. フロントエンドサーバーの再起動
プロキシ設定を追加した後は、Reactサーバーを再起動する必要があります：
```bash
cd front
npm start
```

#### 4. API接続テスト
3D UX Practiceページの左上パネルにある「🔧 API接続テスト」ボタンをクリックして、バックエンドとの接続を確認してください。

### 確認手順

1. **バックエンドサーバーの確認**
   - ブラウザで `http://localhost:5000/api/test` にアクセス
   - 以下のようなJSONレスポンスが返されることを確認：
   ```json
   {
     "success": true,
     "message": "Session Sync API is working!",
     "timestamp": "2024-01-15T10:30:00.000000"
   }
   ```

2. **フロントエンドからのAPI呼び出し確認**
   - 3D UX Practiceページで「API接続テスト」ボタンをクリック
   - 成功メッセージが表示されることを確認

3. **セッション同期の実行**
   - Gmailアプリを3D空間に追加
   - 「セッション同期」ボタンをクリック
   - 成功メッセージが表示され、インジケーターが緑色（同期済み）になることを確認

## その他の一般的な問題

### 問題: 3D操作が効かない
**解決方法:**
- ウィンドウのリサイズ中でないか確認
- ブラウザがWebGLをサポートしているか確認
- コンソールでThree.jsエラーがないか確認

### 問題: セッション状態が更新されない
**解決方法:**
- ページをリロードしてセッション状態を再確認
- ブラウザのキャッシュをクリア
- デベロッパーツールでネットワークリクエストを確認

### 問題: CORS エラー
**解決方法:**
- `back/app.py`のCORS設定を確認：
```python
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
```

### 問題: 認証エラー
**現在の実装では認証をバイパスしています（テスト用）**
- 実際の本番環境では`@login_required`デコレータを有効にしてください
- ログイン機能を実装してからセッション同期を使用してください

## デバッグ用ログ

### フロントエンド
ブラウザのコンソールで以下のログを確認：
```javascript
console.log('Syncing session for app:', appId);
console.error('Session sync error:', error);
```

### バックエンド
Flaskサーバーのコンソールで以下のログを確認：
```python
print(f"Session sync request for app: {app_id}")
print(f"User ID: {user_id}")
```

## 設定ファイルの確認

### front/package.json
```json
{
  "proxy": "http://localhost:5000"
}
```

### back/app.py
```python
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
app.run(host="0.0.0.0", port=5000)
```

## 開発環境の要件

- **Node.js**: v14以上
- **Python**: v3.8以上
- **Flask**: v2.0以上
- **React**: v18以上

## サポート

問題が解決しない場合は、以下の情報を含めてお問い合わせください：
1. エラーメッセージの全文
2. ブラウザのデベロッパーツールのネットワークタブのスクリーンショット
3. バックエンドサーバーのコンソール出力
4. 使用している環境（OS、ブラウザ、Node.js/Pythonのバージョン）
#
# Electronキャプチャのトラブルシューティング

### 問題: "Proxy error" または "is not valid JSON" エラー
**原因**: バックエンドサーバーが起動していない、またはプロキシ設定の問題
**解決方法**:
1. バックエンドサーバーを起動: `cd back && python app.py`
2. `http://localhost:5000/service/3d/test` にアクセスして動作確認
3. フロントエンドを再起動: `cd front && npm start`

### 問題: Electronキャプチャが失敗する
**原因**: Electronがインストールされていない
**解決方法**:
1. Electronをインストール: `npm install -g electron`
2. 「⚡ Electron状態チェック」ボタンで確認
3. 模擬モードでの動作確認

### 問題: 模擬モードで動作している
**原因**: Electronが正しくインストールされていない
**解決方法**:
1. `electron --version` でバージョン確認
2. `npm uninstall -g electron && npm install -g electron` で再インストール
3. パス設定を確認

### デバッグ手順
1. 「🔧 API接続テスト」でバックエンド接続を確認
2. 「⚡ Electron状態チェック」でElectron環境を確認
3. ブラウザの開発者ツールでネットワークエラーを確認
4. バックエンドのコンソール出力を確認