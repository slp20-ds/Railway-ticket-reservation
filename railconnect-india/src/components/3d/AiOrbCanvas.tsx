import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AIOrbState = 'idle' | 'listening' | 'thinking' | 'responding' | 'success' | 'error';

interface AiOrbCanvasProps {
  state: AIOrbState;
  size?: number;
}

export const AiOrbCanvas: React.FC<AiOrbCanvasProps> = ({ state, size = 64 }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic color depending on AI state
    let orbColor = 0x06b6d4; // idle / listening cyan
    let emissiveColor = 0x0891b2;
    if (state === 'thinking') {
      orbColor = 0xa855f7; // purple
      emissiveColor = 0x9333ea;
    } else if (state === 'responding') {
      orbColor = 0x38bdf8; // light sky blue
      emissiveColor = 0x0284c7;
    } else if (state === 'success') {
      orbColor = 0x10b981; // emerald
      emissiveColor = 0x059669;
    } else if (state === 'error') {
      orbColor = 0xef4444; // red
      emissiveColor = 0xdc2626;
    }

    // Inner Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: orbColor,
      emissive: emissiveColor,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.7,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Outer Holographic Wireframe Cage / Icosahedron
    const cageGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: orbColor,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cage);

    // Surrounding Orbital Rings
    const ringGeo = new THREE.TorusGeometry(1.25, 0.03, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: orbColor,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring2);

    // Point light inside
    const pointLight = new THREE.PointLight(orbColor, 3, 10);
    scene.add(pointLight);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotation
      cage.rotation.x = elapsed * 0.8;
      cage.rotation.y = elapsed * 1.2;

      ring1.rotation.z = elapsed * 1.5;
      ring2.rotation.x = -elapsed * 1.2;

      // Pulsing scale based on AI state
      let pulseSpeed = 2;
      let pulseAmp = 0.05;
      if (state === 'thinking') {
        pulseSpeed = 6;
        pulseAmp = 0.12;
      } else if (state === 'responding') {
        pulseSpeed = 4;
        pulseAmp = 0.1;
      }

      const scale = 1 + Math.sin(elapsed * pulseSpeed) * pulseAmp;
      core.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [state, size]);

  return <div ref={mountRef} style={{ width: size, height: size }} className="inline-block" />;
};
