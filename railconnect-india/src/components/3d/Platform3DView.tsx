import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeMode } from '../../types';

interface Platform3DViewProps {
  platform: string;
  userCoach: string;
  trainNumber: string;
  themeMode: ThemeMode;
}

export const Platform3DView: React.FC<Platform3DViewProps> = ({
  platform,
  userCoach,
  trainNumber,
  themeMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const isDark = themeMode === 'dark';
    scene.background = new THREE.Color(isDark ? 0x050b14 : 0x0f172a);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 7, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 5, 30);
    spotLight.position.set(0, 10, 5);
    scene.add(spotLight);

    // Platform Surface
    const platGeo = new THREE.BoxGeometry(22, 0.6, 5);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const platMesh = new THREE.Mesh(platGeo, platMat);
    platMesh.position.set(0, -0.3, 2.5);
    scene.add(platMesh);

    // Yellow Platform edge
    const edgeGeo = new THREE.BoxGeometry(22, 0.62, 0.25);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.set(0, -0.3, 0.1);
    scene.add(edgeMesh);

    // Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.2, 0.1), railMat);
    r1.position.set(0, -0.2, -0.8);
    scene.add(r1);

    const r2 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.2, 0.1), railMat);
    r2.position.set(0, -0.2, -2.2);
    scene.add(r2);

    // Train Rake: Engine -> S1 -> S2 -> S3 -> S4 -> S5
    const coaches = ['ENG', 'S1', 'S2', 'S3', 'S4', 'S5'];
    const coachGroup = new THREE.Group();
    const arrowMeshes: THREE.Mesh[] = [];

    coaches.forEach((cName, idx) => {
      const isEngine = cName === 'ENG';
      const isTargetCoach = cName === userCoach;
      const xPos = -9 + idx * 3.4;

      const cGeo = new THREE.BoxGeometry(2.8, 1.6, 1.5);
      const cMat = new THREE.MeshStandardMaterial({
        color: isTargetCoach ? 0x06b6d4 : isEngine ? 0xd97706 : 0x0284c7,
        emissive: isTargetCoach ? 0x0891b2 : 0x000000,
        emissiveIntensity: isTargetCoach ? 1.2 : 0,
        metalness: 0.6,
        roughness: 0.3,
      });

      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(xPos, 0.8, -1.5);
      coachGroup.add(cMesh);

      // Coach Windows
      const winGeo = new THREE.BoxGeometry(0.5, 0.4, 0.05);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
      });
      for (let wx = -0.8; wx <= 0.8; wx += 0.8) {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(xPos + wx, 1.1, -0.73);
        coachGroup.add(win);
      }

      // Glowing Arrow Indicator for user's coach
      if (isTargetCoach) {
        const arrowGeo = new THREE.ConeGeometry(0.4, 0.9, 16);
        const arrowMat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x06b6d4,
          emissiveIntensity: 2.5,
        });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.x = Math.PI; // point down
        arrow.position.set(xPos, 2.8, -1.5);
        coachGroup.add(arrow);
        arrowMeshes.push(arrow);
      }
    });

    scene.add(coachGroup);

    // Platform Display Board Overhead
    const signGeo = new THREE.BoxGeometry(3.5, 1.2, 0.2);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.8, 2.5);
    scene.add(sign);

    const signPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    signPole.position.set(0, 2.2, 2.5);
    scene.add(signPole);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate arrow bobbing
      arrowMeshes.forEach((arr) => {
        arr.position.y = 2.8 + Math.sin(time * 5) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [platform, userCoach, trainNumber, themeMode]);

  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/80">
      <div ref={mountRef} className="w-full h-full" />

      {/* 3D Platform HUD badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/50 text-xs backdrop-blur-md flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-hud text-amber-300 font-bold">PLATFORM {platform}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-hud text-xs backdrop-blur-md">
          TARGET COACH: {userCoach}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-300 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold">Engine</span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-400">S1</span>
          <span className="text-slate-400">S2</span>
          <span className="text-slate-400">S3</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold">
            {userCoach} (YOUR BERTH)
          </span>
          <span className="text-slate-400">S5</span>
        </div>
        <span className="text-emerald-400 text-[11px] font-mono-rail">Follow Glowing Arrow</span>
      </div>
    </div>
  );
};
