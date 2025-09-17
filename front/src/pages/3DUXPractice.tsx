import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import MyCustomApp from "./MyCustomApp";
import { DragControls } from "three/examples/jsm/controls/DragControls";

interface MenuItem {
  name: string;
  content: React.ReactNode;
  x: number;
  y: number;
  z: number;
}

interface Props {
  menus: MenuItem[];
}

const DraggableMenus3D: React.FC<{ menus: MenuItem[]; orbitRef: React.RefObject<any> }> = ({
  menus,
  orbitRef,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const [positions, setPositions] = useState(menus.map((m) => new THREE.Vector3(m.x, m.y, m.z)));

  useEffect(() => {
    if (!groupRef.current) return;

    const handles: THREE.Mesh[] = groupRef.current.children as THREE.Mesh[];

    const controls = new DragControls(handles, camera, gl.domElement);

    controls.addEventListener("dragstart", () => {
      if (orbitRef.current) orbitRef.current.enabled = false;
      gl.domElement.style.cursor = "grabbing";
    });
    controls.addEventListener("dragend", (e: any) => {
      if (orbitRef.current) orbitRef.current.enabled = true;
      gl.domElement.style.cursor = "default";

      // ドラッグ後に位置を更新
      const idx = handles.indexOf(e.object);
      if (idx >= 0) {
        setPositions((prev) =>
          prev.map((pos, i) =>
            i === idx
              ? new THREE.Vector3(e.object.position.x, e.object.position.y, e.object.position.z)
              : pos
          )
        );
      }
    });

    return () => controls.dispose();
  }, [camera, gl, orbitRef]);

  return (
    <group ref={groupRef}>
      {menus.map((m, idx) => (
        <mesh key={idx} position={positions[idx]}>
          {/* ここをハンドル用ボックスに */}
          <boxGeometry args={[1, 0.2, 0.1]} />
          <meshStandardMaterial color="skyblue" />
          <Html position={[0, m.y * -1 + -3, 0]} transform>
            <div
              style={{
                width: 300,
                height: 200,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {m.content}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
};

const Menu3D: React.FC<Props> = ({ menus }) => {
  const orbitRef = useRef<any>(null);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DraggableMenus3D menus={menus} orbitRef={orbitRef} />
        <OrbitControls ref={orbitRef} />
      </Canvas>
    </div>
  );
};

export default Menu3D;
