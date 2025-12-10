"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Monochrome shader for glossy white/gray aesthetic
const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 8.0 + time * 0.5) * 0.08 * intensity;
    pos.x += cos(pos.y * 6.0 + time * 0.7) * 0.04 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create smooth animated noise pattern
    float noise = sin(uv.x * 15.0 + time * 0.3) * cos(uv.y * 12.0 + time * 0.4);
    noise += sin(uv.x * 25.0 - time * 0.5) * cos(uv.y * 18.0 + time * 0.6) * 0.5;
    
    // Monochrome gradient from dark to light
    float gradient = smoothstep(0.0, 1.0, uv.y * 0.7 + noise * 0.3);
    
    // Create glossy white highlights
    vec3 baseColor = mix(vec3(0.02, 0.02, 0.02), vec3(0.15, 0.15, 0.15), gradient);
    vec3 highlightColor = vec3(1.0, 1.0, 1.0);
    
    // Add subtle glossy highlights
    float highlight = pow(abs(noise), 3.0) * intensity * 0.3;
    vec3 color = mix(baseColor, highlightColor, highlight);
    
    // Add soft glow
    float glow = 1.0 - length(uv - 0.5) * 1.5;
    glow = pow(max(glow, 0.0), 1.5);
    
    gl_FragColor = vec4(color * (0.8 + glow * 0.2), 1.0);
  }
`;

function ShaderPlane() {
  const mesh = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 1.0 },
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      uniforms.time.value = state.clock.elapsedTime;
      uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function BackgroundShader() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full"
      >
        <ShaderPlane />
      </Canvas>
      
      {/* Additional glossy overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/[0.01] rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}
