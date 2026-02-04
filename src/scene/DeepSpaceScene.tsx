import { useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

type Props = { mode: "dark" | "light" };

function makeStarField(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // bias toward forward depth
    const r = Math.random();
    const z = -r * spread;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * spread * 0.55;
    const x = (Math.random() - 0.5) * spread * 0.85;
    positions[i3 + 0] = x + Math.cos(theta) * 0.6;
    positions[i3 + 1] = y + Math.sin(theta) * 0.35;
    positions[i3 + 2] = z;
  }
  return positions;
}

function NebulaSheet({ colorA, colorB, z, scale }: { colorA: string; colorB: string; z: number; scale: number }) {
  const mat = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          vec3 p = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;

        float hash(vec2 p){
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p){
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0,0.0));
          float c = hash(i + vec2(0.0,1.0));
          float d = hash(i + vec2(1.0,1.0));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }
        float fbm(vec2 p){
          float v=0.0;
          float a=0.55;
          for(int i=0;i<5;i++){
            v += a*noise(p);
            p *= 2.03;
            a *= 0.55;
          }
          return v;
        }

        void main(){
          vec2 uv = vUv;
          vec2 p = (uv-0.5)*2.0;
          float t = uTime*0.04;
          float n = fbm(p*2.3 + vec2(t, -t));
          float n2 = fbm(p*4.1 + vec2(-t*1.2, t*1.6));
          float haze = smoothstep(0.85, 0.2, length(p)) * 0.75;
          float alpha = (n*0.75 + n2*0.45) * haze;
          vec3 col = mix(uColorA, uColorB, clamp(n2,0.0,1.0));
          col *= 1.15;
          gl_FragColor = vec4(col, alpha*0.70);
        }
      `,
    });
    return material;
  }, [colorA, colorB]);

  useFrame((_, dt) => {
    (mat.uniforms.uTime.value as number) += dt;
  });

  return (
    <mesh position={[0, 0, z]} scale={[scale, scale * 0.6, 1]} material={mat as any}>
      <planeGeometry args={[10, 10, 1, 1]} />
    </mesh>
  );
}

export default function DeepSpaceScene({ mode }: Props) {
  const starsNear = useMemo(() => makeStarField(9000, 110), []);
  const starsFar = useMemo(() => makeStarField(7000, 170), []);
  const group = useRef<THREE.Group>(null!);

  useFrame(({ camera, mouse }, dt) => {
    // camera glide forward (warp-through-space vibe)
    camera.position.z -= dt * 2.8;
    if (camera.position.z < -80) camera.position.z = 7.5;

    // subtle mouse parallax
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + mouse.y * 0.8, 0.05);
    camera.lookAt(0, 0, camera.position.z - 10);

    if (group.current) {
      group.current.rotation.z += dt * 0.02;
      group.current.rotation.y += dt * 0.01;
    }
  });

  const starColor = mode === "dark" ? "#bfe6ff" : "#6b85ff";

  return (
    <group ref={group}>
      {/* far field */}
      <Points positions={starsFar} stride={3} frustumCulled={false}>
        <PointMaterial transparent color={starColor} size={0.012} sizeAttenuation depthWrite={false} />
      </Points>
      {/* near field (brighter) */}
      <Points positions={starsNear} stride={3} frustumCulled={false}>
        <PointMaterial transparent color={"#ffffff"} size={0.018} sizeAttenuation depthWrite={false} />
      </Points>

      <Float speed={0.25} rotationIntensity={0.25} floatIntensity={0.65}>
        <NebulaSheet colorA={mode === "dark" ? "#7c3aed" : "#4f46e5"} colorB={mode === "dark" ? "#06b6d4" : "#0ea5e9"} z={-22} scale={24} />
        <NebulaSheet colorA={mode === "dark" ? "#f97316" : "#fb7185"} colorB={mode === "dark" ? "#22c55e" : "#10b981"} z={-52} scale={34} />
      </Float>

      {/* faint galaxy core */}
      <mesh position={[1.8, 0.8, -34]} rotation={[0, 0, 0.25]}>
        <ringGeometry args={[0.6, 2.2, 64]} />
        <meshBasicMaterial color={mode === "dark" ? "#93c5fd" : "#1d4ed8"} transparent opacity={0.18} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
