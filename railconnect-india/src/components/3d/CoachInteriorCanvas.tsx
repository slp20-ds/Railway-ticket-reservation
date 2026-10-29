import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Seat, PerformanceMode, ThemeMode } from '../../types';

interface CoachInteriorCanvasProps {
  coachName: string;
  seats: Seat[];
  selectedSeat: Seat | null;
  onSeatSelect: (seat: Seat) => void;
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
}

export const CoachInteriorCanvas: React.FC<CoachInteriorCanvasProps> = ({
  coachName,
  seats,
  selectedSeat,
  onSeatSelect,
  performanceMode,
  themeMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  
  // Camera animation target refs
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.4, 0));
  const cameraPosRef = useRef(new THREE.Vector3(0, 2.2, 5.5));
  const defaultPos = new THREE.Vector3(0, 2.2, 5.5);
  const defaultTarget = new THREE.Vector3(0, 1.4, 0);

  // Store seat meshes map for raycasting & glow highlighting
  const seatMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; seat: Seat }>>(new Map());

  // Mouse drag / Orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 5.5, theta: 0, phi: Math.PI / 2.8 });

  // Reset View function
  const handleResetView = () => {
    sphericalRef.current = { radius: 5.5, theta: 0, phi: Math.PI / 2.8 };
    cameraTargetRef.current.copy(defaultTarget);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const isDark = themeMode === 'dark';
    scene.background = new THREE.Color(isDark ? 0x050b14 : 0x0f172a);
    scene.fog = new THREE.FogExp2(isDark ? 0x050b14 : 0x0f172a, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.copy(defaultPos);

    const renderer = new THREE.WebGLRenderer({
      antialias: performanceMode === 'high',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceMode === 'performance' ? 1 : 2));
    if (performanceMode === 'high') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    container.appendChild(renderer.domElement);

    // 2. Interior Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.6 : 2.2);
    scene.add(ambientLight);

    // Warm ceiling lights along coach length
    for (let x = -8; x <= 8; x += 4) {
      const ceilingLight = new THREE.PointLight(0xbae6fd, 2.5, 6.5);
      ceilingLight.position.set(x, 2.8, 0);
      scene.add(ceilingLight);
    }

    // 3. Coach Shell Structure
    const coachLength = 24;
    const coachWidth = 3.6;
    const coachHeight = 3.1;

    // Floor (Aisle with anti-slip rubber texture color)
    const floorGeo = new THREE.BoxGeometry(coachLength, 0.2, coachWidth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -0.1, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Aisle strip guide line
    const aisleStripGeo = new THREE.BoxGeometry(coachLength, 0.21, 0.4);
    const aisleStripMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.5,
      metalness: 0.3,
    });
    const aisleStrip = new THREE.Mesh(aisleStripGeo, aisleStripMat);
    aisleStrip.position.set(0, -0.09, 0);
    scene.add(aisleStrip);

    // Ceiling & Roof curvature
    const ceilingGeo = new THREE.BoxGeometry(coachLength, 0.15, coachWidth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, coachHeight, 0);
    scene.add(ceiling);

    // Ceiling Fans / AC Vents
    for (let x = -7; x <= 7; x += 3.5) {
      const fanBaseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
      const fanBaseMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const fanBase = new THREE.Mesh(fanBaseGeo, fanBaseMat);
      fanBase.position.set(x, coachHeight - 0.1, 0);
      scene.add(fanBase);
    }

    // Outer Coach Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
    });

    // Left wall (Behind Cabin Berths)
    const wallLeftGeo = new THREE.BoxGeometry(coachLength, coachHeight, 0.15);
    const wallLeft = new THREE.Mesh(wallLeftGeo, wallMat);
    wallLeft.position.set(0, coachHeight / 2, coachWidth / 2);
    scene.add(wallLeft);

    // Right wall (Behind Side Berths)
    const wallRightGeo = new THREE.BoxGeometry(coachLength, coachHeight, 0.15);
    const wallRight = new THREE.Mesh(wallRightGeo, wallMat);
    wallRight.position.set(0, coachHeight / 2, -coachWidth / 2);
    scene.add(wallRight);

    // Windows with subtle exterior twilight / passing ambient glow
    const windowGeo = new THREE.BoxGeometry(1.6, 0.9, 0.18);
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45,
      roughness: 0.1,
    });
    for (let x = -8; x <= 8; x += 2.8) {
      // Main cabin windows
      const winL = new THREE.Mesh(windowGeo, windowMat);
      winL.position.set(x, 1.4, coachWidth / 2 - 0.05);
      scene.add(winL);

      // Side berth windows
      const winR = new THREE.Mesh(windowGeo, windowMat);
      winR.position.set(x, 1.4, -coachWidth / 2 + 0.05);
      scene.add(winR);
    }

    // Partition walls separating bays
    const partitionGeo = new THREE.BoxGeometry(0.1, coachHeight, 1.3);
    const partitionMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.8,
    });
    for (let x = -9.6; x <= 9.6; x += 2.4) {
      const part = new THREE.Mesh(partitionGeo, partitionMat);
      part.position.set(x, coachHeight / 2, 1.1);
      scene.add(part);
    }

    // 4. Generate 3D Interactive Berth Meshes
    seatMeshesRef.current.clear();
    const seatGroup = new THREE.Group();

    // Standard berth sizes
    const cabinBerthGeo = new THREE.BoxGeometry(1.9, 0.18, 0.72);
    const sideBerthGeo = new THREE.BoxGeometry(1.9, 0.18, 0.62);

    seats.forEach((seat) => {
      const isSide = seat.berth === 'Side Lower' || seat.berth === 'Side Upper';
      const geo = isSide ? sideBerthGeo : cabinBerthGeo;

      // Color coding per seat status
      let baseColor = 0x10b981; // available (emerald)
      let emissiveColor = 0x059669;
      let emissiveIntensity = 0.2;

      if (seat.status === 'occupied') {
        baseColor = 0x475569; // occupied (muted slate/gray)
        emissiveColor = 0x1e293b;
        emissiveIntensity = 0.05;
      } else if (seat.status === 'prebooked') {
        baseColor = 0x3b82f6; // pre-booked (blue)
        emissiveColor = 0x1d4ed8;
        emissiveIntensity = 0.4;
      } else if (seat.status === 'rac') {
        baseColor = 0xa855f7; // rac (purple)
        emissiveColor = 0x7e22ce;
        emissiveIntensity = 0.35;
      } else if (seat.status === 'selected') {
        baseColor = 0x06b6d4; // selected (cyan glowing)
        emissiveColor = 0x22d3ee;
        emissiveIntensity = 0.85;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity,
        roughness: 0.45,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(seat.position.x, seat.position.y, seat.position.z);
      mesh.castShadow = performanceMode === 'high';
      mesh.receiveShadow = true;
      mesh.userData = { seatId: seat.id, seatNumber: seat.number };

      // Berth support chains / brackets for Upper and Middle berths
      if (seat.berth === 'Upper' || seat.berth === 'Middle') {
        const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6);
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const chain1 = new THREE.Mesh(chainGeo, chainMat);
        chain1.position.set(seat.position.x - 0.85, seat.position.y + 0.4, seat.position.z);
        scene.add(chain1);

        const chain2 = new THREE.Mesh(chainGeo, chainMat);
        chain2.position.set(seat.position.x + 0.85, seat.position.y + 0.4, seat.position.z);
        scene.add(chain2);
      }

      // Pillow / Headrest detail
      const pillowGeo = new THREE.BoxGeometry(0.35, 0.12, isSide ? 0.45 : 0.55);
      const pillowMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.9,
      });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(seat.position.x - 0.72, seat.position.y + 0.12, seat.position.z);
      scene.add(pillow);

      seatGroup.add(mesh);
      seatMeshesRef.current.set(seat.id, { mesh, seat });
    });

    scene.add(seatGroup);

    // 5. Raycasting for Mouse Hover & Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedSeatMesh = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);

      const meshes = Array.from(seatMeshesRef.current.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const entry = Array.from(seatMeshesRef.current.values()).find((v) => v.mesh === hit);
        return entry ? entry.seat : null;
      }
      return null;
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        // Orbit drag calculation
        const deltaX = e.clientX - prevMouseRef.current.x;
        const deltaY = e.clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };

        sphericalRef.current.theta -= deltaX * 0.006;
        sphericalRef.current.phi = Math.max(
          0.3,
          Math.min(Math.PI / 2 + 0.2, sphericalRef.current.phi - deltaY * 0.006)
        );
        return;
      }

      // Raycast hover
      const hovered = getIntersectedSeatMesh(e.clientX, e.clientY);
      setHoveredSeat(hovered);
      if (hovered) {
        const rect = container.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        setTooltipPos(null);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const wasDraggingFar =
        Math.hypot(e.clientX - prevMouseRef.current.x, e.clientY - prevMouseRef.current.y) > 5;
      isDraggingRef.current = false;

      if (!wasDraggingFar) {
        const clickedSeat = getIntersectedSeatMesh(e.clientX, e.clientY);
        if (clickedSeat) {
          onSeatSelect(clickedSeat);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(
        2.5,
        Math.min(10, sphericalRef.current.radius + e.deltaY * 0.005)
      );
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Touch support for Mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseRef.current.x;
        const deltaY = e.touches[0].clientY - prevMouseRef.current.y;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        sphericalRef.current.theta -= deltaX * 0.008;
        sphericalRef.current.phi = Math.max(
          0.3,
          Math.min(Math.PI / 2 + 0.2, sphericalRef.current.phi - deltaY * 0.008)
        );
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isDraggingRef.current = false;
      if (e.changedTouches.length === 1) {
        const clickedSeat = getIntersectedSeatMesh(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
        if (clickedSeat) {
          onSeatSelect(clickedSeat);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 6. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Convert spherical coordinates to 3D camera position relative to target
      const target = cameraTargetRef.current;
      const r = sphericalRef.current.radius;
      const phi = sphericalRef.current.phi;
      const theta = sphericalRef.current.theta;

      const destX = target.x + r * Math.sin(phi) * Math.sin(theta);
      const destY = target.y + r * Math.cos(phi);
      const destZ = target.z + r * Math.sin(phi) * Math.cos(theta);

      camera.position.lerp(new THREE.Vector3(destX, destY, destZ), 0.1);
      camera.lookAt(target);

      // Animate highlighted / selected seat with subtle breathing glow & lift
      seatMeshesRef.current.forEach(({ mesh, seat }) => {
        if (seat.status === 'selected' || (selectedSeat && selectedSeat.id === seat.id)) {
          mesh.position.y = seat.position.y + 0.04 + Math.sin(elapsed * 4) * 0.02;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.7 + Math.sin(elapsed * 5) * 0.3;
        } else if (hoveredSeat && hoveredSeat.id === seat.id) {
          mesh.position.y = seat.position.y + 0.03;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.55;
        } else {
          mesh.position.y = seat.position.y;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (seat.status === 'prebooked') {
            mat.emissiveIntensity = 0.35 + Math.sin(elapsed * 2) * 0.15;
          } else if (seat.status === 'available') {
            mat.emissiveIntensity = 0.2;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [coachName, seats, selectedSeat, performanceMode, themeMode]);

  // When selected seat changes, smoothly glide target near that seat
  useEffect(() => {
    if (selectedSeat) {
      cameraTargetRef.current.set(selectedSeat.position.x, 1.4, selectedSeat.position.z);
    }
  }, [selectedSeat]);

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-2xl overflow-hidden border border-cyan-500/25 bg-slate-950/80 shadow-2xl">
      {/* Three.js Canvas container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Coach Identification */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-hud text-sm flex items-center gap-2 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>3D VIRTUAL COACH: {coachName}</span>
        </div>
        <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs backdrop-blur-md">
          <span>72 Sleeper/3AC Berths</span>
        </div>
      </div>

      {/* Camera Controls & Reset button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleResetView}
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-hud transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          title="Reset Camera View"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          RESET VIEW
        </button>
      </div>

      {/* Interactive Legend Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-sm shadow-cyan-400/80" />
            <span className="text-cyan-300 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span className="text-blue-300">Pre-booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-500" />
            <span className="text-purple-300">RAC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-600" />
            <span className="text-slate-400">Occupied</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <span>Drag to orbit • Scroll to zoom • Click berth to select</span>
        </div>
      </div>

      {/* Dynamic 3D Cursor Hover Tooltip */}
      {hoveredSeat && tooltipPos && (
        <div
          className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/60 shadow-xl backdrop-blur-md text-xs -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-hud font-bold text-cyan-300 text-sm">
              {hoveredSeat.coach} / {hoveredSeat.number}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                hoveredSeat.status === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : hoveredSeat.status === 'prebooked'
                  ? 'bg-blue-500/20 text-blue-300'
                  : hoveredSeat.status === 'rac'
                  ? 'bg-purple-500/20 text-purple-300'
                  : hoveredSeat.status === 'selected'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {hoveredSeat.status}
            </span>
          </div>
          <div className="text-slate-300 text-[11px] flex justify-between gap-4">
            <span>{hoveredSeat.berth} Berth</span>
            <span className="text-emerald-400 font-mono-rail font-bold">₹{hoveredSeat.fare}</span>
          </div>
          {hoveredSeat.status === 'prebooked' && (
            <div className="text-[10px] text-blue-300 mt-1 border-t border-slate-800 pt-1">
              ⏳ Smart Pre-Booked (24h timer active)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
