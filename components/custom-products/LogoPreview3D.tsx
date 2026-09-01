"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FileText, ImageIcon } from "lucide-react";

function LogoModel({ file }: { file: File }) {
  const [url] = useState(() => URL.createObjectURL(file));
  const sourceTexture = useTexture(url);
  const texture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [sourceTexture]);

  useEffect(() => () => {
    texture.dispose();
    URL.revokeObjectURL(url);
  }, [texture, url]);

  return (
    <group rotation={[-0.18, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.16, 72]} />
        <meshStandardMaterial color="#ede9fe" roughness={0.42} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.65, 1.05]} />
        <meshStandardMaterial map={texture} transparent roughness={0.35} />
      </mesh>
    </group>
  );
}

export default function LogoPreview3D({ file }: { file: File | null }) {
  if (!file) {
    return <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400"><ImageIcon size={48} strokeWidth={1.5} /><p className="mt-3 text-sm font-semibold">Logo yüklediğinizde önizleme burada görünecek.</p></div>;
  }

  if (file.type === "application/pdf") {
    return <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-500"><FileText size={48} strokeWidth={1.5} /><p className="mt-3 text-sm font-semibold">PDF dosyanız teklife eklenecek.</p><p className="mt-1 text-xs">3D önizleme PNG ve JPG logolar için kullanılabilir.</p></div>;
  }

  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.8, 3.8], fov: 38 }} gl={{ antialias: true, powerPreference: "low-power" }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
      <Suspense fallback={null}><LogoModel key={`${file.name}-${file.lastModified}`} file={file} /></Suspense>
      <OrbitControls enablePan={false} enableZoom={false} enableDamping autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  );
}
