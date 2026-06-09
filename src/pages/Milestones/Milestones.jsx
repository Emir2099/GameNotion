import React, { useState } from 'react';
import { useMilestoneStore, useAppStore } from '../../store';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../lib/toast';
import { Plus, Edit3, Trash2, CheckCircle2, Circle, AlertCircle, Play, ShieldAlert } from 'lucide-react';
import styles from './Milestones.module.css';

const STATUS_LABELS = { done: 'Secure', 'in-progress': 'Active Operation', planned: 'Classified' };

const COLORS = [
  { label: '🟢 Green (Rendering)', value: '#059669' },
  { label: '🟣 Purple (Gameplay)', value: '#7c3aed' },
  { label: '🔵 Blue (System)', value: '#2563eb' },
  { label: '🟠 Orange (Gold Stage)', value: '#d97706' },
  { label: '🔴 Red (Launch)', value: '#dc2626' },
];

const PHASES = ['Pre-Production', 'Vertical Slice', 'Alpha', 'Beta', 'Gold Master', 'Launch'];

const EMPTY_MILESTONE = { name: '', date: '', status: 'planned', color: '#2563eb', deliverablesText: '' };

export default function Milestones() {
  const milestones = useMilestoneStore((s) => s.milestones);
  const addMilestone = useMilestoneStore((s) => s.addMilestone);
  const updateMilestone = useMilestoneStore((s) => s.updateMilestone);
  const deleteMilestone = useMilestoneStore((s) => s.deleteMilestone);

  const projectPhase = useAppStore((s) => s.projectPhase);
  const updateActiveProject = useAppStore((s) => s.updateActiveProject);
  const { addToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_MILESTONE });

  const handleUpdateProjectPhase = (newPhase) => {
    updateActiveProject({ projectPhase: newPhase });
    addToast(`Campaign operation updated: ${newPhase}`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingMilestone(null);
    setForm({ ...EMPTY_MILESTONE });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMilestone(m);
    const deliverablesText = (m.deliverables || [])
      .map((d) => (typeof d === 'string' ? d : d.text))
      .join('\n');

    setForm({
      name: m.name,
      date: m.date,
      status: m.status || 'planned',
      color: m.color || '#2563eb',
      deliverablesText,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('Operation name is required.', 'error');
      return;
    }
    if (!form.date.trim()) {
      addToast('Target date is required.', 'error');
      return;
    }

    const milestoneData = {
      name: form.name.trim(),
      date: form.date.trim(),
      status: form.status,
      color: form.color,
      deliverables: form.deliverablesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ text, completed: form.status === 'done' })),
    };

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, milestoneData);
      addToast('Campaign details modified.', 'success');
    } else {
      addMilestone(milestoneData);
      addToast('New campaign phase deployed.', 'success');
    }

    setShowModal(false);
    setEditingMilestone(null);
    setForm({ ...EMPTY_MILESTONE });
  };

  const handleDelete = (id) => {
    deleteMilestone(id);
    addToast('Campaign phase decommissioned.', 'warning');
  };

  const handleToggleDeliverable = (milestoneId, deliverableIndex) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const updatedDeliverables = (milestone.deliverables || []).map((d, idx) => {
      const dObj = typeof d === 'string' ? { text: d, completed: milestone.status === 'done' } : d;
      if (idx === deliverableIndex) {
        return { ...dObj, completed: !dObj.completed };
      }
      return dObj;
    });

    updateMilestone(milestoneId, { deliverables: updatedDeliverables });
    addToast('Objective log updated.', 'success');
  };

  // Calculate overall campaign completion
  const totalObjectives = milestones.reduce((sum, m) => sum + (m.deliverables?.length || 0), 0);
  const completedObjectives = milestones.reduce((sum, m) => {
    const completedInMilestone = (m.deliverables || []).filter(d => 
      typeof d === 'string' ? m.status === 'done' : d.completed
    ).length;
    return sum + completedInMilestone;
  }, 0);
  const overallProgress = totalObjectives ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* HUD Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Campaign Roadmap</h1>
          <p className={styles.subtitle}>Tactical operation stages and phase objective tracking</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.projectPhaseSelector}>
            <span className={styles.selectorLabel}>ACTIVE OP:</span>
            <Select
              className={styles.phaseSelect}
              value={projectPhase}
              onChange={(e) => handleUpdateProjectPhase(e.target.value)}
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Initiate Phase
          </Button>
        </div>
      </div>

      {/* Overarching HUD Status Widget */}
      <div className={styles.hudPanel}>
        <div className={styles.hudHeader}>
          <div className={styles.hudTitle}>
            <Play size={10} className={styles.hudIcon} />
            <span>OPERATIONAL METRICS OVERVIEW</span>
          </div>
          <span className={styles.hudValue}>{completedObjectives} / {totalObjectives} OBJECTIVES SECURED</span>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: `${overallProgress}%` }} />
          </div>
          <span className={styles.progressPct}>{overallProgress}% COMPLETE</span>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className={styles.timeline}>
        {milestones.map((m, i) => {
          const totalDelivs = m.deliverables?.length || 0;
          const completedDelivs = (m.deliverables || []).filter(d => 
            typeof d === 'string' ? m.status === 'done' : d.completed
          ).length;
          const pct = totalDelivs ? Math.round((completedDelivs / totalDelivs) * 100) : 0;

          return (
            <div
              key={m.id || m.name}
              className={`${styles.milestone} ${
                m.status === 'done'
                  ? styles.milestoneDone
                  : m.status === 'in-progress'
                  ? styles.milestoneActive
                  : styles.milestonePlanned
              }`}
            >
              {/* Timeline Left Node */}
              <div className={styles.milestoneLeft}>
                <div
                  className={styles.milestoneDot}
                  style={{
                    borderColor: m.color,
                    background: m.status === 'done' ? m.color : 'var(--bg-base)',
                    color: m.color,
                  }}
                >
                  {m.status === 'done' ? (
                    <CheckCircle2 size={14} className={styles.doneGlow} />
                  ) : m.status === 'in-progress' ? (
                    <Play size={12} className={styles.playGlow} />
                  ) : (
                    <Circle size={10} />
                  )}
                </div>
                {i < milestones.length - 1 && (
                  <div
                    className={styles.milestoneLine}
                    style={{ background: m.status === 'done' ? m.color : 'var(--border-default)' }}
                  />
                )}
              </div>

              {/* Quest dossier card */}
              <div
                className={styles.milestoneCard}
                style={{
                  '--card-color': m.color,
                  borderColor: m.status === 'in-progress' ? m.color : 'var(--border-subtle)',
                }}
              >
                <div className={styles.milestoneHead}>
                  <div>
                    <div className={styles.milestoneName}>{m.name.toUpperCase()}</div>
                    <div className={styles.milestoneDate}>TARGET TIME // {m.date}</div>
                  </div>
                  <div className={styles.milestoneMeta}>
                    <span
                      className={styles.milestoneStatus}
                      style={{ color: m.color, background: m.color + '12', borderColor: m.color + '25' }}
                    >
                      {STATUS_LABELS[m.status] || 'Planned'}
                    </span>
                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} onClick={() => handleOpenEdit(m)} title="Edit Configuration">
                        <Edit3 size={11} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(m.id)} title="Decommission Stage">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-Progress bar for current milestone */}
                {totalDelivs > 0 && (
                  <div className={styles.cardProgressWrap}>
                    <div className={styles.cardProgressBarBg}>
                      <div className={styles.cardProgressBarFill} style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                    <span className={styles.cardProgressPct}>{pct}% objectives resolved</span>
                  </div>
                )}

                {/* Sub-Objectives (Deliverables) */}
                <div className={styles.objectivesHeader}>PHASE OBJECTIVES :</div>
                <ul className={styles.deliverables}>
                  {(m.deliverables || []).map((d, index) => {
                    const text = typeof d === 'string' ? d : d.text;
                    const completed = typeof d === 'string' ? m.status === 'done' : d.completed;
                    return (
                      <li
                        key={index}
                        className={`${styles.deliverable} ${completed ? styles.deliverableCompleted : ''}`}
                        onClick={() => handleToggleDeliverable(m.id, index)}
                        title="Click to toggle objective completion"
                      >
                        <span
                          className={styles.deliverableCheckbox}
                          style={{
                            color: completed ? m.color : 'var(--text-disabled)',
                            borderColor: completed ? m.color : 'var(--border-default)',
                          }}
                        >
                          {completed ? (
                            <CheckCircle2 size={12} fill={m.color + '20'} />
                          ) : (
                            <Circle size={12} />
                          )}
                        </span>
                        <span className={styles.deliverableText}>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
        {milestones.length === 0 && (
          <div className={styles.empty}>
            <ShieldAlert size={28} className={styles.emptyIcon} />
            <p>NO ROADMAP CAMPAIGNS INITIATED. CLICK "INITIATE PHASE" TO COMPILE TARGET LOGS.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingMilestone(null); }}
        title={editingMilestone ? 'Configure Campaign Phase' : 'Initiate New Phase'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingMilestone ? 'Deploy Phase' : 'Initiate Phase'}</Button>
          </>
        }
      >
        <FormGroup label="Phase Title" required>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Vertical Slice, Alpha Release"
            autoFocus
          />
        </FormGroup>

        <FormRow>
          <FormGroup label="Target Deadline" required>
            <input
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              placeholder="e.g. Jul 2026, Q4 2026"
            />
          </FormGroup>

          <FormGroup label="Operation Sector Theme" required>
            <Select
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            >
              {COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup label="Operational Readiness" required>
          <Select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="planned">Planned (Classified)</option>
            <option value="in-progress">Active Operation</option>
            <option value="done">Secure (Complete)</option>
          </Select>
        </FormGroup>

        <FormGroup label="Phase Objectives" hint="Enter objectives, one per line. They will compile into checkable HUD mission metrics.">
          <textarea
            value={form.deliverablesText}
            onChange={(e) => setForm((f) => ({ ...f, deliverablesText: e.target.value }))}
            placeholder="e.g. Lock Engine version to UE5.4&#10;Assemble Vertical Slice whitebox"
            rows={5}
          />
        </FormGroup>
      </Modal>
    </div>
  );
}
