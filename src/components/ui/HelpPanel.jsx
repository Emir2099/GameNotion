import React, { useState, useMemo } from 'react';
import { X, Keyboard, BookOpen, Lightbulb, Search, Cpu, Terminal, Compass } from 'lucide-react';
import styles from './HelpPanel.module.css';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], description: 'Open global search / command palette' },
  { keys: ['Esc'],     description: 'Close active modal or panel' },
  { keys: ['Tab'],     description: 'Navigate buttons and form inputs' },
  { keys: ['/'],       description: 'Trigger Slash block commands inside GDD Editor' },
  { keys: ['Ctrl', 'B'], description: 'Toggle Bold text inside GDD Editor' },
  { keys: ['Ctrl', 'I'], description: 'Toggle Italic text inside GDD Editor' },
  { keys: ['Ctrl', 'Shift', 'H'], description: 'Highlight text inside GDD Editor' },
];

const UE5_TECH_HANDBOOK = [
  {
    term: 'GAS (Gameplay Ability System)',
    category: 'Gameplay Systems',
    desc: 'An actor framework for building complex RPG status effects, execution formulas, cooldowns, and combat combos. Integrates tightly with Gameplay Tags (e.g., "Ability.Combat.BlinkDash").',
    tip: 'Ensure all ability slots are gated via tag blocks (e.g. Block status blocks BlinkDash input).'
  },
  {
    term: 'Lumen Dynamic GI',
    category: 'Rendering',
    desc: 'Unreal Engine 5\'s fully dynamic global illumination and reflections solve. Simulates light bounces, ambient occlusion, and emissive material glow in real-time.',
    tip: 'For dark areas or sunset transition solves (Dusk/Dawn), configure Lumen scene capture intervals dynamically to prevent flickering (Ref bug B-050).'
  },
  {
    term: 'Nanite Geometry',
    category: 'Rendering',
    desc: 'Virtualized micropolygon system that bypasses traditional LOD meshes by dynamically streaming cluster triangles. Saves memory and eliminates asset popping.',
    tip: 'Flag high-poly environment assets with "Nanite-enabled" and specify 3 fallback LODs for non-Nanite platforms in the Asset Manager.'
  },
  {
    term: 'State Tree AI',
    category: 'AI / Navigation',
    desc: 'A hierarchical state machine system replacing complex Behavior Trees. Combines state logic, transitions, and tasks into simple graphical graphs.',
    tip: 'When building enemy AI, separate Alert, Combat, and Patrol phases with conditional transitions linked to player distance tags (Ref task t5).'
  },
  {
    term: 'PCG (Procedural Content Generation)',
    category: 'World Building',
    desc: 'Visual scripting tools to generate foliage density, rock clusters, and environmental layouts procedurally within bounds or along terrain slopes.',
    tip: 'Create source mask grids in Houdini, then import them into PCG graphs to generate natural volcanic sand erosion patterns (Ref task t2).'
  },
];

const PAGE_TIPS = {
  '/': [
    'The dashboard gathers metrics across all stores. View recent logs to monitor what Alex, Maya, and Jake are committing in real-time.',
    'Review the Sprint Progress bar; it dynamically tracks completed tasks relative to total tasks.',
    'Quick notes on the right are persistent across reload cycles.',
  ],
  '/sprints': [
    'Drag-and-drop works by clicking the grip handle of any card and sliding it into another column.',
    'Columns use useDroppable zones, meaning you can easily move tasks into empty columns.',
    'Use the filter dropdowns to isolate tasks assigned to Maya (Programming) or Alex (Art).',
  ],
  '/gdd': [
    'Type "/" inside the text block area to trigger the inline command menu for Headings, Bullet Lists, checkable Task Items, or 3x3 Tables.',
    'The editor saves automatically on keystrokes. Export as HTML at any time to share specs with stakeholders.',
  ],
  '/assets': [
    'Search assets using partial name matches (e.g., "SM_" for static meshes, "BP_" for blueprints).',
    'Sort headers are fully interactive. Click "Asset Name" or "Priority" to reorder files.',
  ],
  '/bugs': [
    'The severity filters at the top (Critical, High, Medium, Low) are clickable and toggle current list results.',
    'Reported steps are formatted inside code-blocks to maintain readability of terminal logs.',
  ],
  '/world': [
    'Create wiki-style lore, biome and faction entries. Filter entries by category and search dynamically across tags like Volcanic, Year 2347, or Military.',
    'Lore entries support standard HTML structures. Use the custom templates to speed up world-building.'
  ],
  '/characters': [
    'Build your cast list. Set character status (Concept, In Progress, Review, Final), assign archetypes and faction affinities.',
    'Use the local file uploader or specify a custom URL to upload character avatar portraits directly from your device.'
  ],
  '/levels': [
    'Track biome sizes, level progress (%), actor counts, and asset dependencies. Assign level designers and document blocking issues on each area.',
    'Level design entries automatically hook into asset metrics to track memory footprint.'
  ],
  '/techstack': [
    'Configure engine properties, graphics configuration (Lumen, Nanite, Ray Tracing, Virtual Textures), and build settings.',
    'Tracks compiler versions, active SDK modules, and custom Unreal Engine/Unity plugin versions.'
  ],
  '/milestones': [
    'Track project milestones and roadmap phases. Add goals, link related bugs or tasks, and monitor milestone health stats.',
    'Completed tasks from the Sprint Board dynamically update milestone target health bars.'
  ],
  '/team': [
    'Manage your studio team crew. Assign roles, departments, timezones, and skills.',
    'Click on individual profiles to edit credentials, time offsets, and current task loading.'
  ],
};

export function HelpPanel({ currentPath, onClose }) {
  const [activeTab, setActiveTab] = useState('tips'); // 'tips' | 'tech' | 'keys'
  const [searchQuery, setSearchQuery] = useState('');

  const tips = PAGE_TIPS[currentPath] || PAGE_TIPS['/'];

  const filteredHandbook = useMemo(() => {
    return UE5_TECH_HANDBOOK.filter(h =>
      h.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel} role="complementary" aria-label="Help Panel">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Compass size={16} className={styles.pulseIcon} />
            <span>Diagnostics & Guide</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close help panel">
            <X size={15} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBox}>
          <Search size={12} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'tips' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            <Lightbulb size={12} />
            Tips
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tech' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tech')}
          >
            <Cpu size={12} />
            UE5 Tech Handbook
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'keys' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <Keyboard size={12} />
            Shortcuts
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.body}>
          {activeTab === 'tips' && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Contextual Help ({currentPath === '/' ? 'Dashboard' : currentPath.slice(1).toUpperCase()})</div>
              <ul className={styles.tipsList}>
                {tips.map((tip, i) => (
                  <li key={i} className={styles.tipItem}>
                    <span className={styles.tipIcon}>💡</span>
                    <div className={styles.tipText}>{tip}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>AAA Production Reference</div>
              <div className={styles.handbookList}>
                {filteredHandbook.map(item => (
                  <div key={item.term} className={styles.handbookItem}>
                    <div className={styles.handbookHeader}>
                      <span className={styles.handbookTerm}>{item.term}</span>
                      <span className={styles.handbookBadge}>{item.category}</span>
                    </div>
                    <p className={styles.handbookDesc}>{item.desc}</p>
                    <div className={styles.handbookTip}>
                      <strong>Protip:</strong> {item.tip}
                    </div>
                  </div>
                ))}
                {filteredHandbook.length === 0 && (
                  <div className={styles.noResults}>No tech reference matches your query.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Keyboard Shortcuts</div>
              <div className={styles.shortcutsList}>
                {SHORTCUTS.map((s, i) => (
                  <div key={i} className={styles.shortcutRow}>
                    <div className={styles.shortcutKeys}>
                      {s.keys.map((k, j) => (
                        <kbd key={j} className={styles.key}>{k}</kbd>
                      ))}
                    </div>
                    <span className={styles.shortcutDesc}>{s.description}</span>
                  </div>
                ))}
              </div>

              <div className={styles.sectionLabel} style={{ marginTop: 20 }}>GDD slash commands (TipTap)</div>
              <div className={styles.cmdGrid}>
                {[
                  ['/h1', 'Heading 1'], ['/h2', 'Heading 2'], ['/h3', 'Heading 3'],
                  ['/code', 'Code Block'], ['/quote', 'Blockquote'], ['/table', 'Insert Table'],
                  ['/task', 'Task List'], ['/hr', 'Divider'],
                ].map(([cmd, label]) => (
                  <div key={cmd} className={styles.cmdRow}>
                    <kbd className={styles.cmdKey}>{cmd}</kbd>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span>GameNotion Diagnostic Drawer · v2.1</span>
        </div>
      </aside>
    </div>
  );
}
