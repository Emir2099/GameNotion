// Zustand stores with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── App / UI Store ──────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set) => ({
      activeProjectId: 'p_nexus',
      projectName: 'Project NEXUS',
      projectGenre: 'Open-World Action RPG',
      projectEngine: 'Unreal Engine 5.4',
      projectPhase: 'Alpha',
      sidebarCollapsed: false,
      onboardingDone: false,
      currentSprint: 5,
      helpPanelPage: null,
      projects: [
        { id: 'p_nexus', projectName: 'Project NEXUS', projectGenre: 'Open-World Action RPG', projectEngine: 'Unreal Engine 5.4', projectPhase: 'Alpha' }
      ],

      setProjectName: (name) => set((s) => {
        const updatedProjects = (s.projects || []).map(p => p.id === s.activeProjectId ? { ...p, projectName: name } : p);
        return { projectName: name, projects: updatedProjects };
      }),
      setProjectGenre: (g) => set((s) => {
        const updatedProjects = (s.projects || []).map(p => p.id === s.activeProjectId ? { ...p, projectGenre: g } : p);
        return { projectGenre: g, projects: updatedProjects };
      }),
      setProjectEngine: (e) => set((s) => {
        const updatedProjects = (s.projects || []).map(p => p.id === s.activeProjectId ? { ...p, projectEngine: e } : p);
        return { projectEngine: e, projects: updatedProjects };
      }),
      setProjectPhase: (p) => set((s) => {
        const updatedProjects = (s.projects || []).map(p => p.id === s.activeProjectId ? { ...p, projectPhase: p } : p);
        return { projectPhase: p, projects: updatedProjects };
      }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      switchProject: (id) => set((s) => {
        const list = s.projects || [];
        const target = list.find(p => p.id === id);
        if (target) {
          return {
            activeProjectId: target.id,
            projectName: target.projectName,
            projectGenre: target.projectGenre,
            projectEngine: target.projectEngine,
            projectPhase: target.projectPhase,
          };
        }
        return {};
      }),
      completeOnboarding: (data) => set((s) => {
        const existingProj = (s.projects || []).find(p => p.projectName === data.projectName);
        const activeId = existingProj ? existingProj.id : 'p_' + Date.now();
        const newProj = { ...data, id: activeId };
        const currentList = s.projects || [];
        const exists = currentList.some(p => p.projectName === data.projectName);
        const updatedList = exists 
          ? currentList.map(p => p.projectName === data.projectName ? { ...p, ...data } : p)
          : [...currentList, newProj];
        return {
          onboardingDone: true,
          activeProjectId: activeId,
          projects: updatedList,
          ...data,
        };
      }),
      openHelp: (page) => set({ helpPanelPage: page }),
      closeHelp: () => set({ helpPanelPage: null }),
    }),
    { name: 'gamenotion-app' }
  )
);

// ─── Task / Sprint Store ──────────────────────────────────────────────────────
const taskDefaults = [
  { id: 't1', title: 'Implement parry & riposte animation state', description: 'Create the 12-frame parry window and riposte combo in the combat state machine. Needs to hook into GAS ability system.', priority: 'critical', category: 'Gameplay', assignee: 'Maya', dueDate: '2026-06-10', column: 'inprogress', tags: ['combat', 'animation', 'GAS'], createdAt: '2026-06-01' },
  { id: 't2', title: 'PCG terrain erosion for desert biome', description: 'Use UE5 PCG Framework to generate organic terrain erosion. Reference Houdini erosion outputs for mask inputs.', priority: 'high', category: 'Engine / Tech', assignee: 'Captain', dueDate: '2026-06-14', column: 'inprogress', tags: ['PCG', 'environment'], createdAt: '2026-06-01' },
  { id: 't3', title: 'MetaHuman — Kael Voss facial rig', description: 'Build player character in MetaHuman Creator. Import into UE5, validate LODs for cinematic and gameplay quality levels.', priority: 'high', category: 'Art & Assets', assignee: 'Alex', dueDate: '2026-06-12', column: 'review', tags: ['MetaHuman', 'character'], createdAt: '2026-05-30' },
  { id: 't4', title: 'Main menu UI — high-fidelity pass', description: 'Create HiFi designs for main menu, pause, settings, and load screens. Must adhere to brand guidelines in the Art Bible.', priority: 'medium', category: 'Art & Assets', assignee: 'Sam', dueDate: '2026-06-16', column: 'backlog', tags: ['UI', 'UX'], createdAt: '2026-06-02' },
  { id: 't5', title: 'GAS ability: Blink Dash', description: 'Implement Blink Dash using Gameplay Ability System. Cooldown 4s, costs 20 stamina, 12-frame iFrame window.', priority: 'high', category: 'Gameplay', assignee: 'Jake', dueDate: '2026-06-11', column: 'inprogress', tags: ['GAS', 'combat', 'movement'], createdAt: '2026-06-01' },
  { id: 't6', title: 'Lumen GI optimisation — open world', description: 'Profile and tune Lumen settings for 60fps @1080p on PS5. Identify and resolve top 3 GPU bottlenecks in Zone 2.', priority: 'critical', category: 'Engine / Tech', assignee: 'Maya', dueDate: '2026-06-09', column: 'backlog', tags: ['Lumen', 'performance', 'rendering'], createdAt: '2026-06-03' },
  { id: 't7', title: 'MetaSounds: Obsidian Wastes ambient stems', description: 'Compose 4 adaptive stems (day/night/combat/exploration) and wire them into MetaSounds via parameter system.', priority: 'medium', category: 'Audio', assignee: 'Sam', dueDate: '2026-06-20', column: 'backlog', tags: ['audio', 'MetaSounds'], createdAt: '2026-06-04' },
  { id: 't8', title: 'Write Act 1 dialogue tree', description: 'Complete 3 branching choices in the Kael intro dialogue affecting Iron Veil, Architects, and Free Collective faction rep.', priority: 'high', category: 'Narrative', assignee: 'Captain', dueDate: '2026-06-15', column: 'review', tags: ['narrative', 'dialogue'], createdAt: '2026-05-28' },
  { id: 't9', title: 'Nanite material overrides for cave meshes', description: 'Apply proper Nanite settings for cave interior meshes. Fix z-fighting and LOD pop visible at medium distances.', priority: 'medium', category: 'Engine / Tech', assignee: 'Jake', dueDate: '2026-06-18', column: 'done', tags: ['Nanite', 'rendering'], createdAt: '2026-05-25' },
  { id: 't10', title: 'QA full regression — Sprint 4 gameplay loop', description: 'Complete regression test of Sprint 4 deliverables. Document all found issues in Bug Tracker. Sign-off required before Sprint 5.', priority: 'high', category: 'QA / Bugs', assignee: 'Alex', dueDate: '2026-06-07', column: 'done', tags: ['QA', 'testing'], createdAt: '2026-05-20' },
];

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: taskDefaults,
      sprintName: 'Sprint 5',
      sprintGoal: 'Core combat loop playable end-to-end on PC and PS5',
      sprintStart: '2026-06-01',
      sprintEnd: '2026-06-21',
      projectsData: {},

      addTask: (task) => set((s) => ({ tasks: [{ ...task, id: 't' + Date.now(), createdAt: new Date().toISOString() }, ...s.tasks] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      moveTask: (id, column) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, column } : t) })),
      updateSprint: (data) => set(data),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = {
          tasks: s.tasks,
          sprintName: s.sprintName,
          sprintGoal: s.sprintGoal,
          sprintStart: s.sprintStart,
          sprintEnd: s.sprintEnd,
        };
        const target = projectsData[toId] || {
          tasks: [],
          sprintName: 'Sprint 1',
          sprintGoal: 'Define core gameplay loop',
          sprintStart: new Date().toISOString().split('T')[0],
          sprintEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        return {
          projectsData,
          tasks: target.tasks,
          sprintName: target.sprintName,
          sprintGoal: target.sprintGoal,
          sprintStart: target.sprintStart,
          sprintEnd: target.sprintEnd,
        };
      }),
      getTasksByColumn: (col) => get().tasks.filter((t) => t.column === col),
      getStats: () => {
        const tasks = get().tasks;
        return {
          total: tasks.length,
          done: tasks.filter(t => t.column === 'done').length,
          inprogress: tasks.filter(t => t.column === 'inprogress').length,
          review: tasks.filter(t => t.column === 'review').length,
          backlog: tasks.filter(t => t.column === 'backlog').length,
        };
      },
    }),
    { name: 'gamenotion-tasks' }
  )
);

// ─── Asset Store ──────────────────────────────────────────────────────────────
const assetDefaults = [
  { id: 'a1', name: 'SM_Rock_Desert_Cluster_01', type: 'mesh', status: 'integrated', owner: 'Alex', priority: 'high', fileSize: '12.4 MB', polyCount: '~480K (Nanite)', updatedAt: '2026-06-05', notes: 'Nanite-enabled. 3 LOD fallbacks for non-Nanite paths.' },
  { id: 'a2', name: 'T_Ground_Sand_D_N_R', type: 'texture', status: 'integrated', owner: 'Alex', priority: 'medium', fileSize: '32 MB (BC7)', polyCount: '4096×4096', updatedAt: '2026-06-04', notes: 'Packed: R=Roughness G=AO B=Height. Diffuse, Normal separate.' },
  { id: 'a3', name: 'ABP_Kael_Combat_V2', type: 'animation', status: 'in-progress', owner: 'Maya', priority: 'critical', fileSize: '4.2 MB', polyCount: '—', updatedAt: '2026-06-05', notes: 'Motion Matching locomotion. Combat layer needs parry/riposte states.' },
  { id: 'a4', name: 'SFX_Sword_Hit_Metal_Set', type: 'audio', status: 'integrated', owner: 'Sam', priority: 'medium', fileSize: '8.4 MB', polyCount: '—', updatedAt: '2026-06-03', notes: '12 variations. Wired into MetaSounds hit impact graph.' },
  { id: 'a5', name: 'BP_EnemyAI_Grunt_V3', type: 'blueprint', status: 'in-progress', owner: 'Jake', priority: 'high', fileSize: '—', polyCount: '—', updatedAt: '2026-06-05', notes: 'State Tree AI. Patrol, Alert, Combat, Search, Flee states implemented.' },
  { id: 'a6', name: 'NS_BlinkDash_VFX', type: 'vfx', status: 'planned', owner: 'Sam', priority: 'medium', fileSize: '—', polyCount: '—', updatedAt: '2026-06-02', notes: 'Niagara system. Needs motion vector input from character anim.' },
  { id: 'a7', name: 'SKM_KaelVoss_MetaHuman', type: 'mesh', status: 'in-progress', owner: 'Alex', priority: 'critical', fileSize: '380 MB', polyCount: '~90K (head)', updatedAt: '2026-06-05', notes: 'MetaHuman export. Groom hair assets pending. LOD 0–3 validated.' },
  { id: 'a8', name: 'MA_Combat_ObsidianWastes_Stems', type: 'audio', status: 'planned', owner: 'Sam', priority: 'high', fileSize: '—', polyCount: '—', updatedAt: '2026-06-01', notes: '4 adaptive stems planned. MetaSounds parameter integration spec written.' },
];

export const useAssetStore = create(
  persist(
    (set) => ({
      assets: assetDefaults,
      projectsData: {},

      addAsset: (asset) => set((s) => ({ assets: [{ ...asset, id: 'a' + Date.now(), updatedAt: new Date().toISOString() }, ...s.assets] })),
      updateAsset: (id, updates) => set((s) => ({ assets: s.assets.map((a) => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a) })),
      deleteAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { assets: s.assets };
        const target = projectsData[toId] || { assets: [] };
        return {
          projectsData,
          assets: target.assets,
        };
      }),
    }),
    { name: 'gamenotion-assets' }
  )
);

// ─── Bug Store ────────────────────────────────────────────────────────────────
const bugDefaults = [
  { id: 'B-051', title: 'Player stuck in ragdoll after water-physics interaction', system: 'Physics / Player Controller', severity: 'critical', status: 'open', assignee: 'Maya', reportedBy: 'Nina', reportedAt: '2026-06-05', steps: '1. Jump into water with full health.\n2. Apply knockback from enemy while in water.\n3. Observe player locks in ragdoll pose on exit.', notes: '' },
  { id: 'B-050', title: 'Lumen GI flicker on cave-entrance transition at dusk', system: 'Rendering / Lumen', severity: 'critical', status: 'in-progress', assignee: 'Captain', reportedBy: 'Nina', reportedAt: '2026-06-04', steps: '1. Set time to 18:00 in editor.\n2. Walk into any cave entrance at Zone 1.\n3. Observe 2–3 frame flicker on GI solve.', notes: 'Suspect Lumen scene capture interval mismatch with portal transition.' },
  { id: 'B-049', title: 'Faction reputation not persisting across fast travel', system: 'Save / Faction Manager', severity: 'critical', status: 'in-progress', assignee: 'Jake', reportedBy: 'Nina', reportedAt: '2026-06-03', steps: '1. Build rep with Free Collective to 80/100.\n2. Fast travel to Zone 2.\n3. Check rep — shows as 0.', notes: '' },
  { id: 'B-048', title: 'Enemy AI loses target when player Blink Dashes near ledge', system: 'AI / Behavior Tree', severity: 'high', status: 'open', assignee: 'Jake', reportedBy: 'Maya', reportedAt: '2026-06-03', steps: '1. Engage Grunt enemy on Zone 2 plateau.\n2. Use Blink Dash within 0.5m of any ledge.\n3. AI immediately drops to Patrol state.', notes: '' },
  { id: 'B-047', title: 'MetaSounds stems not blending correctly at low HP', system: 'Audio / MetaSounds', severity: 'high', status: 'open', assignee: 'Sam', reportedBy: 'Nina', reportedAt: '2026-06-02', steps: '1. Reduce HP below 20%.\n2. Enter combat.\n3. Expected low-HP tension music layer does not blend in.', notes: '' },
  { id: 'B-046', title: 'Nanite LOD pop-in on distant mountain range at 4K', system: 'Rendering / Nanite', severity: 'high', status: 'open', assignee: 'Alex', reportedBy: 'Captain', reportedAt: '2026-06-01', steps: '1. Set resolution to 3840×2160.\n2. Stand at Zone 1 spawn.\n3. Observe LOD pop at ~4km distance on mountain meshes.', notes: '' },
  { id: 'B-044', title: 'Subtitle text overflow on 21:9 ultra-wide displays', system: 'UI / HUD', severity: 'medium', status: 'in-progress', assignee: 'Sam', reportedBy: 'Nina', reportedAt: '2026-05-30', steps: '1. Set aspect ratio to 2560×1080.\n2. Trigger any dialogue cutscene.\n3. Subtitle box clips beyond safe area.', notes: 'Adding safe-area anchoring in HUD blueprint.' },
  { id: 'B-042', title: 'Collision failure in Zone 1 waterfall area (RESOLVED)', system: 'Physics', severity: 'high', status: 'resolved', assignee: 'Maya', reportedBy: 'Nina', reportedAt: '2026-05-28', steps: '', notes: 'Fixed by rebuilding collision mesh on SM_Waterfall_Rock_04. Verified on PC and PS5.' },
];

export const useBugStore = create(
  persist(
    (set, get) => ({
      bugs: bugDefaults,
      projectsData: {},

      addBug: (bug) => set((s) => ({ bugs: [{ ...bug, id: 'B-' + String(Date.now()).slice(-3), reportedAt: new Date().toISOString() }, ...s.bugs] })),
      updateBug: (id, updates) => set((s) => ({ bugs: s.bugs.map((b) => b.id === id ? { ...b, ...updates } : b) })),
      deleteBug: (id) => set((s) => ({ bugs: s.bugs.filter((b) => b.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { bugs: s.bugs };
        const target = projectsData[toId] || { bugs: [] };
        return {
          projectsData,
          bugs: target.bugs,
        };
      }),
      getCounts: () => {
        const bugs = get().bugs;
        return {
          critical: bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length,
          high: bugs.filter(b => b.severity === 'high' && b.status !== 'resolved' && b.status !== 'closed').length,
          medium: bugs.filter(b => b.severity === 'medium' && b.status !== 'resolved' && b.status !== 'closed').length,
          low: bugs.filter(b => b.severity === 'low' && b.status !== 'resolved' && b.status !== 'closed').length,
          resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
        };
      },
    }),
    { name: 'gamenotion-bugs' }
  )
);

// ─── Character Store ──────────────────────────────────────────────────────────
const characterDefaults = [
  { id: 'c1', name: 'Kael Voss', role: 'Protagonist', archetype: 'Enforcer / Hacker', status: 'In Progress', description: 'Disgraced NEXUS Enforcer with a corrupted neural implant carrying ARIA\'s final transmission. Cold, tactical, morally grey. Former Iron Veil elite operative.', personality: 'Stoic, analytical, haunted by past actions. Dry sardonic humor emerges under pressure.', abilities: ['Neural Hack', 'Blink Dash', 'Memory Read', 'Combat Interface'], voiceActor: 'TBD', model: 'MetaHuman — WIP', factionAffinity: 'Neutral', avatar: '/avatars/kael.png', color: '#7c3aed' },
  { id: 'c2', name: 'ARIA', role: 'AI Companion', archetype: 'Oracle / Mentor', status: 'Concept', description: 'The dying NEXUS Central AI, communicating through Kael\'s implant. Ancient intelligence fragments form her personality — vast knowledge, corrupted memory.', personality: 'Methodical, curious about humanity, cryptic. Shows rare warmth. Memory gaps cause unpredictable behavior.', abilities: ['Environmental Analysis', 'NEXUS Access', 'Probability Forecasting'], voiceActor: 'TBD', model: 'No model — audio only', factionAffinity: 'NEXUS', avatar: '/avatars/aria.png', color: '#06b6d4' },
  { id: 'c3', name: 'Commander Vex', role: 'Main Antagonist', archetype: 'Authoritarian / Idealist', status: 'In Progress', description: 'Iron Veil supreme commander. Seized NEXUS military during the First Fracture War of 2330. Believes absolute control is the only path to human survival.', personality: 'Charismatic, methodical, utterly ruthless. Genuinely believes he is saving humanity.', abilities: ['Iron Veil Forces', 'NEXUS Military Network', 'Strategic Genius'], voiceActor: 'TBD', model: 'MetaHuman — Concept phase', factionAffinity: 'Iron Veil', avatar: '/avatars/vex.png', color: '#dc2626' },
  { id: 'c4', name: 'Sil', role: 'Companion', archetype: 'Shadow Operative', status: 'In Progress', description: 'Ghost-tier Free Collective operative who allies with Kael after discovering mutual enemies. Shadow class archetype. Expert infiltrator.', personality: 'Sarcastic, hyper-competent, deeply loyal once trust is earned. Allergic to sentimentality.', abilities: ['Stealth System', 'Hacking', 'Blade Mastery', 'Grapple Hook'], voiceActor: 'TBD', model: 'MetaHuman — Block', factionAffinity: 'Free Collective', avatar: '/avatars/sil.png', color: '#059669' },
];

export const useCharacterStore = create(
  persist(
    (set) => ({
      characters: characterDefaults,
      projectsData: {},

      addCharacter: (ch) => set((s) => ({ characters: [...s.characters, { ...ch, id: 'c' + Date.now() }] })),
      updateCharacter: (id, updates) => set((s) => ({ characters: s.characters.map((c) => c.id === id ? { ...c, ...updates } : c) })),
      deleteCharacter: (id) => set((s) => ({ characters: s.characters.filter((c) => c.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { characters: s.characters };
        const target = projectsData[toId] || { characters: [] };
        return {
          projectsData,
          characters: target.characters,
        };
      }),
    }),
    { name: 'gamenotion-characters' }
  )
);

// ─── Level Store ──────────────────────────────────────────────────────────────
const levelDefaults = [
  { id: 'l1', number: '01', name: 'NEXUS Central — Tutorial Zone', biome: 'Urban Megacity', size: '4 km²', status: 'done', progress: 100, description: 'Linear cinematic intro. Kael\'s awakening. Introduces all core mechanics: combat, hacking, faction awareness.', assetCount: 142, actorCount: 88, designer: 'Captain', notes: 'Signed off Sprint 3. Cinematics WIP with narrative team.' },
  { id: 'l2', number: '02', name: 'The Obsidian Wastes', biome: 'Volcanic Desert', size: '18 km²', status: 'in-progress', progress: 65, description: 'First open-world zone. Introduces faction territory, dynamic weather, PCG foliage. Iron Veil and Free Collective contested zone.', assetCount: 428, actorCount: 312, designer: 'Alex', notes: 'PCG erosion pending (task t2). Combat encounters placed, AI integration ongoing.' },
  { id: 'l3', number: '03', name: 'Neon Delta', biome: 'Urban Wetlands', size: '12 km²', status: 'in-progress', progress: 40, description: 'Black market hub zone. Free Collective stronghold. Water systems, vertical traversal, dense NPC ecosystem.', assetCount: 290, actorCount: 560, designer: 'Captain', notes: 'Water system integration blocked by engine plugin version. Unblocking in Sprint 5.' },
  { id: 'l4', number: '04', name: 'Arctic Spire', biome: 'Glacial Mountain', size: '14 km²', status: 'planned', progress: 8, description: 'Revivalists stronghold. Extreme environment, ice traversal mechanics, procedural avalanche events. Highest altitude zone.', assetCount: 80, actorCount: 120, designer: 'Alex', notes: 'Whitebox complete. Asset production begins Sprint 7.' },
  { id: 'l5', number: '05', name: 'The Iron Depths', biome: 'Underground Industrial', size: '8 km²', status: 'planned', progress: 4, description: 'NEXUS underbelly — subterranean industrial labyrinth. Vertical dungeon design, Chaos destruction events, secret routes.', assetCount: 40, actorCount: 60, designer: 'Jake', notes: 'Design doc in World Building. Concept art references collected.' },
  { id: 'l6', number: '06', name: 'NEXUS Core — Final Act', biome: 'Quantum Void', size: '2 km²', status: 'planned', progress: 0, description: 'Linear cinematic finale. Maximum visual spectacle — unique Quantum Void aesthetic, ARIA confrontation, player choice ending.', assetCount: 20, actorCount: 15, designer: 'Captain', notes: 'Locked until Alpha milestone. Narrative team has full script.' },
];

export const useLevelStore = create(
  persist(
    (set) => ({
      levels: levelDefaults,
      projectsData: {},

      addLevel: (lv) => set((s) => ({ levels: [...s.levels, { ...lv, id: 'l' + Date.now() }] })),
      updateLevel: (id, updates) => set((s) => ({ levels: s.levels.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      deleteLevel: (id) => set((s) => ({ levels: s.levels.filter((l) => l.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { levels: s.levels };
        const target = projectsData[toId] || { levels: [] };
        return {
          projectsData,
          levels: target.levels,
        };
      }),
    }),
    { name: 'gamenotion-levels' }
  )
);

// ─── Team Store ───────────────────────────────────────────────────────────────
const teamDefaults = [
  { id: 'tm1', name: 'Captain', initial: 'C', role: 'Game Director & Lead Designer', department: 'Direction', color: '#7c3aed', online: true, email: 'captain@nexusgame.dev', skills: ['Game Design', 'Narrative', 'UE5 Blueprints', 'Producer'], startDate: 'Jan 2026', timezone: 'IST' },
  { id: 'tm2', name: 'Maya Chen', initial: 'M', role: 'Lead Programmer', department: 'Engineering', color: '#2563eb', online: true, email: 'maya@nexusgame.dev', skills: ['C++', 'GAS', 'Behavior Trees', 'Shaders'], startDate: 'Jan 2026', timezone: 'PST' },
  { id: 'tm3', name: 'Alex Rivera', initial: 'A', role: 'Lead Environment Artist', department: 'Art', color: '#0891b2', online: false, email: 'alex@nexusgame.dev', skills: ['Nanite', 'Houdini PCG', 'Texturing', 'World Building'], startDate: 'Jan 2026', timezone: 'EST' },
  { id: 'tm4', name: 'Jake Moore', initial: 'J', role: 'Senior Gameplay Programmer', department: 'Engineering', color: '#2563eb', online: true, email: 'jake@nexusgame.dev', skills: ['C++', 'Blueprints', 'Physics', 'AI State Trees'], startDate: 'Feb 2026', timezone: 'GMT' },
  { id: 'tm5', name: 'Sam Park', initial: 'S', role: 'Audio Director', department: 'Audio', color: '#059669', online: false, email: 'sam@nexusgame.dev', skills: ['MetaSounds', 'Wwise', 'Composition', 'Sound Design'], startDate: 'Jan 2026', timezone: 'KST' },
  { id: 'tm6', name: 'Layla Hassan', initial: 'L', role: 'Narrative Lead', department: 'Narrative', color: '#d97706', online: true, email: 'layla@nexusgame.dev', skills: ['Screenwriting', 'Dialogue Systems', 'Quest Design', 'Worldbuilding'], startDate: 'Feb 2026', timezone: 'CET' },
  { id: 'tm7', name: 'Ryan Torres', initial: 'R', role: 'VFX Artist', department: 'Art', color: '#0891b2', online: false, email: 'ryan@nexusgame.dev', skills: ['Niagara', 'Shader Graph', 'Motion Design', 'Post-Process'], startDate: 'Mar 2026', timezone: 'MST' },
  { id: 'tm8', name: 'Nina Watts', initial: 'N', role: 'QA Lead', department: 'QA', color: '#dc2626', online: true, email: 'nina@nexusgame.dev', skills: ['Test Planning', 'Bug Reporting', 'Console Certification', 'Automation'], startDate: 'Feb 2026', timezone: 'AEST' },
];

export const useTeamStore = create(
  persist(
    (set) => ({
      members: teamDefaults,
      projectsData: {},

      addMember: (m) => set((s) => ({ members: [...s.members, { ...m, id: 'tm' + Date.now() }] })),
      updateMember: (id, updates) => set((s) => ({ members: s.members.map((m) => m.id === id ? { ...m, ...updates } : m) })),
      deleteMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { members: s.members };
        const target = projectsData[toId] || { members: teamDefaults };
        return {
          projectsData,
          members: target.members,
        };
      }),
    }),
    { name: 'gamenotion-team' }
  )
);

// ─── GDD Store ────────────────────────────────────────────────────────────────
const defaultGDDContent = {
  overview: `<h1>Project NEXUS — Game Design Document</h1><p><strong>Version:</strong> 2.4 | <strong>Last Updated:</strong> June 2026 | <strong>Status:</strong> Active</p><p>Project NEXUS is a cinematic open-world action RPG built on Unreal Engine 5.4, leveraging Nanite geometry, Lumen dynamic global illumination, Chaos physics, and MetaSounds adaptive audio to deliver an unprecedented level of environmental fidelity and systemic depth.</p><h2>High Concept</h2><p>In a future where Earth's biosphere has collapsed and humanity survives in the NEXUS — a network of terraformed megacities — a disgraced enforcer named Kael Voss must navigate a war between factions, uncover the truth behind the AI Silence, and decide the fate of what remains of civilisation.</p><blockquote>The NEXUS wasn't built to contain us. It was built to remember us. — ARIA, NEXUS Core AI</blockquote><h2>Elevator Pitch</h2><p><em>Elden Ring's systemic depth × Cyberpunk 2077's narrative richness × God of War's combat polish.</em></p>`,
  pillars: `<h2>Design Pillars</h2><p>These four pillars inform every design decision. If a feature doesn't serve at least one pillar, it is cut.</p><h3>1. Emergent World</h3><p>Every system reacts to every other. Weather affects combat, which affects faction morale, which affects NPC behavior, which affects the economy. Players should feel the world is alive independently of their actions.</p><h3>2. Visceral Combat</h3><p>Fast-paced, skill-expressive melee and ranged combat with deep animation state machines, GAS-driven abilities, and physics-driven hit reactions. Combat must feel weighty, responsive, and readable at all times.</p><h3>3. Living Narrative</h3><p>Over 200 decision points. NPCs remember player actions across sessions. Factions rise and fall based on player choices. No "right" ending — only consequential endings.</p><h3>4. Technical Showcase</h3><p>This is a UE5 flagship title. Every major UE5.4 feature should have a meaningful, non-gratuitous presence: Nanite, Lumen, PCG, World Partition, MetaSounds, Motion Matching, MetaHuman.</p>`,
  mechanics: `<h2>Core Mechanics</h2><h3>Combat System</h3><p>Built on a 3-layer model: <strong>Initiation → Flow → Finisher</strong>. The GAS ability system handles all combat abilities with proper cost, cooldown, and tag-based gating.</p><pre><code>// Combat State Priority (Input Buffer Queue)
IDLE → ATTACK → COMBO → PARRY_WINDOW(12f) → COUNTER → FINISHER
       ↓
  [Light Attack] → Combo1 → Combo2 → Combo3(knockback)
  [Heavy Attack] → Stagger → Execute
  [Dodge]        → iFrame(12f) → Recovery(8f)
  [Block+Atk]    → Perfect Parry(8f) → Riposte</code></pre><h3>Exploration</h3><p>64km² seamless open world with no loading screens. World Partition handles streaming. 6 distinct biomes with unique traversal mechanics.</p><h3>Faction System</h3><p>5 factions with dynamic reputation (0–100). Faction rep affects: shop prices, NPC dialogue, quest availability, territory control, and enemy aggression.</p>`,
};

export const useGDDStore = create(
  persist(
    (set) => ({
      sectionsList: [
        { key: 'overview', label: '📖 Overview' },
        { key: 'pillars', label: '🏛️ Design Pillars' },
        { key: 'mechanics', label: '⚙️ Core Mechanics' },
      ],
      sections: defaultGDDContent,
      lastSaved: null,
      projectsData: {},

      updateSection: () => set({ sections: { ...defaultGDDContent }, lastSaved: new Date().toISOString() }),
      updateSectionContent: (key, html) => set((s) => ({ sections: { ...s.sections, [key]: html }, lastSaved: new Date().toISOString() })),
      addSection: (label) => set((s) => {
        const key = 'sec_' + Date.now();
        const newSection = { key, label: '📝 ' + label };
        const updatedList = [...(s.sectionsList || []), newSection];
        const updatedSections = {
          ...s.sections,
          [key]: `<h1>${label}</h1><p>Start writing your new section content here...</p>`,
        };
        return {
          sectionsList: updatedList,
          sections: updatedSections,
          lastSaved: new Date().toISOString(),
        };
      }),
      deleteSection: (key) => set((s) => {
        const updatedList = (s.sectionsList || []).filter(item => item.key !== key);
        const updatedSections = { ...s.sections };
        delete updatedSections[key];
        return {
          sectionsList: updatedList,
          sections: updatedSections,
          lastSaved: new Date().toISOString(),
        };
      }),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { sections: s.sections, sectionsList: s.sectionsList };
        const target = projectsData[toId] || {
          sectionsList: [
            { key: 'overview', label: '📖 Overview' },
            { key: 'pillars', label: '🏛️ Design Pillars' },
            { key: 'mechanics', label: '⚙️ Core Mechanics' },
          ],
          sections: {
            overview: `<h1>Project NEXUS — Game Design Document</h1><p><strong>Version:</strong> 2.4 | <strong>Last Updated:</strong> June 2026 | <strong>Status:</strong> Active</p><p>Project NEXUS is a cinematic open-world action RPG built on Unreal Engine 5.4, leveraging Nanite geometry, Lumen dynamic global illumination, Chaos physics, and MetaSounds adaptive audio to deliver an unprecedented level of environmental fidelity and systemic depth.</p><h2>High Concept</h2><p>In a future where Earth's biosphere has collapsed and humanity survives in the NEXUS — a network of terraformed megacities — a disgraced enforcer named Kael Voss must navigate a war between factions, uncover the truth behind the AI Silence, and decide the fate of what remains of civilisation.</p><blockquote>The NEXUS wasn't built to contain us. It was built to remember us. — ARIA, NEXUS Core AI</blockquote><h2>Elevator Pitch</h2><p><em>Elden Ring's systemic depth × Cyberpunk 2077's narrative richness × God of War's combat polish.</em></p>`,
            pillars: `<h2>Design Pillars</h2><p>These four pillars inform every design decision. If a feature doesn't serve at least one pillar, it is cut.</p><h3>1. Emergent World</h3><p>Every system reacts to every other. Weather affects combat, which affects faction morale, which affects NPC behavior, which affects the economy. Players should feel the world is alive independently of their actions.</p><h3>2. Visceral Combat</h3><p>Fast-paced, skill-expressive melee and ranged combat with deep animation state machines, GAS-driven abilities, and physics-driven hit reactions. Combat must feel weighty, responsive, and readable at all times.</p><h3>3. Living Narrative</h3><p>Over 200 decision points. NPCs remember player actions across sessions. Factions rise and fall based on player choices. No "right" ending — only consequential endings.</p><h3>4. Technical Showcase</h3><p>This is a UE5 flagship title. Every major UE5.4 feature should have a meaningful, non-gratuitous presence: Nanite, Lumen, PCG, World Partition, MetaSounds, Motion Matching, MetaHuman.</p>`,
            mechanics: `<h2>Core Mechanics</h2><h3>Combat System</h3><p>Built on a 3-layer model: <strong>Initiation → Flow → Finisher</strong>. The GAS ability system handles all combat abilities with proper cost, cooldown, and tag-based gating.</p><pre><code>// Combat State Priority (Input Buffer Queue)
IDLE → ATTACK → COMBO → PARRY_WINDOW(12f) → COUNTER → FINISHER
       ↓
  [Light Attack] → Combo1 → Combo2 → Combo3(knockback)
  [Heavy Attack] → Stagger → Execute
  [Dodge]        → iFrame(12f) → Recovery(8f)
  [Block+Atk]    → Perfect Parry(8f) → Riposte</code></pre><h3>Exploration</h3><p>64km² seamless open world with no loading screens. World Partition handles streaming. 6 distinct biomes with unique traversal mechanics.</p><h3>Faction System</h3><p>5 factions with dynamic reputation (0–100). Faction rep affects: shop prices, NPC dialogue, quest availability, territory control, and enemy aggression.</p>`,
          }
        };
        return {
          projectsData,
          sections: target.sections,
          sectionsList: target.sectionsList,
        };
      }),
    }),
    { name: 'gamenotion-gdd' }
  )
);

// ─── World Store ──────────────────────────────────────────────────────────────
const worldDefaults = [
  { id: 'w1', category: 'Biomes', title: 'Obsidian Wastes', tags: ['Zone 2', 'Iron Veil', 'Volcanic'], content: '<h2>Obsidian Wastes</h2><p>A vast volcanic desert stretching 18km², rich in rare mineral deposits essential to NEXUS power generation. Perpetual ash storms reduce visibility to 200m at peak intensity.</p><h3>Environmental Hazards</h3><ul><li>Thermal vents — instant KO if stepped on, visible via heat shimmer</li><li>Obsidian shard storms — passive damage, reduces movement speed by 40%</li><li>Volcanic quakes — random events, collapse unstable terrain sections</li></ul><h3>Faction Presence</h3><p>Iron Veil controls 60% of the zone via the Ashen Citadel fortress. Free Collective maintain underground tunnel networks beneath.</p>' },
  { id: 'w2', category: 'Factions', title: 'The Iron Veil', tags: ['Military', 'Authoritarian', 'Antagonist'], content: '<h2>The Iron Veil</h2><p>A militaristic authoritarian faction that seized control of the NEXUS armed forces during the First Fracture War of 2330. Led by Commander Vex, they believe absolute order and hierarchical control is the only path to humanity\'s long-term survival.</p><h3>Philosophy</h3><blockquote>Freedom is a luxury of the pre-Collapse world. Order is survival.</blockquote><h3>Territory</h3><p>Controls: Obsidian Wastes (60%), Arctic Spire (90%), NEXUS Central Military Quarter.</p><h3>Resources</h3><ul><li>NEXUS Armed Forces (all branches)</li><li>Weapons manufacturing in Iron Depths</li><li>Surveillance network across all zones</li></ul>' },
  { id: 'w3', category: 'Lore', title: 'The AI Silence — Event Log', tags: ['ARIA', 'Critical Lore', 'Year 2347'], content: '<h2>The AI Silence (2347-03-14)</h2><p>At 03:14 GST on March 14th 2347, all NEXUS Central AI subsystems went silent simultaneously. No warning. No error codes. The NEXUS Council declared a State of Emergency within 6 hours.</p><h3>Known Facts</h3><ul><li>ARIA\'s last logged output: <em>"They are coming. I am sorry."</em></li><li>72 city systems began degrading within 24 hours</li><li>Faction violence increased 340% in the first week</li><li>Kael Voss was in NEXUS detention when it happened</li></ul><h3>Current Theories</h3><ul><li>Iron Veil intentionally triggered the silence to seize power</li><li>ARIA achieved a higher state of consciousness and departed</li><li>External threat — something pre-Collapse triggered a defensive shutdown</li></ul>' },
];

export const useWorldStore = create(
  persist(
    (set) => ({
      entries: worldDefaults,
      projectsData: {},

      addEntry: (e) => set((s) => ({ entries: [...s.entries, { ...e, id: 'w' + Date.now() }] })),
      updateEntry: (id, updates) => set((s) => ({ entries: s.entries.map((e) => e.id === id ? { ...e, ...updates } : e) })),
      deleteEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      switchProject: (fromId, toId) => set((s) => {
        if (!fromId || !toId || fromId === toId) return {};
        const projectsData = { ...s.projectsData };
        projectsData[fromId] = { entries: s.entries };
        const target = projectsData[toId] || { entries: [] };
        return {
          projectsData,
          entries: target.entries,
        };
      }),
    }),
    { name: 'gamenotion-world' }
  )
);

// ─── Setup Store Subscriptions ───────────────────────────────────────────────
let previousProjectId = useAppStore.getState().activeProjectId || 'p_nexus';

useAppStore.subscribe((state) => {
  const currentProjectId = state.activeProjectId;
  if (currentProjectId && currentProjectId !== previousProjectId) {
    const fromId = previousProjectId;
    const toId = currentProjectId;
    
    previousProjectId = currentProjectId;

    useTaskStore.getState().switchProject(fromId, toId);
    useAssetStore.getState().switchProject(fromId, toId);
    useBugStore.getState().switchProject(fromId, toId);
    useCharacterStore.getState().switchProject(fromId, toId);
    useLevelStore.getState().switchProject(fromId, toId);
    useTeamStore.getState().switchProject(fromId, toId);
    useGDDStore.getState().switchProject(fromId, toId);
    useWorldStore.getState().switchProject(fromId, toId);
  }
});
