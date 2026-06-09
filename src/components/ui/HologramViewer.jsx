import React, { useEffect, useRef, useState } from 'react';
import { Upload, RotateCw, Box, Layers, Play } from 'lucide-react';
import { useToast } from '../../lib/toast';
import styles from './HologramViewer.module.css';

const loadedScripts = new Map();

const loadScript = (src) => {
  // Return existing promise if script is currently loading or loaded
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src);
  }

  // Double-checks for globally available objects to avoid re-fetching
  if (src.includes('three.min.js') && window.THREE) {
    return Promise.resolve();
  }
  if (src.includes('OrbitControls.js') && window.THREE && window.THREE.OrbitControls) {
    return Promise.resolve();
  }
  if (src.includes('OBJLoader.js') && window.THREE && window.THREE.OBJLoader) {
    return Promise.resolve();
  }
  if (src.includes('fflate') && window.fflate) {
    return Promise.resolve();
  }
  if (src.includes('FBXLoader.js') && window.THREE && window.THREE.FBXLoader) {
    return Promise.resolve();
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
};

export function HologramViewer({ title = 'MODEL PREVIEW' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [fileName, setFileName] = useState('');

  // Three.js instances refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const currentModelRef = useRef(null);
  const placeholderMeshRef = useRef(null);
  const laserRef = useRef(null);

  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        // Load Three.js sequentially
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        // Once Three.js is loaded, load loaders and controls
        await Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'),
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js'),
          loadScript('https://unpkg.com/fflate@0.8.2/umd/index.js'),
        ]);
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js');

        if (!active) return;
        setLoading(false);

        // Setup Scene
        const THREE = window.THREE;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);
        sceneRef.current = scene;

        // Setup Camera
        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          100
        );
        camera.position.set(0, 3, 7);
        cameraRef.current = camera;

        // Setup Renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Setup Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 15;
        controls.minDistance = 2;
        controlsRef.current = controls;

        // Grid & Coordinate helpers (cyberpunk HUD feel)
        const gridHelper = new THREE.GridHelper(10, 20, 0x7c3aed, 0x2563eb);
        gridHelper.position.y = -1;
        // Make grid lines look like sci-fi laser paths
        gridHelper.material.opacity = 0.25;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        const gridHelperSub = new THREE.GridHelper(10, 40, 0x06b6d4, 0x2563eb);
        gridHelperSub.position.y = -1.01;
        gridHelperSub.material.opacity = 0.1;
        gridHelperSub.material.transparent = true;
        scene.add(gridHelperSub);

        // Ambient glow light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        // Pulsing colored spotlight
        const dirLight1 = new THREE.DirectionalLight(0x7c3aed, 0.8);
        dirLight1.position.set(5, 10, 7);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.6);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        // Dynamic sweeping scanning laser line (plane)
        const laserGeometry = new THREE.CylinderGeometry(4.5, 4.5, 0.02, 32, 1, true);
        const laserMaterial = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.y = 0;
        scene.add(laser);
        laserRef.current = laser;

        // Create Placeholder Mesh (Torus Knot)
        createPlaceholder();

        // Resize handler with ResizeObserver for modal integration
        const handleResize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        };

        const resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', handleResize);

        // Trigger immediate resize check
        handleResize();

        // Animation Loop
        let frameId;
        let laserDir = 1;
        const clock = new THREE.Clock();

        const animate = () => {
          frameId = requestAnimationFrame(animate);

          // Update controls
          controls.update();

          const elapsed = clock.getElapsedTime();

          // Auto-rotation
          if (isRotatingRef.current && currentModelRef.current) {
            currentModelRef.current.rotation.y = elapsed * 0.15;
          } else if (isRotatingRef.current && placeholderMeshRef.current) {
            placeholderMeshRef.current.rotation.y = elapsed * 0.25;
            placeholderMeshRef.current.rotation.x = elapsed * 0.1;
          }

          // Laser sweeping action
          if (laser) {
            laser.position.y += 0.012 * laserDir;
            laser.rotation.y = elapsed * 0.5;
            if (laser.position.y > 2.5) laserDir = -1;
            if (laser.position.y < -1) laserDir = 1;
          }

          renderer.render(scene, camera);
        };
        animate();

        return () => {
          active = false;
          resizeObserver.disconnect();
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(frameId);
          if (rendererRef.current) {
            rendererRef.current.dispose();
          }
        };
      } catch (err) {
        console.error(err);
        setError('Could not load 3D visualizer.');
      }
    };

    init();
  }, []);

  // Update wireframe property on current model/placeholder
  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE) return;

    const toggleWireframe = (obj, wire) => {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material.wireframe = wire;
          child.material.needsUpdate = true;
        }
      });
    };

    if (placeholderMeshRef.current) {
      placeholderMeshRef.current.material.wireframe = isWireframe;
      placeholderMeshRef.current.material.needsUpdate = true;
    }
    if (currentModelRef.current) {
      toggleWireframe(currentModelRef.current, isWireframe);
    }
  }, [isWireframe, modelLoaded]);

  const createPlaceholder = () => {
    const THREE = window.THREE;
    if (!THREE || !sceneRef.current) return;

    // Remove old placeholder if exists
    if (placeholderMeshRef.current) {
      sceneRef.current.remove(placeholderMeshRef.current);
    }

    const placeholderGeom = new THREE.TorusKnotGeometry(1, 0.35, 120, 16);
    const placeholderMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      wireframe: isWireframe,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const placeholderMesh = new THREE.Mesh(placeholderGeom, placeholderMat);
    sceneRef.current.add(placeholderMesh);
    placeholderMeshRef.current = placeholderMesh;
  };

  const handleFileUpload = (e) => {
    const THREE = window.THREE;
    if (!THREE || !sceneRef.current) return;

    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'obj' && extension !== 'fbx') {
      addToast?.('Unsupported format. Please upload .obj or .fbx.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    const applyHologramMaterial = (model) => {
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x00ffcc,
            wireframe: isWireframe,
            roughness: 0.2,
            metalness: 0.9,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide,
          });
        }
      });
    };

    const centerAndScaleModel = (model) => {
      // Remove placeholder mesh
      if (placeholderMeshRef.current) {
        sceneRef.current.remove(placeholderMeshRef.current);
        placeholderMeshRef.current = null;
      }

      // Remove old model if loaded
      if (currentModelRef.current) {
        sceneRef.current.remove(currentModelRef.current);
      }

      // Center and scale model to fit view
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center); // Center it

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim; // Fit within 2.5 units
      model.scale.set(scale, scale, scale);
      model.position.y += 0.2; // Adjust height slightly

      sceneRef.current.add(model);
      currentModelRef.current = model;
      setModelLoaded(true);
      addToast?.('3D Model loaded successfully.', 'success');
    };

    if (extension === 'obj') {
      reader.onload = (event) => {
        const contents = event.target.result;
        try {
          const loader = new THREE.OBJLoader();
          const obj = loader.parse(contents);
          applyHologramMaterial(obj);
          centerAndScaleModel(obj);
        } catch (err) {
          console.error(err);
          addToast?.('Failed to parse OBJ file.', 'error');
        }
      };
      reader.readAsText(file);
    } else if (extension === 'fbx') {
      reader.onload = (event) => {
        const contents = event.target.result;
        try {
          const loader = new THREE.FBXLoader();
          const fbx = loader.parse(contents);
          applyHologramMaterial(fbx);
          centerAndScaleModel(fbx);
        } catch (err) {
          const errMsg = err?.message || '';
          if (errMsg.includes('FBX version not supported')) {
            console.warn('HologramViewer: Uploaded FBX model uses an outdated version (v6100 or older).');
            addToast?.('FBX version not supported. Please use FBX 2014 or newer (v7.0+).', 'error');
          } else {
            console.error(err);
            addToast?.('Failed to parse FBX file.', 'error');
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleResetModel = () => {
    const THREE = window.THREE;
    if (!THREE || !sceneRef.current) return;

    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
      currentModelRef.current = null;
    }
    createPlaceholder();
    setModelLoaded(false);
    setFileName('');
  };

  return (
    <div className={styles.viewportContainer} ref={containerRef}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.scannerLine} />
          <span className={styles.loadingText}>BOOTING NEURAL GRAPHICS UNIT…</span>
        </div>
      )}
      {error && <div className={styles.errorOverlay}>{error}</div>}

      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ LINK ACTIVE ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>GRID: ACTIVE (7C3AED)</div>
          <div>FILE: {fileName || 'HOLOGRAM_PLACEHOLDER.SYS'}</div>
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.hudFooter}>
        <button
          className={`${styles.hudBtn} ${isRotating ? styles.hudBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsRotating(!isRotating);
          }}
          title="Toggle Auto-Rotation"
        >
          <RotateCw size={12} />
          <span>ROTATE</span>
        </button>
        <button
          className={`${styles.hudBtn} ${isWireframe ? styles.hudBtnActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsWireframe(!isWireframe);
          }}
          title="Toggle Wireframe Rendering"
        >
          <Box size={12} />
          <span>WIREFRAME</span>
        </button>
        {modelLoaded ? (
          <button
            className={`${styles.hudBtn} ${styles.resetBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleResetModel();
            }}
            title="Reset Model"
          >
            <Layers size={12} />
            <span>RESET</span>
          </button>
        ) : (
          <button
            className={styles.hudBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerUpload();
            }}
            title="Upload Local OBJ or FBX file"
          >
            <Upload size={12} />
            <span>UPLOAD .OBJ / .FBX</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".obj,.fbx"
        style={{ display: 'none' }}
      />
    </div>
  );
}
