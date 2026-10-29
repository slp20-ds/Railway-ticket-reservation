import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrainStation, PerformanceMode, ThemeMode } from '../../types';

interface RouteJourney3DProps {
  stations: TrainStation[];
  trainNumber: string;
  trainName: string;
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
}

export const RouteJourney3D: React.FC<RouteJourney3DProps> = ({
  stations,
  trainNumber,
  trainName,
  performanceMode,
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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: performanceMode === 'high',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Point lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const topLight = new THREE.PointLight(0x38bdf8, 4, 30);
    topLight.position.set(0, 8, 5);
    scene.add(topLight);

    // Generate Route Curve through station coordinates
    const points: THREE.Vector3[] = [];
    const count = stations.length;
    stations.forEach((st, idx) => {
      // Map to a nice curved trajectory in 3D space
      const progress = idx / (count - 1);
      const x = (progress - 0.5) * 20;
      const z = Math.sin(progress * Math.PI) * 4 - 2;
      const y = Math.cos(progress * Math.PI * 2) * 0.5;
      points.push(new THREE.Vector3(x, y, z));
    });

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const routeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(routeMesh);

    // Glowing Station Nodes
    points.forEach((pt, idx) => {
      const station = stations[idx];
      const isPassed = station.isPassed;
      const isCurrent = station.isCurrent;

      const nodeGeo = new THREE.SphereGeometry(isCurrent ? 0.45 : 0.32, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isCurrent ? 0xf59e0b : isPassed ? 0x10b981 : 0x38bdf8,
        emissive: isCurrent ? 0xd97706 : isPassed ? 0x059669 : 0x0284c7,
        emissiveIntensity: isCurrent ? 2.5 : 1.2,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.copy(pt);
      scene.add(node);

      // Station Ring for Current Station
      if (isCurrent) {
        const ringGeo = new THREE.RingGeometry(0.55, 0.75, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pt);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
      }
    });

    // Miniature Futuristic 3D Train traveling along the route
    const trainGroup = new THREE.Group();
    const trainBodyGeo = new THREE.BoxGeometry(1.2, 0.4, 0.4);
    const trainBodyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      metalness: 0.8,
    });
    const trainBody = new THREE.Mesh(trainBodyGeo, trainBodyMat);
    trainGroup.add(trainBody);

    const headlightGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlight = new THREE.Mesh(headlightGeo, headlightMat);
    headlight.position.set(0.65, 0, 0);
    trainGroup.add(headlight);

    scene.add(trainGroup);

    // Ground Grid
    const grid = new THREE.GridHelper(26, 26, 0x0284c7, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Mouse drag for rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0;
    let rotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };
      rotY += dx * 0.005;
      rotX = Math.max(-0.4, Math.min(0.4, rotX + dy * 0.005));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Train moves continuously along Catmull-Rom curve
      const trainProgress = (time * 0.06) % 1;
      const trainPos = curve.getPointAt(trainProgress);
      const trainTangent = curve.getTangentAt(trainProgress);

      trainGroup.position.copy(trainPos);
      trainGroup.lookAt(trainPos.clone().add(trainTangent));

      // Orbit control rotations
      scene.rotation.y = rotY;
      scene.rotation.x = rotX;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stations, performanceMode, themeMode]);

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950/70">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD route overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-xs backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-hud text-cyan-300">
          3D ROUTE TELEMETRY • {trainNumber} {trainName}
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md">
        <div className="flex items-center gap-4 overflow-x-auto py-1">
          {stations.map((st, i) => (
            <div key={st.code} className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full ${
                  st.isCurrent
                    ? 'bg-amber-400 ring-2 ring-amber-400/50'
                    : st.isPassed
                    ? 'bg-emerald-400'
                    : 'bg-cyan-400'
                }`}
              />
              <span className={st.isCurrent ? 'font-bold text-amber-300' : ''}>
                {st.name} ({st.time})
              </span>
              {i < stations.length - 1 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>
        <span className="hidden md:inline text-slate-500 text-[10px]">Drag to rotate</span>
      </div>
    </div>
  );
};
