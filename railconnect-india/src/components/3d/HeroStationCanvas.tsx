import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PerformanceMode, ThemeMode } from '../../types';

interface HeroStationCanvasProps {
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
}

export const HeroStationCanvas: React.FC<HeroStationCanvasProps> = ({
  performanceMode,
  themeMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const isDark = themeMode === 'dark';
    scene.background = new THREE.Color(isDark ? 0x030712 : 0x0f172a);
    scene.fog = new THREE.FogExp2(isDark ? 0x030712 : 0x0f172a, 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(12, 5, 20);

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

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1e293b : 0x475569,
      isDark ? 1.5 : 2.5
    );
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0x38bdf8, 8, 80, Math.PI / 4, 0.4);
    mainSpot.position.set(15, 25, 10);
    mainSpot.castShadow = performanceMode === 'high';
    scene.add(mainSpot);

    const platformWarmLight = new THREE.PointLight(0xf59e0b, 3, 30);
    platformWarmLight.position.set(6, 4, 0);
    scene.add(platformWarmLight);

    const cyanAccentLight = new THREE.PointLight(0x06b6d4, 4, 40);
    cyanAccentLight.position.set(-6, 3, 5);
    scene.add(cyanAccentLight);

    // 3. Station Platform
    const platformGeo = new THREE.BoxGeometry(10, 1.2, 80);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(7, 0, 0);
    platform.receiveShadow = true;
    scene.add(platform);

    // Platform tactile / yellow warning strip
    const warningStripGeo = new THREE.BoxGeometry(0.35, 1.22, 80);
    const warningStripMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      roughness: 0.5,
    });
    const warningStrip = new THREE.Mesh(warningStripGeo, warningStripMat);
    warningStrip.position.set(2.15, 0, 0);
    scene.add(warningStrip);

    // 4. Railway Tracks
    const ballastGeo = new THREE.BoxGeometry(5.5, 0.3, 80);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(-1.5, -0.45, 0);
    ballast.receiveShadow = true;
    scene.add(ballast);

    // Sleepers (concrete ties)
    const sleeperGeo = new THREE.BoxGeometry(3.6, 0.2, 0.4);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const sleeperCount = 50;
    const sleepers = new THREE.InstancedMesh(sleeperGeo, sleeperMat, sleeperCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      dummy.position.set(-1.5, -0.3, -38 + i * 1.6);
      dummy.updateMatrix();
      sleepers.setMatrixAt(i, dummy.matrix);
    }
    sleepers.instanceMatrix.needsUpdate = true;
    scene.add(sleepers);

    // Steel Rails (two parallel rails)
    const railGeo = new THREE.BoxGeometry(0.12, 0.3, 80);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(-2.5, -0.1, 0);
    scene.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(-0.5, -0.1, 0);
    scene.add(railRight);

    // Overhead Catenary Poles & Canopy Truss
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 9, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    for (let z = -30; z <= 30; z += 15) {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(11, 4.5, z);
      scene.add(pole);

      // Horizontal beam
      const beamGeo = new THREE.BoxGeometry(14, 0.2, 0.2);
      const beam = new THREE.Mesh(beamGeo, poleMat);
      beam.position.set(4, 8.8, z);
      scene.add(beam);

      // Light lamp suspended from beam
      const lampGeo = new THREE.CylinderGeometry(0.2, 0.4, 0.3, 8);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(5.5, 8.6, z);
      scene.add(lamp);
    }

    // 5. Stylized Futuristic 3D Train Group
    const trainGroup = new THREE.Group();
    trainGroup.position.set(-1.5, 1.1, -10);

    // Locomotive Nose / Engine Body
    const engineBodyGeo = new THREE.BoxGeometry(2.4, 2.3, 14);
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Indian Rail metallic blue
      metalness: 0.8,
      roughness: 0.25,
    });
    const engineBody = new THREE.Mesh(engineBodyGeo, engineMat);
    engineBody.position.set(0, 0, 0);
    engineBody.castShadow = performanceMode === 'high';
    trainGroup.add(engineBody);

    // Aerodynamic Nose wedge
    const noseGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.4, 16, 1, false, 0, Math.PI);
    const nose = new THREE.Mesh(noseGeo, engineMat);
    nose.rotation.z = Math.PI / 2;
    nose.rotation.y = Math.PI / 2;
    nose.position.set(0, -0.2, 7.8);
    trainGroup.add(nose);

    // Glowing Windshield Glass
    const windshieldGeo = new THREE.BoxGeometry(2.1, 0.9, 0.1);
    const windshieldMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0, 0.4, 7.2);
    trainGroup.add(windshield);

    // Headlights (Twin glowing LED projector lights)
    const headlightGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 2.5,
    });
    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.7, -0.4, 8.1);
    trainGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.7, -0.4, 8.1);
    trainGroup.add(rightHeadlight);

    // Headlight Spot beam
    const headSpot = new THREE.SpotLight(0xbae6fd, 8, 45, Math.PI / 6, 0.6);
    headSpot.position.set(0, -0.2, 8.2);
    headSpot.target.position.set(0, -0.5, 30);
    trainGroup.add(headSpot);
    trainGroup.add(headSpot.target);

    // Train Windows (Strip of warm illuminated cabin windows)
    const winGeo = new THREE.BoxGeometry(0.08, 0.7, 1.3);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    for (let w = -5; w <= 5; w += 2.2) {
      const winRight = new THREE.Mesh(winGeo, winMat);
      winRight.position.set(1.21, 0.2, w);
      trainGroup.add(winRight);

      const winLeft = new THREE.Mesh(winGeo, winMat);
      winLeft.position.set(-1.21, 0.2, w);
      trainGroup.add(winLeft);
    }

    // Trailing Coach 1
    const coach1Geo = new THREE.BoxGeometry(2.35, 2.3, 13);
    const coach1 = new THREE.Mesh(coach1Geo, engineMat);
    coach1.position.set(0, 0, -14);
    trainGroup.add(coach1);

    for (let w = -5; w <= 5; w += 2.2) {
      const winRight = new THREE.Mesh(winGeo, winMat);
      winRight.position.set(1.19, 0.2, -14 + w);
      trainGroup.add(winRight);
    }

    scene.add(trainGroup);

    // 6. Railway Signals (Post with Green / Red LED lenses)
    const signalPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const signalPostMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const signalPost = new THREE.Mesh(signalPostGeo, signalPostMat);
    signalPost.position.set(-4, 2.5, 12);
    scene.add(signalPost);

    const signalHeadGeo = new THREE.BoxGeometry(0.5, 1.2, 0.3);
    const signalHeadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const signalHead = new THREE.Mesh(signalHeadGeo, signalHeadMat);
    signalHead.position.set(-4, 4.5, 12);
    scene.add(signalHead);

    const greenLampGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const greenLampMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
    });
    const greenLamp = new THREE.Mesh(greenLampGeo, greenLampMat);
    greenLamp.position.set(-4, 4.2, 12.2);
    scene.add(greenLamp);

    // 7. Atmospheric Floating Sparks / Particles
    const particleCount = performanceMode === 'high' ? 220 : performanceMode === 'balanced' ? 100 : 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = Math.random() * 12;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse listener for smooth parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Parallax camera movement
      camera.position.x = 12 + mouseRef.current.x * 2.5;
      camera.position.y = 5 + mouseRef.current.y * 1.5;
      camera.lookAt(0, 2, 0);

      // Train forward glide & looping track
      trainGroup.position.z += delta * 4.2;
      if (trainGroup.position.z > 25) {
        trainGroup.position.z = -35;
      }

      // Train gentle vibration/sway
      trainGroup.position.y = 1.1 + Math.sin(elapsed * 12) * 0.012;
      trainGroup.rotation.z = Math.sin(elapsed * 6) * 0.005;

      // Particles float
      const posArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArray[i] += delta * 0.4;
        if (posArray[i] > 12) posArray[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Signal light subtle pulse
      greenLampMat.emissiveIntensity = 1.8 + Math.sin(elapsed * 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [performanceMode, themeMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{ touchAction: 'none' }}
    />
  );
};
