import React, { useState } from 'react';
import {
  Gamepad2, Cpu, Users, CheckCircle2, ChevronRight, ChevronLeft, Trash2, Plus, UsersRound, Settings,
  FileText, Layers, Flame, FlaskConical, Trophy, Swords, Target, EyeOff, Globe, Gauge, HelpCircle, Rocket, Wrench, Kanban, Bug, BookOpen, Package, GitCommit
} from 'lucide-react';
import { useAppStore, useTeamStore } from '../../store';
import { Button } from '../ui/Button';
import styles from './Onboarding.module.css';

const GENRES = [
  'Open-World Action RPG', 'First-Person Shooter', 'Third-Person Action',
  'Survival Horror', 'Strategy / RTS', 'Platformer', 'Stealth Action',
  'MMO / Online RPG', 'Sports / Racing', 'Other',
];

const BASE_ENGINES = ['Unreal Engine', 'Unity', 'Godot', 'Custom Engine'];

const ENGINE_VERSION_DEFAULTS = {
  'Unreal Engine': '5.4',
  'Unity': '6',
  'Godot': '4.2',
  'Custom Engine': '1.0',
};

const PHASES = ['Pre-Production', 'Vertical Slice', 'Alpha', 'Beta', 'Gold Master'];

const STEPS = [
  { icon: Gamepad2, label: 'Project Info' },
  { icon: Cpu,      label: 'Engine & Genre' },
  { icon: Users,    label: 'Team Lead' },
  { icon: CheckCircle2, label: "You're Ready!" },
];

const DEFAULT_AAA_CREW = [
  { id: 'tm1', name: 'Captain', initial: 'C', role: 'Game Director & Lead Designer', department: 'Direction', color: '#7c3aed', online: true, email: 'captain@nexusgame.dev', skills: ['Game Design', 'Narrative', 'UE5 Blueprints'], startDate: 'Jan 2026', timezone: 'IST' },
  { id: 'tm2', name: 'Maya Chen', initial: 'M', role: 'Lead Programmer', department: 'Engineering', color: '#2563eb', online: true, email: 'maya@nexusgame.dev', skills: ['C++', 'GAS', 'Behavior Trees'], startDate: 'Jan 2026', timezone: 'PST' },
  { id: 'tm3', name: 'Alex Rivera', initial: 'A', role: 'Lead Environment Artist', department: 'Art', color: '#0891b2', online: false, email: 'alex@nexusgame.dev', skills: ['Nanite', 'Houdini PCG'], startDate: 'Jan 2026', timezone: 'EST' },
  { id: 'tm4', name: 'Nina Watts', initial: 'N', role: 'QA Lead', department: 'QA', color: '#dc2626', online: true, email: 'nina@nexusgame.dev', skills: ['QA', 'Testing'], startDate: 'Feb 2026', timezone: 'AEST' },
];

// Helper to resolve dynamic Lucide icons for dropdown choices
function getOptionIcon(opt) {
  if (!opt) return <HelpCircle size={12} />;
  const o = opt.toLowerCase();
  
  // Versions
  if (/^\d+(\.\d+)*(\s+LTS)?$/.test(opt.trim())) {
    return <GitCommit size={12} style={{ color: 'var(--cyan-light)' }} />;
  }

  // Phases
  if (o.includes('pre-production')) return <FileText size={12} style={{ color: 'var(--brand-300)' }} />;
  if (o.includes('vertical slice')) return <Layers size={12} style={{ color: 'var(--blue-light)' }} />;
  if (o.includes('alpha')) return <Flame size={12} style={{ color: 'var(--orange-light)' }} />;
  if (o.includes('beta')) return <FlaskConical size={12} style={{ color: 'var(--cyan-light)' }} />;
  if (o.includes('gold master')) return <Trophy size={12} style={{ color: 'var(--amber-light)' }} />;
  
  // Genres
  if (o.includes('open-world') || o.includes('rpg')) return <Swords size={12} style={{ color: 'var(--cyan-light)' }} />;
  if (o.includes('shooter') || o.includes('fps')) return <Target size={12} style={{ color: 'var(--red-light)' }} />;
  if (o.includes('third-person') || o.includes('action')) return <Gamepad2 size={12} style={{ color: 'var(--brand-300)' }} />;
  if (o.includes('horror') || o.includes('survival')) return <Flame size={12} style={{ color: 'var(--red-light)' }} />;
  if (o.includes('strategy') || o.includes('rts')) return <Layers size={12} style={{ color: 'var(--green-light)' }} />;
  if (o.includes('stealth')) return <EyeOff size={12} style={{ color: 'var(--text-disabled)' }} />;
  if (o.includes('mmo') || o.includes('online')) return <Globe size={12} style={{ color: 'var(--blue-light)' }} />;
  if (o.includes('sports') || o.includes('racing')) return <Gauge size={12} style={{ color: 'var(--amber-light)' }} />;
  
  return <HelpCircle size={12} />;
}

// ── Custom Glassmorphic Select Component ──────────────────────────────────────
function CustomSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.customSelectWrap}>
      <button
        type="button"
        className={`${styles.customSelectTrigger} ${isOpen ? styles.customSelectTriggerOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.triggerValWrap}>
          {getOptionIcon(value)}
          <span>{value || 'Select option…'}</span>
        </span>
        <ChevronRight size={14} className={`${styles.selectChevron} ${isOpen ? styles.selectChevronOpen : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className={styles.selectBackdrop} onClick={() => setIsOpen(false)} />
          <div className={`${styles.selectDropdown} glass`}>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                className={`${styles.selectOption} ${value === opt ? styles.selectOptionActive : ''}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {getOptionIcon(opt)}
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Watermark SVGs ────────────────────────────────────────────────────────────
function UnrealLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.watermarkSvg}>
      <circle cx="50" cy="50" r="45" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="38" opacity="0.75" />
      <path d="M50 22 C34.54 22 22 34.54 22 50 C22 65.46 34.54 78 50 78 C65.46 78 78 65.46 78 50 C78 34.54 65.46 22 50 22ZM44.5 66C41.19 66 38.5 63.31 38.5 60C38.5 56.69 41.19 54 44.5 54C47.81 54 50.5 56.69 50.5 60C50.5 63.31 47.81 66 44.5 66ZM61 57C58.24 57 56 54.76 56 52C56 49.24 58.24 47 61 47C63.76 47 66 49.24 66 52C66 54.76 63.76 57 61 57ZM50 30C58.84 30 66 37.16 66 46C66 52.26 62.4 57.68 57.14 60.3C56.32 57.9 54.08 56.2 51.35 56.2C50.4 56.2 49.5 56.44 48.7 56.88C47.66 54.88 45.63 53.5 43.25 53.5C40.78 53.5 38.65 54.95 37.7 57.02C33.38 54.12 30.5 49.17 30.5 43.5C30.5 36.04 36.04 30.5 43.5 30.5H50Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function UnityLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.watermarkSvg}>
      <path d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z" opacity="0.65" />
      <path d="M50 12 L50 48 M82 30 L50 48 M82 70 L50 48 M50 88 L50 48 M18 70 L50 48 M18 30 L50 48" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.5" />
      <circle cx="50" cy="48" r="5" fill="currentColor" opacity="0.65" />
      <path d="M34 22 L50 31 L66 22 M66 78 L50 69 L34 78 M18 50 L34 41 L34 59 M82 50 L66 41 L66 59" strokeWidth="1.5" opacity="0.85" />
    </svg>
  );
}

function GodotLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.watermarkSvg}>
      <path d="M25 45 C18 45 12 50 12 60 C12 74 25 82 50 82 C75 82 88 74 88 60 C88 50 82 45 75 45 Z" opacity="0.65" />
      <path d="M32 28 L30 38 M68 28 L70 38" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
      <circle cx="34" cy="56" r="7" fill="currentColor" opacity="0.45" />
      <circle cx="66" cy="56" r="7" fill="currentColor" opacity="0.45" />
      <circle cx="34" cy="56" r="3" fill="currentColor" />
      <circle cx="66" cy="56" r="3" fill="currentColor" />
      <path d="M40 67 Q50 71 60 67" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 68 L14 74 M78 68 L86 74" strokeWidth="1.5" />
    </svg>
  );
}

function CustomLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={styles.watermarkSvg}>
      <rect x="25" y="25" width="50" height="50" rx="8" opacity="0.7" />
      <rect x="34" y="34" width="32" height="32" rx="4" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 40 H25 M12 50 H25 M12 60 H25 M75 40 H88 M75 50 H88 M75 60 H88 M40 12 V25 M50 12 V25 M60 12 V25 M40 75 V88 M50 75 V88 M60 75 V88" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

const WATERMARKS = {
  'Unreal Engine': <UnrealLogo />,
  'Unity': <UnityLogo />,
  'Godot': <GodotLogo />,
  'Custom Engine': <CustomLogo />,
};

export function OnboardingWizard() {
  const completeOnboarding = useAppStore(s => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [hoveredEngine, setHoveredEngine] = useState(null);
  
  const [selectedBaseEngine, setSelectedBaseEngine] = useState('Unreal Engine');
  const [engineVersion, setEngineVersion] = useState('5.4');

  const [crewMode, setCrewMode] = useState('aaa'); // 'aaa' or 'custom'
  const [crewList, setCrewList] = useState([
    { id: 'tm1', name: 'Captain', role: 'Game Director & Lead Designer', department: 'Direction', timezone: 'IST', color: '#7c3aed', initial: 'C' },
  ]);
  const [newMember, setNewMember] = useState({ name: '', role: 'Gameplay Programmer', department: 'Engineering', timezone: 'GMT' });

  const [data, setData] = useState({
    projectName: '',
    projectGenre: 'Open-World Action RPG',
    projectEngine: 'Unreal Engine 5.4',
    projectPhase: 'Alpha',
  });

  const isValid = () => {
    if (step === 0) return data.projectName.trim().length > 0;
    if (step === 2 && crewMode === 'custom') return crewList.length > 0;
    return true;
  };

  const handleBaseEngineChange = (eng) => {
    setSelectedBaseEngine(eng);
    const defVer = ENGINE_VERSION_DEFAULTS[eng] || '1.0';
    setEngineVersion(defVer);
    setData(d => ({ ...d, projectEngine: eng === 'Custom Engine' ? 'Custom Engine' : `${eng} ${defVer}` }));
  };

  const handleVersionChange = (ver) => {
    setEngineVersion(ver);
    setData(d => ({ ...d, projectEngine: `${selectedBaseEngine} ${ver}` }));
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const colors = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#9333ea', '#db2777'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const id = 'tm' + Date.now();
    setCrewList(prev => [
      ...prev,
      {
        ...newMember,
        id,
        initial: newMember.name.trim()[0].toUpperCase(),
        color: randomColor,
        online: true,
        email: `${newMember.name.trim().toLowerCase().replace(/\s+/g, '')}@nexusgame.dev`,
        skills: [newMember.role],
        startDate: 'Jun 2026',
      },
    ]);
    setNewMember({ name: '', role: 'Gameplay Programmer', department: 'Engineering', timezone: 'GMT' });
  };

  const handleRemoveMember = (id) => {
    if (id === 'tm1') return; // Cannot delete Captain
    setCrewList(prev => prev.filter(m => m.id !== id));
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Complete onboarding and update team store
      if (crewMode === 'aaa') {
        // Keep default crew
      } else {
        // Update with custom manual crew
        useTeamStore.setState({ members: crewList });
      }
      completeOnboarding(data);
    }
  };

  const prev = () => setStep(s => s - 1);

  const handleCancel = () => {
    const state = useAppStore.getState();
    const projects = state.projects || [];
    if (projects.length > 0) {
      const lastProj = projects[projects.length - 1];
      useAppStore.setState({
        onboardingDone: true,
        projectName: lastProj.projectName,
        projectGenre: lastProj.projectGenre,
        projectEngine: lastProj.projectEngine,
        projectPhase: lastProj.projectPhase,
      });
    } else {
      useAppStore.setState({ onboardingDone: true });
    }
  };

  const activeEngineKey = hoveredEngine || selectedBaseEngine;
  const activeWatermark = WATERMARKS[activeEngineKey] || null;

  return (
    <div className={styles.overlay}>
      {/* Background Engine Logo Overlay (Highly visible, styled Blueprint) */}
      <div className={`${styles.backgroundWatermark} ${activeWatermark ? styles.watermarkVisible : ''}`}>
        {activeWatermark}
      </div>

      <div className={`${styles.wizard} glass`}>
        {/* Progress steps */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={i}>
                <div className={`${styles.stepItem} ${i === step ? styles.stepActive : i < step ? styles.stepDone : ''}`}>
                  <div className={styles.stepIconWrap}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <span className={styles.stepLabel}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {step === 0 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIconHero}>
                <Gamepad2 size={48} className={styles.heroGlowIcon} />
              </div>
              <h2 className={styles.stepTitle}>Name Your Project</h2>
              <p className={styles.stepDesc}>What's the working title for your game? You can always change this later.</p>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Project Name *</label>
                <input
                  className={styles.input}
                  value={data.projectName}
                  onChange={e => setData(d => ({ ...d, projectName: e.target.value }))}
                  placeholder="e.g. Project NEXUS, Shadow Protocol…"
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Current Phase</label>
                <CustomSelect
                  value={data.projectPhase}
                  onChange={val => setData(d => ({ ...d, projectPhase: val }))}
                  options={PHASES}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIconHero}>
                <Cpu size={48} className={styles.heroGlowIcon} />
              </div>
              <h2 className={styles.stepTitle}>Engine & Genre</h2>
              <p className={styles.stepDesc}>Tell us what you're building on. You can choose any base engine and specify the exact version.</p>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Game Engine</label>
                <div className={styles.engineGrid}>
                  {BASE_ENGINES.map(e => (
                    <button
                      key={e}
                      type="button"
                      className={`${styles.optionBtn} ${selectedBaseEngine === e ? styles.optionBtnActive : ''}`}
                      onClick={() => handleBaseEngineChange(e)}
                      onMouseEnter={() => setHoveredEngine(e)}
                      onMouseLeave={() => setHoveredEngine(null)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Version Selector (Fixes version constraints) */}
              {selectedBaseEngine !== 'Custom Engine' && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Engine Version Spec</label>
                  <div className={styles.versionField}>
                    {selectedBaseEngine === 'Unreal Engine' ? (
                      <CustomSelect
                        value={engineVersion}
                        onChange={handleVersionChange}
                        options={['5.5', '5.4', '5.3', '5.2', '5.1', '5.0', '4.27']}
                      />
                    ) : selectedBaseEngine === 'Unity' ? (
                      <CustomSelect
                        value={engineVersion}
                        onChange={handleVersionChange}
                        options={['6', '2023.2', '2022.3 LTS', '2021.3 LTS']}
                      />
                    ) : (
                      <CustomSelect
                        value={engineVersion}
                        onChange={handleVersionChange}
                        options={['4.2', '4.1', '4.0', '3.5']}
                      />
                    )}
                    <input
                      className={styles.input}
                      style={{ marginTop: 8 }}
                      value={engineVersion}
                      onChange={e => handleVersionChange(e.target.value)}
                      placeholder="Or enter custom version (e.g. 5.4.2)..."
                    />
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Game Genre</label>
                <CustomSelect
                  value={data.projectGenre}
                  onChange={val => setData(d => ({ ...d, projectGenre: val }))}
                  options={GENRES}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIconHero}>
                <UsersRound size={48} className={styles.heroGlowIcon} />
              </div>
              <h2 className={styles.stepTitle}>Assemble Your Crew</h2>
              <p className={styles.stepDesc}>
                Choose to auto-populate a professional AAA team, or build your own custom crew manually.
              </p>

              {/* Mode Select Tabs */}
              <div className={styles.tabHeader}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${crewMode === 'aaa' ? styles.tabBtnActive : ''}`}
                  onClick={() => setCrewMode('aaa')}
                >
                  <Rocket size={13} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                  Prefill AAA Crew
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${crewMode === 'custom' ? styles.tabBtnActive : ''}`}
                  onClick={() => setCrewMode('custom')}
                >
                  <Wrench size={13} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
                  Setup Custom Crew
                </button>
              </div>

              {/* AAA Crew Preview */}
              {crewMode === 'aaa' && (
                <div className={styles.teamPreview}>
                  {DEFAULT_AAA_CREW.map(m => (
                    <div key={m.name} className={styles.teamRow}>
                      <div className={styles.teamAvatar} style={{ background: m.color }}>{m.initial}</div>
                      <div>
                        <div className={styles.teamName}>{m.name}</div>
                        <div className={styles.teamRole}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                  <p className={styles.teamMore}>+4 more members will be pre-populated.</p>
                </div>
              )}

              {/* Custom Crew Builder */}
              {crewMode === 'custom' && (
                <div className={styles.customCrewBuilder}>
                  {/* Active list */}
                  <div className={styles.builderList}>
                    {crewList.map(m => (
                      <div key={m.id} className={styles.builderRow}>
                        <div className={styles.teamAvatar} style={{ background: m.color }}>{m.initial}</div>
                        <div style={{ flex: 1 }}>
                          <div className={styles.teamName}>{m.name}</div>
                          <div className={styles.teamRole}>{m.role} · <span style={{opacity: 0.6}}>{m.timezone}</span></div>
                        </div>
                        {m.id !== 'tm1' && (
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => handleRemoveMember(m.id)}
                            title="Remove member"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add inputs */}
                  <div className={styles.builderForm}>
                    <div className={styles.builderInputs}>
                      <input
                        className={styles.builderInput}
                        placeholder="Name (e.g. Maya Chen)"
                        value={newMember.name}
                        onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))}
                      />
                      <select
                        className={styles.builderSelect}
                        value={newMember.role}
                        onChange={e => {
                          const val = e.target.value;
                          let dep = 'Engineering';
                          if (val.includes('Artist') || val.includes('Art')) dep = 'Art';
                          else if (val.includes('Sound') || val.includes('Audio')) dep = 'Audio';
                          else if (val.includes('QA') || val.includes('Tester')) dep = 'QA';
                          else if (val.includes('Designer') || val.includes('Director')) dep = 'Direction';
                          setNewMember(m => ({ ...m, role: val, department: dep }));
                        }}
                      >
                        <option value="Gameplay Programmer">Gameplay Programmer</option>
                        <option value="Systems Programmer">Systems Programmer</option>
                        <option value="Lead Environment Artist">Lead Environment Artist</option>
                        <option value="3D Character Artist">3D Character Artist</option>
                        <option value="Sound Designer">Sound Designer</option>
                        <option value="QA Lead">QA Lead</option>
                        <option value="Game Designer">Game Designer</option>
                      </select>
                      <select
                        className={styles.builderSelect}
                        value={newMember.timezone}
                        onChange={e => setNewMember(m => ({ ...m, timezone: e.target.value }))}
                        title="Timezone"
                      >
                        <option value="GMT">GMT</option>
                        <option value="PST">PST</option>
                        <option value="EST">EST</option>
                        <option value="IST">IST</option>
                        <option value="CET">CET</option>
                        <option value="KST">KST</option>
                      </select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={handleAddMember}
                      disabled={!newMember.name.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepIconHero}>
                <CheckCircle2 size={48} className={styles.heroGlowIcon} style={{ color: 'var(--green-light)' }} />
              </div>
              <h2 className={styles.stepTitle}>
                <span className={styles.gradient}>{data.projectName || 'Your Game'}</span> is ready!
              </h2>
              <p className={styles.stepDesc}>
                Your workspace is set up. Here's what's waiting for you:
              </p>
              <ul className={styles.featureList}>
                {[
                  [Kanban, 'Sprint Board — Drag & drop Kanban with real task persistence', 'var(--brand-300)'],
                  [Bug, 'Bug Tracker — Report, assign, and resolve bugs with full lifecycle', 'var(--red-light)'],
                  [BookOpen, 'GDD Editor — Notion-style block editor with auto-save', 'var(--cyan-light)'],
                  [Package, 'Asset Manager — Track every mesh, texture, audio, and blueprint', 'var(--blue-light)'],
                  [HelpCircle, 'Help Panel — Press the Help button in the sidebar any time', 'var(--amber-light)'],
                ].map(([Icon, text, color]) => (
                  <li key={text} className={styles.featureItem}>
                    <span className={styles.featureIconWrap} style={{ background: color + '20', color: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginRight: 6 }}>
                      <Icon size={12} />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {step > 0 && (
              <Button variant="ghost" icon={ChevronLeft} onClick={prev}>Back</Button>
            )}
            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          </div>
          <Button
            variant={step === STEPS.length - 1 ? 'gradient' : 'primary'}
            iconRight={step < STEPS.length - 1 ? ChevronRight : undefined}
            icon={step === STEPS.length - 1 ? Rocket : undefined}
            onClick={next}
            disabled={!isValid()}
          >
            {step === STEPS.length - 1 ? 'Launch Workspace' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
