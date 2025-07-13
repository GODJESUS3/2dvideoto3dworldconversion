import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  Text3D,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
  SMAA,
  ToneMapping,
} from "@react-three/postprocessing";
import * as THREE from "three";

interface ProcessingJob {
  jobId: string;
  status: "processing" | "completed" | "failed";
  progress: {
    stage: "extracting" | "estimating" | "reconstructing" | "rendering";
    progress: number;
    currentFrame?: number;
    totalFrames?: number;
  };
}

interface HollywoodViewerProps {
  jobId?: string;
  className?: string;
}

function PointCloudMesh({ points }: { points: Float32Array }) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(points, 3));

    // Generate colors based on position for cinematic effect
    const colors = new Float32Array(points.length);
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      // Hollywood-style color grading
      colors[i] = 0.8 + Math.sin(x * 0.1) * 0.2; // R
      colors[i + 1] = 0.6 + Math.cos(y * 0.1) * 0.3; // G
      colors[i + 2] = 0.9 + Math.sin(z * 0.05) * 0.1; // B
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [points]);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Cinematic camera movement
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.05;

      // Dynamic point size for depth effect
      materialRef.current.size =
        0.02 + Math.sin(state.clock.elapsedTime * 2) * 0.005;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CinematicLighting() {
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Dynamic cinematic lighting
      lightRef.current.position.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 10;
      lightRef.current.position.z =
        Math.cos(state.clock.elapsedTime * 0.5) * 10;
      lightRef.current.intensity =
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <>
      {/* Key light */}
      <spotLight
        ref={lightRef}
        position={[10, 10, 10]}
        intensity={1.5}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={0.5}
        castShadow
      />

      {/* Fill light */}
      <spotLight
        position={[-10, 5, -5]}
        intensity={0.8}
        color="#9333ea"
        angle={Math.PI / 4}
        penumbra={0.3}
      />

      {/* Rim light */}
      <directionalLight
        position={[0, -10, -10]}
        intensity={0.4}
        color="#ff6b9d"
      />

      {/* Ambient */}
      <ambientLight intensity={0.2} color="#1a1a2e" />
    </>
  );
}

function GeneratedScene({ jobId }: { jobId: string }) {
  const [pointCloudData, setPointCloudData] = useState<Float32Array | null>(
    null,
  );

  useEffect(() => {
    // Simulate loading processed 3D data
    const generatePointCloud = () => {
      const points = new Float32Array(15000); // 5000 points * 3 coordinates

      for (let i = 0; i < points.length; i += 3) {
        // Generate sophisticated 3D point distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 3;

        points[i] = radius * Math.sin(phi) * Math.cos(theta);
        points[i + 1] = radius * Math.cos(phi);
        points[i + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Add some noise for organic feel
        points[i] += (Math.random() - 0.5) * 0.5;
        points[i + 1] += (Math.random() - 0.5) * 0.5;
        points[i + 2] += (Math.random() - 0.5) * 0.5;
      }

      return points;
    };

    // Simulate loading time
    setTimeout(() => {
      setPointCloudData(generatePointCloud());
    }, 2000);
  }, [jobId]);

  if (!pointCloudData) {
    return (
      <Float speed={2} rotationIntensity={0.1}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          position={[0, 0, 0]}
          size={0.5}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
        >
          PROCESSING...
          <meshStandardMaterial
            color="#9333ea"
            emissive="#9333ea"
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Float>
    );
  }

  return <PointCloudMesh points={pointCloudData} />;
}

function PostProcessing() {
  return (
    <EffectComposer>
      <SMAA />
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
      <Noise opacity={0.025} />
      <Vignette eskil={false} offset={0.1} darkness={0.8} />
      <ToneMapping mode={THREE.ACESFilmicToneMapping} />
    </EffectComposer>
  );
}

function Scene({ jobId }: { jobId?: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={60} position={[8, 4, 8]} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />

      <CinematicLighting />

      <Environment preset="city" background={false} />

      {/* Hollywood-level background */}
      <mesh>
        <sphereGeometry args={[100, 64, 32]} />
        <meshBasicMaterial
          side={THREE.BackSide}
          color="#0a0a0a"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Grid floor with glow effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          wireframe
          transparent
          opacity={0.3}
          emissive="#9333ea"
          emissiveIntensity={0.1}
        />
      </mesh>

      {jobId ? (
        <GeneratedScene jobId={jobId} />
      ) : (
        <Float speed={1.5} rotationIntensity={0.2}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            position={[0, 0, 0]}
            size={0.8}
            height={0.1}
          >
            READY
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.7}
              roughness={0.1}
              emissive="#9333ea"
              emissiveIntensity={0.2}
            />
          </Text3D>
        </Float>
      )}

      <PostProcessing />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-black/95">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/80 text-lg font-medium">
          Initializing Hollywood Renderer...
        </p>
        <p className="text-white/60 text-sm mt-2">
          Loading AI-powered 3D environment
        </p>
      </div>
    </div>
  );
}

export default function HollywoodViewer({
  jobId,
  className = "",
}: HollywoodViewerProps) {
  return (
    <div
      className={`w-full h-full bg-black overflow-hidden relative ${className}`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [8, 4, 8], fov: 60 }}
        gl={{
          alpha: false,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap,
          },
        }}
      >
        <Suspense fallback={null}>
          <Scene jobId={jobId} />
          <fog attach="fog" args={["#000010", 15, 60]} />
        </Suspense>
      </Canvas>

      {/* Hollywood-style UI overlay */}
      <div className="absolute top-4 left-4 glass p-4 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div>
            <p className="text-white font-medium text-sm">DIMENSION AI</p>
            <p className="text-white/60 text-xs">Hollywood-Level Renderer</p>
          </div>
        </div>
      </div>

      {/* Controls info */}
      <div className="absolute bottom-4 right-4 glass p-3 rounded-lg border border-primary/20">
        <p className="text-white/80 text-sm font-medium mb-2">Navigation:</p>
        <div className="text-xs text-white/60 space-y-1">
          <div>🖱️ Drag: Rotate camera</div>
          <div>🔍 Scroll: Zoom in/out</div>
          <div>⚡ Right-click: Pan view</div>
        </div>
      </div>

      {jobId && (
        <div className="absolute top-4 right-4 glass p-3 rounded-lg border border-primary/20">
          <p className="text-white/80 text-sm">
            Processing Job:{" "}
            <span className="text-primary font-mono">{jobId.slice(-8)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
