import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Cabinet3DViewer.css';

export default function Cabinet3DViewer() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cabinetRef = useRef(null);
  const [currentStyle, setCurrentStyle] = useState('oak');
  const [isWebXRAvailable, setIsWebXRAvailable] = useState(false);

  // Material definitions (PBR-style)
  const materials = {
    oak: {
      name: 'Oak',
      color: 0xD2A679,
      roughness: 0.4,
      metalness: 0.1,
    },
    white: {
      name: 'White',
      color: 0xF5F5F5,
      roughness: 0.5,
      metalness: 0.05,
    },
    walnut: {
      name: 'Walnut',
      color: 0x5C4A3D,
      roughness: 0.45,
      metalness: 0.08,
    },
    ebony: {
      name: 'Ebony',
      color: 0x1A1A1A,
      roughness: 0.6,
      metalness: 0.02,
    },
  };

  // Create a realistic cabinet geometry
  const createCabinet = () => {
    const group = new THREE.Group();

    const getMaterial = () => new THREE.MeshStandardMaterial({
      color: materials[currentStyle].color,
      roughness: materials[currentStyle].roughness,
      metalness: materials[currentStyle].metalness,
      side: THREE.DoubleSide,
    });

    const cabinetMat = getMaterial();

    // Countertop (marble-style)
    const counterGeom = new THREE.BoxGeometry(1, 0.08, 0.5);
    const counterMat = new THREE.MeshStandardMaterial({
      color: 0xd3d3d3,
      roughness: 0.3,
      metalness: 0.1,
    });
    const counter = new THREE.Mesh(counterGeom, counterMat);
    counter.position.set(0, 0.635, 0);
    counter.castShadow = true;
    counter.receiveShadow = true;
    group.add(counter);

    // Main cabinet body (frame only - no front face)
    const sideThickness = 0.02;
    
    // Left side panel
    const sideGeom = new THREE.BoxGeometry(sideThickness, 0.68, 0.48);
    const leftSide = new THREE.Mesh(sideGeom, cabinetMat);
    leftSide.position.set(-0.49, 0.1, 0);
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    group.add(leftSide);

    // Right side panel
    const rightSide = new THREE.Mesh(sideGeom, cabinetMat);
    rightSide.position.set(0.49, 0.1, 0);
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    group.add(rightSide);

    // Back panel
    const backGeom = new THREE.BoxGeometry(1, 0.68, sideThickness);
    const backPanel = new THREE.Mesh(backGeom, cabinetMat);
    backPanel.position.set(0, 0.1, -0.24);
    backPanel.castShadow = true;
    backPanel.receiveShadow = true;
    group.add(backPanel);

    // Base/kick plate
    const baseGeom = new THREE.BoxGeometry(1, 0.08, 0.48);
    const base = new THREE.Mesh(baseGeom, cabinetMat);
    base.position.set(0, -0.3, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Top drawer
    const drawerFaceGeom = new THREE.BoxGeometry(0.92, 0.15, 0.02);
    const drawer = new THREE.Mesh(drawerFaceGeom, cabinetMat);
    drawer.position.set(0, 0.45, 0.25);
    drawer.castShadow = true;
    drawer.receiveShadow = true;
    group.add(drawer);

    // Drawer handle
    const handleGeom = new THREE.BoxGeometry(0.25, 0.008, 0.01);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.2,
      metalness: 0.9,
    });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(0, 0.45, 0.27);
    handle.castShadow = true;
    handle.receiveShadow = true;
    group.add(handle);

    // Left door with recessed panel
    const leftDoorGeom = new THREE.BoxGeometry(0.45, 0.42, 0.02);
    const leftDoor = new THREE.Mesh(leftDoorGeom, cabinetMat);
    leftDoor.position.set(-0.26, 0.08, 0.25);
    leftDoor.castShadow = true;
    leftDoor.receiveShadow = true;
    group.add(leftDoor);

    // Left door recessed panel
    const recessGeom = new THREE.BoxGeometry(0.35, 0.32, 0.015);
    const recess1 = new THREE.Mesh(recessGeom, cabinetMat);
    recess1.position.set(-0.26, 0.08, 0.255);
    recess1.scale.set(0.95, 0.92, 1);
    recess1.castShadow = true;
    recess1.receiveShadow = true;
    group.add(recess1);

    // Right door with recessed panel
    const rightDoorGeom = new THREE.BoxGeometry(0.45, 0.42, 0.02);
    const rightDoor = new THREE.Mesh(rightDoorGeom, cabinetMat);
    rightDoor.position.set(0.26, 0.08, 0.25);
    rightDoor.castShadow = true;
    rightDoor.receiveShadow = true;
    group.add(rightDoor);

    // Right door recessed panel
    const recess2 = new THREE.Mesh(recessGeom, cabinetMat);
    recess2.position.set(0.26, 0.08, 0.255);
    recess2.scale.set(0.95, 0.92, 1);
    recess2.castShadow = true;
    recess2.receiveShadow = true;
    group.add(recess2);

    // Door handles (knobs)
    const knobGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.008, 16);
    
    // Left door knob
    const knob1 = new THREE.Mesh(knobGeom, handleMat);
    knob1.position.set(-0.32, 0.08, 0.27);
    knob1.castShadow = true;
    knob1.receiveShadow = true;
    group.add(knob1);

    // Right door knob
    const knob2 = new THREE.Mesh(knobGeom, handleMat);
    knob2.position.set(0.32, 0.08, 0.27);
    knob2.castShadow = true;
    knob2.receiveShadow = true;
    group.add(knob2);

    // Cabinet edge trim (subtle beveled edges)
    const trimGeom = new THREE.BoxGeometry(1, 0.008, 0.02);
    const trimMat = new THREE.MeshStandardMaterial({
      color: materials[currentStyle].color,
      roughness: materials[currentStyle].roughness * 0.8,
      metalness: materials[currentStyle].metalness * 1.2,
    });
    
    const topTrim = new THREE.Mesh(trimGeom, trimMat);
    topTrim.position.set(0, 0.595, 0.24);
    topTrim.castShadow = true;
    topTrim.receiveShadow = true;
    group.add(topTrim);

    return group;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      65,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(2.2, 1.5, 1.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(6, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.3);
    pointLight1.position.set(-6, 5, 6);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.2);
    pointLight2.position.set(6, 4, -5);
    scene.add(pointLight2);

    // Ground plane (for shadow)
    const groundGeom = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.85,
      metalness: 0,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.32;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create and add cabinet
    const cabinet = createCabinet();
    scene.add(cabinet);
    cabinetRef.current = cabinet;

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      cabinet.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Check WebXR availability
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsWebXRAvailable(supported);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update cabinet material
  useEffect(() => {
    if (!cabinetRef.current) return;

    const material = new THREE.MeshStandardMaterial({
      color: materials[currentStyle].color,
      roughness: materials[currentStyle].roughness,
      metalness: materials[currentStyle].metalness,
    });

    cabinetRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
  }, [currentStyle]);

  const handleStartAR = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported on this device');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      });
      console.log('AR session started:', session);
      // Full AR implementation would go here
      alert('AR mode activated! (Full implementation requires additional setup)');
    } catch (err) {
      console.error('AR session error:', err);
      alert('AR not available: ' + err.message);
    }
  };

  return (
    <div className="cabinet-viewer-container">
      <div className="viewer-header">
        <h1>Cabinet AR Visualizer</h1>
        <p>Select a finish to preview your cabinet</p>
      </div>

      <div className="viewer-content">
        <div className="canvas-container" ref={containerRef} />

        <div className="controls-panel">
          <div className="material-section">
            <h2>Cabinet Finishes</h2>
            <div className="button-grid">
              {Object.entries(materials).map(([key, value]) => (
                <button
                  key={key}
                  className={`style-button ${currentStyle === key ? 'active' : ''}`}
                  onClick={() => setCurrentStyle(key)}
                  style={{
                    backgroundColor: `#${value.color.toString(16).padStart(6, '0')}`,
                  }}
                >
                  {value.name}
                </button>
              ))}
            </div>
          </div>

          <div className="ar-section">
            <h3>Try AR Experience</h3>
            {isWebXRAvailable ? (
              <button className="ar-button" onClick={handleStartAR}>
                📱 Start AR View
              </button>
            ) : (
              <p className="ar-unavailable">
                AR not available on this device. Try on an iPhone 12+ or compatible Android phone.
              </p>
            )}
          </div>

          <div className="info-section">
            <h3>Current Selection</h3>
            <p className="current-style">
              <strong>Finish:</strong> {materials[currentStyle].name}
            </p>
            <p className="info-text">
              ✓ Professional PBR materials<br />
              ✓ Real-time 3D preview<br />
              ✓ Mobile-optimized<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
