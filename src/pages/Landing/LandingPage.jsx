import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Zap, Cpu, Package, Eye, Code } from 'lucide-react';
import styles from './LandingPage.module.css';

export default function LandingPage({ onEnter }) {
  const [glitchText, setGlitchText] = useState('GAMENOTION');
  const [scanProgress, setScanProgress] = useState(0);

  // Core boot loader animation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1;
      });
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Futuristic subtitle glitch effect
  useEffect(() => {
    const texts = ['GAMENOTION', 'G4M3N0T10N', 'GAME_CORE.SYS', 'GAMENOTION'];
    let idx = 0;
    const interval = setInterval(() => {
      setGlitchText(texts[idx % texts.length]);
      idx++;
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.landingContainer}>
      {/* Blueprint cyber grid backdrop */}
      <div className={styles.cyberGrid} />

      {/* Cyber ambient glow blobs */}
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />

      <div className={styles.hudContainer}>
        {/* Futuristic HUD corner brackets */}
        <div className={`${styles.corner} ${styles.topLeft}`} />
        <div className={`${styles.corner} ${styles.topRight}`} />
        <div className={`${styles.corner} ${styles.bottomLeft}`} />
        <div className={`${styles.corner} ${styles.bottomRight}`} />

        <div className={styles.header}>
          <div className={styles.securityBadge}>
            <Shield size={10} className={styles.pulseIcon} />
            <span>SECURE SYSTEM LINK ESTABLISHED</span>
          </div>
          <div className={styles.terminalStatus}>
            <Terminal size={10} />
            <span>SYS_STATUS: ONLINE</span>
          </div>
        </div>

        <div className={styles.heroSection}>
          <h1 className={styles.title} data-text={glitchText}>
            {glitchText}
          </h1>
          <p className={styles.subtitle}>
            THE NEXT-GEN GAME DESIGN COMMAND CENTER & COLLABORATION CORE
          </p>
          <p className={styles.tagline}>
            Consolidate your GDD, organize sprint tasks, track debugging runs, design lore databases, and inspect 3D assets, audio waves, and particle fields in real-time.
          </p>

          {/* Boot scan bar */}
          <div className={styles.bootBarContainer}>
            <div className={styles.bootBar} style={{ width: `${scanProgress}%` }} />
            <span className={styles.bootText}>INITIALIZING SUBSYSTEM CORES... {scanProgress}%</span>
          </div>

          {scanProgress >= 100 ? (
            <button className={styles.enterBtn} onClick={onEnter}>
              <Zap size={14} className={styles.btnIcon} />
              <span>LAUNCH NEURAL WORKSPACE</span>
            </button>
          ) : (
            <button className={styles.enterBtnDisabled} disabled>
              <span>CONNECTING SYSTEMS...</span>
            </button>
          )}
        </div>

        {/* Feature Matrix Showcase */}
        <div className={styles.matrixSection}>
          <div className={styles.matrixHeader}>SYSTEM CAPABILITIES MATRIX</div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <Eye size={16} className={styles.cardIcon} style={{ color: '#00f0ff' }} />
                <h3>3D Asset Pipeline</h3>
              </div>
              <p>WebGL hologram viewer supporting client-side parsing of OBJ & FBX files with active coordinate grids and wireframe controls.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <Cpu size={16} className={styles.cardIcon} style={{ color: '#7c3aed' }} />
                <h3>Visual Node Blueprint</h3>
              </div>
              <p>Interactive scripting canvas displaying nodes and execution linkages in the style of Unreal Engine blueprint graphs.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <Package size={16} className={styles.cardIcon} style={{ color: '#059669' }} />
                <h3>Media Inspectors</h3>
              </div>
              <p>Multichannel texture zooming tool (RGB, R, G, B, Alpha) and a real-time reactive equalizer waveform display for sound stems.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <Zap size={16} className={styles.cardIcon} style={{ color: '#dc2626' }} />
                <h3>Niagara Emitter Sim</h3>
              </div>
              <p>Adjustable dynamic attractor particle swarm simulator to preview visual effects density, gravity, and velocities instantly.</p>
            </div>
          </div>
        </div>

        {/* Footer info and repository */}
        <div className={styles.footer}>
          <span>DEVELOPED BY EMIR2099 FOR NEXT-GEN CREATORS</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gitLink}
            onClick={(e) => e.stopPropagation()}
          >
            <Code size={12} />
            <span>VIEW CODEBASE</span>
          </a>
        </div>
      </div>
    </div>
  );
}
