"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import type { Metrics } from "@/lib/quote/pricing";

type Props = {
  fileUrl: string;
  colorHex: string;
  onMetrics: (metrics: Metrics) => void;
  onError: (code: string) => void;
};

function Model({ url, colorHex, yOffset }: { url: string; colorHex: string; yOffset: number }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let active = true;
    new STLLoader().load(url, (loaded) => {
      if (!active) { loaded.dispose(); return; }
      loaded.computeVertexNormals();
      loaded.center();
      setGeometry((previous) => { previous?.dispose(); return loaded; });
    });
    return () => {
      active = false;
      setGeometry((previous) => { previous?.dispose(); return null; });
    };
  }, [url]);

  if (!geometry) return null;
  return (
    <mesh geometry={geometry} position={[0, yOffset, 0]}>
      <meshStandardMaterial color={colorHex} roughness={0.4} metalness={0.05} />
    </mesh>
  );
}

export default function StlScene({ fileUrl, colorHex, onMetrics, onError }: Props) {
  const [targetY, setTargetY] = useState(60);
  const [yOffset, setYOffset] = useState(0);
  const callbacks = useRef({ onMetrics, onError });

  useEffect(() => {
    callbacks.current = { onMetrics, onError };
  }, [onMetrics, onError]);

  useEffect(() => {
    const worker = new Worker(new URL("./stlWorker.ts", import.meta.url), { type: "module" });
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "err") callbacks.current.onError(event.data.code || "STL_UNREADABLE");
      if (event.data?.type === "ok") {
        callbacks.current.onMetrics(event.data.metrics);
        setTargetY(Math.max(35, Math.min(140, (event.data.bounds?.height ?? 120) * 0.45)));
        setYOffset(event.data.bounds?.yOffset ?? 0);
      }
    };
    worker.addEventListener("message", handleMessage);
    worker.postMessage({ type: "parse", url: fileUrl });
    return () => worker.terminate();
  }, [fileUrl]);

  return (
    <Canvas dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: false, powerPreference: "low-power" }} camera={{ fov: 38, position: [-300, 350, 700] }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[256, 256]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.95} />
      </mesh>
      <gridHelper args={[256, 16, "#7C3AED", "#cbd5e1"]} position={[0, 0.05, 0]} />
      <Suspense fallback={null}><Model url={fileUrl} colorHex={colorHex} yOffset={yOffset} /></Suspense>
      <OrbitControls target={[0, targetY, 0]} enablePan={false} enableDamping rotateSpeed={0.3} minDistance={120} maxDistance={1400} />
    </Canvas>
  );
}
