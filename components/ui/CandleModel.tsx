// Importing necessary libraries & Components
import React, { useRef, useEffect } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

// Define exported CandleModel component
export default function CandleModel({
  // Parameters
  preview, // Final preview state
  type,
  color,
}: {
  // TypeScript Parameter Types
  preview?: boolean;
  type: string;
  color: string;
}) {
  const { scene } = useGLTF(`/models/${type}.glb`); // Creating 3D Candle Object
  const ref = useRef<THREE.Object3D>(null); // 3D candle object reference
  const scale = preview ? 1.15 : 1; // Candle scale state

  // Effect to update candle colour
  useEffect(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).color.set(color);
        }
      });
    }
  }, [color]); // Re-run effect if colour dependency changes

  // Effect to create final spinning preview
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (preview && ref.current) {
        ref.current.rotation.y += 0.02;
      }
      if (ref.current) {
        ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      }
      frameId = requestAnimationFrame(animate);
    };

    animate();
    // Cleanup functio to remoce Animation Frame when component unmounts
    return () => cancelAnimationFrame(frameId);
  }, [preview, scale]);

  return (
    // Canvas for model
    <Canvas className="top-14 md:top-0">
      <ambientLight intensity={0.75} /> {/* Set light intensity */}
      <directionalLight position={[10, 10, 10]} /> {/* Position light source */}
      <primitive object={scene} ref={ref} /> {/* 3D Candle Model object */}
      <OrbitControls enableZoom={false} />{" "}
      {/* Allow users to move and rotate candle, but not zoom */}
    </Canvas>
  );
}
