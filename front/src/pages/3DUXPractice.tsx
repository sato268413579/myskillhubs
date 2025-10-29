import React, { useRef, useEffect, useState, useCallback } from "react";
import API_BASE_URL from "../config/api";

// WebRTC型定義の拡張
declare global {
  interface DisplayMediaStreamConstraints {
    video?: boolean | MediaTrackConstraints;
    audio?: boolean | MediaTrackConstraints;
  }
}

interface WebAppPreview {
  id: string;
  name: string;
  url: string;
  previewImage?: string;
  description?: string;
  isAuthenticated?: boolean;
  sessionData?: any;
}

interface TabStream {
  id: string;
  name: string;
  stream: MediaStream | null;
  isActive: boolean;
  tabId?: number;
}

interface MenuItem {
  name: string;
  content: React.ReactNode;
  x: number;
  y: number;
  width?: number;
  height?: number;
  webApp?: WebAppPreview;
  tabStream?: TabStream; // タブストリーム情報を追加
}

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface Props {
  menus: MenuItem[];
}

// 操作転送機能付きタブキャプチャコンポーネント
const InteractiveTabCapture: React.FC<{
  tabStream: TabStream;
  onStopCapture: (streamId: string) => void;
  sessionToken?: string;
}> = ({ tabStream, onStopCapture, sessionToken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (videoRef.current && tabStream.stream) {
      videoRef.current.srcObject = tabStream.stream;
    }
  }, [tabStream.stream]);

  // 操作イベントを送信
  const sendInteraction = async (interaction: any) => {
    if (!interactionEnabled || !sessionToken) return;

    try {
      const response = await fetch('/service/3d/send-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: tabStream.id,
          token: sessionToken,
          ...interaction
        })
      });

      if (!response.ok) {
        console.error('Interaction send failed');
      }
    } catch (error) {
      console.error('Interaction error:', error);
    }
  };

  // クリックイベント処理
  const handleVideoClick = (e: React.MouseEvent) => {
    if (!interactionEnabled) return;

    const rect = videoRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    sendInteraction({
      type: 'click',
      data: {
        x: x,
        y: y,
        button: e.button,
        timestamp: Date.now()
      }
    });
  };

  // スクロールイベント処理
  const handleVideoWheel = (e: React.WheelEvent) => {
    if (!interactionEnabled) return;
    e.preventDefault();

    sendInteraction({
      type: 'scroll',
      data: {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        timestamp: Date.now()
      }
    });
  };

  return (
    <div style={{
      padding: '8px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#000'
    }}>
      {/* ビデオプレビュー */}
      <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
        {tabStream.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            onClick={handleVideoClick}
            onWheel={handleVideoWheel}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000',
              cursor: interactionEnabled ? 'pointer' : 'default'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            backgroundColor: '#333'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📺</div>
              <div>タブキャプチャが停止されています</div>
            </div>
          </div>
        )}

        {/* ストリーム状態インジケーター */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          gap: '4px'
        }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: tabStream.isActive ? '#28a745' : '#dc3545',
            color: 'white'
          }}>
            {tabStream.isActive ? '配信中' : '停止中'}
          </div>
          {interactionEnabled && (
            <div style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white'
            }}>
              操作可能
            </div>
          )}
        </div>
      </div>

      {/* 拡張コントロールパネル */}
      <div style={{
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {tabStream.name}
          </span>
          <button
            onClick={() => onStopCapture(tabStream.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            停止
          </button>
        </div>

        {/* 操作制御 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={interactionEnabled}
              onChange={(e) => setInteractionEnabled(e.target.checked)}
            />
            操作転送
          </label>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#28a745' : '#dc3545'
          }} />
          <span style={{ fontSize: '11px', color: '#6c757d' }}>
            {isConnected ? '接続中' : '未接続'}
          </span>
        </div>
      </div>
    </div>
  );
};

// 従来のタブキャプチャコンポーネント（後方互換性のため）
const TabCapturePreview: React.FC<{
  tabStream: TabStream;
  onStopCapture: (streamId: string) => void;
}> = ({ tabStream, onStopCapture }) => {
  return (
    <InteractiveTabCapture
      tabStream={tabStream}
      onStopCapture={onStopCapture}
    />
  );
};

// Webアプリプレビューコンポーネント
const WebAppPreviewCard: React.FC<{
  webApp: WebAppPreview;
  onOpenInBrowser: (url: string) => void;
  onSyncSession: (appId: string) => void;
}> = ({ webApp, onOpenInBrowser, onSyncSession }) => {
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'synced' | 'not-synced'>('checking');

  useEffect(() => {
    // セッション同期状態をチェック
    const checkSession = async () => {
      try {
        const response = await fetch(`/api/session-status/${webApp.id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setSessionStatus(data.authenticated ? 'synced' : 'not-synced');
        } else {
          setSessionStatus('not-synced');
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSessionStatus('not-synced');
      }
    };

    checkSession();
  }, [webApp.id]);

  return (
    <div style={{
      padding: '16px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      {/* プレビュー画像エリア */}
      <div style={{
        flex: 1,
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        minHeight: '200px',
        backgroundImage: webApp.previewImage ? `url(${webApp.previewImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {!webApp.previewImage && (
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌐</div>
            <div>プレビュー画像なし</div>
          </div>
        )}

        {/* セッション状態インジケーター */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: sessionStatus === 'synced' ? '#28a745' :
            sessionStatus === 'not-synced' ? '#dc3545' : '#ffc107',
          color: 'white'
        }}>
          {sessionStatus === 'checking' ? '確認中...' :
            sessionStatus === 'synced' ? '同期済み' : '未同期'}
        </div>
      </div>

      {/* アプリ情報 */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>
          {webApp.name}
        </h3>
        {webApp.description && (
          <p style={{ margin: '0', fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
            {webApp.description}
          </p>
        )}
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onOpenInBrowser(webApp.url)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ブラウザで開く
        </button>
        <button
          onClick={() => onSyncSession(webApp.id)}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: sessionStatus === 'synced' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          セッション同期
        </button>
      </div>

      {/* 簡易操作パネル */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          クイックアクション
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onOpenInBrowser(`${webApp.url}/dashboard`)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            ダッシュボード
          </button>
          <button
            onClick={() => onOpenInBrowser(`${webApp.url}/settings`)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            設定
          </button>
        </div>
      </div>
    </div>
  );
};

// リサイズ可能なウィンドウコンポーネント（2D版）
const ResizableWindow: React.FC<{
  menu: MenuItem;
  index: number;
  onSizeChange: (index: number, width: number, height: number) => void;
  onPositionChange: (index: number, x: number, y: number) => void;
  onOpenInBrowser: (url: string) => void;
  onSyncSession: (appId: string) => void;
  onStopCapture: (streamId: string) => void;
}> = ({ menu, index, onSizeChange, onPositionChange, onOpenInBrowser, onSyncSession, onStopCapture }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: menu.width || 600,
    height: menu.height || 400,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const newWidth = Math.max(300, startWidth + (e.clientX - startX));
      const newHeight = Math.max(200, startHeight + (e.clientY - startY));

      setWindowSize({ width: newWidth, height: newHeight });
      onSizeChange(index, newWidth, newHeight);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { x: menu.x, y: menu.y };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // 2D平面での移動
      onPositionChange(index, startPosition.x + deltaX, startPosition.y + deltaY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: menu.x,
        top: menu.y,
        width: windowSize.width,
        height: windowSize.height,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        zIndex: 100 + index,
      }}
    >
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "8px 12px",
          borderBottom: "1px solid #ddd",
          fontSize: "12px",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleTitleBarMouseDown}
      >
        <span title="ドラッグで移動">{menu.name}</span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {/* リサイズハンドル */}
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#ddd",
              cursor: "nw-resize",
              borderRadius: "2px",
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
      <div style={{ height: "calc(100% - 32px)", overflow: "auto" }}>
        {menu.tabStream ? (
          <TabCapturePreview
            tabStream={menu.tabStream}
            onStopCapture={onStopCapture}
          />
        ) : menu.webApp ? (
          <WebAppPreviewCard
            webApp={menu.webApp}
            onOpenInBrowser={onOpenInBrowser}
            onSyncSession={onSyncSession}
          />
        ) : (
          menu.content
        )}
      </div>

      {/* リサイズハンドル */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "15px",
          height: "15px",
          cursor: "nw-resize",
          background: "linear-gradient(-45deg, transparent 40%, #ccc 40%, #ccc 60%, transparent 60%)",
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

// 2Dウィンドウマネージャー（カメラ機能付き）
const WindowManager2D: React.FC<{
  menus: MenuItem[];
  camera: CameraState;
  onMenuSizeChange: (index: number, width: number, height: number) => void;
  onMenuPositionChange: (index: number, x: number, y: number) => void;
  onOpenInBrowser: (url: string) => void;
  onSyncSession: (appId: string) => void;
  onStopCapture: (streamId: string) => void;
  onCameraChange: (camera: CameraState) => void;
}> = ({
  menus,
  camera,
  onMenuSizeChange,
  onMenuPositionChange,
  onOpenInBrowser,
  onSyncSession,
  onStopCapture,
  onCameraChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // カメラドラッグ処理
    const handleMouseDown = (e: React.MouseEvent) => {
      // ウィンドウ以外の場所でのドラッグ開始
      if (e.target === containerRef.current) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        onCameraChange({
          ...camera,
          x: camera.x + deltaX,
          y: camera.y + deltaY
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }, [isDragging, dragStart, camera, onCameraChange]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // ホイールズーム処理
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, camera.zoom * zoomFactor));

      onCameraChange({
        ...camera,
        zoom: newZoom
      });
    };

    // イベントリスナーの設定
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {menus.map((menu, idx) => (
          <ResizableWindow
            key={`${menu.name}-${idx}`}
            menu={menu}
            index={idx}
            onSizeChange={onMenuSizeChange}
            onPositionChange={onMenuPositionChange}
            onOpenInBrowser={onOpenInBrowser}
            onSyncSession={onSyncSession}
            onStopCapture={onStopCapture}
          />
        ))}
      </div>
    );
  };

const Menu2D: React.FC<Props> = ({ menus: initialMenus }) => {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [activeStreams, setActiveStreams] = useState<Map<string, MediaStream>>(new Map());
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1 });

  const handleMenuSizeChange = (index: number, width: number, height: number) => {
    setMenus(prev => prev.map((menu, idx) =>
      idx === index ? { ...menu, width, height } : menu
    ));
  };

  const handleMenuPositionChange = (index: number, x: number, y: number) => {
    setMenus(prev => prev.map((menu, idx) =>
      idx === index ? { ...menu, x, y } : menu
    ));
  };

  // カメラリセット
  const resetCamera = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
  };

  // カメラを中央に移動
  const centerCamera = () => {
    setCamera({ x: window.innerWidth / 4, y: window.innerHeight / 4, zoom: 1 });
  };

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetCamera();
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        centerCamera();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCamera(prev => ({ ...prev, zoom: 1 }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ブラウザでWebアプリを開く
  const handleOpenInBrowser = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // セッション同期処理
  const handleSyncSession = async (appId: string) => {
    try {
      console.log(`Syncing session for app: ${appId}`);

      const response = await fetch(`/api/sync-session/${appId}`, {
        method: 'POST',
        credentials: 'include', // セッションCookieを含める
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // セッション同期成功
        setMenus(prev => prev.map(menu =>
          menu.webApp?.id === appId
            ? { ...menu, webApp: { ...menu.webApp, isAuthenticated: true } }
            : menu
        ));
        alert(`セッション同期が完了しました: ${data.message}`);

        // セッション状態を再チェック
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'セッション同期に失敗しました');
      }
    } catch (error) {
      console.error('Session sync error:', error);
      alert(`セッション同期に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ブラウザサポートチェック
  const checkBrowserSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return false;
    }
    return true;
  };

  // Electronの状態をチェック
  const checkElectronStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service/3d/check-electron`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return { electron_available: false, error: 'API接続エラー' };
    } catch (error) {
      return { electron_available: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  // Electronベースの自動キャプチャを開始
  const startElectronCapture = useCallback(async () => {
    try {
      // まずElectronの状態をチェック
      const electronStatus = await checkElectronStatus();

      const response = await fetch(`${API_BASE_URL}/service/3d/start-electron-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          capture_type: 'window',
          target_urls: ['gmail.com', 'github.com', 'notion.so'],
          quality: 'high',
          frame_rate: 30,
          audio_enabled: true,
          interaction_enabled: true,
          security_level: 'high'
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Electronキャプチャセッションを作成
        const electronStream: TabStream = {
          id: data.session_id,
          name: data.mode === 'mock'
            ? `模擬キャプチャ ${new Date().toLocaleTimeString()}`
            : `Electron自動キャプチャ ${new Date().toLocaleTimeString()}`,
          stream: null, // WebSocketで後から設定
          isActive: true
        };

        // 新しいウィンドウを追加
        const newMenu: MenuItem = {
          name: electronStream.name,
          content: null,
          tabStream: electronStream,
          x: Math.random() * (window.innerWidth - 600),
          y: Math.random() * (window.innerHeight - 400) + 100,
          width: 800,
          height: 600,
        };
        setMenus(prev => [...prev, newMenu]);

        // 成功メッセージ
        let message = `キャプチャを開始しました。セッションID: ${data.session_id}`;
        if (data.mode === 'mock') {
          message += '\n\n⚠️ Electronが利用できないため、模擬モードで動作しています。';
          if (data.warning) {
            message += `\n詳細: ${data.warning}`;
          }
        }

        alert(message);
      } else {
        // レスポンスがJSONでない場合の処理
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'キャプチャの開始に失敗しました');
        } else {
          const errorText = await response.text();
          throw new Error(`サーバーエラー (${response.status}): ${errorText.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.error('Electron capture failed:', error);

      let errorMessage = 'キャプチャに失敗しました。';
      if (error instanceof Error) {
        if (error.message.includes('Proxy error')) {
          errorMessage = 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
        } else {
          errorMessage = `エラー: ${error.message}`;
        }
      }

      alert(errorMessage);
    }
  }, [checkElectronStatus]);

  // WebRTCタブキャプチャを開始
  const startTabCapture = useCallback(async () => {
    // ブラウザサポートチェック
    if (!checkBrowserSupport()) {
      alert('このブラウザは画面共有をサポートしていません。Chrome、Edge、Firefox、Safariの最新版をお試しください。');
      return;
    }

    try {
      // 画面共有の設定（標準的なgetDisplayMedia API）
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      } as DisplayMediaStreamConstraints);

      const streamId = `tab-${Date.now()}`;
      const tabStream: TabStream = {
        id: streamId,
        name: `タブキャプチャ ${new Date().toLocaleTimeString()}`,
        stream: stream,
        isActive: true
      };

      // ストリームを管理
      setActiveStreams(prev => new Map(prev.set(streamId, stream)));

      // ストリーム終了時の処理
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        handleStopCapture(streamId);
      });

      // 新しいウィンドウを追加
      const newMenu: MenuItem = {
        name: tabStream.name,
        content: null,
        tabStream: tabStream,
        x: Math.random() * (window.innerWidth - 400),
        y: Math.random() * (window.innerHeight - 300) + 100,
        width: 600,
        height: 400,
      };
      setMenus(prev => [...prev, newMenu]);

    } catch (error) {
      console.error('Screen capture failed:', error);

      let errorMessage = 'タブキャプチャに失敗しました。';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = '画面共有が拒否されました。ブラウザの設定を確認してください。';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'このブラウザは画面共有をサポートしていません。Chrome/Edgeをお試しください。';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '共有可能な画面が見つかりませんでした。';
        } else {
          errorMessage = `エラー: ${error.message}`;
        }
      }

      alert(errorMessage);
    }
  }, []);

  // タブキャプチャを停止
  const handleStopCapture = useCallback((streamId: string) => {
    const stream = activeStreams.get(streamId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setActiveStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(streamId);
        return newMap;
      });
    }

    // メニューからも削除
    setMenus(prev => prev.filter(menu => menu.tabStream?.id !== streamId));
  }, [activeStreams]);

  // 定義済みWebアプリを追加
  const addWebAppWindow = (webApp: WebAppPreview) => {
    const newMenu: MenuItem = {
      name: webApp.name,
      content: null,
      webApp: webApp,
      x: Math.random() * (window.innerWidth - 400),
      y: Math.random() * (window.innerHeight - 300) + 100,
      width: 400,
      height: 500,
    };
    setMenus(prev => [...prev, newMenu]);
  };

  // サンプルWebアプリ定義
  const sampleWebApps: WebAppPreview[] = [
    {
      id: 'gmail',
      name: 'Gmail',
      url: 'https://mail.google.com',
      description: 'Googleのメールサービス',
      isAuthenticated: false,
      previewImage: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
    },
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com',
      description: 'コード管理・共有プラットフォーム',
      isAuthenticated: true,
      previewImage: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
    },
    {
      id: 'notion',
      name: 'Notion',
      url: 'https://notion.so',
      description: 'オールインワン・ワークスペース',
      isAuthenticated: false
    },
    {
      id: 'slack',
      name: 'Slack',
      url: 'https://slack.com',
      description: 'チームコミュニケーションツール',
      isAuthenticated: true
    }
  ];

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      position: "relative",
      backgroundColor: "#f0f0f0",
      overflow: "hidden"
    }}>
      {/* コントロールパネル */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        maxWidth: "350px"
      }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "bold" }}>
          2D ウィンドウマネージャー
        </h3>

        {/* Electron自動キャプチャボタン */}
        <button
          onClick={startElectronCapture}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          title="Electronベースの自動キャプチャ（複数タブ同時対応）"
        >
          🚀 Electron自動キャプチャ
        </button>

        {/* Electron状態チェックボタン */}
        <button
          onClick={async () => {
            try {
              const status = await checkElectronStatus();
              let message = `Electron状態チェック:\n`;
              message += `利用可能: ${status.electron_available ? 'はい' : 'いいえ'}\n`;
              if (status.electron_version) {
                message += `バージョン: ${status.electron_version}\n`;
              }
              if (status.installation_command) {
                message += `インストール: ${status.installation_command}\n`;
              }
              if (status.alternative_mode) {
                message += `代替モード: ${status.alternative_mode}`;
              }
              alert(message);
            } catch (error) {
              alert(`Electron状態チェック失敗: ${error}`);
            }
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "12px"
          }}
        >
          ⚡ Electron状態チェック
        </button>

        {/* カメラコントロール */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            カメラ操作:
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            <button
              onClick={resetCamera}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "bold"
              }}
            >
              🏠 リセット
            </button>
            <button
              onClick={centerCamera}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "bold"
              }}
            >
              🎯 中央
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "#6c757d", marginBottom: "8px" }}>
            ズーム: {Math.round(camera.zoom * 100)}% | 位置: ({Math.round(camera.x)}, {Math.round(camera.y)})
          </div>
        </div>


      </div>

      {/* 操作ヘルプ */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          lineHeight: "1.4",
        }}
      >
        <div><strong>ウィンドウ操作:</strong></div>
        <div>• タイトルバーをドラッグ: 移動</div>
        <div>• 右下角をドラッグ: リサイズ</div>
        <div><strong>カメラ操作:</strong></div>
        <div>• 背景をドラッグ: カメラ移動</div>
        <div>• マウスホイール: ズーム</div>
        <div>• Ctrl+R: カメラリセット</div>
        <div>• Ctrl+C: カメラ中央</div>
        <div>• Ctrl+0: ズーム100%</div>
        <div>• 画面共有: リアルタイム表示</div>
        <div><strong>アクティブストリーム:</strong> {activeStreams.size}</div>
        <div><strong>ブラウザサポート:</strong> {checkBrowserSupport() ? '✅' : '❌'}</div>
      </div>

      {/* 2Dウィンドウマネージャー */}
      <WindowManager2D
        menus={menus}
        camera={camera}
        onMenuSizeChange={handleMenuSizeChange}
        onMenuPositionChange={handleMenuPositionChange}
        onOpenInBrowser={handleOpenInBrowser}
        onSyncSession={handleSyncSession}
        onStopCapture={handleStopCapture}
        onCameraChange={setCamera}
      />
    </div>
  );
};

export default Menu2D;
