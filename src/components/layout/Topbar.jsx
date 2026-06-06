import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Plus, Search, Bell } from 'lucide-react';
import { useAppStore } from '../../store';
import styles from './Topbar.module.css';

const PAGE_META = {
  '/':           { label: 'Dashboard',     desc: 'Project overview & live stats' },
  '/gdd':        { label: 'Game Design Doc', desc: 'The living bible of your project' },
  '/sprints':    { label: 'Sprint Board',  desc: 'Kanban task management' },
  '/assets':     { label: 'Asset Manager', desc: 'Track all game assets' },
  '/bugs':       { label: 'Bug Tracker',   desc: 'Track, assign & resolve issues' },
  '/world':      { label: 'World Building',desc: 'Lore, factions, geography' },
  '/characters': { label: 'Characters',    desc: 'All characters & profiles' },
  '/levels':     { label: 'Level Design',  desc: 'Level docs & progress' },
  '/techstack':  { label: 'Tech Stack',    desc: 'UE5 features & plugins' },
  '/milestones': { label: 'Milestones',    desc: 'Project roadmap' },
  '/team':       { label: 'Team',          desc: 'Your crew' },
  '/help':       { label: 'Help & Docs',   desc: 'Guides & shortcuts' },
};

const TEAM_AVATARS = [
  { initial: 'C', color: '#7c3aed', name: 'Captain (You)' },
  { initial: 'M', color: '#2563eb', name: 'Maya Chen' },
  { initial: 'A', color: '#0891b2', name: 'Alex Rivera' },
];

export function Topbar({ onNewAction }) {
  const location = useLocation();
  const projectName = useAppStore(s => s.projectName);
  const meta = PAGE_META[location.pathname] || { label: 'GameNotion', desc: '' };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span className={styles.breadcrumbRoot}>{projectName || 'GameNotion'}</span>
          <ChevronRight size={14} className={styles.breadcrumbSep} strokeWidth={2.5} />
          <span className={styles.breadcrumbCurrent}>{meta.label}</span>
        </nav>
        {meta.desc && (
          <span className={styles.pageDesc}>{meta.desc}</span>
        )}
      </div>

      <div className={styles.right}>
        {/* Search trigger */}
        <button className={styles.searchBtn} aria-label="Search">
          <Search size={13} strokeWidth={2} />
          <span>Search…</span>
          <kbd className={styles.kbd}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications" title="Notifications">
          <Bell size={15} strokeWidth={2} />
          <span className={styles.notifDot} />
        </button>

        {/* Avatar group */}
        <div className={styles.avatarGroup} aria-label="Active team members">
          {TEAM_AVATARS.map((av, i) => (
            <div
              key={i}
              className={styles.avatar}
              style={{ background: av.color, zIndex: TEAM_AVATARS.length - i }}
              title={av.name}
              role="img"
              aria-label={av.name}
            >
              {av.initial}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
