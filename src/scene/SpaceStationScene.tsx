import { useFrame } from "@react-three/fiber";
import { RoundedBox, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

type Props = { mode: "dark" | "light" };

function Panel({ pos, rot, color }: { pos: [number, number, number]; rot?: [number, number, number]; color: string }) {
  return (
    <RoundedBox position={pos} rotation={rot} args={[1.4, 0.26, 0.05]} radius={0.06} smoothness={4}>
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} emissive={color} emissiveIntensity={0.08} />
    </RoundedBox>
  );
}

export default function SpaceStationScene({ mode }: Props) {
  const group = useRef<THREE.Group>(null!);
  const lights = useRef<THREE.Group>(null!);

  const accent = mode === "dark" ? "#67e8f9" : "#2563eb";
  const wall = mode === "dark" ? "#0b1220" : "#e2e8f0";
  const metal = mode === "dark" ? "#111827" : "#cbd5e1";

  const windows = useMemo(
    () => [
      { x: -2.4, z: -6.5 },
      { x: 2.4, z: -6.5 },
      { x: -2.4, z: -10.0 },
      { x: 2.4, z: -10.0 },
      { x: -2.4, z: -13.5 },
      { x: 2.4, z: -13.5 },
    ],
    []
  );

  useFrame(({ camera, mouse }, dt) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.55, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.55 + mouse.y * 0.25, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4.8, 0.02);
    camera.lookAt(0, 0.45, -9);

    if (group.current) group.current.position.z = Math.sin(Date.now() * 0.00025) * 0.15;
    if (lights.current) lights.current.rotation.z += dt * 0.12;
  });

  return (
    <group>
      {/* Space outside through windows */}
      <group position={[0, 0, -26]}>
        <Stars radius={140} depth={70} count={8000} factor={4} saturation={0} fade speed={0.5} />
        <mesh position={[0, 2, -10]}>
          <sphereGeometry args={[3.2, 48, 48]} />
          <meshBasicMaterial color={mode === "dark" ? "#60a5fa" : "#93c5fd"} transparent opacity={0.10} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <ambientLight intensity={mode === "dark" ? 0.25 : 0.65} />
      <pointLight position={[0, 2, 3]} intensity={mode === "dark" ? 1.8 : 1.1} color={accent} distance={35} />
      <pointLight position={[-4, 1.2, -8]} intensity={mode === "dark" ? 0.9 : 0.6} color={"#f472b6"} distance={30} />

      <group ref={group}>
        {/* Corridor shell */}
        <RoundedBox position={[0, 0.5, -10]} args={[6.6, 3.4, 18]} radius={0.25} smoothness={6}>
          <meshStandardMaterial color={wall} roughness={0.8} metalness={0.1} />
        </RoundedBox>

        {/* Floor */}
        <RoundedBox position={[0, -0.65, -10]} args={[6.3, 0.35, 17.6]} radius={0.18} smoothness={6}>
          <meshStandardMaterial color={metal} roughness={0.35} metalness={0.75} />
        </RoundedBox>

        {/* Ceiling light strips */}
        <group ref={lights} position={[0, 1.65, -10]}>
          <RoundedBox args={[5.4, 0.08, 16.8]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} roughness={0.2} metalness={0.1} />
          </RoundedBox>
          <RoundedBox position={[0, 0.0, 0]} args={[5.4, 0.08, 16.8]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color={"#ffffff"} emissive={"#ffffff"} emissiveIntensity={0.22} transparent opacity={0.35} />
          </RoundedBox>
        </group>

        {/* Side panels */}
        <Panel pos={[-2.2, 0.4, -6]} rot={[0, 0.25, 0]} color={accent} />
        <Panel pos={[2.2, 0.4, -8]} rot={[0, -0.25, 0]} color={accent} />
        <Panel pos={[-2.1, 0.2, -12]} rot={[0, 0.22, 0]} color={"#f472b6"} />
        <Panel pos={[2.1, 0.2, -14]} rot={[0, -0.22, 0]} color={"#a78bfa"} />

        {/* Windows (holes are faked with emissive glass) */}
        {windows.map((w, idx) => (
          <RoundedBox
            key={idx}
            position={[w.x, 0.65, w.z]}
            rotation={[0, w.x < 0 ? 0.12 : -0.12, 0]}
            args={[1.25, 0.9, 0.06]}
            radius={0.14}
            smoothness={6}
          >
            <meshStandardMaterial
              color={mode === "dark" ? "#0b1220" : "#ffffff"}
              roughness={0.05}
              metalness={0.05}
              transparent
              opacity={mode === "dark" ? 0.18 : 0.22}
              emissive={mode === "dark" ? "#60a5fa" : "#2563eb"}
              emissiveIntensity={0.55}
            />
          </RoundedBox>
        ))}

        {/* end door */}
        <RoundedBox position={[0, 0.5, -18.8]} args={[3.4, 2.4, 0.25]} radius={0.22} smoothness={6}>
          <meshStandardMaterial color={metal} roughness={0.35} metalness={0.85} />
        </RoundedBox>
      </group>
    </group>
  );
}
