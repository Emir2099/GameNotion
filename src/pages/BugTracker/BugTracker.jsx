import React, { useState, useMemo } from 'react';
import { useBugStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Badge, PRIORITY_LABELS, STATUS_LABELS } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Plus, Search, Bug, AlertTriangle, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';
import styles from './BugTracker.module.css';

const SYSTEMS = ['Physics / Player Controller','Rendering / Lumen','Rendering / Nanite','Save / Faction Manager','AI / Behavior Tree','Audio / MetaSounds','UI / HUD','Gameplay / Combat','Gameplay / Traversal','Other'];
const ASSIGNEES = ['Captain','Maya','Alex','Jake','Sam','Layla','Ryan','Nina'];
const SEVERITIES = ['critical','high','medium','low'];
const STATUSES = ['open','in-progress','needs-info','resolved','closed'];
const EMPTY = { title:'', system:'Physics / Player Controller', severity:'medium', status:'open', assignee:'Captain', reportedBy:'Nina', steps:'', notes:'' };

export default function BugTracker() {
  const bugs = useBugStore(s => s.bugs);
  const addBug = useBugStore(s => s.addBug);
  const updateBug = useBugStore(s => s.updateBug);
  const deleteBug = useBugStore(s => s.deleteBug);
  const { addToast } = useToast();

  const counts = React.useMemo(() => {
    return {
      critical: bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length,
      high: bugs.filter(b => b.severity === 'high' && b.status !== 'resolved' && b.status !== 'closed').length,
      medium: bugs.filter(b => b.severity === 'medium' && b.status !== 'resolved' && b.status !== 'closed').length,
      low: bugs.filter(b => b.severity === 'low' && b.status !== 'resolved' && b.status !== 'closed').length,
      resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
    };
  }, [bugs]);

  const [showModal, setShowModal] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => bugs.filter(b => {
    if (filterSeverity !== 'all' && b.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.system.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [bugs, filterSeverity, filterStatus, search]);

  const handleSave = () => {
    if (!form.title.trim()) { addToast('Bug title is required.', 'error'); return; }
    if (editingBug) {
      updateBug(editingBug.id, form);
      addToast('Bug updated.', 'success');
    } else {
      addBug(form);
      addToast('Bug reported.', 'success');
    }
    setShowModal(false); setEditingBug(null); setForm({ ...EMPTY });
  };

  const handleEdit = (b) => { setEditingBug(b); setForm({ ...b }); setShowModal(true); };
  const handleDelete = (id) => { deleteBug(id); addToast('Bug deleted.', 'warning'); };

  const SEV_COUNT = [
    { key: 'critical', label: 'Critical', icon: '🔴' },
    { key: 'high',     label: 'High',     icon: '🟠' },
    { key: 'medium',   label: 'Medium',   icon: '🟡' },
    { key: 'low',      label: 'Low',      icon: '🟢' },
    { key: 'resolved', label: 'Resolved', icon: '✅' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bug Tracker</h1>
          <p className={styles.subtitle}>{bugs.length} total bugs · {counts.critical + counts.high + counts.medium + counts.low} active</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingBug(null); setForm({ ...EMPTY }); setShowModal(true); }}>Report Bug</Button>
      </div>

      {/* Severity summary row */}
      <div className={styles.summaryRow}>
        {SEV_COUNT.map(s => (
          <button
            key={s.key}
            className={`${styles.summaryCard} ${filterSeverity === s.key || (s.key === 'resolved' && filterStatus === 'resolved') ? styles.summaryActive : ''}`}
            onClick={() => {
              if (s.key === 'resolved') { setFilterStatus(filterStatus === 'resolved' ? 'all' : 'resolved'); setFilterSeverity('all'); }
              else { setFilterSeverity(filterSeverity === s.key ? 'all' : s.key); setFilterStatus('all'); }
            }}
          >
            <span className={styles.summaryNum}>{counts[s.key] || 0}</span>
            <span className={styles.summaryLabel}>{s.icon} {s.label}</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search bugs by title or system…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setFilterStatus('all'); }} className={styles.sel}>
          <option value="all">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setFilterSeverity('all'); }} className={styles.sel}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Bug list */}
      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>
            <Bug size={32} strokeWidth={1.5} />
            <p>No bugs match your filters.</p>
          </div>
        )}
        {filtered.map(bug => {
          const expanded = expandedId === bug.id;
          return (
            <div key={bug.id} className={`${styles.bugRow} ${expanded ? styles.bugRowExpanded : ''}`}>
              <div className={styles.bugMain} onClick={() => setExpandedId(expanded ? null : bug.id)}>
                <div className={styles.bugLeft}>
                  <span className={styles.bugId}>{bug.id}</span>
                  <Badge label={PRIORITY_LABELS[bug.severity] || bug.severity} variant={bug.severity} size="xs" />
                  <div className={styles.bugInfo}>
                    <span className={styles.bugTitle}>{bug.title}</span>
                    <span className={styles.bugSystem}>{bug.system}</span>
                  </div>
                </div>
                <div className={styles.bugRight}>
                  <Badge label={STATUS_LABELS[bug.status] || bug.status} variant={bug.status} size="xs" dot />
                  <span className={styles.bugAssignee} title={bug.assignee}>{bug.assignee?.[0]}</span>
                  <button className={styles.expandBtn} aria-label={expanded ? 'Collapse' : 'Expand'}>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
              {expanded && (
                <div className={styles.bugDetail}>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Reported by</span>
                      <span>{bug.reportedBy || '—'}</span>
                    </div>
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Date</span>
                      <span>{bug.reportedAt ? new Date(bug.reportedAt).toLocaleDateString() : '—'}</span>
                    </div>
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Status</span>
                      <span>{STATUS_LABELS[bug.status]}</span>
                    </div>
                  </div>
                  {bug.steps && (
                    <div className={styles.detailSection}>
                      <span className={styles.detailLabel}>Steps to reproduce</span>
                      <pre className={styles.detailPre}>{bug.steps}</pre>
                    </div>
                  )}
                  {bug.notes && (
                    <div className={styles.detailSection}>
                      <span className={styles.detailLabel}>Notes</span>
                      <p className={styles.detailNotes}>{bug.notes}</p>
                    </div>
                  )}
                  <div className={styles.detailActions}>
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => handleEdit(bug)}>Edit</Button>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(bug.id)}>Delete</Button>
                    {bug.status !== 'resolved' && (
                      <Button variant="success" size="sm" onClick={() => { updateBug(bug.id, { status: 'resolved' }); addToast('Bug marked resolved.', 'success'); }}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingBug(null); }} title={editingBug ? 'Edit Bug' : 'Report New Bug'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingBug ? 'Save' : 'Report Bug'}</Button></>}
      >
        <FormGroup label="Bug Title" required><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="One-line description of the issue" autoFocus /></FormGroup>
        <FormRow>
          <FormGroup label="Severity"><Select value={form.severity} onChange={e => setForm(f => ({...f, severity: e.target.value}))}>{SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</Select></FormGroup>
          <FormGroup label="Status"><Select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</Select></FormGroup>
        </FormRow>
        <FormGroup label="Affected System"><Select value={form.system} onChange={e => setForm(f => ({...f, system: e.target.value}))}>{SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}</Select></FormGroup>
        <FormRow>
          <FormGroup label="Assignee"><Select value={form.assignee} onChange={e => setForm(f => ({...f, assignee: e.target.value}))}>{ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}</Select></FormGroup>
          <FormGroup label="Reported By"><input value={form.reportedBy} onChange={e => setForm(f => ({...f, reportedBy: e.target.value}))} placeholder="Your name" /></FormGroup>
        </FormRow>
        <FormGroup label="Steps to Reproduce" hint="Numbered steps make it easier to reproduce"><textarea value={form.steps} onChange={e => setForm(f => ({...f, steps: e.target.value}))} placeholder={"1. Do X\n2. Do Y\n3. Observe Z"} rows={4} /></FormGroup>
        <FormGroup label="Notes / Investigation"><textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Any additional context, suspected cause, or partial fix attempts…" rows={2} /></FormGroup>
      </Modal>
    </div>
  );
}
