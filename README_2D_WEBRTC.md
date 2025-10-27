# 2D ウィンドウマネージャー with WebRTC タブキャプチャ

## 概要

3DUXPractice.tsxを2Dウィンドウマネージャーに変更し、WebRTCを使用してブラウザタブをリアルタイムでキャプチャ・表示する機能を追加しました。

## 主な変更点

### 1. 3D → 2D への変更
- **Three.js依存の削除**: Canvas、OrbitControls、3D座標系を削除
- **2D座標系**: X, Y座標のみを使用した平面配置
- **絶対位置指定**: `position: absolute`を使用したウィンドウ配置
- **シンプルな操作**: ドラッグ移動とリサイズのみ

### 2. WebRTCタブキャプチャ機能
- **リアルタイムストリーミング**: 開いているタブの内容をリアルタイム表示
- **画面共有API**: `navigator.mediaDevices.getDisplayMedia()`を使用
- **ストリーム管理**: 複数のタブキャプチャを同時管理
- **自動停止検知**: タブが閉じられた際の自動停止

## 新機能

### WebRTCタブキャプチャ
```typescript
// タブキャプチャの開始
const startTabCapture = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { mediaSource: 'tab', preferCurrentTab: false },
    audio: true
  });
  // ストリーム処理...
};
```

### 主要コンポーネント

#### 1. TabCapturePreview
- **機能**: WebRTCストリームの表示
- **特徴**: 
  - リアルタイム映像表示
  - ストリーム状態インジケーター
  - 停止ボタン

#### 2. WindowManager2D
- **機能**: 2Dウィンドウの管理
- **特徴**:
  - 絶対位置でのウィンドウ配置
  - Z-indexによる重ね順管理
  - ドラッグ&ドロップ移動

#### 3. ResizableWindow (2D版)
- **機能**: リサイズ可能なウィンドウ
- **変更点**:
  - 3D回転機能を削除
  - 2D座標系での移動
  - シンプルなドラッグ操作

## 使用方法

### 1. タブキャプチャの開始
1. 「📺 タブをキャプチャ」ボタンをクリック
2. ブラウザの画面共有ダイアログで対象タブを選択
3. 「共有」をクリックしてキャプチャ開始

### 2. ウィンドウ操作
- **移動**: タイトルバーをドラッグ
- **リサイズ**: 右下角をドラッグ
- **停止**: タブキャプチャウィンドウの「停止」ボタン

### 3. カメラ操作
- **パン**: 背景をドラッグしてカメラ移動
- **ズーム**: マウスホイールでズームイン/アウト
- **リセット**: 🏠ボタンまたは`Ctrl+R`でカメラ位置をリセット
- **中央**: 🎯ボタンまたは`Ctrl+C`でカメラを中央に移動
- **ズーム100%**: `Ctrl+0`でズームを100%にリセット

### 3. Webアプリ追加
- 従来通り、左上パネルからWebアプリを追加可能
- セッション同期機能も継続利用可能

## 技術仕様

### WebRTC API
```typescript
interface TabStream {
  id: string;
  name: string;
  stream: MediaStream | null;
  isActive: boolean;
  tabId?: number;
}

// 画面共有設定
const displayMediaOptions = {
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 }
  },
  audio: true
};
```

### ストリーム管理
- **Map<string, MediaStream>**: アクティブストリームの管理
- **自動クリーンアップ**: ストリーム終了時の自動削除
- **メモリ管理**: 不要なストリームの適切な解放

### ブラウザサポート
- **Chrome/Edge**: 完全サポート
- **Firefox**: 部分サポート（タブ指定制限あり）
- **Safari**: 限定サポート

## セキュリティ考慮事項

### 1. 画面共有許可
- ユーザーの明示的な許可が必要
- タブごとの個別許可
- 自動停止機能による意図しない継続防止

### 2. ストリーム管理
- 適切なストリーム停止処理
- メモリリークの防止
- 不要なリソースの解放

## パフォーマンス最適化

### 1. ストリーム品質
- 適切な解像度設定
- フレームレート制御
- 帯域幅最適化

### 2. メモリ管理
- 使用済みストリームの即座解放
- ガベージコレクション対応
- リソース監視

## トラブルシューティング

### 問題: タブキャプチャが開始できない
**原因**: ブラウザがWebRTC画面共有をサポートしていない
**解決方法**: Chrome/Edgeの最新版を使用

### 問題: 映像が表示されない
**原因**: ストリーム設定の問題
**解決方法**: 
1. ブラウザの開発者ツールでエラーを確認
2. 画面共有許可を再度確認
3. タブを再選択

### 問題: 音声が聞こえない
**原因**: 音声キャプチャの設定問題
**解決方法**: 
1. `audio: true`設定を確認
2. ブラウザの音声許可を確認
3. システム音量設定を確認

## 今後の拡張予定

### 1. 録画機能
- MediaRecorder APIを使用した録画
- ローカルファイル保存
- クラウドアップロード

### 2. 画質設定
- 解像度選択
- フレームレート調整
- 圧縮設定

### 3. 複数タブ同時キャプチャ
- タブ切り替え機能
- ピクチャーインピクチャー
- グリッド表示

### 4. 共有機能
- リアルタイム共有
- WebRTC P2P通信
- 複数ユーザー対応

## API リファレンス

### startTabCapture()
タブキャプチャを開始

### handleStopCapture(streamId: string)
指定されたストリームを停止

### TabCapturePreview Props
```typescript
interface TabCapturePreviewProps {
  tabStream: TabStream;
  onStopCapture: (streamId: string) => void;
}
```

## 使用例

```typescript
import Menu2D from './3DUXPractice';

const App = () => {
  const initialMenus = [
    {
      name: "Welcome",
      content: <div>Hello 2D World!</div>,
      x: 100,
      y: 100,
      width: 400,
      height: 300
    }
  ];

  return <Menu2D menus={initialMenus} />;
};
```

この実装により、従来の3D機能を2Dに変更し、WebRTCを使用したリアルタイムタブキャプチャ機能を追加しました。ユーザーは開いているタブの内容を他のウィンドウと並べて表示・操作できるようになります。