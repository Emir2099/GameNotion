import React from 'react';
import styles from './Milestones.module.css';

const MILESTONES = [
  { name: 'Pre-Production', date: 'Jan 2026', status: 'done', color: '#059669', deliverables: ['Engine version locked (UE5.4)','Core team assembled (8 members)','GDD v1.0 complete','Target platforms confirmed: PC, PS5, Xbox S|X','Art Bible approved','Vertical slice defined'] },
  { name: 'Vertical Slice', date: 'Mar 2026', status: 'done', color: '#059669', deliverables: ['1km² playable area of Zone 1','Core combat loop functional','GAS system: 4 baseline abilities','MetaSounds music system integrated','UE5 render pipeline validated','QA sign-off on core gameplay feel'] },
  { name: 'Alpha', date: 'Jul 2026', status: 'in-progress', color: '#7c3aed', deliverables: ['All 6 zones accessible (whitebox → greybox)','World Partition streaming validated','All story acts scripted & dialogue recorded (v1)','AI systems (State Tree) complete','MetaHuman characters integrated','Sprint 8 task completion required'] },
  { name: 'Beta', date: 'Oct 2026', status: 'planned', color: '#2563eb', deliverables: ['Feature-complete build','All assets integrated and optimised','Full platform certification pass','Performance targets hit (60fps PS5 / Xbox)','Localisation complete (10 languages)','Press preview build ready'] },
  { name: 'Gold Master', date: 'Dec 2026', status: 'planned', color: '#d97706', deliverables: ['Zero Critical/High bugs open','Platform cert submission accepted','Disc manufacturing approved','Day-1 patch prepared','Launch trailer delivered','Review copies shipped'] },
  { name: 'Launch', date: 'Jan 2027', status: 'planned', color: '#dc2626', deliverables: ['Global launch — PC, PS5, Xbox Series X|S','Day-1 patch live','Post-launch support team assembled','Social media campaign active','DLC roadmap published'] },
];

const STATUS_ICON = { done: '✅', 'in-progress': '🔄', planned: '⭕' };

export default function Milestones() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Milestones & Roadmap</h1>
        <p className={styles.subtitle}>Project NEXUS production timeline — Jan 2026 → Jan 2027</p>
      </div>

      <div className={styles.timeline}>
        {MILESTONES.map((m, i) => (
          <div key={m.name} className={`${styles.milestone} ${m.status === 'done' ? styles.milestoneDone : m.status === 'in-progress' ? styles.milestoneActive : styles.milestonePlanned}`}>
            <div className={styles.milestoneLeft}>
              <div className={styles.milestoneDot} style={{ borderColor: m.color, background: m.status === 'done' ? m.color : 'var(--bg-base)' }}>
                <span>{STATUS_ICON[m.status]}</span>
              </div>
              {i < MILESTONES.length - 1 && <div className={styles.milestoneLine} style={{ background: m.status === 'done' ? m.color : 'var(--border-default)' }} />}
            </div>
            <div className={styles.milestoneCard} style={{ borderLeftColor: m.color }}>
              <div className={styles.milestoneHead}>
                <div>
                  <div className={styles.milestoneName}>{m.name}</div>
                  <div className={styles.milestoneDate}>{m.date}</div>
                </div>
                <span className={styles.milestoneStatus} style={{ color: m.color, background: m.color + '18', borderColor: m.color + '33' }}>
                  {m.status === 'done' ? 'Complete' : m.status === 'in-progress' ? 'In Progress' : 'Planned'}
                </span>
              </div>
              <ul className={styles.deliverables}>
                {m.deliverables.map(d => (
                  <li key={d} className={styles.deliverable}>
                    <span className={styles.deliverableDot} style={{ background: m.status === 'done' ? m.color : 'var(--text-disabled)' }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
