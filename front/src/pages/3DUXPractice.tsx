import React, { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";

interface MenuItem {
  name: string;
  content: React.ReactNode;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
  rotationY?: number; // Y軸回転を追加
}

interface Props {
  menus: MenuItem[];
}

// リサイズ可能なウィンドウコンポーネント
const ResizableWindow: React.FC<{
  menu: MenuItem;
  index: number;
  onSizeChange: (index: number, width: number, height: number) => void;
  onPositionChange: (index: number, x: number, y: number, z: number) => void;
  onRotationChange: (index: number, rotationY: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}> = ({ menu, index, onSizeChange, onPositionChange, onRotationChange, onResizeStart, onResizeEnd }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: menu.width || 600,
    height: menu.height || 400,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // イベントの伝播を停止
    setIsResizing(true);
    onResizeStart(); // 3Dビューの操作を無効化

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
      onResizeEnd(); // 3Dビューの操作を再有効化
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
    onResizeStart(); // 3Dビューの操作を無効化

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { x: menu.x, y: menu.y, z: menu.z };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const deltaX = (e.clientX - startX) * 0.05;
      const deltaY = -(e.clientY - startY) * 0.05;

      if (e.ctrlKey) {
        // Ctrl + ドラッグ: Z軸移動（奥行き）
        const deltaZ = deltaY; // Y方向の動きをZ軸に変換
        onPositionChange(index, startPosition.x, startPosition.y, startPosition.z + deltaZ);
      } else if (e.shiftKey) {
        // Shift + ドラッグ: Y軸回転
        const rotationDelta = deltaX * 2; // 水平移動を回転に変換
        const currentRotation = menu.rotationY || 0;
        onRotationChange(index, currentRotation + rotationDelta);
      } else {
        // 通常ドラッグ: XY平面移動
        onPositionChange(index, startPosition.x + deltaX, startPosition.y + deltaY, startPosition.z);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      onResizeEnd(); // 3Dビューの操作を再有効化
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        width: windowSize.width,
        height: windowSize.height,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        position: "relative",
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
        <span title="ドラッグ: XY移動 | Ctrl+ドラッグ: 奥行き移動 | Shift+ドラッグ: 回転">{menu.name}</span>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {/* 回転ボタン */}
          <button
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              const currentRotation = menu.rotationY || 0;
              onRotationChange(index, currentRotation + Math.PI / 2); // 90度回転
            }}
            title="90度回転"
          >
            ↻
          </button>
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
        {menu.content}
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

const DraggableMenus3D: React.FC<{
  menus: MenuItem[];
  orbitRef: React.RefObject<any>;
  onMenuSizeChange: (index: number, width: number, height: number) => void;
  onMenuPositionChange: (index: number, x: number, y: number, z: number) => void;
  onMenuRotationChange: (index: number, rotationY: number) => void;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}> = ({
  menus,
  orbitRef,
  onMenuSizeChange,
  onMenuPositionChange,
  onMenuRotationChange,
  onResizeStart,
  onResizeEnd,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, viewport } = useThree();
    const [positions, setPositions] = useState<THREE.Vector3[]>([]);

    // メニューが変更されたときに位置を更新
    useEffect(() => {
      setPositions(menus.map((m) => new THREE.Vector3(m.x, m.y, m.z)));
    }, [menus]);

    // 位置が変更されたときに更新
    useEffect(() => {
      setPositions(menus.map((m) => new THREE.Vector3(m.x, m.y, m.z)));
    }, [menus]);

    return (
      <group ref={groupRef}>
        {menus.map((m, idx) => (
          <Html
            key={`${m.name}-${idx}`}
            position={positions[idx] || new THREE.Vector3(m.x, m.y, m.z)}
            rotation={[0, m.rotationY || 0, 0]}
            transform
          >
            <ResizableWindow
              menu={m}
              index={idx}
              onSizeChange={onMenuSizeChange}
              onPositionChange={onMenuPositionChange}
              onRotationChange={onMenuRotationChange}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
            />
          </Html>
        ))}
      </group>
    );
  };

const Menu3D: React.FC<Props> = ({ menus: initialMenus }) => {
  const orbitRef = useRef<any>(null);
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [isResizing, setIsResizing] = useState(false);

  const handleMenuSizeChange = (index: number, width: number, height: number) => {
    setMenus(prev => prev.map((menu, idx) =>
      idx === index ? { ...menu, width, height } : menu
    ));
  };

  const handleMenuPositionChange = (index: number, x: number, y: number, z: number) => {
    setMenus(prev => prev.map((menu, idx) =>
      idx === index ? { ...menu, x, y, z } : menu
    ));
  };

  const handleMenuRotationChange = (index: number, rotationY: number) => {
    setMenus(prev => prev.map((menu, idx) =>
      idx === index ? { ...menu, rotationY } : menu
    ));
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    if (orbitRef.current) {
      orbitRef.current.enabled = false;
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    if (orbitRef.current) {
      orbitRef.current.enabled = true;
    }
  };

  const addGoogleWindow = () => {
    const newMenu: MenuItem = {
      name: "Google検索",
      content: (
        <iframe
          src="https://www.google.com/webhp?igu=1"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          title="Google検索"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ),
      x: Math.random() * 10 - 5,
      y: Math.random() * 5,
      z: Math.random() * 5 - 2.5,
      width: 800, // デフォルトサイズを大きく
      height: 600,
    };
    setMenus(prev => [...prev, newMenu]);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* 新しいウィンドウ追加ボタン */}
      <button
        onClick={addGoogleWindow}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
        }}
      >
        + Google検索を追加
      </button>

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
        <div>• ドラッグ: XY移動</div>
        <div>• Ctrl+ドラッグ: 奥行き移動</div>
        <div>• Shift+ドラッグ: 回転</div>
        <div>• ↻ボタン: 90度回転</div>
        <div>• 右下角: リサイズ</div>
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DraggableMenus3D
          menus={menus}
          orbitRef={orbitRef}
          onMenuSizeChange={handleMenuSizeChange}
          onMenuPositionChange={handleMenuPositionChange}
          onMenuRotationChange={handleMenuRotationChange}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
        <OrbitControls ref={orbitRef} enabled={!isResizing} />
      </Canvas>
    </div>
  );
};

export default Menu3D;
