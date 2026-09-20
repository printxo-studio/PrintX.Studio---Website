"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import {
  RotateCcw,
  Box,
  Layers,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

interface ModelViewerProps {
  file?: File | null;
  fileUrl?: string | null;
  fileBuffer?: ArrayBuffer | null;
  defaultColor?: string;
  dimensions?: { x: number; y: number; z: number };
  title?: string;
  onModelLoaded?: (specs: { x: number; y: number; z: number; volumeCm3: number; triangles: number }) => void;
}

export default function ModelViewer({
  file,
  fileUrl,
  fileBuffer,
  defaultColor = "#E50914",
  dimensions: propDimensions = { x: 120, y: 120, z: 140 },
  title = "3D Interactive Simulation",
  onModelLoaded,
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [activeColor, setActiveColor] = useState(defaultColor);
  const [isRotating, setIsRotating] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelSpecs, setModelSpecs] = useState({
    x: propDimensions.x,
    y: propDimensions.y,
    z: propDimensions.z,
    triangles: 24580,
    volumeCm3: 185.4,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const colors = [
    { name: "Crimson Red", hex: "#E50914" },
    { name: "Stealth Black", hex: "#18181B" },
    { name: "Cyber Silver", hex: "#CBD5E1" },
    { name: "Bone White", hex: "#F8FAFC" },
    { name: "Electric Blue", hex: "#2563EB" },
  ];

  // Helper to load geometry into scene
  const setupGeometry = (
    geometry: THREE.BufferGeometry,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) => {
    // Remove previous mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    geometry.computeVertexNormals();
    geometry.center();
    geometry.computeBoundingBox();

    const box = geometry.boundingBox || new THREE.Box3();
    const size = new THREE.Vector3();
    box.getSize(size);

    const dimX = Math.round(size.x) || 120;
    const dimY = Math.round(size.y) || 120;
    const dimZ = Math.round(size.z) || 140;
    const triangleCount = geometry.attributes.position ? Math.round(geometry.attributes.position.count / 3) : 24000;
    const estVol = Math.round(((dimX * dimY * dimZ) / 1000) * 0.38 * 10) / 10;

    const specs = {
      x: dimX,
      y: dimY,
      z: dimZ,
      triangles: triangleCount,
      volumeCm3: estVol,
    };
    setModelSpecs(specs);
    if (onModelLoaded) onModelLoaded(specs);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(activeColor),
      roughness: 0.3,
      metalness: 0.35,
      wireframe: wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Position build plate right at bottom edge of model
    if (gridRef.current) {
      gridRef.current.position.y = -size.y / 2;
    }

    // Fit camera nicely
    const maxDim = Math.max(size.x, size.y, size.z, 50);
    camera.position.set(maxDim * 0.9, maxDim * 0.7, maxDim * 1.5);
    camera.lookAt(0, 0, 0);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);

    // 2. Camera: centered view
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.set(45, 35, 90);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(80, 120, 80);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xe50914, 1.8);
    rimLight.position.set(-80, 40, -60);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(0, -60, 40);
    scene.add(fillLight);

    // 5. 3D Print Build Plate Grid
    const gridHelper = new THREE.GridHelper(160, 16, 0xe50914, 0x27272a);
    gridHelper.position.y = -22;
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // 6. Load file if provided, otherwise sleek default mechanical demo part
    if (file && file.name.toLowerCase().endsWith(".stl")) {
      setIsLoadingModel(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const loader = new STLLoader();
          const geometry = loader.parse(buffer);
          setupGeometry(geometry, scene, camera);
        } catch (err) {
          console.error("Failed to parse STL file:", err);
        } finally {
          setIsLoadingModel(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileBuffer) {
      try {
        const loader = new STLLoader();
        const geometry = loader.parse(fileBuffer);
        setupGeometry(geometry, scene, camera);
      } catch (err) {
        console.error("Failed to parse buffer:", err);
      }
    } else {
      // Default: Centered precision mechanical bracket shape
      const defaultGeometry = new THREE.TorusKnotGeometry(18, 5.5, 96, 24);
      setupGeometry(defaultGeometry, scene, camera);
    }

    // 7. Mouse drag interaction
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

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const zoomFactor = e.deltaY * 0.05;
      cam.position.z = Math.max(20, Math.min(cam.position.z + zoomFactor, 300));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    domElement.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current && isRotating && !isDragging) {
        meshRef.current.rotation.y += 0.007;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
    };
  }, [file, fileBuffer]);

  // Update material properties dynamically without re-mounting
  useEffect(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(activeColor);
      mat.wireframe = wireframe;
    }
  }, [activeColor, wireframe]);

  const handleReset = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      const maxDim = Math.max(modelSpecs.x, modelSpecs.y, modelSpecs.z, 50);
      cameraRef.current.position.set(maxDim * 0.9, maxDim * 0.7, maxDim * 1.5);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(20, Math.min(cameraRef.current.position.z + delta, 300));
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col w-full h-[380px] shadow-2xl">
      {/* Viewer Overlay Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-white">
          <Box className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold truncate max-w-[200px]">{title}</span>
          {isLoadingModel && (
            <span className="text-[10px] text-red-400 font-normal animate-pulse">• Slicing STL...</span>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => handleZoom(-15)}
            className="p-1.5 rounded-lg text-xs bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:text-white backdrop-blur-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(15)}
            className="p-1.5 rounded-lg text-xs bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:text-white backdrop-blur-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded-lg text-xs backdrop-blur-md border transition-all ${
              wireframe
                ? "bg-red-600 text-white border-red-500"
                : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:text-white"
            }`}
            title="Toggle Wireframe Layer View"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg text-xs backdrop-blur-md border transition-all ${
              isRotating
                ? "bg-zinc-800 text-red-400 border-zinc-700"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
            }`}
            title="Toggle Auto Rotation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-xs bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:text-white backdrop-blur-md"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing min-h-[280px]" />

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filament Color Swatches */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-400 px-1.5">Color:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setActiveColor(c.hex)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                activeColor === c.hex ? "scale-110 border-white ring-2 ring-red-500/40" : "border-zinc-700 hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* CAD Specs HUD */}
        <div className="pointer-events-auto flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300">
          <span>
            Dim: <strong className="text-white">{modelSpecs.x}×{modelSpecs.y}×{modelSpecs.z}mm</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span>
            Vol: <strong className="text-red-400">{modelSpecs.volumeCm3} cm³</strong>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">
            {modelSpecs.triangles.toLocaleString()} polys
          </span>
        </div>
      </div>
    </div>
  );
}
