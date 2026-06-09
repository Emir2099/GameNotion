import React, { useEffect, useRef, useState } from 'react';
import { Upload, RotateCw, Box, Layers, Play, Pause, ZoomIn, ZoomOut, Volume2, Plus, Trash } from 'lucide-react';
import { useToast } from '../../lib/toast';
import styles from './HologramViewer.module.css';

// ─── Base64 Serialization Helpers ───────────────────────────────────────────
const base64ToArrayBuffer = (base64) => {
  const base64Content = base64.split(',')[1] || base64;
  const binaryString = window.atob(base64Content);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const base64ToText = (base64) => {
  const base64Content = base64.split(',')[1] || base64;
  return decodeURIComponent(escape(window.atob(base64Content)));
};

// ─── Loaded Scripts Tracker (Race Condition Shield) ──────────────────────────
const loadedScripts = new Map();
const loadScript = (src) => {
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src);
  }

  // Fast resolution if objects are already defined globally
  if (src.includes('three.min.js') && window.THREE) return Promise.resolve();
  if (src.includes('OrbitControls.js') && window.THREE?.OrbitControls) return Promise.resolve();
  if (src.includes('OBJLoader.js') && window.THREE?.OBJLoader) return Promise.resolve();
  if (src.includes('fflate') && window.fflate) return Promise.resolve();
  if (src.includes('FBXLoader.js') && window.THREE?.FBXLoader) return Promise.resolve();

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

// ─── Main Unified Component ──────────────────────────────────────────────────
export function HologramViewer({
  type = 'mesh',
  title = 'MODEL PREVIEW',
  savedData = '',
  savedFileName = '',
  onSaveData = null
}) {
  switch (type) {
    case 'mesh':
      return <MeshVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    case 'texture':
      return <TextureVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    case 'audio':
      return <AudioVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    case 'blueprint':
      return <BlueprintVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    case 'animation':
      return <AnimationVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    case 'vfx':
      return <VFXVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
    default:
      return <MeshVisualizer title={title} savedData={savedData} savedFileName={savedFileName} onSaveData={onSaveData} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MESH VISUALIZER (3D OBJ & FBX Hologram)
// ─────────────────────────────────────────────────────────────────────────────
function MeshVisualizer({ title, savedData, savedFileName, onSaveData }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [fileName, setFileName] = useState(savedFileName || '');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const currentModelRef = useRef(null);
  const placeholderMeshRef = useRef(null);

  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  // Handle wireframe changes on active model
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

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'),
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js'),
          loadScript('https://unpkg.com/fflate@0.8.2/umd/index.js'),
        ]);
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js');

        if (!active) return;
        setLoading(false);

        const THREE = window.THREE;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          100
        );
        camera.position.set(0, 3, 7);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 15;
        controls.minDistance = 2;
        controlsRef.current = controls;

        // Visual Coordinates grid (Hologram theme)
        const grid = new THREE.GridHelper(10, 20, 0x7c3aed, 0x2563eb);
        grid.position.y = -1;
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        const light1 = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x00f0ff, 0.8);
        light2.position.set(5, 10, 5);
        scene.add(light2);

        const light3 = new THREE.DirectionalLight(0x7c3aed, 0.5);
        light3.position.set(-5, -5, -5);
        scene.add(light3);

        // Sweeping scanner laser ring
        const laserGeom = new THREE.CylinderGeometry(4.5, 4.5, 0.02, 32, 1, true);
        const laserMat = new THREE.MeshBasicMaterial({
          color: 0x00ffcc,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const laser = new THREE.Mesh(laserGeom, laserMat);
        scene.add(laser);

        const createPlaceholder = () => {
          if (placeholderMeshRef.current) scene.remove(placeholderMeshRef.current);
          const geom = new THREE.TorusKnotGeometry(1, 0.35, 100, 16);
          const mat = new THREE.MeshStandardMaterial({
            color: 0x7c3aed,
            wireframe: isWireframe,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8,
          });
          const mesh = new THREE.Mesh(geom, mat);
          scene.add(mesh);
          placeholderMeshRef.current = mesh;
        };

        const loadModelFromDataUrl = (dataUrl, name) => {
          const extension = name.split('.').pop().toLowerCase();
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
            if (placeholderMeshRef.current) {
              scene.remove(placeholderMeshRef.current);
              placeholderMeshRef.current = null;
            }
            if (currentModelRef.current) scene.remove(currentModelRef.current);

            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);

            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.4 / maxDim;
            model.scale.set(scale, scale, scale);
            model.position.y += 0.2;

            scene.add(model);
            currentModelRef.current = model;
            setModelLoaded(true);
          };

          try {
            if (extension === 'obj') {
              const text = base64ToText(dataUrl);
              const loader = new THREE.OBJLoader();
              const obj = loader.parse(text);
              applyHologramMaterial(obj);
              centerAndScaleModel(obj);
            } else if (extension === 'fbx') {
              const arrayBuffer = base64ToArrayBuffer(dataUrl);
              const loader = new THREE.FBXLoader();
              const fbx = loader.parse(arrayBuffer);
              applyHologramMaterial(fbx);
              centerAndScaleModel(fbx);
            }
          } catch (err) {
            const errMsg = err?.message || '';
            if (errMsg.includes('FBX version not supported')) {
              console.warn('HologramViewer: Uploaded FBX model uses an outdated version (v6100 or older).');
              addToast?.('FBX version not supported. Please use FBX 2014 or newer (v7.0+).', 'error');
            } else {
              console.error(err);
              addToast?.(`Failed to parse ${extension.toUpperCase()} model.`, 'error');
            }
          }
        };

        if (savedData && savedFileName) {
          loadModelFromDataUrl(savedData, savedFileName);
        } else {
          createPlaceholder();
        }

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

        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', handleResize);
        handleResize();

        // Loop variables
        let frameId;
        let laserDir = 1;
        const clock = new THREE.Clock();

        const animate = () => {
          frameId = requestAnimationFrame(animate);
          controls.update();

          const elapsed = clock.getElapsedTime();

          if (isRotatingRef.current && currentModelRef.current) {
            currentModelRef.current.rotation.y = elapsed * 0.15;
          } else if (isRotatingRef.current && placeholderMeshRef.current) {
            placeholderMeshRef.current.rotation.y = elapsed * 0.25;
            placeholderMeshRef.current.rotation.x = elapsed * 0.1;
          }

          laser.position.y += 0.012 * laserDir;
          laser.rotation.y = elapsed * 0.5;
          if (laser.position.y > 2.5) laserDir = -1;
          if (laser.position.y < -1) laserDir = 1;

          renderer.render(scene, camera);
        };
        animate();

        return () => {
          active = false;
          resizeObserver.disconnect();
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(frameId);
          if (rendererRef.current) rendererRef.current.dispose();
        };
      } catch (err) {
        console.error(err);
        setError('Could not load 3D visualizer.');
      }
    };

    init();
  }, [savedData, savedFileName]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'obj' && extension !== 'fbx') {
      addToast?.('Unsupported format. Please upload .obj or .fbx.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      onSaveData?.(dataUrl, file.name);
      addToast?.('3D Model uploaded successfully.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleResetModel = () => {
    onSaveData?.('', '');
    setFileName('');
    setModelLoaded(false);
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
          onClick={(e) => { e.stopPropagation(); setIsRotating(!isRotating); }}
          title="Toggle Auto-Rotation"
        >
          <RotateCw size={12} />
          <span>ROTATE</span>
        </button>
        <button
          className={`${styles.hudBtn} ${isWireframe ? styles.hudBtnActive : ''}`}
          onClick={(e) => { e.stopPropagation(); setIsWireframe(!isWireframe); }}
          title="Toggle Wireframe Rendering"
        >
          <Box size={12} />
          <span>WIREFRAME</span>
        </button>
        {modelLoaded || savedData ? (
          <button
            className={`${styles.hudBtn} ${styles.resetBtn}`}
            onClick={(e) => { e.stopPropagation(); handleResetModel(); }}
            title="Reset Model"
          >
            <Layers size={12} />
            <span>RESET</span>
          </button>
        ) : (
          <button
            className={styles.hudBtn}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
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

// ─────────────────────────────────────────────────────────────────────────────
// 2. TEXTURE VISUALIZER (Zoom & Color Channel Inspector)
// ─────────────────────────────────────────────────────────────────────────────
function TextureVisualizer({ title, savedData, savedFileName, onSaveData }) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [fileName, setFileName] = useState(savedFileName || '');
  const [zoom, setZoom] = useState(1);
  const [channel, setChannel] = useState('rgb'); // rgb, r, g, b, a

  useEffect(() => {
    if (!savedData) return;
    const img = new Image();
    img.src = savedData;
    img.onload = () => {
      imgRef.current = img;
      renderImage();
    };
  }, [savedData, channel]);

  const renderImage = () => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    
    // Apply channel filter using canvas pixel operations
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    if (channel !== 'rgb') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (channel === 'r') {
          data[i] = r; data[i + 1] = r; data[i + 2] = r; data[i + 3] = 255;
        } else if (channel === 'g') {
          data[i] = g; data[i + 1] = g; data[i + 2] = g; data[i + 3] = 255;
        } else if (channel === 'b') {
          data[i] = b; data[i + 1] = b; data[i + 2] = b; data[i + 3] = 255;
        } else if (channel === 'a') {
          data[i] = a; data[i + 1] = a; data[i + 2] = a; data[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      onSaveData?.(event.target.result, file.name);
      addToast?.('Texture map linked.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    onSaveData?.('', '');
    setFileName('');
    setZoom(1);
    setChannel('rgb');
  };

  return (
    <div className={styles.viewportContainer}>
      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ RENDER: {channel.toUpperCase()} ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>ZOOM: {(zoom * 100).toFixed(0)}%</div>
          <div>FILE: {fileName || 'NO_TEXTURE_MAP.SYS'}</div>
        </div>
      </div>

      <div className={styles.textureViewport}>
        {savedData ? (
          <div className={styles.textureCanvasWrap} style={{ transform: `scale(${zoom})` }}>
            <canvas ref={canvasRef} className={styles.textureCanvas} />
          </div>
        ) : (
          <div className={styles.texturePlaceholder}>
            <div className={styles.textureGridBg} />
            <span className={styles.loadingText}>NO TEXTURE DATA MAP LOADED</span>
          </div>
        )}
      </div>

      <div className={styles.hudFooter}>
        <button
          className={`${styles.hudBtn} ${zoom > 1 ? styles.hudBtnActive : ''}`}
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.25, 3)); }}
        >
          <ZoomIn size={12} />
          <span>ZOOM IN</span>
        </button>
        <button
          className={`${styles.hudBtn} ${zoom < 1 ? styles.hudBtnActive : ''}`}
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.25, 0.5)); }}
        >
          <ZoomOut size={12} />
          <span>ZOOM OUT</span>
        </button>
        <div className={styles.hudBtnDivider} />
        {['rgb', 'r', 'g', 'b', 'a'].map(ch => (
          <button
            key={ch}
            className={`${styles.hudBtn} ${channel === ch ? styles.hudBtnActive : ''}`}
            onClick={(e) => { e.stopPropagation(); setChannel(ch); }}
          >
            <span>{ch.toUpperCase()}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {savedData ? (
          <button className={`${styles.hudBtn} ${styles.resetBtn}`} onClick={(e) => { e.stopPropagation(); handleReset(); }}>
            <Trash size={12} />
            <span>RESET</span>
          </button>
        ) : (
          <button className={styles.hudBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
            <Upload size={12} />
            <span>UPLOAD TEXTURE</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUDIO VISUALIZER (Pulsing Equalizer simulation)
// ─────────────────────────────────────────────────────────────────────────────
function AudioVisualizer({ title, savedData, savedFileName, onSaveData }) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [fileName, setFileName] = useState(savedFileName || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!savedData) return;
    audioRef.current = new Audio(savedData);
    
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [savedData]);

  // Bouncing Equalizer animations on play
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;
    
    const barsCount = 20;
    const heights = Array(barsCount).fill(4);

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width / barsCount;

      for (let i = 0; i < barsCount; i++) {
        // Target heights bounce if playing, else return to baseline
        const target = isPlaying ? Math.random() * (canvas.height - 10) + 4 : 4;
        heights[i] += (target - heights[i]) * 0.25;

        // Draw neon glowing equalizers
        ctx.fillStyle = `hsl(${180 + i * 5}, 100%, 60%)`;
        ctx.fillRect(i * width + 2, canvas.height - heights[i], width - 4, heights[i]);
      }
    };
    draw();

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      onSaveData?.(event.target.result, file.name);
      addToast?.('Audio file loaded.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (audioRef.current) audioRef.current.pause();
    onSaveData?.('', '');
    setFileName('');
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className={styles.viewportContainer}>
      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ WAV MODULE ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>PLAYBACK: {formatTime(currentTime)} / {formatTime(duration)}</div>
          <div>FILE: {fileName || 'HOLOGRAM_SOUNDSTEM.RAW'}</div>
        </div>
      </div>

      <div className={styles.audioViewport}>
        <canvas ref={canvasRef} className={styles.audioCanvas} width="300" height="120" />
      </div>

      <div className={styles.hudFooter}>
        {savedData && (
          <button className={`${styles.hudBtn} ${isPlaying ? styles.hudBtnActive : ''}`} onClick={handlePlayToggle}>
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
        )}
        <div style={{ flex: 1 }} />
        {savedData ? (
          <button className={`${styles.hudBtn} ${styles.resetBtn}`} onClick={(e) => { e.stopPropagation(); handleReset(); }}>
            <Trash size={12} />
            <span>RESET</span>
          </button>
        ) : (
          <button className={styles.hudBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
            <Upload size={12} />
            <span>UPLOAD AUDIO</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BLUEPRINT VISUALIZER (Interactive Node Scripting Flow)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_BLUEPRINT = JSON.stringify([
  { id: 'n1', title: 'Event BeginPlay', type: 'event', x: 20, y: 40, outputs: ['Exec'] },
  { id: 'n2', title: 'Initialize Ability: Blink', type: 'function', x: 180, y: 20, inputs: ['Exec', 'StaminaCost (20)'], outputs: ['Exec', 'Success'] },
  { id: 'n3', title: 'PlaySound2D', type: 'audio', x: 380, y: 30, inputs: ['Exec', 'SFX_Blink_Cue'], outputs: ['Exec'] },
]);

function BlueprintVisualizer({ title, savedData, savedFileName, onSaveData }) {
  const { addToast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const dragNodeRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dataString = savedData || DEFAULT_BLUEPRINT;
    try {
      setNodes(JSON.parse(dataString));
    } catch {
      setNodes(JSON.parse(DEFAULT_BLUEPRINT));
    }
  }, [savedData]);

  const handleMouseDown = (node, e) => {
    e.stopPropagation();
    setSelectedNode(node);
    dragNodeRef.current = node.id;
    dragOffsetRef.current = {
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragNodeRef.current) return;
    const updated = nodes.map(n => {
      if (n.id === dragNodeRef.current) {
        return {
          ...n,
          x: Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, 480)),
          y: Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, 220)),
        };
      }
      return n;
    });
    setNodes(updated);
  };

  const handleMouseUp = () => {
    if (dragNodeRef.current) {
      onSaveData?.(JSON.stringify(nodes), savedFileName || 'CustomBlueprint.json');
      dragNodeRef.current = null;
    }
  };

  const handleAddNode = (e) => {
    e.stopPropagation();
    const type = prompt('Enter Node Type (e.g., event, function, audio, branch):', 'function');
    if (!type) return;
    const nodeTitle = prompt('Enter Node Name:', 'New Function');
    if (!nodeTitle) return;

    const newNode = {
      id: 'node_' + Date.now(),
      title: nodeTitle,
      type,
      x: 100,
      y: 80,
      inputs: ['Exec'],
      outputs: ['Exec'],
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    onSaveData?.(JSON.stringify(updated), savedFileName || 'CustomBlueprint.json');
    addToast?.('Blueprint node added.', 'success');
  };

  const handleDeleteNode = (id, e) => {
    e.stopPropagation();
    const updated = nodes.filter(n => n.id !== id);
    setNodes(updated);
    onSaveData?.(JSON.stringify(updated), savedFileName || 'CustomBlueprint.json');
    setSelectedNode(null);
    addToast?.('Blueprint node deleted.', 'warning');
  };

  return (
    <div
      className={styles.viewportContainer}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ GRAPH LINK ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>NODES ACTIVE: {nodes.length}</div>
          <div>SCHEMA: UE5_GRAPH_LINK</div>
        </div>
      </div>

      <div className={styles.blueprintGridContainer}>
        {/* Draw bezier connection paths between nodes */}
        <svg className={styles.blueprintSvg}>
          {nodes.map((n, i) => {
            const nextNode = nodes[i + 1];
            if (!nextNode) return null;
            // Draw connection between current node output and next node input
            const x1 = n.x + 130;
            const y1 = n.y + 35;
            const x2 = nextNode.x;
            const y2 = nextNode.y + 35;
            const cx1 = x1 + 40;
            const cy1 = y1;
            const cx2 = x2 - 40;
            const cy2 = y2;
            return (
              <path
                key={n.id}
                d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(0, 240, 255, 0.45)"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
            );
          })}
        </svg>

        {nodes.map(n => (
          <div
            key={n.id}
            className={`${styles.blueprintNode} ${selectedNode?.id === n.id ? styles.blueprintNodeSelected : ''}`}
            style={{ left: n.x, top: n.y }}
            onMouseDown={(e) => handleMouseDown(n, e)}
          >
            <div className={styles.nodeHeader} style={{ '--node-color': n.type === 'event' ? '#dc2626' : n.type === 'audio' ? '#059669' : '#2563eb' }}>
              <span className={styles.nodeTitle}>{n.title}</span>
              <button className={styles.nodeDeleteBtn} onClick={(e) => handleDeleteNode(n.id, e)} title="Delete Node">×</button>
            </div>
            <div className={styles.nodePins}>
              <div className={styles.nodeInputPin}>{n.inputs ? '▶ ' + n.inputs.join(', ') : '▶'}</div>
              <div style={{ flex: 1 }} />
              <div className={styles.nodeOutputPin}>{n.outputs ? n.outputs.join(', ') + ' ▶' : '▶'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.hudFooter}>
        <button className={styles.hudBtn} onClick={handleAddNode}>
          <Plus size={12} />
          <span>ADD FLOW NODE</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className={`${styles.hudBtn} ${styles.resetBtn}`} onClick={(e) => { e.stopPropagation(); setNodes(JSON.parse(DEFAULT_BLUEPRINT)); onSaveData?.('', ''); }}>
          <Trash size={12} />
          <span>RESET GRAPH</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ANIMATION VISUALIZER (Timeline Keyframe cycle)
// ─────────────────────────────────────────────────────────────────────────────
function AnimationVisualizer({ title, savedData, savedFileName, onSaveData }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const [fileName, setFileName] = useState(savedFileName || '');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const currentModelRef = useRef(null);
  const placeholderMeshRef = useRef(null);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Main canvas animation loop and script imports
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'),
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js'),
          loadScript('https://unpkg.com/fflate@0.8.2/umd/index.js'),
        ]);
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js');

        if (!active) return;
        setLoading(false);

        const THREE = window.THREE;
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
          45,
          containerRef.current.clientWidth / containerRef.current.clientHeight,
          0.1,
          100
        );
        camera.position.set(0, 3, 7);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        rendererRef.current = renderer;

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Visual coordinate grid
        const grid = new THREE.GridHelper(10, 20, 0x7c3aed, 0x06b6d4);
        grid.position.y = -1;
        grid.material.opacity = 0.15;
        grid.material.transparent = true;
        scene.add(grid);

        const light1 = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0x06b6d4, 0.8);
        light2.position.set(5, 5, 5);
        scene.add(light2);

        // Circular sweeping scanners
        const ringGeom = new THREE.RingGeometry(2, 2.1, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.99;
        scene.add(ring);

        const createPlaceholder = () => {
          if (placeholderMeshRef.current) scene.remove(placeholderMeshRef.current);
          const geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
          const mat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            wireframe: true,
          });
          const mesh = new THREE.Mesh(geom, mat);
          scene.add(mesh);
          placeholderMeshRef.current = mesh;
        };

        const loadModelFromDataUrl = (dataUrl, name) => {
          const extension = name.split('.').pop().toLowerCase();
          const applyHologramMaterial = (model) => {
            model.traverse((child) => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x00f0ff,
                  wireframe: true,
                  transparent: true,
                  opacity: 0.65,
                });
              }
            });
          };

          const centerAndScaleModel = (model) => {
            if (placeholderMeshRef.current) {
              scene.remove(placeholderMeshRef.current);
              placeholderMeshRef.current = null;
            }
            if (currentModelRef.current) scene.remove(currentModelRef.current);

            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);

            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.4 / maxDim;
            model.scale.set(scale, scale, scale);

            scene.add(model);
            currentModelRef.current = model;
          };

          try {
            if (extension === 'obj') {
              const text = base64ToText(dataUrl);
              const loader = new THREE.OBJLoader();
              const obj = loader.parse(text);
              applyHologramMaterial(obj);
              centerAndScaleModel(obj);
            } else if (extension === 'fbx') {
              const arrayBuffer = base64ToArrayBuffer(dataUrl);
              const loader = new THREE.FBXLoader();
              const fbx = loader.parse(arrayBuffer);
              applyHologramMaterial(fbx);
              centerAndScaleModel(fbx);
            }
          } catch (err) {
            console.error(err);
            addToast?.('Failed to load asset model.', 'error');
          }
        };

        if (savedData && savedFileName) {
          loadModelFromDataUrl(savedData, savedFileName);
        } else {
          createPlaceholder();
        }

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

        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', handleResize);
        handleResize();

        // Loop animation frame controls
        let frameId;
        let elapsedFrames = 0;

        const animate = () => {
          frameId = requestAnimationFrame(animate);
          controls.update();

          if (isPlayingRef.current) {
            elapsedFrames += speedRef.current;
            const frameNum = Math.floor(elapsedFrames) % 120;
            setCurrentFrame(frameNum);

            // Simulating continuous keyframe skeletal rotation on placeholder
            if (placeholderMeshRef.current) {
              placeholderMeshRef.current.rotation.y = frameNum * 0.025;
              placeholderMeshRef.current.rotation.x = Math.sin(frameNum * 0.05) * 0.4;
            }
            if (currentModelRef.current) {
              currentModelRef.current.rotation.y = frameNum * 0.025;
              // Add slight skeletal bounce
              currentModelRef.current.position.y = Math.sin(frameNum * 0.08) * 0.15 + 0.1;
            }
          }

          renderer.render(scene, camera);
        };
        animate();

        return () => {
          active = false;
          resizeObserver.disconnect();
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(frameId);
          if (rendererRef.current) rendererRef.current.dispose();
        };
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [savedData, savedFileName]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      onSaveData?.(event.target.result, file.name);
      addToast?.('Target animation skeleton linked.', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.viewportContainer} ref={containerRef}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.scannerLine} />
          <span className={styles.loadingText}>RESOLVING RIG BONES…</span>
        </div>
      )}

      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ CYCLE ACTIVE ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>SPEED: {speed}x</div>
          <div>FILE: {fileName || 'ABP_SKELETAL_PLACEHOLDER.SYS'}</div>
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Frame Timeline Slider */}
      <div className={styles.timelineScrubberWrap}>
        <span className={styles.timelineLabel}>F: {currentFrame}</span>
        <input
          type="range"
          min="0"
          max="119"
          value={currentFrame}
          onChange={(e) => {
            setCurrentFrame(parseInt(e.target.value));
            setIsPlaying(false);
          }}
          className={styles.timelineSlider}
        />
      </div>

      <div className={styles.hudFooter}>
        <button className={styles.hudBtn} onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>
        {[0.5, 1, 2].map(s => (
          <button key={s} className={`${styles.hudBtn} ${speed === s ? styles.hudBtnActive : ''}`} onClick={(e) => { e.stopPropagation(); setSpeed(s); }}>
            <span>{s}x</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className={styles.hudBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
          <Upload size={12} />
          <span>UPLOAD SKEL</span>
        </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. VFX VISUALIZER (Niagara Particle Attraction Field Simulator)
// ─────────────────────────────────────────────────────────────────────────────
function VFXVisualizer({ title }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Attraction field parameters
  const [particleCount, setParticleCount] = useState(1200);
  const [gravity, setGravity] = useState(0.2); // Attractor strength
  const [velocity, setVelocity] = useState(1.5);
  const [colorTheme, setColorTheme] = useState('cyan'); // cyan, magenta, gold, purple

  const countRef = useRef(particleCount);
  const gravRef = useRef(gravity);
  const velRef = useRef(velocity);
  const colorRef = useRef(colorTheme);

  useEffect(() => { countRef.current = particleCount; }, [particleCount]);
  useEffect(() => { gravRef.current = gravity; }, [gravity]);
  useEffect(() => { velRef.current = velocity; }, [velocity]);
  useEffect(() => { colorRef.current = colorTheme; }, [colorTheme]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameId;

    let active = true;

    // Handle dimensions
    const resize = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Spawn Particles
    let particles = [];
    const createParticles = (num) => {
      particles = [];
      const colors = {
        cyan: ['#00f0ff', '#06b6d4', '#22d3ee'],
        magenta: ['#f43f5e', '#ec4899', '#f472b6'],
        gold: ['#fbbf24', '#f59e0b', '#d97706'],
        purple: ['#a855f7', '#8b5cf6', '#c084fc'],
      };
      const themeColors = colors[colorRef.current] || colors.cyan;

      for (let i = 0; i < num; i++) {
        // Spiral orbits around center
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 80 + 20;
        particles.push({
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height / 2 + Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * velRef.current,
          vy: (Math.random() - 0.5) * velRef.current,
          radius: Math.random() * 1.5 + 0.5,
          color: themeColors[Math.floor(Math.random() * themeColors.length)],
          life: Math.random() * 100 + 40,
          maxLife: 140,
        });
      }
    };
    createParticles(countRef.current);

    const animate = () => {
      if (!active) return;
      frameId = requestAnimationFrame(animate);

      // Semi-transparent clearing for motion trails
      ctx.fillStyle = 'rgba(6, 6, 12, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentCount = countRef.current;

      // Adjust particle arrays dynamically if slider moved
      if (particles.length !== currentCount) {
        createParticles(currentCount);
      }

      particles.forEach(p => {
        // Gravitational pull to center
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        p.vx += (dx / dist) * gravRef.current * 0.15;
        p.vy += (dy / dist) * gravRef.current * 0.15;

        // Apply velocities
        p.x += p.vx * velRef.current;
        p.y += p.vy * velRef.current;
        
        // Decay
        p.life--;

        // Draw glowing circular particle
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Respawn if dead
        if (p.life <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 10 + 1;
          p.x = centerX + Math.cos(angle) * radius;
          p.y = centerY + Math.sin(angle) * radius;
          p.vx = (Math.random() - 0.5) * velRef.current;
          p.vy = (Math.random() - 0.5) * velRef.current;
          p.life = Math.random() * 100 + 40;
        }
      });
      ctx.shadowBlur = 0; // Reset blur
    };
    animate();

    return () => {
      active = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [particleCount, colorTheme]);

  return (
    <div className={styles.viewportContainer} ref={containerRef}>
      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <span className={styles.hudLabel}>{title}</span>
          <span className={styles.hudStatus}>[ NIAGARA ONLINE ]</span>
        </div>
        <div className={styles.hudDetails}>
          <div>SIMULATOR: ACTIVE_ATTRACTOR</div>
          <div>EMITTING: {particleCount} PART.</div>
        </div>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />

      {/* VFX Slider Control Panel */}
      <div className={styles.vfxControlsPanel}>
        <div className={styles.vfxSliderGroup}>
          <span className={styles.vfxSliderLabel}>COUNT ({particleCount})</span>
          <input
            type="range"
            min="200"
            max="3000"
            step="100"
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value))}
            className={styles.vfxSlider}
          />
        </div>
        <div className={styles.vfxSliderGroup}>
          <span className={styles.vfxSliderLabel}>ATTRACTION ({gravity.toFixed(1)})</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className={styles.vfxSlider}
          />
        </div>
      </div>

      <div className={styles.hudFooter}>
        {['cyan', 'magenta', 'gold', 'purple'].map(color => (
          <button
            key={color}
            className={`${styles.hudBtn} ${colorTheme === color ? styles.hudBtnActive : ''}`}
            onClick={(e) => { e.stopPropagation(); setColorTheme(color); }}
          >
            <span>{color.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
