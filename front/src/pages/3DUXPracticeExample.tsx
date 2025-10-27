import React from 'react';
import Menu2D from './3DUXPractice';

// 使用例コンポーネント
const TwoDUXPracticeExample: React.FC = () => {
  // 初期メニュー設定（従来のコンテンツも混在可能）
  const initialMenus = [
    {
      name: "ウェルカムメッセージ",
      content: (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>2D ウィンドウマネージャーへようこそ！</h2>
          <p>左上のパネルからWebアプリを追加したり、タブをキャプチャできます。</p>
          <p>各ウィンドウは2D平面で自由に配置・操作できます。</p>
          <ul style={{ textAlign: 'left', marginTop: '20px' }}>
            <li>📺 タブキャプチャ: リアルタイムでタブ内容を表示</li>
            <li>タイトルバーをドラッグ: ウィンドウ移動</li>
            <li>右下角をドラッグ: リサイズ</li>
            <li>WebRTC技術を使用した高品質ストリーミング</li>
          </ul>
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>💡 ヒント:</strong> タブキャプチャを使用するには、ブラウザの画面共有許可が必要です。
          </div>
        </div>
      ),
      x: 400,
      y: 100,
      width: 500,
      height: 400,
    }
  ];

  return <Menu2D menus={initialMenus} />;
};

export default TwoDUXPracticeExample;