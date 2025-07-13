import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  Text3D,
  useTexture,
  Plane,
} from "@react-three/drei";
import * as THREE from "three";

interface ThreeViewerProps {
  videoSrc?: string;
  className?: string;
}

function VideoPlane({ videoSrc }: { videoSrc: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoTexture = useMemo(() => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.play();
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    return texture;
  }, [videoSrc]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[8, 4.5]} />
        <meshStandardMaterial map={videoTexture} />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  const { camera } = useThree();

  // Create a demo 3D environment
  const spheres = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ] as [number, number, number],
      color: `hsl(${260 + Math.random() * 40}, 70%, ${50 + Math.random() * 30}%)`,
      scale: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault fov={75} position={[0, 2, 10]} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9333ea" />

      {/* Environment */}
      <Environment preset="city" />

      {/* Demo 3D elements representing converted video content */}
      <group>
        {spheres.map((sphere, i) => (
          <Float
            key={i}
            speed={1 + Math.random() * 2}
            rotationIntensity={0.5}
            floatIntensity={0.8}
          >
            <mesh position={sphere.position}>
              <sphereGeometry args={[sphere.scale, 32, 32]} />
              <meshStandardMaterial
                color={sphere.color}
                metalness={0.7}
                roughness={0.2}
                emissive={sphere.color}
                emissiveIntensity={0.1}
              />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Central platform representing the main video content */}
      <group position={[0, -2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Glowing ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[5.8, 6.2, 64]} />
          <meshStandardMaterial
            color="#9333ea"
            emissive="#9333ea"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* 3D Text */}
      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            position={[0, 4, 0]}
            size={0.8}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            3D WORLD
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.7}
              roughness={0.1}
              emissive="#9333ea"
              emissiveIntensity={0.2}
            />
          </Text3D>
        </Float>
      </Suspense>

      {/* Particle system */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={
              new Float32Array(
                Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 50),
              )
            }
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#9333ea" transparent opacity={0.6} />
      </points>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading 3D Environment...</p>
      </div>
    </div>
  );
}

export default function ThreeViewer({
  videoSrc,
  className = "",
}: ThreeViewerProps) {
  return (
    <div
      className={`w-full h-full bg-black/90 rounded-lg overflow-hidden ${className}`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 10], fov: 75 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
      >
        <Suspense fallback={null}>
          <Scene3D />
          <fog attach="fog" args={["#000", 10, 50]} />
        </Suspense>
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 glass p-3 rounded-lg">
        <p className="text-sm text-white/80 mb-1">Controls:</p>
        <div className="text-xs text-white/60 space-y-1">
          <div>Mouse: Rotate view</div>
          <div>Scroll: Zoom in/out</div>
          <div>Right-click + drag: Pan</div>
        </div>
      </div>
    </div>
  );
}
