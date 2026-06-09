import React, { useState } from 'react';
import { useMilestoneStore, useAppStore } from '../../store';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../lib/toast';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import styles from './Milestones.module.css';

const STATUS_ICON = { done: '✅', 'in-progress': '🔄', planned: '⭕' };
const STATUS_LABELS = { done: 'Complete', 'in-progress': 'In Progress', planned: 'Planned' };

const COLORS = [
  { label: '🟢 Green', value: '#059669' },
  { label: '🟣 Purple', value: '#7c3aed' },
  { label: '🔵 Blue', value: '#2563eb' },
  { label: '🟠 Orange', value: '#d97706' },
  { label: '🔴 Red', value: '#dc2626' },
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
    addToast(`Project phase updated to ${newPhase}.`, 'success');
  };

  const handleOpenAdd = () => {
    setEditingMilestone(null);
    setForm({ ...EMPTY_MILESTONE });
    setShowModal(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMilestone(m);
    setForm({
      name: m.name,
      date: m.date,
      status: m.status || 'planned',
      color: m.color || '#2563eb',
      deliverablesText: (m.deliverables || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('Milestone name is required.', 'error');
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
        .filter(Boolean),
    };

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, milestoneData);
      addToast('Milestone updated.', 'success');
    } else {
      addMilestone(milestoneData);
      addToast('Milestone created.', 'success');
    }

    setShowModal(false);
    setEditingMilestone(null);
    setForm({ ...EMPTY_MILESTONE });
  };

  const handleDelete = (id) => {
    deleteMilestone(id);
    addToast('Milestone deleted.', 'warning');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Milestones & Roadmap</h1>
          <p className={styles.subtitle}>Track production timeline and milestones</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.projectPhaseSelector}>
            <span className={styles.selectorLabel}>Project Stage:</span>
            <Select
              className={styles.phaseSelect}
              value={projectPhase}
              onChange={(e) => handleUpdateProjectPhase(e.target.value)}
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            Add Milestone
          </Button>
        </div>
      </div>

      <div className={styles.timeline}>
        {milestones.map((m, i) => (
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
            <div className={styles.milestoneLeft}>
              <div
                className={styles.milestoneDot}
                style={{ borderColor: m.color, background: m.status === 'done' ? m.color : 'var(--bg-base)' }}
              >
                <span>{STATUS_ICON[m.status] || '⭕'}</span>
              </div>
              {i < milestones.length - 1 && (
                <div
                  className={styles.milestoneLine}
                  style={{ background: m.status === 'done' ? m.color : 'var(--border-default)' }}
                />
              )}
            </div>
            <div className={styles.milestoneCard} style={{ borderLeftColor: m.color }}>
              <div className={styles.milestoneHead}>
                <div>
                  <div className={styles.milestoneName}>{m.name}</div>
                  <div className={styles.milestoneDate}>{m.date}</div>
                </div>
                <div className={styles.milestoneMeta}>
                  <span
                    className={styles.milestoneStatus}
                    style={{ color: m.color, background: m.color + '18', borderColor: m.color + '33' }}
                  >
                    {STATUS_LABELS[m.status] || 'Planned'}
                  </span>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleOpenEdit(m)} title="Edit Milestone">
                      <Edit3 size={11} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(m.id)} title="Delete Milestone">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
              <ul className={styles.deliverables}>
                {(m.deliverables || []).map((d, index) => (
                  <li key={index} className={styles.deliverable}>
                    <span className={styles.deliverableDot} style={{ background: m.status === 'done' ? m.color : 'var(--text-disabled)' }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className={styles.empty}>
            <p>No milestones created yet. Click "+ Add Milestone" to start planning your roadmap.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingMilestone(null); }}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingMilestone ? 'Save' : 'Add Milestone'}</Button>
          </>
        }
      >
        <FormGroup label="Milestone Name" required>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Vertical Slice, Alpha Release"
            autoFocus
          />
        </FormGroup>

        <FormRow>
          <FormGroup label="Target Date" required>
            <input
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              placeholder="e.g. Jul 2026, Q4 2026"
            />
          </FormGroup>

          <FormGroup label="Theme Color" required>
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

        <FormGroup label="Status" required>
          <Select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Complete</option>
          </Select>
        </FormGroup>

        <FormGroup label="Deliverables" hint="Enter deliverables, one per line.">
          <textarea
            value={form.deliverablesText}
            onChange={(e) => setForm((f) => ({ ...f, deliverablesText: e.target.value }))}
            placeholder="e.g. Engine version locked&#10;Core combat loop playable"
            rows={5}
          />
        </FormGroup>
      </Modal>
    </div>
  );
}
