import React from 'react';
import styles from './TechStack.module.css';

const TECH = [
  { category: '🎨 Rendering', color: '#7c3aed', items: [
    { name: 'Nanite', desc: 'Virtualized micropolygon geometry — all environment meshes', status: 'Active', version: 'UE5.4' },
    { name: 'Lumen', desc: 'Dynamic global illumination — all 6 zones, day/night cycle', status: 'Active', version: 'UE5.4' },
    { name: 'Temporal Super Resolution (TSR)', desc: 'Native 4K upscale from 1080p base render', status: 'Active', version: 'UE5.4' },
    { name: 'Substrate Materials', desc: 'Layered material framework replacing legacy material model', status: 'In Progress', version: 'UE5.4' },
    { name: 'Path Tracing', desc: 'Used for offline cinematics and marketing renders', status: 'Planned', version: 'UE5.4' },
  ]},
  { category: '⚙️ Gameplay Systems', color: '#2563eb', items: [
    { name: 'Gameplay Ability System (GAS)', desc: 'All combat abilities, passive effects, attribute sets, gameplay tags', status: 'Active', version: '5.4' },
    { name: 'Motion Matching', desc: 'Locomotion system replacing traditional state machine — Kael only', status: 'Active', version: '5.4' },
    { name: 'State Tree', desc: 'AI decision system for all enemy archetypes', status: 'In Progress', version: '5.4' },
    { name: 'Chaos Physics', desc: 'Destruction in The Iron Depths, avalanche sim in Arctic Spire', status: 'Planned', version: '5.4' },
  ]},
  { category: '🌍 World & Environment', color: '#0891b2', items: [
    { name: 'World Partition', desc: 'Seamless 64km² open world streaming — no loading screens', status: 'Active', version: '5.4' },
    { name: 'PCG (Procedural Content Generation)', desc: 'Desert terrain erosion, foliage scatter, interior prop variation', status: 'In Progress', version: '5.4' },
    { name: 'Water System Plugin', desc: 'Rivers, ocean, and interaction physics — Neon Delta zone', status: 'Planned', version: '5.4' },
    { name: 'MetaHuman', desc: 'Kael Voss and Commander Vex hero characters', status: 'In Progress', version: '5.4' },
  ]},
  { category: '🔊 Audio', color: '#059669', items: [
    { name: 'MetaSounds', desc: 'Full adaptive audio system — parameter-driven music, SFX procedural variation', status: 'Active', version: '5.4' },
    { name: 'Convolution Reverb', desc: 'Real-time IR-based reverb for acoustic zones', status: 'Active', version: '5.4' },
    { name: 'Wwise Integration', desc: 'Secondary audio engine for complex adaptive music sequences', status: 'Planned', version: '2024.1' },
  ]},
  { category: '🔌 Plugins', color: '#d97706', items: [
    { name: 'Enhanced Input', desc: 'Full input remapping, gamepad + KB/M, accessibility modes', status: 'Active', version: 'Built-in' },
    { name: 'Common UI', desc: 'Cross-platform UI layer — console navigation, focus management', status: 'Active', version: 'Built-in' },
    { name: 'Mover 2.0', desc: 'New character movement framework replacing CharacterMovementComponent', status: 'Evaluating', version: '5.4 Exp' },
    { name: 'Online Subsystem Steam', desc: 'Steam achievements, cloud saves, leaderboards', status: 'Planned', version: '—' },
  ]},
  { category: '🚀 Optimization', color: '#dc2626', items: [
    { name: 'Platform Scalability', desc: 'Quality presets: Cinematic / Epic / High / Medium / Low', status: 'In Progress', version: '—' },
    { name: 'Insight Profiling', desc: 'Unreal Insights integrated into CI pipeline', status: 'Active', version: '5.4' },
    { name: 'PSO Caching', desc: 'Pipeline State Object pre-compilation for PS5 / Xbox', status: 'Planned', version: '—' },
  ]},
];

const STATUS_COLORS = {
  Active:      { bg:'rgba(5,150,105,0.12)',  color:'#34d399', border:'rgba(5,150,105,0.25)' },
  'In Progress':{ bg:'rgba(37,99,235,0.12)',  color:'#60a5fa', border:'rgba(37,99,235,0.25)' },
  Planned:     { bg:'rgba(124,58,237,0.10)', color:'#a78bfa', border:'rgba(124,58,237,0.25)' },
  Evaluating:  { bg:'rgba(217,119,6,0.12)',  color:'#fbbf24', border:'rgba(217,119,6,0.25)' },
};

export default function TechStack() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src="/unreal_banner.png" alt="Unreal Tech Banner" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Tech Stack</h1>
          <p className={styles.subtitle}>Unreal Engine 5.4 feature set and plugin integration status</p>
        </div>
      </div>
      <div className={styles.grid}>
        {TECH.map(cat => (
          <div key={cat.category} className={styles.catCard}>
            <div className={styles.catHeader} style={{ borderColor: cat.color }}>
              <span className={styles.catLabel}>{cat.category}</span>
              <span className={styles.catCount}>{cat.items.length}</span>
            </div>
            <div className={styles.items}>
              {cat.items.map(item => {
                const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Planned;
                return (
                  <div key={item.name} className={styles.item}>
                    <div className={styles.itemTop}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemStatus} style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {item.status}
                      </span>
                    </div>
                    <p className={styles.itemDesc}>{item.desc}</p>
                    <span className={styles.itemVer}>{item.version}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
