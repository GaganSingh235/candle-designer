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
  className,
}: {
  // TypeScript Parameter Types
  preview?: boolean;
  type: string;
  color: string;
  className?: string;
}) {
  const { scene } = useGLTF(`/models/${type}.glb`); // Creating 3D Candle Object
  const ref = useRef<THREE.Object3D>(null); // 3D candle object reference
  const scale = preview ? 1 : 0.85; // Candle scale state

  // Effect to update candle colour
  useEffect(() => {
    if (!ref.current) return;

    ref.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        child.material.color.set(color);
      }
    });
  }, [color]);

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
    // Cleanup function to remove Animation Frame when component unmounts
    return () => cancelAnimationFrame(frameId);
  }, [preview, scale]);

  return (
    // Canvas for model
    <Canvas className={`md:top-0 ${className}`}>
      <ambientLight intensity={0.75} /> {/* Set light intensity */}
      <directionalLight position={[10, 10, 10]} /> {/* Position light source */}
      {/* 3D Candle Model object */}
      <primitive
        object={scene}
        ref={ref}
        // Reload the color of the candle when the color changes
        onUpdate={(self: THREE.Group) => {
          self.traverse((child: THREE.Object3D | THREE.Mesh) => {
            if (child instanceof THREE.Mesh) {
              child.material.color.set(color);
            }
          });
        }}
      />
      <OrbitControls enableZoom={false} enablePan={false} />
      {/* Allow users to move and rotate candle, but not zoom */}
    </Canvas>
  );
}
