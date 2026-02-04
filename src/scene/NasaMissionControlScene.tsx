import { useFrame } from "@react-three/fiber";
import { RoundedBox, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

type Props = { mode: "dark" | "light" };

function makeStars(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.55;
    positions[i3 + 2] = -Math.random() * spread;
  }
  return positions;
}

function ConsoleRow({ z }: { z: number }) {
  return (
    <group position={[0, -0.35, z]}>
      <RoundedBox args={[6.4, 0.35, 1.2]} radius={0.14} smoothness={6}>
        <meshStandardMaterial color={"#0b0f17"} roughness={0.9} metalness={0.12} />
      </RoundedBox>
      {/* monitors */}
      {[-2.2, -0.7, 0.7, 2.2].map((x, i) => (
        <RoundedBox key={i} position={[x, 0.35, -0.25]} args={[1.0, 0.55, 0.08]} radius={0.12} smoothness={6}>
          <meshStandardMaterial
            color={"#070a10"}
            roughness={0.25}
            metalness={0.2}
            emissive={"#dbeafe"}
            emissiveIntensity={0.04}
          />
        </RoundedBox>
      ))}
      {/* tiny status LEDs */}
      {[-2.55, -1.05, -0.1, 0.95, 2.05].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0.35]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#fde68a" : "#86efac"} transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

export default function NasaMissionControlScene({ mode }: Props) {
  const rig = useRef<THREE.Group>(null!);
  const stars = useMemo(() => makeStars(2400, 140), []);

  useFrame(({ camera, mouse }, dt) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.7, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.55 + mouse.y * 0.25, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.8, 0.02);
    camera.lookAt(0, 0.25, -6.5);

    if (rig.current) rig.current.position.z = Math.sin(Date.now() * 0.00025) * 0.08;

    // very slow drift in stars
    (camera as any).rotation.z += dt * 0.0005;
  });

  const bg = mode === "dark" ? "#000005" : "#f3f4f6";

  return (
    <group>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 16, 120]} />

      {/* distant starfield (realistic, subtle) */}
      <Points positions={stars} stride={3} frustumCulled={false}>
        <PointMaterial transparent color={mode === "dark" ? "#ffffff" : "#111827"} size={0.012} sizeAttenuation depthWrite={false} opacity={0.75} />
      </Points>

      <ambientLight intensity={mode === "dark" ? 0.35 : 0.75} />
      <directionalLight position={[4, 6, 3]} intensity={mode === "dark" ? 0.45 : 0.7} color={"#ffffff"} />
      <pointLight position={[0, 1.1, 1.5]} intensity={mode === "dark" ? 0.55 : 0.35} color={"#dbeafe"} distance={22} />

      <group ref={rig} position={[0, 0.05, -8]}>
        {/* control room shell */}
        <RoundedBox position={[0, 0.6, -4.0]} args={[8.6, 3.6, 12]} radius={0.22} smoothness={8}>
          <meshStandardMaterial color={mode === "dark" ? "#05070c" : "#e5e7eb"} roughness={0.95} metalness={0.05} />
        </RoundedBox>

        {/* floor grid plate */}
        <mesh position={[0, -0.72, -4.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.0, 12.0, 1, 1]} />
          <meshStandardMaterial color={mode === "dark" ? "#03040a" : "#f8fafc"} roughness={1} metalness={0} />
        </mesh>

        {/* grid lines */}
        <gridHelper args={[9, 18, mode === "dark" ? "#1f2937" : "#cbd5e1", mode === "dark" ? "#0b1220" : "#e2e8f0"]} position={[0, -0.71, -4.1]} rotation={[0, 0, 0]} />

        {/* rows of consoles */}
        <ConsoleRow z={-2.8} />
        <ConsoleRow z={-5.3} />
        <ConsoleRow z={-7.8} />

        {/* main display wall */}
        <RoundedBox position={[0, 1.05, -10.3]} args={[7.4, 2.2, 0.22]} radius={0.18} smoothness={8}>
          <meshStandardMaterial color={mode === "dark" ? "#0b0f17" : "#e5e7eb"} roughness={0.65} metalness={0.15} />
        </RoundedBox>
        <RoundedBox position={[0, 1.05, -10.19]} args={[7.0, 1.9, 0.06]} radius={0.14} smoothness={8}>
          <meshStandardMaterial
            color={mode === "dark" ? "#05070c" : "#ffffff"}
            roughness={0.2}
            metalness={0.05}
            emissive={mode === "dark" ? "#e5e7eb" : "#111827"}
            emissiveIntensity={mode === "dark" ? 0.05 : 0.02}
            transparent
            opacity={mode === "dark" ? 0.55 : 0.18}
          />
        </RoundedBox>
      </group>
    </group>
  );
}
