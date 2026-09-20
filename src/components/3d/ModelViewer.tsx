"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface ModelViewerProps {
  fileUrl?: string | null;
  fileBuffer?: ArrayBuffer | null;
  defaultColor?: string;
  dimensions?: { x: number; y: number; z: number };
  title?: string;
}

export default function ModelViewer({
  fileUrl,
  fileBuffer,
  defaultColor = "#E50914",
  dimensions = { x: 120, y: 120, z: 140 },
  title = "3D Interactive Print Preview",
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [activeColor, setActiveColor] = useState(defaultColor);
  const [isRotating, setIsRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({
    triangles: 24580,
    volumeCm3: Math.round((dimensions.x * dimensions.y * dimensions.z * 0.00035) * 10) / 10,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const colors = [
    { name: "Crimson Red", hex: "#E50914" },
    { name: "Stealth Black", hex: "#18181B" },
    { name: "Cyber Silver", hex: "#CBD5E1" },
    { name: "Bone White", hex: "#F8FAFC" },
    { name: "Electric Blue", hex: "#2563EB" },
  ];

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 70, 160);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(50, 100, 70);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const redRimLight = new THREE.DirectionalLight(0xe50914, 2.0);
    redRimLight.position.set(-60, 40, -50);
    scene.add(redRimLight);

    // 5. 3D Print Build Plate Grid
    const gridHelper = new THREE.GridHelper(160, 16, 0xe50914, 0x27272a);
    gridHelper.position.y = -30;
    scene.add(gridHelper);

    // 6. Geometry: Futuristic Mechanical Polyhedron or 3D Object
    const geometry = new THREE.DodecahedronGeometry(35, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeColor),
      roughness: 0.35,
      metalness: 0.4,
      wireframe: wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 10;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Mouse drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current && isRotating && !isDragging) {
        meshRef.current.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [activeColor, wireframe, isRotating]);

  const handleColorChange = (hex: string) => {
    setActiveColor(hex);
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(hex);
    }
  };

  const handleReset = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "w-full h-[400px]"}`}>
      {/* Viewer Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-white">
          <Box className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold">{title}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded-lg text-xs backdrop-blur-md border transition-all ${
              wireframe
                ? "bg-red-600 text-white border-red-500"
                : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:text-white"
            }`}
            title="Toggle Wireframe Layer Lines"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg text-xs backdrop-blur-md border transition-all ${
              isRotating
                ? "bg-zinc-800 text-red-400 border-zinc-700"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
            }`}
            title="Auto Rotate"
          >
            <RefreshCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-xs bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:text-white backdrop-blur-md"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filament Color Swatches */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-zinc-900/85 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-1.5">Color:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => handleColorChange(c.hex)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                activeColor === c.hex ? "scale-110 border-white" : "border-zinc-700 hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* CAD Specs HUD */}
        <div className="pointer-events-auto flex items-center gap-3 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300">
          <span>
            Dim: <strong className="text-white">{dimensions.x}×{dimensions.y}×{dimensions.z}mm</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span>
            Vol: <strong className="text-red-400">{stats.volumeCm3} cm³</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
