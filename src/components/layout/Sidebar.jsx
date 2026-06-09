/* eslint-disable react/prop-types */
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Kanban, Package, Bug,
  Globe, Users, Map, Cpu, Flag, UsersRound,
  ChevronLeft, ChevronRight, HelpCircle,
  ChevronDown, FolderPlus, FolderKanban
} from 'lucide-react';
import { useAppStore } from '../../store';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',    icon: LayoutDashboard, section: 'main' },
  { path: '/gdd',        label: 'Game Design Doc', icon: FileText,    section: 'main', badge: 'GDD' },
  { path: '/sprints',    label: 'Sprint Board', icon: Kanban,         section: 'main', badge: null, liveCount: true },
  { path: '/assets',     label: 'Asset Manager',icon: Package,         section: 'main' },
  { path: '/bugs',       label: 'Bug Tracker',  icon: Bug,             section: 'main', criticalCount: true },
  { path: '/world',      label: 'World Building',icon: Globe,          section: 'creative' },
  { path: '/characters', label: 'Characters',   icon: Users,           section: 'creative' },
  { path: '/levels',     label: 'Level Design', icon: Map,             section: 'creative' },
  { path: '/techstack',  label: 'Tech Stack',   icon: Cpu,             section: 'technical' },
  { path: '/milestones', label: 'Milestones',   icon: Flag,            section: 'technical' },
  { path: '/team',       label: 'Team',         icon: UsersRound,      section: 'technical' },
];

const SECTIONS = [
  { key: 'main',      label: 'Workspace' },
  { key: 'creative',  label: 'Creative' },
  { key: 'technical', label: 'Technical' },
];

function ProjectSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const projects = useAppStore(s => s.projects) || [];
  const projectName = useAppStore(s => s.projectName);
  const projectPhase = useAppStore(s => s.projectPhase);
  const switchProject = useAppStore(s => s.switchProject);

  const handleCreateNew = () => {
    useAppStore.setState({
      onboardingDone: false,
      projectName: '',
      projectGenre: 'Open-World Action RPG',
      projectEngine: 'Unreal Engine 5.4',
      projectPhase: 'Alpha'
    });
    setIsOpen(false);
  };

  return (
    <div className={styles.switcherWrap}>
      <button
        type="button"
        className={styles.projectPillBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.phaseDot} />
        <span className={styles.projectName}>{projectName || 'Select Project…'}</span>
        <span className={styles.phaseLabel}>{projectPhase}</span>
        <ChevronDown size={12} className={`${styles.switcherChevron} ${isOpen ? styles.switcherChevronOpen : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className={styles.switcherBackdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.switcherDropdown}>
            <div className={styles.switcherHeader}>Switch Project</div>
            <div className={styles.projectsList}>
              {projects.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.projectOption} ${projectName === p.projectName ? styles.projectOptionActive : ''}`}
                  onClick={() => {
                    switchProject(p.id);
                    setIsOpen(false);
                  }}
                >
                  <FolderKanban size={12} />
                  <div className={styles.projectOptionInfo}>
                    <div className={styles.projectOptionName}>{p.projectName}</div>
                    <div className={styles.projectOptionDesc}>{p.projectEngine} · {p.projectPhase}</div>
                  </div>
                </button>
              ))}
              {projects.length === 0 && (
                <div className={styles.noProjects}>No saved projects.</div>
              )}
            </div>
            
            <div className={styles.switcherDivider} />
            
            <button
              type="button"
              className={styles.createProjectBtn}
              onClick={handleCreateNew}
            >
              <FolderPlus size={12} />
              <span>Create New Project</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Sidebar({ taskStats, bugCounts }) {
  const collapsed = useAppStore(s => s.sidebarCollapsed);
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const openHelp = useAppStore(s => s.openHelp);
  const location = useLocation();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        {!collapsed ? (
          <>
            <div className={styles.brandIcon} style={{ background: 'none', boxShadow: 'none', borderRadius: '4px', overflow: 'hidden' }}>
              <img src="/logo.png" alt="GameNotion Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>GameNotion</span>
              <span className={styles.brandSub}>UE5 Workspace</span>
            </div>
            <button
              className={styles.collapseBtn}
              onClick={toggleSidebar}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </>
        ) : (
          <div className={styles.brandIconCollapsed} onClick={toggleSidebar} title="Expand sidebar">
            <img src="/logo.png" alt="GameNotion Logo" style={{ width: '24px', height: '24px', objectFit: 'cover' }} />
            <div className={styles.collapseBtnOverlay}>
              <ChevronRight size={12} />
            </div>
          </div>
        )}
      </div>

      {/* Project Switcher Pill */}
      {!collapsed && <ProjectSwitcher />}

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        {SECTIONS.map(section => {
          const items = NAV_ITEMS.filter(i => i.section === section.key);
          return (
            <div key={section.key} className={styles.navSection}>
              {!collapsed && (
                <span className={styles.sectionLabel}>{section.label}</span>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                // Compute dynamic badges
                let dynamicBadge = item.badge;
                if (item.criticalCount && bugCounts?.critical > 0) {
                  dynamicBadge = String(bugCounts.critical);
                }
                if (item.liveCount && taskStats) {
                  const inProgress = taskStats.inprogress || 0;
                  if (inProgress > 0) dynamicBadge = String(inProgress);
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={styles.navIcon} />
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    {!collapsed && dynamicBadge && (
                      <span className={`${styles.navBadge} ${item.criticalCount ? styles.badgeRed : ''}`}>
                        {dynamicBadge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={styles.bottom}>
        <button
          className={styles.helpBtn}
          onClick={() => openHelp(location.pathname)}
          title="Help & Keyboard Shortcuts"
          aria-label="Help"
        >
          <HelpCircle size={16} />
          {!collapsed && <span>Help & Shortcuts</span>}
        </button>
      </div>
    </aside>
  );
}
